import { verifyToken } from "@clerk/backend";

// Per-user desk settings (watchlist, thesis weights, desk tools, etc.), namespaced by the
// authenticated Clerk user id in Upstash. Signed-out clients never reach here — they keep using
// browser storage — so this endpoint always requires a valid Clerk session token.

const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

async function redisCmd(command) {
  const res = await fetch(kvUrl(), {
    method: "POST",
    headers: { Authorization: `Bearer ${kvToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Redis command failed: ${res.status}`);
  return (await res.json()).result;
}

// Verify the Bearer session token with Clerk (networkless once JWKS is cached) and return the user id.
async function authUserId(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const claims = await verifyToken(auth.slice(7), { secretKey });
    return claims?.sub || null;
  } catch {
    return null;
  }
}

// Only these fields are persisted, so a client can't stuff arbitrary data into the record.
const pickSettings = (body) => ({
  watchlist: Array.isArray(body.watchlist) ? body.watchlist : [],
  instrument: typeof body.instrument === "string" ? body.instrument : null,
  weights: body.weights && typeof body.weights === "object" ? body.weights : null,
  lean: typeof body.lean === "string" ? body.lean : null,
  risk: typeof body.risk === "string" ? body.risk : null,
  deskTools: body.deskTools && typeof body.deskTools === "object" ? body.deskTools : null,
  updatedAt: Date.now(),
});

export default async function handler(req, res) {
  const uid = await authUserId(req);
  if (!uid) return json(res, 401, { error: "Unauthorized" });

  if (!kvUrl() || !kvToken()) return json(res, 500, { error: "Storage not configured" });
  const key = `user:${uid}:settings`;

  if (req.method === "GET") {
    try {
      const raw = await redisCmd(["GET", key]);
      return json(res, 200, { data: raw ? JSON.parse(raw) : null });
    } catch {
      return json(res, 502, { error: "Failed to read settings" });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    const body = req.body;
    if (!body || typeof body !== "object") return json(res, 400, { error: "Invalid JSON body" });
    try {
      await redisCmd(["SET", key, JSON.stringify(pickSettings(body))]);
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 502, { error: "Failed to save settings" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
