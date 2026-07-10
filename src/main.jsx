import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import Overwatch from "./App.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

// Only wrap the app in Clerk when a publishable key is configured. Without it, render the plain
// app so the desk keeps working (local-only, no sign-in) instead of white-screening on a missing key.
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Top-level boundary: catches any render throw the whole app produces so a single bad component /
// data shape shows a recoverable fallback instead of a blank white screen.
const app = (
  <React.StrictMode>
    <ErrorBoundary scope="app">
      <Overwatch />
    </ErrorBoundary>
  </React.StrictMode>
);

createRoot(document.getElementById("root")).render(
  publishableKey
    ? <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">{app}</ClerkProvider>
    : app,
);
