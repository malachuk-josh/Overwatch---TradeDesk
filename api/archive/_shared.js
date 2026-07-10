import { createHash } from "node:crypto";

const STORAGE_TIMEOUT_MS = 8_000;

export class StorageError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "StorageError";
  }
}

export const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
export const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const storageConfig = () => {
  const url = kvUrl();
  const token = kvToken();
  if (!url || !token) throw new StorageError("Storage is not configured");
  return { url: url.replace(/\/+$/, ""), token };
};

const readRedisResponse = async (response, label) => {
  let payload;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new StorageError(`${label} returned invalid JSON`, { cause });
  }

  if (!response.ok) {
    throw new StorageError(`${label} failed with HTTP ${response.status}`);
  }
  if (!payload || typeof payload !== "object" || !("result" in payload)) {
    throw new StorageError(`${label} returned an invalid response`);
  }
  if (payload.error) throw new StorageError(`${label} failed`);
  return payload.result;
};

export async function redisCommand(command, timeoutMs = STORAGE_TIMEOUT_MS) {
  const { url, token } = storageConfig();
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw new StorageError("Storage request failed", { cause });
  }
  return readRedisResponse(response, "Redis command");
}

export async function redisPipeline(commands, timeoutMs = 10_000) {
  if (!Array.isArray(commands) || commands.length === 0) return [];
  const { url, token } = storageConfig();
  let response;
  try {
    response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw new StorageError("Storage pipeline request failed", { cause });
  }

  let payload;
  try {
    payload = await response.json();
  } catch (cause) {
    throw new StorageError("Redis pipeline returned invalid JSON", { cause });
  }
  if (!response.ok) throw new StorageError(`Redis pipeline failed with HTTP ${response.status}`);
  if (!Array.isArray(payload) || payload.length !== commands.length) {
    throw new StorageError("Redis pipeline returned an invalid response");
  }
  return payload.map((entry) => {
    if (!entry || typeof entry !== "object" || !("result" in entry) || entry.error) {
      throw new StorageError("Redis pipeline command failed");
    }
    return entry.result;
  });
}

export const json = (res, status, body, { cacheControl = "no-store" } = {}) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.end(JSON.stringify(body));
};

const requestIdentity = (req) => {
  const raw = String(req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || "unknown").split(",")[0].trim();
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
};

// Durable fixed-window limiter for Redis-backed routes. Public callers use a one-way hash of their
// address; authenticated routes pass the Clerk user id. The counter and expiry are one atomic script.
export async function consumeRateLimit(req, res, { scope, identity = null, limit = 60, windowSec = 60 } = {}) {
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const subject = identity || requestIdentity(req);
  const key = `ratelimit:${String(scope || "storage").slice(0, 60)}:${subject}:${bucket}`;
  const count = Number(await redisCommand([
    "EVAL",
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return n",
    "1", key, String(windowSec * 2),
  ]));
  if (!Number.isFinite(count)) throw new StorageError("Rate-limit storage returned an invalid response");
  res.setHeader("RateLimit-Limit", String(limit));
  res.setHeader("RateLimit-Remaining", String(Math.max(0, limit - count)));
  res.setHeader("RateLimit-Reset", String((bucket + 1) * windowSec));
  if (count > limit) {
    res.setHeader("Retry-After", String(windowSec));
    return false;
  }
  return true;
}

export const queryValue = (value) => (Array.isArray(value) ? value[0] : value);

export const isSafeId = (value) =>
  typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);

export const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

export function setHtmlSecurityHeaders(res, { embeddable = false, cacheControl = "no-store", images = false } = {}) {
  const imageSource = images ? "img-src data: https:" : "img-src data:";
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("Content-Security-Policy", [
    "default-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    `frame-ancestors ${embeddable ? "'self'" : "'none'"}`,
    "object-src 'none'",
    "script-src 'none'",
    "style-src 'unsafe-inline'",
    imageSource,
    "font-src data:",
    "connect-src 'none'",
    "media-src 'none'",
    "worker-src 'none'",
    "manifest-src 'none'",
  ].join("; "));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", embeddable ? "SAMEORIGIN" : "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
}

export const errorPage = (title, message = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title><style>
body{margin:0;background:#0c0f14;color:#ece8df;font:16px/1.6 system-ui,-apple-system,sans-serif;display:grid;min-height:100vh;place-items:center}
main{max-width:36rem;padding:2rem}h1{font-size:1.6rem;margin:0 0 .5rem;color:#c9a84c}p{color:#aaa59b;margin:0}
</style></head><body><main><h1>${escapeHtml(title)}</h1>${message ? `<p>${escapeHtml(message)}</p>` : ""}</main></body></html>`;
