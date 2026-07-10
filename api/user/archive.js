import {
  json, redisCmd, authUserId, kvUrl, kvToken,
  writeVersionedJson, storedRevision, RevisionConflictError,
} from "../_userStore.js";
import { consumeRateLimit } from "../archive/_shared.js";

// Per-user thesis library / archive, namespaced by the authenticated Clerk user id in Upstash.
// Signed-out clients keep their library in browser storage; only signed-in requests reach here.

const MAX_ENTRIES = 120; // hard cap so a runaway client can't balloon the record

export default async function handler(req, res) {
  const uid = await authUserId(req);
  if (!uid) return json(res, 401, { error: "Unauthorized" });

  if (!kvUrl() || !kvToken()) return json(res, 503, { error: "Storage not configured" });
  const key = `user:${uid}:archive`;
  try {
    const write = req.method === "PUT" || req.method === "POST";
    if (!(await consumeRateLimit(req, res, { scope: `user-archive-${write ? "write" : "read"}`, identity: uid, limit: write ? 30 : 120 }))) {
      return json(res, 429, { error: "Too many archive requests" });
    }
  } catch {
    return json(res, 503, { error: "Rate-limit storage unavailable" });
  }

  if (req.method === "GET") {
    try {
      const raw = await redisCmd(["GET", key]);
      const parsed = raw ? JSON.parse(raw) : null;
      // Records are stored as { archive, updatedAt }; tolerate a bare array from any earlier shape.
      const archive = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.archive) ? parsed.archive : null;
      return json(res, 200, { data: archive, revision: storedRevision(raw, parsed) });
    } catch {
      return json(res, 502, { error: "Failed to read archive" });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    const body = req.body;
    const archive = Array.isArray(body?.archive) ? body.archive.slice(0, MAX_ENTRIES) : null;
    if (!archive) return json(res, 400, { error: "Expected { archive: [...] }" });
    if (Buffer.byteLength(JSON.stringify(archive), "utf8") > 1_500_000) return json(res, 413, { error: "Archive is too large" });
    try {
      const enforce = Object.prototype.hasOwnProperty.call(body, "baseRevision");
      const revision = await writeVersionedJson(key, { archive, updatedAt: Date.now() }, { enforce, baseRevision: body.baseRevision });
      return json(res, 200, { ok: true, revision });
    } catch (error) {
      if (error instanceof RevisionConflictError) return json(res, 409, { error: error.message, code: "revision_conflict", revision: error.currentRevision });
      if (error instanceof TypeError) return json(res, 400, { error: error.message });
      return json(res, 502, { error: "Failed to save archive" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}

export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };
