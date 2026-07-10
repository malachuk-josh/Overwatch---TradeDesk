import { authUserEmail, authUserId } from "../_userStore.js";
import { consumeRateLimit, isSafeId, json, redisCommand } from "./_shared.js";

// Jack's Journal is a shared archive. Reads stay public, while destructive writes require this exact
// verified Clerk account. The environment override makes the identity explicit per deployment.
const adminEmail = () => String(process.env.ARCHIVE_ADMIN_EMAIL || "").trim().toLowerCase();
const adminUserId = () => String(process.env.ARCHIVE_ADMIN_USER_ID || "").trim();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  if (typeof req.headers.authorization !== "string" || !req.headers.authorization.startsWith("Bearer ")) {
    return json(res, 403, { error: "Not authorized to delete journal entries" });
  }
  const expectedUserId = adminUserId();
  const expectedEmail = adminEmail();
  if (!expectedUserId && !expectedEmail) return json(res, 503, { error: "Archive administration is not configured" });
  const authorized = expectedUserId
    ? (await authUserId(req)) === expectedUserId
    : (await authUserEmail(req)) === expectedEmail;
  if (!authorized) {
    return json(res, 403, { error: "Not authorized to delete journal entries" });
  }

  try {
    if (!(await consumeRateLimit(req, res, { scope: "archive-delete", identity: expectedUserId || expectedEmail, limit: 30 }))) {
      return json(res, 429, { error: "Too many delete requests" });
    }
  } catch {
    return json(res, 503, { error: "Archive storage is temporarily unavailable" });
  }

  const id = req.body?.id;
  if (!isSafeId(id)) return json(res, 400, { error: "Invalid id" });

  try {
    const results = await redisCommand([
      "EVAL",
      "local a=redis.call('DEL',KEYS[1]); local b=redis.call('DEL',KEYS[2]); local c=redis.call('ZREM',KEYS[3],ARGV[1]); return {a,b,c}",
      "3", `newsletter:${id}`, `newsletter:meta:${id}`, "newsletters:index", id,
    ]);
    if (!results.every((value) => Number.isFinite(Number(value)))) {
      throw new Error("Unexpected Redis delete result");
    }
    return json(res, 200, { ok: true, deleted: results.some((value) => Number(value) > 0) });
  } catch (error) {
    console.error("Archive delete storage write failed", error instanceof Error ? error.name : "UnknownError");
    return json(res, 503, { error: "Archive storage is temporarily unavailable" });
  }
}
