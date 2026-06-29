const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

const REQUIRED = ["id", "type", "date", "title", "sentAt", "html"];
const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://overwatch-mu.vercel.app";

async function redisPipeline(commands) {
  const url = kvUrl();
  const token = kvToken();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Redis pipeline failed: ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const secret = process.env.ARCHIVE_INGEST_SECRET;
  if (!secret) return json(res, 500, { error: "Ingest not configured" });

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${secret}`) return json(res, 401, { error: "Unauthorized" });

  const url = kvUrl();
  const token = kvToken();
  if (!url || !token) return json(res, 500, { error: "Redis not configured" });

  const body = req.body;
  if (!body || typeof body !== "object") return json(res, 400, { error: "Invalid JSON body" });

  const missing = REQUIRED.filter((k) => !body[k]);
  if (missing.length) return json(res, 400, { error: `Missing required fields: ${missing.join(", ")}` });

  const { id, html, ...meta } = body;
  const record = { ...meta, id, html };
  // Slim metadata (no html) so the list endpoint never has to transfer full newsletter bodies.
  const metaRecord = { ...meta, id };

  const score = Date.parse(body.sentAt);
  if (Number.isNaN(score)) return json(res, 400, { error: "Invalid sentAt date" });

  await redisPipeline([
    ["SET", `newsletter:${id}`, JSON.stringify(record), "EX", "31536000"],
    ["SET", `newsletter:meta:${id}`, JSON.stringify(metaRecord), "EX", "31536000"],
    ["ZADD", "newsletters:index", score, id],
  ]);

  return json(res, 200, { ok: true, id, url: `${BASE_URL}/archive/${id}` });
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
