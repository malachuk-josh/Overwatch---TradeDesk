const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://overwatch-mu.vercel.app";

async function redisCmd(command) {
  const url = kvUrl();
  const token = kvToken();
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Redis command failed: ${res.status}`);
  return (await res.json()).result;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const url = kvUrl();
  const token = kvToken();
  if (!url || !token) return json(res, 200, { data: [] });

  const { type, limit: rawLimit } = req.query || {};
  const limit = Math.min(Math.max(Number(rawLimit) || 50, 1), 200);

  const ids = await redisCmd(["ZRANGE", "newsletters:index", "+inf", "-inf", "BYSCORE", "REV", "LIMIT", "0", String(limit)]);
  if (!ids || !ids.length) return json(res, 200, { data: [] });

  const pipeline = ids.map((id) => ["GET", `newsletter:${id}`]);
  const pipeRes = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(pipeline),
    signal: AbortSignal.timeout(10000),
  });
  const results = await pipeRes.json();

  const items = results
    .map((r) => {
      if (!r?.result) return null;
      try {
        const record = JSON.parse(r.result);
        const { html, ...meta } = record;
        return { ...meta, url: `${BASE_URL}/archive/${meta.id}` };
      } catch { return null; }
    })
    .filter(Boolean);

  const filtered = type ? items.filter((i) => i.type === type) : items;

  return json(res, 200, { data: filtered });
}
