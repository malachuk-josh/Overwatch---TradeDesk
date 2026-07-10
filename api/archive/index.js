import { consumeRateLimit, isSafeId, json, queryValue, redisCommand, redisPipeline } from "./_shared.js";

const BASE_URL = (process.env.ARCHIVE_PUBLIC_BASE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://overwatch-mu.vercel.app"))
  .replace(/\/+$/, "");
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;

const text = (value, max) => typeof value === "string" ? value.slice(0, max) : undefined;
const finiteNumber = (value) =>
  value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))
    ? Number(value)
    : undefined;

// The list endpoint is intentionally public, so expose only the metadata the Library renders. Never
// echo arbitrary fields from an ingest body (or the stored newsletter HTML) into the public response.
function publicMeta(value, indexedId) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !isSafeId(indexedId)) return null;
  const type = text(value.type, 40);
  const title = text(value.title, 300);
  const sentAt = text(value.sentAt, 80);
  if (!type || !title || !sentAt || Number.isNaN(Date.parse(sentAt))) return null;
  const out = {
    id: indexedId,
    type,
    date: text(value.date, 40),
    title,
    subject: text(value.subject, 300),
    instrument: text(value.instrument, 32),
    bias: text(value.bias, 80),
    score: finiteNumber(value.score),
    conviction: typeof value.conviction === "number" || typeof value.conviction === "string"
      ? String(value.conviction).slice(0, 32)
      : undefined,
    summary: text(value.summary, 4_000),
    sentAt,
  };
  return Object.fromEntries(Object.entries(out).filter(([, item]) => item !== undefined));
}

const parseStored = (raw) => {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }

  const rawType = queryValue(req.query?.type);
  if (rawType !== undefined && (typeof rawType !== "string" || !/^[A-Za-z0-9_-]{1,40}$/.test(rawType))) {
    return json(res, 400, { error: "Invalid archive type" });
  }
  const requestedLimit = Number(queryValue(req.query?.limit));
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
    ? Math.min(Math.floor(requestedLimit), 200)
    : 50;

  try {
    if (!(await consumeRateLimit(req, res, { scope: "archive-list", limit: 60 }))) {
      return json(res, 429, { error: "Too many archive requests" });
    }
    // Surface only letters inside the 30-day retention window, even if a legacy blob outlives it.
    const cutoffMs = Date.now() - THIRTY_DAYS_S * 1_000;
    const result = await redisCommand([
      "ZRANGE", "newsletters:index", "+inf", String(cutoffMs), "BYSCORE", "REV", "LIMIT", "0", String(limit),
    ]);
    if (!Array.isArray(result)) throw new Error("Archive index response was not an array");
    const ids = result.filter(isSafeId);
    if (!ids.length) return json(res, 200, { data: [] }, { cacheControl: "public, max-age=15, s-maxage=30, stale-while-revalidate=60" });

    // Read slim metadata first. Only legacy entries without a meta key require the larger full record.
    const byId = new Map();
    const metaResults = await redisPipeline(ids.map((id) => ["GET", `newsletter:meta:${id}`]));
    const missing = [];
    metaResults.forEach((raw, index) => {
      const id = ids[index];
      const meta = publicMeta(parseStored(raw), id);
      if (meta) byId.set(id, meta);
      else missing.push(id);
    });

    if (missing.length) {
      const fullResults = await redisPipeline(missing.map((id) => ["GET", `newsletter:${id}`]));
      const backfill = [];
      fullResults.forEach((raw, index) => {
        const id = missing[index];
        const meta = publicMeta(parseStored(raw), id);
        if (!meta) return;
        byId.set(id, meta);
        backfill.push(["SET", `newsletter:meta:${id}`, JSON.stringify(meta), "EX", String(THIRTY_DAYS_S)]);
      });
      if (backfill.length) {
        // Backfill is an optimization only. The public read remains available if this checked write
        // fails; a later request can retry it without losing the successfully-read archive data.
        try {
          await redisPipeline(backfill);
        } catch {
          console.warn("Archive metadata backfill failed");
        }
      }
    }

    const items = ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((meta) => ({ ...meta, url: `${BASE_URL}/api/archive/${encodeURIComponent(meta.id)}` }));

    return json(res, 200, { data: rawType ? items.filter((item) => item.type === rawType) : items }, { cacheControl: "public, max-age=15, s-maxage=30, stale-while-revalidate=60" });
  } catch (error) {
    console.error("Archive list read failed", error instanceof Error ? error.name : "UnknownError");
    return json(res, 503, { error: "Archive storage is temporarily unavailable" });
  }
}
