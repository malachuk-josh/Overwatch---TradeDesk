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
    email: user?.primaryEmailAddress?.emailAddress || null,
  };
}
function useNoSync() {
  return { ready: true, signedIn: false, getToken: async () => null, email: null };
}
export const useAuthSync = CLERK_ENABLED ? useClerkSync : useNoSync;

// --- Authenticated per-user settings sync (Phase 2) -----------------------------------------
// getToken comes from useAuthSync(); it returns null when signed out, so both calls no-op safely.
export async function loadUserSettings(getToken) {
  const token = await getToken?.();
  if (!token) return null;
  const res = await fetch("/api/user/settings", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const { data } = await res.json();
  return data || null;
}

export async function saveUserSettings(getToken, settings) {
  const token = await getToken?.();
  if (!token) return false;
  const res = await fetch("/api/user/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
  return res.ok;
}

// Keep Clerk's popovers/modal on-brand with the dark desk (brass-blue accent).
const clerkAppearance = {
  variables: {
    colorPrimary: "#3B82F6",
    borderRadius: "10px",
  },
};

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
