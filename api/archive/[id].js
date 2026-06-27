const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.statusCode = 400;
    res.end("Missing id");
    return;
  }

  const url = kvUrl();
  const token = kvToken();
  if (!url || !token) {
    res.statusCode = 500;
    res.end("Redis not configured");
    return;
  }

  try {
    const result = await fetch(`${url}/get/newsletter:${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    const { result: raw } = await result.json();
    if (!raw) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html");
      res.end("<!doctype html><html><body><h1>404 — Newsletter not found</h1><p>This archive entry does not exist or has expired.</p></body></html>");
      return;
    }

    const record = JSON.parse(raw);
    if (!record.html) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html");
      res.end("<!doctype html><html><body><h1>404 — No HTML content</h1></body></html>");
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    res.end(record.html);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<!doctype html><html><body><h1>500 — Error loading newsletter</h1></body></html>");
  }
}
