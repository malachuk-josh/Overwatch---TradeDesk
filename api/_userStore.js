// Shared helpers for authenticated per-user endpoints. The leading underscore keeps Vercel from
// treating this as a routable function — it's import-only.
import { verifyToken, createClerkClient } from "@clerk/backend";

export const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
export const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

export async function redisCmd(command) {
  const res = await fetch(kvUrl(), {
    method: "POST",
    headers: { Authorization: `Bearer ${kvToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Redis command failed: ${res.status}`);
  return (await res.json()).result;
}

// Verify the Bearer session token with Clerk and return the user id (or null when unauthenticated).
export async function authUserId(req) {
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

// Verify the Bearer session token and resolve the signed-in user's primary email (lowercased), or
// null when unauthenticated. The default session JWT only carries the user id (sub), not email, so
// this makes one extra Backend API call to fetch the user record — used for endpoints that gate an
// action to one specific account rather than "any signed-in user".
export async function authUserEmail(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const claims = await verifyToken(auth.slice(7), { secretKey });
    if (!claims?.sub) return null;
    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(claims.sub);
    const email = user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
      || user?.emailAddresses?.[0]?.emailAddress
      || null;
    return email ? email.toLowerCase() : null;
  } catch {
    return null;
  }
}
