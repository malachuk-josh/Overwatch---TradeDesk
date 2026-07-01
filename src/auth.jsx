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
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import LogIn from "lucide-react/dist/esm/icons/log-in.mjs";

// True only when a publishable key is configured. Gate every Clerk render on this:
// the components below require a <ClerkProvider>, which main.jsx only mounts when the key exists.
export const CLERK_ENABLED = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

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
