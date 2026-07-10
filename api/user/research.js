import {
  json, redisCmd, authUserId, kvUrl, kvToken,
  writeVersionedJson, storedRevision, RevisionConflictError,
} from "../_userStore.js";
import { consumeRateLimit } from "../archive/_shared.js";

// Per-user deep-research briefs, namespaced by the authenticated Clerk user id in Upstash.
// Deep research is metered (it fans out to the Anthropic API with live web search/fetch), so
// briefs are only ever generated for a signed-in account — this keeps their history with them
// across devices and gives a place to budget/audit usage per user later.

const MAX_ENTRIES = 40; // matches the client-side cap in ResearchLab

export default async function handler(req, res) {
  const uid = await authUserId(req);
  if (!uid) return json(res, 401, { error: "Unauthorized" });

  if (!kvUrl() || !kvToken()) return json(res, 503, { error: "Storage not configured" });
  const key = `user:${uid}:research`;
  try {
    const write = req.method === "PUT" || req.method === "POST";
    if (!(await consumeRateLimit(req, res, { scope: `user-research-${write ? "write" : "read"}`, identity: uid, limit: write ? 30 : 120 }))) {
      return json(res, 429, { error: "Too many research requests" });
    }
  } catch {
    return json(res, 503, { error: "Rate-limit storage unavailable" });
  }

  if (req.method === "GET") {
    try {
      const raw = await redisCmd(["GET", key]);
      const parsed = raw ? JSON.parse(raw) : null;
      const briefs = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.briefs) ? parsed.briefs : null;
      return json(res, 200, { data: briefs, revision: storedRevision(raw, parsed) });
    } catch {
      return json(res, 502, { error: "Failed to read research briefs" });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    const body = req.body;
    const briefs = Array.isArray(body?.briefs) ? body.briefs.slice(0, MAX_ENTRIES) : null;
    if (!briefs) return json(res, 400, { error: "Expected { briefs: [...] }" });
    if (Buffer.byteLength(JSON.stringify(briefs), "utf8") > 850_000) return json(res, 413, { error: "Research history is too large" });
    try {
      const enforce = Object.prototype.hasOwnProperty.call(body, "baseRevision");
      const revision = await writeVersionedJson(key, { briefs, updatedAt: Date.now() }, { enforce, baseRevision: body.baseRevision });
      return json(res, 200, { ok: true, revision });
    } catch (error) {
      if (error instanceof RevisionConflictError) return json(res, 409, { error: error.message, code: "revision_conflict", revision: error.currentRevision });
      if (error instanceof TypeError) return json(res, 400, { error: error.message });
      return json(res, 502, { error: "Failed to save research briefs" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
