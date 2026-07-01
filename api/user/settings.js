import { json, redisCmd, authUserId, kvUrl, kvToken } from "../_userStore.js";

// Per-user desk settings (watchlist, thesis weights, desk tools, etc.), namespaced by the
// authenticated Clerk user id in Upstash. Signed-out clients never reach here — they keep using
// browser storage — so this endpoint always requires a valid Clerk session token.

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
