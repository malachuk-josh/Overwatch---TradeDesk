import React from "react";

// App-wide safety net. Without an error boundary, a single render-time throw unmounts the entire
// React tree and the user gets a blank white screen (this is exactly what a data-shape regression in
// the signed-in hydration path did once). Wrapping the app — and each tab — in a boundary turns a
// localized bug into a contained, recoverable fallback instead of a dead page.
//
// Styles are inline on purpose: the boundary must render even if the stylesheet, theme, or any app
// module is the thing that broke, so it can't depend on app CSS or components.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface it loudly so it shows up in the console and any error-tracking, with the component stack.
    console.error(`[ErrorBoundary${this.props.scope ? ` · ${this.props.scope}` : ""}]`, error, info?.componentStack);
    // Persist the last error so a precise diagnosis survives the crash — retrievable from the console
    // via localStorage.getItem("overwatch:lastError") even after the fallback replaces the UI. This is
    // how we pin the exact throwing component for a data-shape regression without a live repro.
    try {
      window.localStorage.setItem("overwatch:lastError", JSON.stringify({
        scope: this.props.scope || null,
        message: String(error?.message || error),
        stack: String(error?.stack || "").slice(0, 4000),
        componentStack: String(info?.componentStack || "").slice(0, 4000),
        at: new Date().toISOString(),
      }));
    } catch { /* storage may be unavailable */ }
    this.props.onError?.(error, info);
  }

  reset = () => {
    // Let a parent re-key/remount if it wants to; otherwise just clear our own error and re-render.
    if (this.props.onReset) this.props.onReset();
    this.setState({ error: null });
  };

  hardReload = () => {
    try { window.location.reload(); } catch { /* ignore */ }
  };

  clearLocalData = () => {
    // Escape hatch for the exact failure mode that motivated this: stored/synced data of an old shape
    // crashing the render. Wiping the local cache (and reloading) lets the app re-hydrate from defaults
    // or a fresh cloud pull. It does NOT delete the user's cloud archive — only this device's cache.
    try {
      const keep = /^(overwatch:light|__clerk|clerk-)/; // preserve theme + Clerk session keys
      const doomed = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith("overwatch:") && !keep.test(k)) doomed.push(k);
      }
      doomed.forEach((k) => window.localStorage.removeItem(k));
    } catch { /* ignore */ }
    this.hardReload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    // A compact, self-contained fallback. `compact` (per-tab) keeps the surrounding chrome usable;
    // the default (top-level) fills the viewport.
    const compact = this.props.compact;
    const wrap = {
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 14, textAlign: "center", color: "#c7d0dc", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      background: "#0b0e13", border: "1px solid #232a35", borderRadius: 12,
      padding: compact ? "28px 20px" : "56px 24px",
      minHeight: compact ? 220 : "60vh", margin: compact ? "14px 0" : 0,
    };
    const btn = {
      cursor: "pointer", border: "1px solid #2f6bff", background: "transparent", color: "#8fb0ff",
      borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600,
    };
    const btnGhost = { ...btn, border: "1px solid #303845", color: "#9aa6b4" };

    return (
      <div style={wrap} role="alert">
        <div style={{ fontSize: compact ? 15 : 18, fontWeight: 700, color: "#e8edf4" }}>
          {this.props.title || (compact ? "This section hit an error" : "Something went wrong")}
        </div>
        <div style={{ fontSize: 12.5, maxWidth: 460, lineHeight: 1.55, color: "#8b95a3" }}>
          {compact
            ? "The rest of the desk is still working — you can keep using the other tabs."
            : "The desk hit an unexpected error while loading. Reloading usually fixes it. If it keeps happening, resetting this device's local cache clears any stale saved data (your cloud archive is untouched)."}
        </div>
        {this.state.error?.message && (
          <code style={{ fontSize: 11, color: "#6b7686", maxWidth: 520, wordBreak: "break-word", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {String(this.state.error.message).slice(0, 300)}
          </code>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          <button style={btn} onClick={this.hardReload}>Reload</button>
          {compact
            ? <button style={btnGhost} onClick={this.reset}>Try again</button>
            : <button style={btnGhost} onClick={this.clearLocalData}>Reset local data &amp; reload</button>}
        </div>
      </div>
    );
  }
}
