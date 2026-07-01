import { json, redisCmd, authUserId, kvUrl, kvToken } from "../_userStore.js";

// Per-user thesis library / archive, namespaced by the authenticated Clerk user id in Upstash.
// Signed-out clients keep their library in browser storage; only signed-in requests reach here.

const MAX_ENTRIES = 120; // hard cap so a runaway client can't balloon the record

export default async function handler(req, res) {
  const uid = await authUserId(req);
  if (!uid) return json(res, 401, { error: "Unauthorized" });

  if (!kvUrl() || !kvToken()) return json(res, 500, { error: "Storage not configured" });
  const key = `user:${uid}:archive`;

  if (req.method === "GET") {
    try {
      const raw = await redisCmd(["GET", key]);
      const parsed = raw ? JSON.parse(raw) : null;
      // Records are stored as { archive, updatedAt }; tolerate a bare array from any earlier shape.
      const archive = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.archive) ? parsed.archive : null;
      return json(res, 200, { data: archive });
    } catch {
      return json(res, 502, { error: "Failed to read archive" });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    const body = req.body;
    const archive = Array.isArray(body?.archive) ? body.archive.slice(0, MAX_ENTRIES) : null;
    if (!archive) return json(res, 400, { error: "Expected { archive: [...] }" });
    try {
      await redisCmd(["SET", key, JSON.stringify({ archive, updatedAt: Date.now() })]);
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 502, { error: "Failed to save archive" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };
