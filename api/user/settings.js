import {
  json, redisCmd, authUserId, kvUrl, kvToken,
  writeVersionedJson, storedRevision, RevisionConflictError,
} from "../_userStore.js";
import { consumeRateLimit } from "../archive/_shared.js";

// Per-user desk settings (watchlist, thesis weights, desk tools, etc.), namespaced by the
// authenticated Clerk user id in Upstash. Signed-out clients never reach here — they keep using
// browser storage — so this endpoint always requires a valid Clerk session token.

// Persisted layout prefs — active tab, split-pane tab, theme — so the desk restores across devices.
const TAB_IDS = ["archives", "pulse", "news", "calendar", "thesis", "charts"];
const WEIGHT_KEYS = ["technicals", "macro", "sentiment", "positioning", "eventRisk"];
const pickWatchlist = (watchlist) => (Array.isArray(watchlist) ? watchlist : []).slice(0, 180).flatMap((item) => {
  if (!item || typeof item !== "object" || Array.isArray(item)) return [];
  const symbol = typeof item.symbol === "string" ? item.symbol.trim().toUpperCase().slice(0, 12) : "";
  if (!/^[A-Z][A-Z0-9.\-]{0,11}$/.test(symbol)) return [];
  const name = typeof item.name === "string" ? item.name.trim().slice(0, 80) : symbol;
  return [{ symbol, name: name || symbol, ...(item.off === true ? { off: true } : {}) }];
});
const pickWeights = (weights) => weights && typeof weights === "object" && !Array.isArray(weights)
  ? Object.fromEntries(WEIGHT_KEYS.flatMap((key) => Number.isFinite(Number(weights[key])) ? [[key, Math.min(100, Math.max(0, Number(weights[key])))]] : []))
  : null;
const pickLayout = (layout) => {
  if (!layout || typeof layout !== "object") return null;
  return {
    tab: TAB_IDS.includes(layout.tab) ? layout.tab : null,
    splitTab: TAB_IDS.includes(layout.splitTab) ? layout.splitTab : null,
    lightMode: typeof layout.lightMode === "boolean" ? layout.lightMode : null,
  };
};
const pickInput = (value, fallback = "") => {
  if (typeof value !== "string" && typeof value !== "number") return fallback;
  return String(value).trim().slice(0, 32);
};
const pickEnv = (value) => {
  const env = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return Object.fromEntries(["spot", "sigmaPct", "ratePct", "divPct", "days"].map((key) => [key, pickInput(env[key])]));
};
const pickOptions = (value) => {
  const options = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    strike: pickInput(options.strike),
    type: options.type === "put" ? "put" : "call",
    marketPrice: pickInput(options.marketPrice),
    feed: options.feed === true,
  };
};
const pickDeskTools = (value) => {
  const tools = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    feedToThesis: tools.feedToThesis === true,
    env: pickEnv(tools.env),
    options: pickOptions(tools.options),
    env2: pickEnv(tools.env2),
    options2: pickOptions(tools.options2),
  };
};

// Only these fields are persisted, so a client can't stuff arbitrary data into the record.
export const pickSettings = (body) => ({
  watchlist: pickWatchlist(body.watchlist),
  instrument: typeof body.instrument === "string" && /^[A-Za-z0-9.\-]{1,12}$/.test(body.instrument) ? body.instrument.toUpperCase() : null,
  weights: pickWeights(body.weights),
  lean: ({ auto: "auto", bull: "bull", bullish: "bull", bear: "bear", bearish: "bear" })[body.lean] || null,
  risk: ["defensive", "balanced", "aggressive"].includes(body.risk) ? body.risk : null,
  deskTools: pickDeskTools(body.deskTools),
  layout: pickLayout(body.layout),
  updatedAt: Date.now(),
});

export default async function handler(req, res) {
  const uid = await authUserId(req);
  if (!uid) return json(res, 401, { error: "Unauthorized" });

  if (!kvUrl() || !kvToken()) return json(res, 503, { error: "Storage not configured" });
  const key = `user:${uid}:settings`;
  try {
    const write = req.method === "PUT" || req.method === "POST";
    if (!(await consumeRateLimit(req, res, { scope: `user-settings-${write ? "write" : "read"}`, identity: uid, limit: write ? 30 : 120 }))) {
      return json(res, 429, { error: "Too many settings requests" });
    }
  } catch {
    return json(res, 503, { error: "Rate-limit storage unavailable" });
  }

  if (req.method === "GET") {
    try {
      const raw = await redisCmd(["GET", key]);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed !== null && (!parsed || typeof parsed !== "object" || Array.isArray(parsed))) throw new Error("Invalid settings record");
      const data = parsed ? Object.fromEntries(Object.entries(parsed).filter(([key]) => key !== "revision")) : null;
      return json(res, 200, { data, revision: storedRevision(raw, parsed) });
    } catch {
      return json(res, 502, { error: "Failed to read settings" });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) return json(res, 400, { error: "Invalid JSON body" });
    if (Array.isArray(body.watchlist) && body.watchlist.length > 180) return json(res, 400, { error: "Watchlist is capped at 180 entries" });
    try {
      const enforce = Object.prototype.hasOwnProperty.call(body, "baseRevision");
      const revision = await writeVersionedJson(key, pickSettings(body), { enforce, baseRevision: body.baseRevision });
      return json(res, 200, { ok: true, revision });
    } catch (error) {
      if (error instanceof RevisionConflictError) return json(res, 409, { error: error.message, code: "revision_conflict", revision: error.currentRevision });
      if (error instanceof TypeError) return json(res, 400, { error: error.message });
      return json(res, 502, { error: "Failed to save settings" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };
