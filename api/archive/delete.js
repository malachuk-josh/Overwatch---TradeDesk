import { json, redisCmd, authUserEmail, kvUrl, kvToken } from "../_userStore.js";

// Deletes a Jacks Journal (cloud newsletter) entry. Restricted to one specific account — this is a
// shared archive (all signed-in users read the same list), so unlike the per-user watchlist/thesis
// endpoints this can't just check "is someone signed in"; it checks WHO.
const ADMIN_EMAIL = "malachuk@gmail.com";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const email = await authUserEmail(req);
  if (email !== ADMIN_EMAIL) return json(res, 403, { error: "Not authorized to delete journal entries" });

  if (!kvUrl() || !kvToken()) return json(res, 500, { error: "Storage not configured" });

  const { id } = req.body || {};
  if (!id || typeof id !== "string") return json(res, 400, { error: "Missing id" });

  try {
    await redisCmd(["DEL", `newsletter:${id}`]);
    await redisCmd(["DEL", `newsletter:meta:${id}`]);
    await redisCmd(["ZREM", "newsletters:index", id]);
    return json(res, 200, { ok: true });
  } catch {
    return json(res, 502, { error: "Failed to delete entry" });
  }
}
