import { timingSafeEqual } from "node:crypto";
import { consumeRateLimit, isSafeId, json, redisCommand } from "./_shared.js";

const BASE_URL = (process.env.ARCHIVE_PUBLIC_BASE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://overwatch-mu.vercel.app"))
  .replace(/\/+$/, "");
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
const MAX_HTML_LENGTH = 950_000;

const isAuthorized = (authorization, secret) => {
  if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};

const requiredText = (body, field, max) => {
  const value = body[field];
  return typeof value === "string" && value.trim() && value.length <= max ? value : null;
};

const optionalText = (value, max) =>
  typeof value === "string" && value.length <= max ? value : undefined;

function buildRecords(body) {
  const id = requiredText(body, "id", 128);
  const type = requiredText(body, "type", 40);
  const date = requiredText(body, "date", 40);
  const title = requiredText(body, "title", 300);
  const sentAt = requiredText(body, "sentAt", 80);
  const html = requiredText(body, "html", MAX_HTML_LENGTH);
  if (!id || !isSafeId(id)) throw new TypeError("Invalid id");
  if (!type || !/^[A-Za-z0-9_-]{1,40}$/.test(type)) throw new TypeError("Invalid type");
  if (!date) throw new TypeError("Invalid date");
  if (!title) throw new TypeError("Invalid title");
  if (!sentAt || Number.isNaN(Date.parse(sentAt))) throw new TypeError("Invalid sentAt date");
  if (!html) throw new TypeError(`Invalid html (maximum ${MAX_HTML_LENGTH} characters)`);

  const optional = {
    subject: optionalText(body.subject, 300),
    instrument: optionalText(body.instrument, 32),
    bias: optionalText(body.bias, 80),
    summary: optionalText(body.summary, 4_000),
  };
  if (body.score !== undefined && body.score !== null) {
    if (!["string", "number"].includes(typeof body.score) || body.score === "" || !Number.isFinite(Number(body.score))) {
      throw new TypeError("Invalid score");
    }
    optional.score = Number(body.score);
  }
  if (body.conviction !== undefined && body.conviction !== null) {
    if (!["string", "number"].includes(typeof body.conviction) || String(body.conviction).length > 32) {
      throw new TypeError("Invalid conviction");
    }
    optional.conviction = body.conviction;
  }

  const meta = {
    id,
    type,
    date,
    title,
    sentAt,
    ...Object.fromEntries(Object.entries(optional).filter(([, value]) => value !== undefined)),
  };
  const record = { ...meta, html };
  if (body.brevoCampaignId === null || typeof body.brevoCampaignId === "string" || typeof body.brevoCampaignId === "number") {
    record.brevoCampaignId = body.brevoCampaignId;
  }
  return { id, sentAt, record, meta };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const secret = process.env.ARCHIVE_INGEST_SECRET;
  if (!secret) return json(res, 503, { error: "Ingest is not configured" });
  if (!isAuthorized(req.headers.authorization, secret)) {
    res.setHeader("WWW-Authenticate", 'Bearer realm="archive-ingest"');
    return json(res, 401, { error: "Unauthorized" });
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return json(res, 400, { error: "Invalid JSON body" });
  }

  let parsed;
  try {
    parsed = buildRecords(req.body);
  } catch (error) {
    return json(res, 400, { error: error instanceof Error ? error.message : "Invalid archive payload" });
  }

  const { id, sentAt, record, meta } = parsed;
  const sentScore = Date.parse(sentAt);
  const cutoffMs = Date.now() - THIRTY_DAYS_S * 1_000;
  if (sentScore < cutoffMs) return json(res, 400, { error: "Newsletter is outside the 30-day retention window" });
  if (sentScore > Date.now() + 24 * 60 * 60 * 1_000) return json(res, 400, { error: "Newsletter sentAt is too far in the future" });
  const ttlSeconds = Math.max(1, Math.ceil((sentScore + THIRTY_DAYS_S * 1_000 - Date.now()) / 1_000));

  try {
    if (!(await consumeRateLimit(req, res, { scope: "archive-ingest", identity: "automation", limit: 30 }))) {
      return json(res, 429, { error: "Too many ingest requests" });
    }
  } catch {
    return json(res, 503, { error: "Archive storage is temporarily unavailable" });
  }

  try {
    const result = await redisCommand([
      "EVAL",
      "redis.call('SET',KEYS[1],ARGV[1],'EX',ARGV[5]); redis.call('SET',KEYS[2],ARGV[2],'EX',ARGV[5]); redis.call('ZADD',KEYS[3],ARGV[3],ARGV[4]); redis.call('ZREMRANGEBYSCORE',KEYS[3],'-inf',ARGV[6]); return 1",
      "3", `newsletter:${id}`, `newsletter:meta:${id}`, "newsletters:index",
      JSON.stringify(record), JSON.stringify(meta), String(sentScore), id, String(ttlSeconds), `(${cutoffMs}`,
    ]);
    if (Number(result) !== 1) throw new Error("Unexpected Redis write result");
  } catch (error) {
    console.error("Archive ingest storage write failed", error instanceof Error ? error.name : "UnknownError");
    return json(res, 503, { error: "Archive storage is temporarily unavailable" });
  }

  return json(res, 200, { ok: true, id, url: `${BASE_URL}/api/archive/${encodeURIComponent(id)}` });
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
