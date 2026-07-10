/* ================================================================
   AUTH SHELL (Phase 1)
   Sign-in / session UI powered by Clerk. Everything here is a no-op
   until VITE_CLERK_PUBLISHABLE_KEY is set in the environment — the app
   runs exactly as before (local-only, no sign-in) when it's absent, so
   the desk never breaks just because auth isn't configured yet.

   Later phases read the Clerk session token (useAuth().getToken) and send
   it as a Bearer to /api routes, which verify it server-side and namespace
   each user's watchlist / desk settings / thesis library in Upstash.
   ================================================================ */
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import LogIn from "lucide-react/dist/esm/icons/log-in.mjs";

// True only when a publishable key is configured. Gate every Clerk render on this:
// the components below require a <ClerkProvider>, which main.jsx only mounts when the key exists.
export const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

// Unified auth state for the app. Two implementations are selected ONCE at module load (CLERK_ENABLED
// is env-constant), so the same hook runs every render — no conditional-hook violation. The no-auth
// variant lets the whole app treat "signed out" and "auth disabled" identically: local storage only.
function useClerkSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  return {
    ready: isLoaded,
    signedIn: Boolean(isSignedIn),
    getToken,
    userId: user?.id || null,
    email: user?.primaryEmailAddress?.emailAddress || null,
  };
}
function useNoSync() {
  return { ready: true, signedIn: false, getToken: async () => null, userId: null, email: null };
}
export const useAuthSync = CLERK_ENABLED ? useClerkSync : useNoSync;

const readUserResource = async (getToken, path, label) => {
  const token = await getToken?.();
  if (!token) throw new Error("Authentication required");
  const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json())?.error || ""; } catch { /* non-JSON failure */ }
    throw new Error(detail || `Failed to load ${label} (${res.status})`);
  }
  const { data, revision = null } = await res.json();
  return data == null ? { status: "not-found", data: null, revision } : { status: "ok", data, revision };
};

const writeUserResource = async (getToken, path, body, label) => {
  const token = await getToken?.();
  if (!token) throw new Error("Authentication required");
  const res = await fetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let payload = null;
    try { payload = await res.json(); } catch { /* non-JSON failure */ }
    const error = new Error(payload?.error || `Failed to save ${label} (${res.status})`);
    error.code = payload?.code || null;
    error.revision = payload?.revision ?? null;
    throw error;
  }
  let payload = null;
  try { payload = await res.json(); } catch { /* an older endpoint may return an empty 2xx */ }
  return { status: "ok", revision: payload?.revision ?? null };
};

// --- Authenticated per-user settings sync (Phase 2) -----------------------------------------
// getToken comes from useAuthSync(); it returns null when signed out, so both calls no-op safely.
export async function loadUserSettings(getToken) {
  return readUserResource(getToken, "/api/user/settings", "settings");
}

export async function saveUserSettings(getToken, settings, baseRevision) {
  return writeUserResource(getToken, "/api/user/settings", { ...settings, baseRevision }, "settings");
}

// Per-user thesis library / archive (Phase 3). loadUserArchive returns an array, or null when the
// account has no record yet (so the caller knows to seed it from this browser's library).
export async function loadUserArchive(getToken) {
  const result = await readUserResource(getToken, "/api/user/archive", "archive");
  if (result.status === "ok" && !Array.isArray(result.data)) throw new Error("Archive response was invalid");
  return result;
}

export async function saveUserArchive(getToken, archive, baseRevision) {
  return writeUserResource(getToken, "/api/user/archive", { archive, baseRevision }, "archive");
}

// Per-user deep-research briefs (Phase 4). Deep research is metered (Anthropic + live web search),
// so it's account-gated end to end: the /api/desk "research" op itself requires this same token.
export async function loadUserResearch(getToken) {
  const result = await readUserResource(getToken, "/api/user/research", "research briefs");
  if (result.status === "ok" && !Array.isArray(result.data)) throw new Error("Research response was invalid");
  return result;
}

export async function saveUserResearch(getToken, briefs, baseRevision) {
  return writeUserResource(getToken, "/api/user/research", { briefs, baseRevision }, "research briefs");
}

// Keep Clerk's popovers/modal on-brand with the dark desk (brass-blue accent).
const clerkAppearance = {
  variables: {
    colorPrimary: "#3B82F6",
    borderRadius: "10px",
  },
};

// In-context sign-in CTA for gating a specific feature (vs. the header's compact AuthControl).
// Only render this when auth.signedIn is false; it's a no-op if Clerk isn't configured at all.
export function GatedSignIn({ label = "Sign in to continue" }) {
  if (!CLERK_ENABLED) return null;
  return (
    <SignInButton mode="modal" appearance={clerkAppearance}>
      <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center", gap: 8, padding: "12px" }}>
        <LogIn size={15} /> {label}
      </button>
    </SignInButton>
  );
}

// Header control: a "Sign in" button when signed out, the account avatar/menu when signed in.
export function AuthControl() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal" appearance={clerkAppearance}>
          <button className="btn btn-ghost" title="Sign in to sync your desk across devices">
            <LogIn size={16} /> <span className="sync-label">Sign in</span>
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" appearance={clerkAppearance} />
      </SignedIn>
    </>
  );
}
