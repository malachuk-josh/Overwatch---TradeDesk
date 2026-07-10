// Shared helpers for authenticated per-user endpoints. The leading underscore keeps Vercel from
// treating this as a routable function — it's import-only.
import { verifyToken, createClerkClient } from "@clerk/backend";
import { randomUUID } from "node:crypto";

export const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
export const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.end(JSON.stringify(body));
};

export class RedisError extends Error {
  constructor(message, { status = 502, cause } = {}) {
    super(message, { cause });
    this.name = "RedisError";
    this.status = status;
  }
}

export class RevisionConflictError extends Error {
  constructor(currentRevision) {
    super("Cloud record changed on another device");
    this.name = "RevisionConflictError";
    this.status = 409;
    this.currentRevision = currentRevision;
  }
}

const redisConfig = () => {
  const url = kvUrl();
  const token = kvToken();
  if (!url || !token) throw new RedisError("Redis is not configured", { status: 503 });
  return { url: url.replace(/\/$/, ""), token };
};

async function redisRequest(path, body, timeoutMs) {
  const { url, token } = redisConfig();
  let res;
  try {
    res = await fetch(`${url}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw new RedisError("Redis request failed", { status: 503, cause });
  }

  let payload;
  try {
    payload = await res.json();
  } catch (cause) {
    throw new RedisError(`Redis returned an invalid response (${res.status})`, { cause });
  }
  if (!res.ok || payload?.error) {
    throw new RedisError(`Redis command failed (${res.status}): ${payload?.error || "upstream error"}`);
  }
  return payload;
}

export async function redisCmd(command) {
  const payload = await redisRequest("", command, 8000);
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !("result" in payload)) {
    throw new RedisError("Redis command returned an invalid response");
  }
  return payload.result;
}

export async function redisPipeline(commands) {
  if (!Array.isArray(commands) || !commands.length) return [];
  const payload = await redisRequest("/pipeline", commands, 10000);
  if (!Array.isArray(payload) || payload.length !== commands.length || payload.some((entry) => !entry || typeof entry !== "object" || !("result" in entry))) {
    throw new RedisError("Redis pipeline returned an invalid response");
  }
  const failed = payload.find((entry) => entry.error);
  if (failed) throw new RedisError(`Redis pipeline command failed: ${failed.error}`);
  return payload;
}

// Atomically compare-and-set a JSON record. Older clients may omit baseRevision and retain the
// previous unconditional-write behavior; upgraded clients send the revision returned by GET and
// receive a 409 instead of silently overwriting a newer tab/device.
export async function writeVersionedJson(key, value, { enforce = false, baseRevision = null } = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Versioned record must be an object");
  let expected = "__MISSING__";
  if (baseRevision !== null && baseRevision !== undefined) {
    if (!["string", "number"].includes(typeof baseRevision) || String(baseRevision).length > 128) {
      throw new TypeError("Invalid baseRevision");
    }
    expected = String(baseRevision);
  }
  const revision = randomUUID();
  const record = { ...value, revision };
  const script = "local raw=redis.call('GET',KEYS[1]); local current='__MISSING__'; if raw then local ok,obj=pcall(cjson.decode,raw); if ok and type(obj)=='table' and obj['revision'] then current=tostring(obj['revision']) else current='legacy' end end; if ARGV[1]=='1' and current~=ARGV[2] then return {'CONFLICT',current} end; redis.call('SET',KEYS[1],ARGV[3]); return {'OK',ARGV[4]}";
  const result = await redisCmd(["EVAL", script, "1", key, enforce ? "1" : "0", expected, JSON.stringify(record), revision]);
  if (!Array.isArray(result) || result.length < 2) throw new RedisError("Redis versioned write returned an invalid response");
  if (result[0] === "CONFLICT") {
    const current = result[1] === "__MISSING__" ? null : result[1];
    throw new RevisionConflictError(current);
  }
  if (result[0] !== "OK" || result[1] !== revision) throw new RedisError("Redis versioned write was not confirmed");
  return revision;
}

export const storedRevision = (raw, parsed) => {
  if (!raw) return null;
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.revision != null
    ? String(parsed.revision)
    : "legacy";
};

// Verify the Bearer session token with Clerk and return the user id (or null when unauthenticated).
const verifySessionToken = async (token) => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || !token) return null;
  const authorizedParties = String(process.env.CLERK_AUTHORIZED_PARTIES || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const claims = await verifyToken(token, {
    secretKey,
    ...(authorizedParties.length ? { authorizedParties } : {}),
  });
  return typeof claims?.sub === "string" && claims.sub.length <= 128 ? claims : null;
};

export async function authUserId(req) {
  const auth = req.headers.authorization || "";
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return null;
  try {
    const claims = await verifySessionToken(auth.slice(7));
    return claims?.sub || null;
  } catch {
    return null;
  }
}

// Verify the Bearer session token and resolve the signed-in user's primary email (lowercased), or
// null when unauthenticated. The default session JWT only carries the user id (sub), not email, so
// this makes one extra Backend API call to fetch the user record — used for endpoints that gate an
// action to one specific account rather than "any signed-in user".
export async function authUserEmail(req) {
  const auth = req.headers.authorization || "";
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return null;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const claims = await verifySessionToken(auth.slice(7));
    if (!claims?.sub) return null;
    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(claims.sub);
    const address = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      || user?.emailAddresses?.[0]
      || null;
    if (address?.verification?.status !== "verified") return null;
    return address.emailAddress ? address.emailAddress.toLowerCase() : null;
  } catch {
    return null;
  }
}
