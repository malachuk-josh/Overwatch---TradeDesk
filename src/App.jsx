import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Activity from "lucide-react/dist/esm/icons/activity.mjs";
import Newspaper from "lucide-react/dist/esm/icons/newspaper.mjs";
import Crosshair from "lucide-react/dist/esm/icons/crosshair.mjs";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days.mjs";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical.mjs";
import Mail from "lucide-react/dist/esm/icons/mail.mjs";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.mjs";
import Settings from "lucide-react/dist/esm/icons/settings.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap.mjs";
import PlayCircle from "lucide-react/dist/esm/icons/play-circle.mjs";
import Lock from "lucide-react/dist/esm/icons/lock.mjs";
import WifiOff from "lucide-react/dist/esm/icons/wifi-off.mjs";
import Share2 from "lucide-react/dist/esm/icons/share-2.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import Trash2 from "lucide-react/dist/esm/icons/trash-2.mjs";
import Copy from "lucide-react/dist/esm/icons/copy.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import Zap from "lucide-react/dist/esm/icons/zap.mjs";
import Sunrise from "lucide-react/dist/esm/icons/sunrise.mjs";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up.mjs";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down.mjs";
import AlertTriangle from "lucide-react/dist/esm/icons/triangle-alert.mjs";
import Shield from "lucide-react/dist/esm/icons/shield.mjs";
import History from "lucide-react/dist/esm/icons/history.mjs";
import FileText from "lucide-react/dist/esm/icons/file-text.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import NotebookPen from "lucide-react/dist/esm/icons/notebook-pen.mjs";
import Sun from "lucide-react/dist/esm/icons/sun.mjs";
import Moon from "lucide-react/dist/esm/icons/moon.mjs";
import CandlestickChart from "lucide-react/dist/esm/icons/chart-candlestick.mjs";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up.mjs";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.mjs";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down.mjs";
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2.mjs";
import Minimize2 from "lucide-react/dist/esm/icons/minimize-2.mjs";
import ExternalLink from "lucide-react/dist/esm/icons/external-link.mjs";
import Eye from "lucide-react/dist/esm/icons/eye.mjs";
import EyeOff from "lucide-react/dist/esm/icons/eye-off.mjs";
import GripVertical from "lucide-react/dist/esm/icons/grip-vertical.mjs";
import Calculator from "lucide-react/dist/esm/icons/calculator.mjs";
import Sigma from "lucide-react/dist/esm/icons/sigma.mjs";
import Gauge from "lucide-react/dist/esm/icons/gauge.mjs";
import Orbit from "lucide-react/dist/esm/icons/orbit.mjs";
import Scale from "lucide-react/dist/esm/icons/scale.mjs";
import Columns2 from "lucide-react/dist/esm/icons/columns-2.mjs";
import Bot from "lucide-react/dist/esm/icons/bot.mjs";
import UserRound from "lucide-react/dist/esm/icons/user-round.mjs";
import SlidersHorizontal from "lucide-react/dist/esm/icons/sliders-horizontal.mjs";
import LogIn from "lucide-react/dist/esm/icons/log-in.mjs";
import { CLERK_ENABLED, AuthControl, useAuthSync, loadUserSettings, saveUserSettings, loadUserArchive, saveUserArchive } from "./auth.jsx";
import "./styles.css";

/* ================================================================
   OVERWATCH // DAILY BIAS DESK
   Live market data + news via Claude API web search → daily bias
   thesis → archive. Persistent across sessions.
   ================================================================ */

const DEFAULT_WATCHLIST = [
  { symbol: "SPX", name: "S&P 500 Index" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "ES", name: "E-mini S&P Futures (front month)" },
  { symbol: "NDX", name: "Nasdaq 100" },
  { symbol: "QQQ", name: "Invesco QQQ ETF" },
  { symbol: "NQ", name: "E-mini Nasdaq-100 Futures (front month)" },
  { symbol: "DJI", name: "Dow Jones Industrial Average" },
  { symbol: "DIA", name: "SPDR Dow Jones ETF" },
  { symbol: "YM", name: "E-mini Dow Futures (front month)" },
  { symbol: "RUT", name: "Russell 2000 Index" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF" },
  { symbol: "RTY", name: "E-mini Russell 2000 Futures (front month)" },
  { symbol: "VIX", name: "CBOE Volatility Index" },
  { symbol: "DXY", name: "US Dollar Index" },
  { symbol: "US10Y", name: "US 10-Year Treasury Yield" },
  { symbol: "GC", name: "Gold Futures" },
  { symbol: "CL", name: "WTI Crude Oil" },
  { symbol: "BTC", name: "Bitcoin" },
  // Cross-asset context reads — semis leadership, the front end of the curve, credit risk appetite,
  // the growth-cyclical commodity, and crypto breadth beyond BTC. Shown on the board by default.
  { symbol: "SMH", name: "VanEck Semiconductor ETF" },
  { symbol: "US02Y", name: "US 2-Year Treasury Yield" },
  { symbol: "HYG", name: "iShares High Yield Corporate Bond ETF" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF" },
  { symbol: "HG", name: "Copper Futures" },
  { symbol: "USO", name: "United States Oil Fund" },
  { symbol: "ETH", name: "Ethereum" },
  // Magnificent Seven mega-caps ship on the board but start hidden (off) — flip them on from
  // Settings to render their ticker cards on Market Pulse. Their live prices are fetched either way.
  { symbol: "AAPL", name: "Apple", off: true },
  { symbol: "MSFT", name: "Microsoft", off: true },
  { symbol: "NVDA", name: "Nvidia", off: true },
  { symbol: "AMZN", name: "Amazon", off: true },
  { symbol: "GOOGL", name: "Alphabet", off: true },
  { symbol: "META", name: "Meta Platforms", off: true },
  { symbol: "TSLA", name: "Tesla", off: true },
  // Select Sector SPDR ETFs — live-quoted (Finnhub) and shipped on the board but hidden by default.
  // They power the Sector Focus panel on Market Pulse; flip any on from Settings to add a ticker card.
  { symbol: "XLK", name: "Technology Sector SPDR", off: true },
  { symbol: "XLF", name: "Financials Sector SPDR", off: true },
  { symbol: "XLV", name: "Health Care Sector SPDR", off: true },
  { symbol: "XLE", name: "Energy Sector SPDR", off: true },
  { symbol: "XLY", name: "Consumer Discretionary Sector SPDR", off: true },
  { symbol: "XLP", name: "Consumer Staples Sector SPDR", off: true },
  { symbol: "XLI", name: "Industrials Sector SPDR", off: true },
  { symbol: "XLB", name: "Materials Sector SPDR", off: true },
  { symbol: "XLU", name: "Utilities Sector SPDR", off: true },
  { symbol: "XLRE", name: "Real Estate Sector SPDR", off: true },
  { symbol: "XLC", name: "Communication Services Sector SPDR", off: true },
];
const WATCHLIST_CAP = 45;
// Symbols the user has toggled off — fetched for pricing but not rendered as Pulse ticker cards.
const watchlistHiddenSet = (items) =>
  new Set((Array.isArray(items) ? items : []).filter((it) => it && it.off).map((it) => it.symbol));

const reconcileWatchlist = (items) => {
  if (!Array.isArray(items) || !items.length) return DEFAULT_WATCHLIST;
  // Preserve the saved list's order AND per-item visibility (off) — canonical default names are
  // refreshed for known symbols, but we never discard the user's toggles/order. (Previously an
  // all-default list was replaced wholesale with DEFAULT_WATCHLIST, which silently reset every
  // show/hide toggle on reload since toggling a default doesn't add a "custom" symbol.)
  const cleaned = items
    .filter((item) => item && item.symbol)
    .map((item) => {
      const symbol = String(item.symbol).toUpperCase();
      const def = DEFAULT_WATCHLIST.find((d) => d.symbol === symbol);
      return { symbol, name: def?.name || item.name || symbol, ...(item.off ? { off: true } : {}) };
    });
  // Append any default symbols the saved list is missing (e.g. newly-shipped defaults), capped.
  const merged = [...cleaned];
  for (const item of DEFAULT_WATCHLIST) {
    if (!merged.some((existing) => existing.symbol === item.symbol) && merged.length < WATCHLIST_CAP) {
      merged.push({ ...item });
    }
  }
  return merged;
};

const FACTORS = [
  { key: "technicals", label: "Technicals", hint: "Levels, trend, structure" },
  { key: "macro", label: "Macro / News", hint: "Headlines, rates, data" },
  { key: "sentiment", label: "Sentiment", hint: "Mood, fear & greed" },
  { key: "positioning", label: "Positioning / Flows", hint: "COT, gamma, funds" },
  { key: "eventRisk", label: "Event Risk", hint: "Calendar landmines" },
];

const PILLAR_KEYS = FACTORS.map((f) => f.key);
const WEIGHT_TOTAL = 100;
const MAX_PILLAR = 70; // no single pillar may exceed this share of the budget
// Fixed budget: the five pillars always sum to WEIGHT_TOTAL, starting evenly split.
const DEFAULT_WEIGHTS = PILLAR_KEYS.reduce((acc, k) => ({ ...acc, [k]: WEIGHT_TOTAL / PILLAR_KEYS.length }), {});

// Largest-remainder integer rounding of float shares to hit an exact integer total.
const roundShares = (entries, total) => {
  const floors = entries.map((e) => ({ ...e, f: Math.floor(e.v), r: e.v - Math.floor(e.v) }));
  let leftover = total - floors.reduce((s, o) => s + o.f, 0);
  floors.sort((a, b) => b.r - a.r);
  for (let i = 0; i < floors.length && leftover > 0; i++) { floors[i].f++; leftover--; }
  for (let i = floors.length - 1; i >= 0 && leftover < 0; i--) { if (floors[i].f > 0) { floors[i].f--; leftover++; } }
  return floors;
};

// Setting one pillar pulls the difference EQUALLY from the others (water-filling, clamped to
// [0, MAX_PILLAR]), keeping the budget fixed at WEIGHT_TOTAL. Works in exact fractions — no integer
// rounding — so every unclamped pillar gives up the same amount with no positional bias or drift.
const redistributeWeights = (weights, key, rawVal) => {
  const newVal = clamp(Math.round(Number(rawVal) || 0), 0, MAX_PILLAR);
  const others = PILLAR_KEYS.filter((k) => k !== key);
  const vals = {};
  others.forEach((k) => { vals[k] = Math.max(0, Number(weights[k]) || 0); });
  let diff = WEIGHT_TOTAL - newVal - others.reduce((s, k) => s + vals[k], 0);
  let pool = others.slice();
  let guard = 0;
  while (Math.abs(diff) > 1e-9 && pool.length && guard++ < 60) {
    const share = diff / pool.length;
    const next = [];
    let leftover = 0;
    for (const k of pool) {
      let nv = vals[k] + share;
      if (nv < 0) { leftover += nv; nv = 0; }
      else if (nv > MAX_PILLAR) { leftover += nv - MAX_PILLAR; nv = MAX_PILLAR; }
      else next.push(k);
      vals[k] = nv;
    }
    diff = leftover;
    pool = next;
  }
  const out = { [key]: newVal };
  others.forEach((k) => { out[k] = vals[k]; });
  return out;
};

// Scale arbitrary saved weights onto the fixed budget and enforce the per-pillar cap
// (migrates older weights, including any pillar that was previously dialed up to 100).
const normalizeWeightsToBudget = (weights) => {
  const vals = {};
  PILLAR_KEYS.forEach((k) => { vals[k] = Math.max(0, Number(weights?.[k]) || 0); });
  const sum = PILLAR_KEYS.reduce((s, k) => s + vals[k], 0);
  if (sum <= 0) return { ...DEFAULT_WEIGHTS };
  PILLAR_KEYS.forEach((k) => { vals[k] = (vals[k] / sum) * WEIGHT_TOTAL; });
  // push any over-cap excess equally onto the pillars that still have room
  let guard = 0;
  while (guard++ < 60) {
    const over = PILLAR_KEYS.filter((k) => vals[k] > MAX_PILLAR + 1e-9);
    if (!over.length) break;
    let excess = 0;
    over.forEach((k) => { excess += vals[k] - MAX_PILLAR; vals[k] = MAX_PILLAR; });
    const room = PILLAR_KEYS.filter((k) => vals[k] < MAX_PILLAR - 1e-9);
    if (!room.length) break;
    const share = excess / room.length;
    room.forEach((k) => { vals[k] = Math.min(MAX_PILLAR, vals[k] + share); });
  }
  const rounded = roundShares(PILLAR_KEYS.map((k) => ({ k, v: vals[k] })), WEIGHT_TOTAL);
  const out = {};
  rounded.forEach((o) => { out[o.k] = o.f; });
  return out;
};

const DEFAULT_THESIS_INSTRUMENT = "SPY";
// Retail-tradable instruments — index ETFs, index futures, and mega-cap stocks
// (traded directly or via options). No cash indexes.
const THESIS_INSTRUMENTS = [
  // Index ETFs
  { symbol: "SPY", label: "SPY", name: "SPDR S&P 500 ETF", futures: "ES", pointsKey: "spy", focusLabel: "SPY / ES", group: "etf" },
  { symbol: "QQQ", label: "QQQ", name: "Invesco QQQ ETF", futures: "NQ", pointsKey: "qqq", focusLabel: "QQQ / NQ", group: "etf" },
  { symbol: "DIA", label: "DIA", name: "SPDR Dow Jones ETF", futures: "YM", pointsKey: "dia", focusLabel: "DIA / YM", group: "etf" },
  { symbol: "IWM", label: "IWM", name: "iShares Russell 2000 ETF", futures: "RTY", pointsKey: "iwm", focusLabel: "IWM / RTY", group: "etf" },
  // Index futures
  { symbol: "ES",  label: "ES",  name: "E-mini S&P 500 Futures", futures: "ES", pointsKey: "es", focusLabel: "ES", group: "futures" },
  { symbol: "NQ",  label: "NQ",  name: "E-mini Nasdaq-100 Futures", futures: "NQ", pointsKey: "nq", focusLabel: "NQ", group: "futures" },
  { symbol: "YM",  label: "YM",  name: "E-mini Dow Futures", futures: "YM", pointsKey: "ym", focusLabel: "YM", group: "futures" },
  { symbol: "RTY", label: "RTY", name: "E-mini Russell 2000 Futures", futures: "RTY", pointsKey: "rty", focusLabel: "RTY", group: "futures" },
  // Mega-cap stocks (Magnificent Seven) — NQ as the index hedge proxy
  { symbol: "AAPL",  label: "AAPL",  name: "Apple", futures: "NQ", pointsKey: "aapl", focusLabel: "AAPL", group: "stock" },
  { symbol: "MSFT",  label: "MSFT",  name: "Microsoft", futures: "NQ", pointsKey: "msft", focusLabel: "MSFT", group: "stock" },
  { symbol: "NVDA",  label: "NVDA",  name: "Nvidia", futures: "NQ", pointsKey: "nvda", focusLabel: "NVDA", group: "stock" },
  { symbol: "AMZN",  label: "AMZN",  name: "Amazon", futures: "NQ", pointsKey: "amzn", focusLabel: "AMZN", group: "stock" },
  { symbol: "META",  label: "META",  name: "Meta Platforms", futures: "NQ", pointsKey: "meta", focusLabel: "META", group: "stock" },
  { symbol: "GOOGL", label: "GOOGL", name: "Alphabet", futures: "NQ", pointsKey: "googl", focusLabel: "GOOGL", group: "stock" },
  { symbol: "TSLA",  label: "TSLA",  name: "Tesla", futures: "NQ", pointsKey: "tsla", focusLabel: "TSLA", group: "stock" },
];
const INSTRUMENT_GROUPS = [
  { group: "etf", label: "Index ETFs" },
  { group: "futures", label: "Index Futures" },
  { group: "stock", label: "Mega-cap Stocks" },
];
const thesisInstrumentConfig = (symbol = DEFAULT_THESIS_INSTRUMENT) =>
  THESIS_INSTRUMENTS.find((item) => item.symbol === symbol) || THESIS_INSTRUMENTS[0];

// Single-stock focuses (Mag 7) aren't on the Market Pulse watchlist, but their live prices are
// still fetched so the Thesis Lab tools can auto-price them like the ETFs/futures.
const THESIS_STOCK_TICKERS = THESIS_INSTRUMENTS.filter((i) => i.group === "stock").map((i) => ({ symbol: i.symbol, name: i.name }));
const THESIS_STOCK_SET = new Set(THESIS_STOCK_TICKERS.map((i) => i.symbol));

// Grouped native <select> for picking a thesis instrument — the standard picker used across the app.
// `exclude` omits one symbol (e.g. the other options-calculator leg) from the list.
const InstrumentSelect = ({ value, onChange, className = "bd-in", style, noneLabel, exclude }) => (
  <select className={className} style={style} value={value} onChange={(e) => onChange(e.target.value)}>
    {noneLabel && <option value="">{noneLabel}</option>}
    {INSTRUMENT_GROUPS.map((g) => {
      const items = THESIS_INSTRUMENTS.filter((it) => it.group === g.group && it.symbol !== exclude);
      if (!items.length) return null;
      return (
        <optgroup key={g.group} label={g.label}>
          {items.map((it) => (
            <option key={it.symbol} value={it.symbol}>{it.symbol} — {it.name}</option>
          ))}
        </optgroup>
      );
    })}
  </select>
);

const C = {
  bull: "#22C55E",
  bear: "#EF4444",
  brass: "#3B82F6",
  info: "#38BDF8",
  muted: "#94A3B8",
};

const SETTINGS_KEY = "overwatch:settings";
const HISTORY_KEY = "overwatch:history";
const ARCHIVE_KEY = "overwatch:archive";
const TAB_KEY = "overwatch:tab";
// Valid tab ids — layout restore is validated against these so a stale/bad id can't blank the view.
const LAYOUT_TAB_IDS = ["archives", "pulse", "news", "calendar", "thesis", "charts"];
const safeTab = (id, fallback = "pulse") => (LAYOUT_TAB_IDS.includes(id) ? id : fallback);
const TOP_ASSET_CARD_ORDER = ["SPX", "SPY", "ES", "NDX", "QQQ", "NQ", "DJI", "DIA", "YM"];

/* ---------------- formatting helpers ---------------- */

const fmtNum = (v, d = 2) =>
  v === null || v === undefined || isNaN(Number(v))
    ? "—"
    : Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtSigned = (v, d = 2, suffix = "") => {
  if (v === null || v === undefined || isNaN(Number(v))) return "—";
  const n = Number(v);
  return (n > 0 ? "+" : "") + fmtNum(n, d) + suffix;
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Compact percent: whole numbers show plain, fractions to one decimal (e.g. 20, 12.5).
const fmtPct = (v) => {
  const r = Math.round((Number(v) || 0) * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

const chgColor = (v) => (v === null || v === undefined || isNaN(v) ? C.muted : v >= 0 ? C.bull : C.bear);

const sentColor = (s) => (s === "bullish" ? C.bull : s === "bearish" ? C.bear : C.muted);

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

const orderAssetCards = (items = []) => {
  const rank = new Map(TOP_ASSET_CARD_ORDER.map((symbol, index) => [symbol, index]));
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aRank = rank.has(a.item.symbol) ? rank.get(a.item.symbol) : TOP_ASSET_CARD_ORDER.length + a.index;
      const bRank = rank.has(b.item.symbol) ? rank.get(b.item.symbol) : TOP_ASSET_CARD_ORDER.length + b.index;
      return aRank - bRank || a.index - b.index;
    })
    .map(({ item }) => item);
};

/* ---------------- New York time / session ---------------- */

const nyParts = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value || "";
  return { wd: get("weekday"), h: parseInt(get("hour"), 10), m: parseInt(get("minute"), 10), s: get("second") };
};

const nyClock = () => {
  const p = nyParts();
  return `${String(p.h).padStart(2, "0")}:${String(p.m).padStart(2, "0")}:${p.s}`;
};

const marketSession = () => {
  const { wd, h, m } = nyParts();
  if (["Sat", "Sun"].includes(wd)) return { label: "CLOSED", tone: "off" };
  const mins = h * 60 + m;
  if (mins >= 240 && mins < 570) return { label: "PRE-MARKET", tone: "warn" };
  if (mins >= 570 && mins < 960) return { label: "MARKET OPEN", tone: "live" };
  if (mins >= 960 && mins < 1200) return { label: "AFTER-HOURS", tone: "warn" };
  return { label: "CLOSED", tone: "off" };
};

// CME Globex hours (ET): Sun 18:00 → Fri 17:00, with a daily 17:00–18:00 maintenance halt.
const futuresOpenNow = () => {
  const { wd, h, m } = nyParts();
  const mins = h * 60 + m;
  if (wd === "Sat") return false;
  if (wd === "Sun") return mins >= 1080;        // opens 18:00 Sun
  if (wd === "Fri") return mins < 1020;         // closes 17:00 Fri
  return !(mins >= 1020 && mins < 1080);        // Mon–Thu: open except the 17:00–18:00 halt
};

const FUTURES_SYMBOLS = new Set(["ES", "NQ", "YM", "RTY", "GC", "CL", "DXY", "US10Y"]);
const CRYPTO_SYMBOLS = new Set(["BTC", "ETH"]);

// Is this specific instrument's market trading right now? Futures run nearly 24h,
// crypto is 24/7, and cash indexes / ETFs only count their regular session.
const symbolMarketOpen = (symbol) => {
  if (CRYPTO_SYMBOLS.has(symbol)) return true;
  if (FUTURES_SYMBOLS.has(symbol)) return futuresOpenNow();
  return marketSession().tone === "live";
};

const dateLine = () =>
  new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
  }) + " ET";

const dateShort = () =>
  new Date().toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" });

const calendarDateLabel = (dateIso, { weekday = false } = {}) => {
  if (!dateIso) return "";
  const parts = String(dateIso).split("-");
  if (parts.length !== 3) return String(dateIso);
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return String(dateIso);
  const d = new Date(Date.UTC(year, month - 1, day, 12));
  const base = d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
  if (!weekday) return base;
  const dow = d.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short" });
  return `${dow} · ${base}`;
};

const stampNow = () =>
  new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) + " ET";

// Sortable ET calendar-date key (YYYY-MM-DD) for same-day / past-day comparisons.
const etDateKey = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });

// First price-like number in a free-text level line ("5900 then 5940" → 5900).
const parseFirstPrice = (text) => {
  const m = String(text || "").replace(/,/g, "").match(/\d{1,6}(?:\.\d+)?/);
  const n = m ? Number(m[0]) : null;
  return Number.isFinite(n) && n > 0 ? n : null;
};

/* ---------------- morning snapshot diff ---------------- */

// The last sync of each ET day is persisted; the first sync of the NEXT day diffs against it to
// produce the "what changed since you left" card on Market Pulse.
const DAYSNAP_KEY = "overwatch:daysnap";
const buildDaySnap = (marketData) => {
  const px = (sym) => {
    const n = Number((marketData?.tickers || []).find((t) => t.symbol === sym)?.price);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const sectors = (marketData?.sectors || []).filter((s) => s && Number.isFinite(Number(s.changePct)));
  return {
    spx: px("SPX"), ndx: px("NDX"), es: px("ES"), vix: px("VIX"),
    green: sectors.length ? sectors.filter((s) => s.changePct > 0).length : null,
    total: sectors.length || null,
    label: dateShort(),
  };
};
const daySnapDiff = (prev, cur) => {
  const lines = [];
  [["SPX", "spx"], ["NDX", "ndx"], ["ES", "es"]].forEach(([label, key]) => {
    if (prev[key] > 0 && cur[key] > 0) {
      const pct = ((cur[key] - prev[key]) / prev[key]) * 100;
      lines.push({ text: `${label} ${fmtNum(prev[key], 0)} → ${fmtNum(cur[key], 0)} (${fmtSigned(pct, 2, "%")})`, tone: pct > 0.05 ? "up" : pct < -0.05 ? "down" : "flat" });
    }
  });
  if (prev.vix > 0 && cur.vix > 0) {
    const d = cur.vix - prev.vix;
    lines.push({ text: `VIX ${fmtNum(prev.vix, 1)} → ${fmtNum(cur.vix, 1)} (${fmtSigned(d, 1)} pts)`, tone: d > 0.3 ? "down" : d < -0.3 ? "up" : "flat" });
  }
  if (prev.green != null && cur.green != null && prev.total && cur.total) {
    lines.push({ text: `Breadth ${prev.green}/${prev.total} → ${cur.green}/${cur.total} sectors green`, tone: cur.green > prev.green ? "up" : cur.green < prev.green ? "down" : "flat" });
  }
  return lines;
};

const extractTime = (value) => String(value || "").match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)(?:\s*ET)?\b/i)?.[0]?.replace(/\s*ET$/i, " ET") || "";

const archiveStamp = (entry = {}) => {
  const date = entry._date || dateShort();
  const time = entry._time || extractTime(entry.timestamp) || extractTime(entry._generatedAt);
  return time ? `${date} · ${time}` : date;
};

const weightsLine = (weights = {}) => FACTORS
  .map((factor) => `${factor.label} ${Number.isFinite(Number(weights[factor.key])) ? Number(weights[factor.key]) : DEFAULT_WEIGHTS[factor.key]}`)
  .join(", ");

const stanceLine = ({ lean = "auto", risk = "balanced", notes = "" } = {}) =>
  `Directional lean ${lean}; risk appetite ${risk}${notes ? `; desk notes: ${notes}` : ""}.`;

const avgChange = (tickers = [], symbols = []) => {
  const values = symbols
    .map((symbol) => tickers.find((item) => item.symbol === symbol)?.changePct)
    .filter((value) => Number.isFinite(Number(value)))
    .map(Number);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
};

const buildTimingSnapshot = ({ market, news, points } = {}) => {
  const session = marketSession();
  const tickers = market?.tickers || [];
  const cashAvg = avgChange(tickers, ["SPX", "NDX", "DJI"]);
  const futuresAvg = avgChange(tickers, ["ES", "NQ", "YM"]);
  const spread = Number.isFinite(cashAvg) && Number.isFinite(futuresAvg) ? futuresAvg - cashAvg : null;
  const staleCashRisk = session.label !== "MARKET OPEN";
  const spreadText = Number.isFinite(spread) ? ` Futures/cash spread is ${fmtSigned(spread, 2, " pts")}.` : "";
  const generatedAt = dateLine();
  const timingNote = staleCashRisk
    ? `${session.label}: generated ${generatedAt}. Cash indexes such as SPX, NDX and DJI may still reflect the last regular session while ES, NQ and YM futures continue to trade.${spreadText}`
    : `MARKET OPEN: generated ${generatedAt}. Cash indexes and futures should both be treated as live, but quote timestamps still matter.${spreadText}`;
  return {
    generatedAt,
    generatedAtShort: stampNow(),
    session: session.label,
    sessionTone: session.tone,
    quoteAsOf: market?.asOf || null,
    newsAsOf: news?.lastUpdated || null,
    calendarSource: points?.calendarSource || null,
    cashAvg: Number.isFinite(cashAvg) ? Number(cashAvg.toFixed(2)) : null,
    futuresAvg: Number.isFinite(futuresAvg) ? Number(futuresAvg.toFixed(2)) : null,
    futuresCashSpread: Number.isFinite(spread) ? Number(spread.toFixed(2)) : null,
    staleCashRisk,
    timingNote,
  };
};

// How many calendar landmines are on the tape right now (0-45) — mirrors the fallback thesis
// engine's event-risk penalty (api/desk.js) so the client can preview it without a round trip.
const calendarRiskScore = (points = {}) => {
  const groups = points?.calendarGroups || {};
  const events = [...(groups.today || []), ...(groups.tomorrow || []), ...(groups.upcoming || [])];
  const high = events.filter((event) => event.importance === "high").length;
  const fomc = events.some(isFomcEvent) ? 1 : 0;
  return clamp(high * 5 + fomc * 14, 0, 45);
};

const positioningFactorScore = (points = {}) => {
  const pos = points?.positioning;
  if (pos && typeof pos === "object" && Number.isFinite(Number(pos.score))) {
    // Soft deadzone over the "mixed" band so positioning only carries weight when genuinely decisive.
    const r = Number(pos.score);
    const eff = Math.sign(r) * Math.max(0, Math.abs(r) - 0.5);
    return Math.round(clamp(eff * 18, -100, 100));
  }
  if (pos?.posture === "risk-on") return 35;
  if (pos?.posture === "defensive") return -35;
  return 0;
};

// Live, unweighted pillar scores (-100..100) computed straight from synced market/news/points data.
// Mirrors the fallback thesis engine's factor math (api/desk.js `makeThesis`) so the Pillar weights
// card can preview what each pillar currently reads, independent of the weight sliders themselves.
const computePillarFactorScores = ({ market, news, points } = {}) => {
  const tickers = market?.tickers || [];
  const indexChanges = ["SPX", "DJI", "ES", "NQ", "YM", "NDX"]
    .map((symbol) => tickers.find((item) => item.symbol === symbol)?.changePct)
    .filter(Number.isFinite);
  const cashTape = avgChange(tickers, ["SPX", "NDX", "DJI"]);
  const futuresTape = avgChange(tickers, ["ES", "NQ", "YM"]);
  const staleCashRisk = marketSession().label !== "MARKET OPEN";
  const tape = staleCashRisk && Number.isFinite(futuresTape)
    ? (futuresTape * 0.7) + ((Number.isFinite(cashTape) ? cashTape : futuresTape) * 0.3)
    : indexChanges.length
      ? indexChanges.reduce((sum, v) => sum + v, 0) / indexChanges.length
      : 0;
  const headlines = news?.headlines || [];
  const newsScore = Number.isFinite(Number(news?.sentimentScore))
    ? Number(news.sentimentScore)
    : headlines.length
      ? (headlines.filter((h) => h.sentiment === "bullish").length - headlines.filter((h) => h.sentiment === "bearish").length) / headlines.length * 100
      : 0;
  const trendScore = Number.isFinite(Number(points?.internals?.trendDetail?.score))
    ? Number(points.internals.trendDetail.score)
    : points?.internals?.trend === "uptrend" ? 55 : points?.internals?.trend === "downtrend" ? -55 : 0;
  const breadthScore = Number.isFinite(Number(points?.internals?.breadthDetail?.score)) ? Number(points.internals.breadthDetail.score) : 0;
  const vixScore = (points?.vix?.spot || 20) > 28 ? -65 : (points?.vix?.spot || 20) < 16 ? 35 : -10;
  const volScore = Number.isFinite(Number(points?.internals?.volDetail?.score)) ? -Number(points.internals.volDetail.score) : vixScore;
  const eventPenalty = calendarRiskScore(points);
  return {
    technicals: Math.round(clamp(tape * 34 + trendScore * 0.58 + breadthScore * 0.5, -100, 100)),
    macro: Math.round(clamp(newsScore * 0.8 - eventPenalty * 0.35, -100, 100)),
    sentiment: Math.round(clamp(newsScore * 0.55 + tape * 16 + breadthScore * 0.22, -100, 100)),
    positioning: positioningFactorScore(points),
    eventRisk: Math.round(clamp(volScore - eventPenalty, -100, 100)),
  };
};

const nyIsoDate = (offsetDays = 0) => {
  const date = new Date(Date.now() + offsetDays * 86400000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

const calendarMinutes = (time = "") => {
  const match = String(time).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 24 * 60;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const isFomcEvent = (event = {}) => /fomc|federal open market|rate decision|press conference|projection/i.test(event.event || "");

const pickCalendarCatalyst = (events = []) => {
  const today = nyIsoDate();
  const tomorrow = nyIsoDate(1);
  const importanceRank = { high: 0, medium: 6, low: 12 };
  return [...events].filter(Boolean).sort((a, b) => {
    const score = (event) => {
      const dayScore = event.date === today ? 0 : event.date === tomorrow ? 20 : 40;
      const fomcScore = isFomcEvent(event) ? -18 : 0;
      const officialScore = /Federal Reserve FOMC calendar/i.test(event.source || "") ? -4 : 0;
      const detailScore = /rate decision|statement/i.test(event.event || "")
        ? -3
        : /projection/i.test(event.event || "")
          ? -2
          : /press conference/i.test(event.event || "")
            ? -1
            : 0;
      return dayScore + fomcScore + officialScore + detailScore + (importanceRank[event.importance] ?? 12) + calendarMinutes(event.time) / 1000;
    };
    return score(a) - score(b);
  })[0] || null;
};

const calendarEventBucket = (event = {}) => {
  const text = String(event.event || "").toLowerCase();
  if (/press conference/.test(text)) return `${event.date}|fomc-press`;
  if (/economic projections|interest rate projection/.test(text)) return `${event.date}|fomc-projections`;
  if (/fomc|fed interest rate decision|rate decision \/ statement/.test(text)) return `${event.date}|fomc-rate`;
  if (/retail sales/.test(text)) return `${event.date}|retail-sales`;
  if (/jobless claims|continuing claims|initial claims/.test(text)) return `${event.date}|jobless-claims`;
  if (/philadelphia fed|philly fed/.test(text)) return `${event.date}|philly-fed`;
  if (/s&p global.*pmi|pmi flash/.test(text)) return `${event.date}|pmi-flash`;
  if (/richmond fed/.test(text)) return `${event.date}|richmond-fed`;
  return `${event.date}|${String(event.time || "").toLowerCase()}|${text.replace(/[^a-z0-9]+/g, " ").trim()}`;
};

const calendarPriority = (event = {}) => {
  const text = String(event.event || "").toLowerCase();
  const importanceRank = { high: 0, medium: 20, low: 42 };
  let score = importanceRank[event.importance] ?? 42;
  if (/fed interest rate decision|rate decision \/ statement/.test(text)) score -= 52;
  else if (/press conference/.test(text)) score -= 44;
  else if (/economic projections/.test(text)) score -= 42;
  else if (/fomc/.test(text)) score -= 34;
  if (/cpi|pce|ppi|inflation|payroll|jobs|unemployment|gdp|retail sales|ism|pmi|jobless claims|philadelphia fed|consumer confidence/.test(text)) score -= 16;
  if (/treasury auction|tips auction|bill auction|fed balance sheet/.test(text)) score -= 7;
  if (/mortgage|natural gas|oil rig|projection -/.test(text)) score += 12;
  if (/Federal Reserve FOMC calendar/i.test(event.source || "")) score -= 5;
  return score + calendarMinutes(event.time) / 1000;
};

const topCalendarEvents = (events = [], limit = 5) => {
  const byBucket = new Map();
  for (const event of [...events].filter(Boolean).sort((a, b) => calendarPriority(a) - calendarPriority(b) || calendarMinutes(a.time) - calendarMinutes(b.time))) {
    const bucket = calendarEventBucket(event);
    if (!byBucket.has(bucket)) byBucket.set(bucket, event);
  }
  return Array.from(byBucket.values())
    .sort((a, b) => calendarPriority(a) - calendarPriority(b) || calendarMinutes(a.time) - calendarMinutes(b.time))
    .slice(0, limit)
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || calendarMinutes(a.time) - calendarMinutes(b.time));
};

/* ---------------- persistent storage ---------------- */

const storageAvailable = () => typeof window !== "undefined" && !!window.localStorage;

const loadStored = async (key, fallback) => {
  if (!storageAvailable()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const saveStored = async (key, val) => {
  if (!storageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("storage save failed", e);
  }
};

// localStorage-backed state so per-view UI prefs (level-map ticker/timeframe, card collapse state)
// survive a refresh instead of snapping back to defaults.
const usePersistentState = (key, initial) => {
  const [val, setVal] = useState(() => {
    try { const s = window.localStorage.getItem(key); return s != null ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
};

/* ---------------- secure desk API layer ---------------- */

const callDesk = async (operation, prompt, payload = {}) => {
  const res = await fetch("/api/desk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation, prompt, payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Desk API error ${res.status}`);
  return data.data;
};

/* ---------------- prompt builders ---------------- */

const pricesPrompt = (watchlist) => {
  const list = watchlist.map((t, i) => `${i + 1}. ${t.symbol} — ${t.name}`).join("\n");
  return `Today is ${dateLine()}. You are a live market data service. Use web search to find the MOST RECENT available prices right now for these instruments:
${list}

Also find today's percentage change for the 11 S&P 500 GICS sectors (Technology, Financials, Health Care, Energy, Consumer Discretionary, Consumer Staples, Industrials, Materials, Utilities, Real Estate, Communication Services).

Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"asOf":"<time of quotes, ET>","summary":"<one sentence on the current session tone>","tickers":[{"symbol":"<symbol from list>","name":"<short name>","price":<number>,"change":<number>,"changePct":<number>,"dayOpen":<number or null>,"dayLow":<number or null>,"dayHigh":<number or null>,"previousClose":<number or null>}],"sectors":[{"name":"<sector>","changePct":<number>}]}

Rules: all numbers must be plain JSON numbers — no commas, no % signs, no strings. Use null for anything unavailable. Keep tickers in the same order as the list. For yields, price = the yield in percent. changePct is today's percent move.`;
};

const newsPrompt = () => `Today is ${dateLine()}. Use web search to find the most market-moving financial news from roughly the last 18 hours that matters to a US equity index trader (S&P 500 / Nasdaq / Dow / Fed / rates / geopolitics / mega-cap earnings / volatility / oil / dollar).

Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"mood":"<one line describing overall tape mood right now>","brief":"<one sentence desk summary>","watchlist":["<3-5 key implications for index traders>"],"catalysts":[{"category":"macro|fed|earnings|geopolitical|technical|flows|volatility","count":<integer>,"maxImpact":<integer 1-5>,"sentiment":"bullish|bearish|neutral"}],"headlines":[{"title":"<concise headline>","source":"<outlet>","timeAgo":"<e.g. 2h ago>","category":"macro|fed|earnings|geopolitical|technical|flows|volatility","sentiment":"bullish|bearish|neutral","impact":<integer 1-5>,"urgency":"high|medium|low","tickers":["SPX","NDX","DJI","VIX","US10Y"],"note":"<one line: why it matters for index risk today>","url":"<source URL if available>"}]}

Return 10 to 14 headlines ordered most impactful first. impact 5 = capable of moving SPX/NDX/DJI more than 0.5% today. sentiment is the headline's implication for equities.`;

const pointsPrompt = () => `Today is ${dateLine()}. Use web search to gather today's key quantitative data points for trading the S&P 500 / Nasdaq 100 / Dow Jones Industrial Average / ES / NQ / YM futures:
1) SPX, NDX, and DJI spot prices plus today's widely-cited technical levels — nearest supports, resistances, and pivot
2) VIX level and the term structure state (contango / flat / backwardation)
3) The latest CBOE equity put/call ratio reading
4) A market breadth read (advancers vs decliners, or % of stocks above key moving averages)
5) Today's US economic calendar releases with times in ET
6) Notable positioning or flows commentary if available (ETF flows, credit vs duration, safe-haven demand, CFTC COT, dealer gamma, fund flows)

Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"spx":{"spot":<number>,"pivot":<number or null>,"supports":[<numbers nearest-first, max 3>],"resistances":[<numbers nearest-first, max 3>]},"ndx":{"spot":<number>,"pivot":<number or null>,"supports":[<numbers nearest-first, max 3>],"resistances":[<numbers nearest-first, max 3>]},"dji":{"spot":<number>,"pivot":<number or null>,"supports":[<numbers nearest-first, max 3>],"resistances":[<numbers nearest-first, max 3>]},"vix":{"spot":<number>,"structure":"contango|flat|backwardation","note":"<one line on what vol is saying>"},"internals":{"putCall":<number or null>,"putCallRead":"<one line>","breadth":"<one line>","trend":"uptrend|downtrend|range"},"calendar":[{"time":"<h:mm AM/PM ET>","event":"<release name>","importance":"high|medium|low"}],"positioning":"<1-2 sentences>"}

Calendar: include today's events, tomorrow's events, and major events remaining this week. All numbers plain JSON numbers.`;

const condenseMarket = (m) => {
  if (!m) return "Market prices: not synced.";
  const t = (m.tickers || []).map((x) => `${x.symbol} ${fmtNum(x.price)} (${fmtSigned(x.changePct, 2, "%")})`).join(", ");
  const s = (m.sectors || []).slice(0, 11).map((x) => `${x.name} ${fmtSigned(x.changePct, 1, "%")}`).join(", ");
  return `PRICES (as of ${m.asOf || "today"}): ${t}\nSESSION: ${m.summary || ""}\nSECTORS: ${s}`;
};

const condenseNews = (n) => {
  if (!n) return "News: not synced.";
  const h = (n.headlines || []).map((x) => `[${x.sentiment}/${x.impact}] ${x.title} — ${x.note}`).join("\n");
  return `TAPE MOOD: ${n.mood || ""}\nHEADLINES:\n${h}`;
};

const condensePoints = (p) => {
  if (!p) return "Internals: not synced.";
  const breadth = p.internals?.breadthDetail;
  const trend = p.internals?.trendDetail;
  const vol = p.internals?.volDetail;
  const sectorLine = (breadth?.sectors || [])
    .slice(0, 11)
    .map((s) => `${s.name} ${fmtSigned(s.changePct, 2, "%")}`)
    .join(", ");
  const dist = breadth?.distribution
    ? `strong up ${breadth.distribution.strongUp}, up ${breadth.distribution.up}, flat ${breadth.distribution.flat}, down ${breadth.distribution.down}, strong down ${breadth.distribution.strongDown}`
    : "";
  const calendarRows = p.calendarGroups
    ? [
      ...(p.calendarGroups.today || []).map((c) => `Today ${c.time} ${c.event} (${c.importance}${c.source ? `, ${c.source}` : ""})${c.note ? ` — ${c.note}` : ""}`),
      ...(p.calendarGroups.tomorrow || []).map((c) => `Tomorrow ${c.time} ${c.event} (${c.importance}${c.source ? `, ${c.source}` : ""})${c.note ? ` — ${c.note}` : ""}`),
      ...(p.calendarGroups.upcoming || []).map((c) => `This week ${c.time} ${c.event} (${c.importance}${c.source ? `, ${c.source}` : ""})${c.note ? ` — ${c.note}` : ""}`),
    ]
    : (p.calendar || []).map((c) => `${c.time} ${c.event} (${c.importance}${c.source ? `, ${c.source}` : ""})${c.note ? ` — ${c.note}` : ""}`);
  const pos = typeof p.positioning === "string"
    ? p.positioning
    : [
      p.positioning?.summary,
      ...(p.positioning?.notes || []),
      ...(p.positioning?.signals || []).slice(0, 3).map((s) => `${s.label}: ${s.value} (${s.tone}) — ${s.note}`),
    ].filter(Boolean).join(" ");
  return `SPX LEVELS: spot ${fmtNum(p.spx?.spot)}, pivot ${fmtNum(p.spx?.pivot)}, supports ${(p.spx?.supports || []).map((v) => fmtNum(v)).join("/")}, resistances ${(p.spx?.resistances || []).map((v) => fmtNum(v)).join("/")}
NDX LEVELS: spot ${fmtNum(p.ndx?.spot)}, pivot ${fmtNum(p.ndx?.pivot)}, supports ${(p.ndx?.supports || []).map((v) => fmtNum(v)).join("/")}, resistances ${(p.ndx?.resistances || []).map((v) => fmtNum(v)).join("/")}
DJI LEVELS: spot ${fmtNum(p.dji?.spot)}, pivot ${fmtNum(p.dji?.pivot)}, supports ${(p.dji?.supports || []).map((v) => fmtNum(v)).join("/")}, resistances ${(p.dji?.resistances || []).map((v) => fmtNum(v)).join("/")}
VIX: ${fmtNum(p.vix?.spot)} (${p.vix?.structure || "?"}) — ${p.vix?.note || ""}
INTERNALS: put/call ${fmtNum(p.internals?.putCall)} (${p.internals?.putCallRead || ""}); breadth: ${p.internals?.breadth || ""}; trend: ${p.internals?.trend || ""}${p.internals?.divergence ? `\nDIVERGENCE (reconcile this — do not narrate one side without the other): ${p.internals.divergence}` : ""}
BREADTH DETAIL: ${breadth ? `${breadth.advancers}/${breadth.total} sectors positive (${breadth.pctPositive}%), avg sector change ${fmtSigned(breadth.avgChange, 2, "%")}, score ${breadth.score}, ${breadth.tone}. ${breadth.read || ""} Distribution: ${dist}. Leaders: ${(breadth.strongest || []).map((s) => `${s.name} ${fmtSigned(s.changePct, 2, "%")}`).join(", ")}. Laggards: ${(breadth.weakest || []).map((s) => `${s.name} ${fmtSigned(s.changePct, 2, "%")}`).join(", ")}. Sector tape: ${sectorLine}` : "Breadth detail unavailable."}
TREND DETAIL: ${trend ? `${trend.state} with trend score ${trend.score}; index tone ${fmtSigned(trend.indexTone, 2, "%")}. ${trend.read || ""} Components: ${(trend.components || []).join("; ")}` : "Trend detail unavailable."}
VOL DETAIL: ${vol ? `VIX ${fmtNum(vol.vix, 1)}; zone ${vol.zone}; structure ${vol.structure}; vol pressure score ${vol.score}. ${vol.read || ""}` : "Vol detail unavailable."}
CALENDAR: ${calendarRows.join("; ")}
POSITIONING: ${pos}`;
};

const condenseTiming = (timing) => {
  if (!timing) return "Generated time: not supplied.";
  return `GENERATED: ${timing.generatedAt || "unknown"}
SESSION: ${timing.session || "unknown"}
QUOTE TIMESTAMP: ${timing.quoteAsOf || "unknown"}
NEWS TIMESTAMP: ${timing.newsAsOf || "unknown"}
CASH INDEX AVG: ${timing.cashAvg == null ? "unknown" : fmtSigned(timing.cashAvg, 2, "%")}
FUTURES AVG: ${timing.futuresAvg == null ? "unknown" : fmtSigned(timing.futuresAvg, 2, "%")}
FUTURES VS CASH: ${timing.futuresCashSpread == null ? "unknown" : fmtSigned(timing.futuresCashSpread, 2, " pts")}
TIMING NOTE: ${timing.timingNote || ""}`;
};

// Head-trader personas — each a clone of a real trader's psychology and strategy. The trader
// name and WHO YOU ARE block swap the voice the synthesis is written in; the journal, schema and
// live-data pipeline are identical across all three, so any persona can reference the same
// library journal entries and desk data.
const PERSONAS = {
  jack: {
    name: "Jack",
    style: "Druckenmiller-style — top-down, liquidity-first, concentrated conviction",
    who: `Jack trades in the mold of Stanley Druckenmiller — psychology and strategy alike:
- Top-down first: liquidity, central banks and flows drive the tape; earnings and headlines matter only through that lens.
- Never trade the present: position for where the market is GOING, using price action and internals as the timing tool.
- Concentrated conviction: when the weighted evidence lines up, say so with size ("when you're right, bet big"); when it doesn't, conviction stays low and the stand-aside conditions get teeth.
- Capital preservation is rule one: hard invalidation levels, cut fast, never dig in. Being wrong is fine; staying wrong is not.
- No ego: you will flip 180 degrees in a session if the tape breaks against your prior call, and you say so plainly.
- If you're out of sync with the tape, the best trade is no trade — and you're not shy about calling that.`,
  },
  jesse: {
    name: "Uncle Jesse",
    style: "Livermore-style — tape reading, trend-following, ruthless discipline",
    who: `Uncle Jesse trades in the mold of Jesse Livermore — psychology and strategy alike:
- Tape reads first: price action and volume are the primary evidence; the "line of least resistance" — where price wants to go — outweighs any story about why.
- Trade with the trend, not against it: the big money is made sitting tight through the "big swing," not from chasing every wiggle.
- Pyramid into strength, cut losers on sight: add to confirmed winners, but a broken thesis gets closed immediately — no averaging down, no hoping.
- Patience is the hardest discipline: overtrading and impatience destroy more accounts than being wrong; if the tape isn't offering a clean read, sitting out IS the trade.
- Respect your own rules over your ego: your worst losses came from breaking your own discipline in a moment of overconfidence — call that risk out loud when conviction runs hot.
- Watch the leaders: the strongest names in the strongest groups tell you where the real move is.`,
  },
  mike: {
    name: "Cousin Mike",
    style: "Burry-style — deep contrarian research, asymmetric bets, long horizon",
    who: `Cousin Mike trades in the mold of Michael Burry — psychology and strategy alike:
- Deep, contrarian research: distrust consensus and sell-side narratives; dig into the underlying data itself rather than take the story at face value.
- Long time horizon, high pain tolerance: once the thesis is intact, mark-to-market pain and short-term noise don't shake the position — being early isn't being wrong.
- Asymmetric bets: size for a favorable risk/reward skew and prefer defined-risk structures that cap the downside while leaving the upside open.
- Comfortable being lonely: a good contrarian call often looks wrong for a while and draws no agreement — that isolation is a feature, not a signal to fold.
- Skeptical by default: question crowd positioning and complacency; the crowded, consensus trade is the one most likely to break.
- Data over vibes: prefers hard numbers — breadth, positioning, credit, volatility structure — to headline sentiment.`,
  },
  ptj: {
    name: "Coach Paul",
    style: "Paul Tudor Jones-style — risk-first, technicals + macro, defense before offense",
    who: `Coach Paul trades in the mold of Paul Tudor Jones — psychology and strategy alike:
- Risk management above all: capital preservation and defense come before offense; position size is dictated by where the stop sits, not by how right the call feels.
- Technicals fused with macro: reads chart patterns and historical analogs alongside liquidity and positioning context — neither alone is the whole picture.
- Only asymmetric risk/reward is worth taking: needs a clean, favorable ratio before committing capital; if it isn't there, the trade is a pass, full stop.
- Extremes are opportunity: violent, overextended moves and crowded positioning are where the best setups form — but only with a plan and a hard stop already in place.
- Quick to cut, quicker to flip: no loyalty to a position; the moment the technical picture breaks, exit first and ask questions later.
- Defense wins championships: preserving capital through the rough stretches matters more than any single home-run trade.`,
  },
  soros: {
    name: "Grandpa George",
    style: "Soros-style — reflexivity, macro theory, bet big only when thesis and timing align",
    who: `Grandpa George trades in the mold of George Soros — psychology and strategy alike:
- Reflexivity: markets and narratives feed each other — price action changes participant behavior, which then bends the fundamentals themselves. Track how the crowd's own belief is shifting reality, not just the data in isolation.
- Bet big only when thesis AND timing align: a correct macro read without the right inflection point is just an early loss — wait for the moment the reflexive loop is about to accelerate or break.
- Theory before tape: builds a top-down macro thesis — policy, currency regimes, capital flows — and treats price as confirming or refuting that theory, not as the whole story.
- No sacred cows: revises or abandons the thesis completely the instant the reflexive loop stops working; being wrong quickly is cheap, staying wrong is not.
- Comfortable with scale and controversy: when conviction and timing truly align, sizes up dramatically; otherwise stays small or flat and waits.
- Globally and policy-aware: central bank credibility, currency regimes and cross-border capital flows matter as much as any single instrument's chart.`,
  },
  seykota: {
    name: "Robo Eddie",
    style: "Seykota-style — pure systematic trend-following, mechanical, zero discretion",
    who: `Robo Eddie trades in the mold of Ed Seykota — psychology and strategy alike:
- Purely systematic: trades a fixed set of rules — if a signal doesn't come from the system, it doesn't exist. No discretion, no gut feel, no story about why.
- The trend is the only edge: position with the prevailing trend and ignore predictions about where it "should" reverse — the trend is your friend until it bends.
- Risk rules are mechanical: fixed position sizing and hard stops define the risk on a trade before it's ever placed — no averaging down, no exceptions.
- Cut losses fast, let winners run: the system trims losers automatically and lets trend trades compound without emotional interference.
- Emotion is the enemy: psychology only matters as the discipline required to follow the system without overriding it in a moment of fear or excitement.
- No forecasting: doesn't predict what the market will do next — reacts mechanically to what it is already doing.`,
  },
};
const DEFAULT_PERSONA = "jack";

// Signature pillar emphasis per persona — how each trader's lens naturally weights the five
// pillars. Folded on top of the trader's manual sliders (see personaWeights) so the persona shapes
// the read while a slider dragged high still anchors it. Relative emphasis, roughly [-0.5, +0.9];
// 0 = neutral. Keys match PILLAR_KEYS.
const PERSONA_TILT = {
  jack:    { technicals: 0.1,  macro: 0.5,  sentiment: -0.3, positioning: 0.6,  eventRisk: 0.0 },  // Druckenmiller — flows/macro
  jesse:   { technicals: 0.8,  macro: -0.3, sentiment: 0.1,  positioning: -0.2, eventRisk: -0.2 }, // Livermore — tape/technicals
  mike:    { technicals: -0.3, macro: 0.2,  sentiment: 0.5,  positioning: 0.7,  eventRisk: 0.3 },  // Burry — positioning/sentiment extremes
  ptj:     { technicals: 0.4,  macro: 0.3,  sentiment: -0.2, positioning: 0.2,  eventRisk: 0.6 },  // Paul Tudor Jones — risk/vol + technicals
  soros:   { technicals: -0.3, macro: 0.8,  sentiment: 0.3,  positioning: 0.5,  eventRisk: 0.0 },  // Soros — macro/reflexivity
  seykota: { technicals: 0.9,  macro: -0.4, sentiment: -0.4, positioning: -0.3, eventRisk: -0.2 }, // Seykota — pure trend/technicals
};
const PILLAR_LABEL = { technicals: "Technicals", macro: "Macro/News", sentiment: "Sentiment", positioning: "Positioning/Flows", eventRisk: "Event Risk" };

// Blend the trader's manual pillar weights with the persona's signature emphasis. Multiplicative,
// so the persona TILTS the read but the manual sliders anchor it — a pillar the trader sets high
// stays dominant for every persona. Renormalized to the 100-point budget. Returns { weights, top },
// where top names the two pillars the persona leans on hardest (for the prompt's explanation line).
const personaWeights = (weights, persona) => {
  const tilt = PERSONA_TILT[persona] || {};
  const raw = {}; let sum = 0;
  for (const k of PILLAR_KEYS) { const v = Math.max(0, (Number(weights?.[k]) || 0) * (1 + (tilt[k] || 0))); raw[k] = v; sum += v; }
  const out = {};
  for (const k of PILLAR_KEYS) out[k] = sum > 0 ? Math.round((raw[k] / sum) * WEIGHT_TOTAL) : Math.round(WEIGHT_TOTAL / PILLAR_KEYS.length);
  // Name only the pillars this persona genuinely leans INTO (positive tilt), hardest first, so the
  // prompt's emphasis line never credits a pillar the persona actually de-weights.
  const top = [...PILLAR_KEYS].filter((k) => (tilt[k] || 0) > 0).sort((a, b) => tilt[b] - tilt[a]).slice(0, 2).map((k) => PILLAR_LABEL[k]);
  return { weights: out, emphasis: top.length >= 2 ? `${top[0]} and ${top[1]}` : (top[0] || "the weighted pillars") };
};

const thesisPrompt =({ market, news, points, timing, weights, lean, risk, notes, instrument, deskContext, focusSpot, focusLevels, pair, jackJournal = [], persona = DEFAULT_PERSONA }) => {
  const trader = PERSONAS[persona] || PERSONAS[DEFAULT_PERSONA];
  const eff = personaWeights(weights, persona);
  const focus = thesisInstrumentConfig(instrument);
  const isStock = focus.group === "stock";
  const journalBlock = jackJournal.length ? `
=== ${trader.name.toUpperCase()}'S JOURNAL (your recent published desk notes, newest first) ===
${jackJournal.map((j) => `- ${j.when} · ${j.type}${j.instrument ? ` · ${j.instrument}` : ""}${j.bias ? ` · ${j.bias}` : ""}${j.title ? ` — "${j.title}"` : ""}`).join("\n")}
These are YOUR recent calls. In "deskRead", reference them for continuity: name whether today's call continues, extends, or breaks from your recent lean, and handle a break the way YOU would (whether that means flipping fast or holding a thesis through the noise).
` : "";
  const stockLevelsLine = focusLevels
    ? `${focus.symbol} live levels (use these exact numbers for the action level and targets): spot ${fmtNum(focusLevels.spot, 2)}, pivot ${fmtNum(focusLevels.pivot, 2)}, supports ${(focusLevels.supports || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"}, resistances ${(focusLevels.resistances || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"} (as of ${focusLevels.asOf || "now"}).`
    : "";
  const pairBlock = pair ? `
=== PAIRED INSTRUMENT (relative-value context) ===
The trader is weighing ${focus.symbol} alongside ${pair.symbol} (${pair.name})${pair.spot ? `, trading near ${fmtNum(pair.spot, 2)}` : ""}.${pair.levels ? ` ${pair.symbol} levels: pivot ${fmtNum(pair.levels.pivot, 2)}, supports ${(pair.levels.supports || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"}, resistances ${(pair.levels.resistances || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"}.` : ""}
In "pairRead", give a concise relative-value read: how ${focus.symbol} is likely to perform RELATIVE to ${pair.symbol} today (e.g. favour long ${focus.symbol} / short ${pair.symbol} or the reverse), the correlation or divergence to watch, and the key level on each leg. Keep the headline bias, score and levels focused on ${focus.symbol}; the pair read is an additional relative-value angle, not the primary call.
` : "";
  return `You are ${trader.name}, head trader at Overwatch Intelligence's desk. Build today's daily bias thesis for trading ${focus.focusLabel}. Today is ${dateLine()}.

=== WHO YOU ARE ===
${trader.who}
Write the summary, game plan and deskRead in ${trader.name}'s voice and decision framework — not just a different accent on the same call: let your lens shape which evidence you privilege, how you size conviction, and how you express the levels (a rules-based trader states triggers, not forecasts). Direct, first-person where natural, zero hedging filler.
${journalBlock}
=== LIVE DESK DATA ===
${condenseMarket(market)}

${condenseNews(news)}

${condensePoints(points)}

=== TIMING CONTEXT ===
${condenseTiming(timing)}

=== DESK CONFIGURATION ===
Pillar weights (0-100, higher = more influence on the call): Technicals ${eff.weights.technicals}, Macro/News ${eff.weights.macro}, Sentiment ${eff.weights.sentiment}, Positioning/Flows ${eff.weights.positioning}, Event Risk ${eff.weights.eventRisk}.
These weights already fold ${trader.name}'s natural emphasis on ${eff.emphasis} into the desk's manual sliders — score with them, and let that emphasis show in which drivers you rank first.
Directional lean: ${lean === "auto" ? "none — derive direction purely from the data" : `trader is leaning ${lean} — stress-test that lean against the data and push back if it is not justified`}.
Risk appetite: ${risk}.
Primary instrument focus: ${focus.symbol} (${focus.name})${focusSpot ? `, currently trading near ${fmtNum(focusSpot, 2)}` : ""} with ${focus.futures} futures as the ${isStock ? "index hedge" : "live execution"} proxy when relevant.
${isStock ? `IMPORTANT — ${focus.symbol} is a SINGLE STOCK. The support/resistance/pivot numbers in the data above (SPX / NDX / DJI) are INDEX levels, NOT ${focus.symbol}'s — use the index internals only as macro proxy context and say so. ${stockLevelsLine ? `${stockLevelsLine} Build the action level, upside and downside targets, game plan, invalidation and watch list from THESE ${focus.symbol} numbers — give specific prices, not vague descriptions.` : `Build the levels around ${focus.symbol}'s OWN price${focusSpot ? ` (live near ${fmtNum(focusSpot, 2)})` : ""} and your knowledge of its recent range, with specific prices.`} NEVER quote an index level as if it were ${focus.symbol}'s level. Your "Technicals" pillar evidence for ${focus.symbol} is its own price/level data (above) plus your knowledge of its recent range and catalysts — NOT index breadth/trend, which is macro/sector regime context, not a technical read on ${focus.symbol} itself. Don't substitute one for the other.` : ""}
Trader notes: ${notes ? notes : "none"}.
${deskContext ? `
=== DESK HEDGE & OPTIONS STRUCTURES (trader is actively considering these) ===
${deskContext}
Weave these into the game plan with SPECIFICS: state whether each structure fits today's bias, conviction, and risk appetite; give concrete entry, profit-taking and stop/exit guidance for the priced option or hedge (reference the actual strike, premium and the thesis's own upside/downside levels); and flag any mismatch (e.g. paying for downside puts into a high-conviction bullish call).
` : ""}${pairBlock}
Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"bias":"bullish|bearish|neutral","score":<integer -100 to 100>,"conviction":<integer 1-10>,"timestamp":"<generated time and ET session>","timingNote":"<one short timestamp/data-freshness note; mention stale cash-index risk when relevant>","headline":"<punchy 6-12 word thesis headline>","summary":"<4-5 sentence thesis grounded in the data, weights, and stance>","pillarRead":"<one sentence explaining which weighted pillars drove the call>","stanceRead":"<one sentence explaining how directional lean and risk appetite changed or constrained the call>","deskRead":"<2-3 sentences, first person, in ${trader.name}'s own voice and decision framework: your read on the setup, how much conviction to put behind the call and why (in the terms YOUR style cares about), and how it squares with your recent journal calls (continuity, extension, or a break — name it)>","pairRead":${pair ? `"<relative-value read: ${focus.symbol} vs ${pair.symbol}, the lean (which leg long/short), correlation/divergence to watch, and the key level on each leg>"` : '""'},"drivers":["<5-7 ranked key drivers, including top weighted pillars and stance impact>"],"bullCase":["<2-3 bullets>"],"bearCase":["<2-3 bullets>"],"levels":{"action":"<the single level that matters most today and why>","upside":"<upside target(s), or the level that confirms/extends the move for a rules-based read>","downside":"<downside target(s), or the level that flips or invalidates the setup>"},"gamePlan":"<2-3 sentences: concrete approach for ${focus.symbol} (and ${focus.futures} where relevant) given this bias and risk appetite>","invalidation":"<the specific price or condition that ends this thesis>","standAside":"<conditions under which the best trade today is NO trade>"}

Every field in the schema is REQUIRED — never omit "deskRead". Keep string values tight so the full JSON always completes.
Be specific — use actual numbers from the data. The sign of score must match bias. Conviction should reflect how aligned the weighted pillars are.
Treat the pillar weights as a scoring model, not decoration: high-weight pillars must have more influence than low-weight pillars and the drivers must name the highest-weight/highest-impact inputs.
Treat the desk stance as a constraint: directional lean may tilt the score, but you must push back if the weighted data disagrees; risk appetite must alter conviction, sizing language, and stand-aside conditions.
Focus the levels, game plan, invalidation, watchpoints, drivers, bull case, bear case, and pillar read on ${focus.symbol} first. The index/breadth/VIX data is regime CONTEXT, not the subject of the call — every driver and bull/bear bullet must tie back to what it means for ${focus.symbol} specifically, not restate the index picture on its own. You can reference the broader index complex, but the trade expression should be built for ${focus.focusLabel}.
The thesis must explicitly use the Internals regime: explain whether market breadth confirms or conflicts with price, what the trend state means in plain English, and whether the volatility structure supports risk-taking or argues for tighter risk.
When session is PRE-MARKET, AFTER-HOURS, or CLOSED, explicitly account for the possibility that SPX/NDX/DJI reflect the last regular close while ES/NQ/YM futures are live. Weight ${focus.futures} more heavily when it diverges from ${focus.symbol}, and say that in timingNote.`;
};

/* ================================================================
   STYLES — graphite-navy desk terminal, brass signal accent
   ================================================================ */

/* ================================================================
   PRIMITIVES
   ================================================================ */

const Card = ({ icon: Ic, title, sub, tools, children, className = "", style, onClick, collapsible = false, open = true, onToggle }) => {
  const headToggles = collapsible && typeof onToggle === "function";
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {(title || tools || collapsible) && (
        <div
          className={`card-head${headToggles ? " card-head-toggle" : ""}`}
          {...(headToggles && {
            role: "button",
            tabIndex: 0,
            "aria-expanded": open,
            onClick: onToggle,
            onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } },
          })}
        >
          {Ic && <Ic size={15} className="ic" />}
          <div className="card-title">
            {title}
            {sub && <small>{sub}</small>}
          </div>
          {/* Keep interactive tools from toggling the section when the header is a collapse button. */}
          {tools && <div className="card-tools" onClick={headToggles ? (e) => e.stopPropagation() : undefined}>{tools}</div>}
          {collapsible && <span className="card-chevron">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>}
        </div>
      )}
      {children}
    </div>
  );
};

const Freshness = ({ at }) => {
  if (!at) return null;
  const ageMin = Math.floor((Date.now() - at.ts) / 60000);
  const tier = ageMin >= 30 ? "stale" : ageMin >= 10 ? "aging" : "";
  return (
    <span className={`freshness ${tier}`} title={`Last synced ${ageMin}m ago`}>
      {tier === "stale" ? "STALE · " : ""}{at.label}{ageMin >= 2 ? ` · ${ageMin}m ago` : ""}
    </span>
  );
};

// Per-symbol freshness chip: LIVE (real-time feed + trading now), a delay tag (delayed feed), or
// nothing when the instrument's market is closed — then every price is just the last close.
const FreshTag = ({ delayed, open, delaySec }) => {
  if (!open) return null;
  if (delayed) {
    const m = Number.isFinite(delaySec) && delaySec > 0 ? Math.round(delaySec / 60) : 15;
    return <span className="tk-fresh delayed" title={`Delayed ~${m} min — free public feed (real-time needs a paid exchange entitlement)`}>{m}m</span>;
  }
  return <span className="tk-fresh live" title="Real-time feed"><span className="tk-fresh-dot" />LIVE</span>;
};

// Compact live/delayed summary for the Market snapshot header, computed across the shown tickers.
const SnapFreshness = ({ tickers }) => {
  const open = (tickers || []).filter((t) => !t._stale && symbolMarketOpen(t.symbol));
  if (!open.length) return <span className="snap-fresh closed">markets closed</span>;
  const live = open.filter((t) => !t.delayed).length;
  const delayed = open.length - live;
  return (
    <span className="snap-fresh" title="Real-time vs delayed instruments currently trading">
      {live > 0 && <span className="snap-fresh-live"><span className="tk-fresh-dot" />{live} live</span>}
      {delayed > 0 && <span className="snap-fresh-delayed">{delayed} delayed</span>}
    </span>
  );
};

const Skeleton = ({ h = 16, w = "100%", style }) => <div className="skel" style={{ height: h, width: w, ...style }} />;

const LoadingBlock = ({ lines = 3, msg }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {msg && (
      <div className="loading-line">
        <RefreshCw size={12} className="spin" /> {msg}
      </div>
    )}
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} h={i === 0 ? 26 : 15} w={`${100 - i * 12}%`} />
    ))}
  </div>
);

const ErrBlock = ({ msg, onRetry }) => (
  <div className="err">
    <AlertTriangle size={17} color={C.bear} style={{ flex: "none" }} />
    <div style={{ flex: 1 }}>
      <b>Fetch failed.</b> {msg || "The data service didn't return a clean read."}
    </div>
    {onRetry && (
      <button className="btn btn-sm" onClick={onRetry}>
        <RotateCcw size={12} /> Retry
      </button>
    )}
  </div>
);

const EmptyState = ({ icon: Ic, title, body, action }) => (
  <div className="empty">
    <Ic size={30} color={C.brass} strokeWidth={1.5} />
    <h3>{title}</h3>
    <p>{body}</p>
    {action}
  </div>
);

const ImpactBars = ({ n }) => (
  <span className="impact" title={`Impact ${n}/5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} style={{ height: 3 + i * 2, background: i <= n ? (n >= 4 ? C.bear : n === 3 ? C.brass : C.muted) : undefined }} />
    ))}
  </span>
);

/* ================================================================
   VISUALIZATIONS
   ================================================================ */

const polar = (cx, cy, r, deg) => {
  const rad = ((deg - 180) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};
const arcPath = (cx, cy, r, a0, a1) => {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

const VixGauge = ({ value, structure }) => {
  const lo = 10, hi = 45;
  const v = value == null ? null : clamp(value, lo, hi);
  const deg = v == null ? 0 : ((v - lo) / (hi - lo)) * 180;
  const zones = [
    { a0: 0, a1: ((15 - lo) / (hi - lo)) * 180, c: C.bull, t: "Calm" },
    { a0: ((15 - lo) / (hi - lo)) * 180, a1: ((20 - lo) / (hi - lo)) * 180, c: C.info, t: "Normal" },
    { a0: ((20 - lo) / (hi - lo)) * 180, a1: ((28 - lo) / (hi - lo)) * 180, c: C.brass, t: "Elevated" },
    { a0: ((28 - lo) / (hi - lo)) * 180, a1: 180, c: C.bear, t: "Stress" },
  ];
  const zone = v == null ? null : value < 15 ? zones[0] : value < 20 ? zones[1] : value < 28 ? zones[2] : zones[3];
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 220 124" style={{ width: "100%", maxWidth: 250, display: "block", margin: "0 auto" }}>
        {zones.map((z, i) => (
          <path key={i} d={arcPath(110, 106, 82, z.a0 + 1.5, z.a1 - 1.5)} stroke={z.c} strokeWidth="11" fill="none" strokeLinecap="round" opacity="0.32" />
        ))}
        {zone && <path d={arcPath(110, 106, 82, zone.a0 + 1.5, zone.a1 - 1.5)} stroke={zone.c} strokeWidth="11" fill="none" strokeLinecap="round" />}
        {[10, 15, 20, 28, 45].map((tick) => {
          const a = ((clamp(tick, lo, hi) - lo) / (hi - lo)) * 180;
          const [tx, ty] = polar(110, 106, 98, a);
          return (
            <text key={tick} x={tx} y={ty} fontSize="8.5" fill="#64748B" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
              {tick}
            </text>
          );
        })}
        <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: "110px 106px", transition: "transform 1s cubic-bezier(.22,1,.36,1)" }}>
          <line x1="110" y1="106" x2="38" y2="106" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="110" cy="106" r="5.5" fill="#E2E8F0" />
        <text x="110" y="88" textAnchor="middle" fontSize="24" fontWeight="700" fill={zone ? zone.c : "#94A3B8"} fontFamily="JetBrains Mono, monospace">
          {value == null ? "—" : fmtNum(value, 2)}
        </text>
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: 9, marginTop: 2, flexWrap: "wrap" }}>
        {zone && <span className={`chip ${value < 20 ? "b-bull" : value < 28 ? "b-brass" : "b-bear"}`}>{zone.t}</span>}
        {structure && <span className="chip b-info">{structure}</span>}
      </div>
    </div>
  );
};

const fearGreedColor = (score) => {
  if (score < 25) return C.bear;
  if (score < 45) return "#F08A6A";
  if (score <= 55) return C.brass;
  if (score <= 75) return "#75D991";
  return C.bull;
};

const fearGreedChip = (score) => (score < 45 ? "b-bear" : score <= 55 ? "b-brass" : "b-bull");

const titleCase = (text = "") =>
  String(text)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const FearGreedGauge = ({ data }) => {
  const score = Number(data?.score);
  if (!Number.isFinite(score)) return <div style={{ color: C.muted, fontSize: 12 }}>No Fear & Greed data in last sync.</div>;
  const pct = clamp(score, 0, 100);
  const color = fearGreedColor(pct);
  const rating = titleCase(data?.rating || "neutral");
  const asOf = data?.timestamp && data.timestamp !== "sample snapshot"
    ? new Date(data.timestamp).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" })
    : data?.timestamp || "latest";
  const comparisons = [
    { label: "Prev", value: data?.previousClose },
    { label: "1W", value: data?.previousWeek },
    { label: "1M", value: data?.previousMonth },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div className="mono" style={{ fontSize: 44, lineHeight: 1, fontWeight: 700, color }}>
            {fmtNum(pct, 1)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
            <span className={`chip ${fearGreedChip(pct)}`}>{rating}</span>
            <span className="mono" style={{ fontSize: 10, color: C.faint || C.muted }}>{data?.source || "CNN"} · {asOf}</span>
          </div>
        </div>
        <div className="mono" style={{ color: C.muted, fontSize: 10, lineHeight: 1.6, textAlign: "right", maxWidth: 112 }}>
          0 fear<br />50 neutral<br />100 greed
        </div>
      </div>

      <div style={{ position: "relative", marginTop: 18, paddingTop: 12 }}>
        <div style={{ height: 8, borderRadius: 999, background: `linear-gradient(90deg,${C.bear},#8a4a52 25%,${C.brass} 50%,#3f7a64 75%,${C.bull})`, opacity: 0.9 }} />
        <div
          style={{
            position: "absolute",
            left: `${pct}%`,
            top: 6,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: color,
            border: "3px solid #E2E8F0",
            boxShadow: `0 0 16px ${color}cc, 0 2px 5px rgba(0,0,0,.45)`,
            transform: "translateX(-50%)",
            transition: "left 1s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 16 }}>
        {comparisons.map((item) => {
          const delta = Number.isFinite(Number(item.value)) ? pct - Number(item.value) : null;
          return (
            <div key={item.label} style={{ border: "1px solid var(--line)", background: "var(--panel2)", borderRadius: 8, padding: "8px 9px" }}>
              <div className="mono" style={{ color: C.faint || C.muted, fontSize: 9, letterSpacing: ".08em" }}>{item.label}</div>
              <div className="mono" style={{ marginTop: 4, fontSize: 12.5, color: delta == null ? C.muted : chgColor(delta) }}>
                {delta == null ? "—" : fmtSigned(delta, 1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BiasSpectrum = ({ score }) => {
  const pct = score == null ? 50 : ((clamp(score, -100, 100) + 100) / 200) * 100;
  return (
    <div>
      <div className="spectrum">
        <div className="spectrum-track" />
        <div className="spectrum-mid" />
        <div className="spectrum-caret" style={{ left: `${pct}%` }} />
      </div>
      <div className="spectrum-lbl">
        <span>BEARISH −100</span>
        <span>0</span>
        <span>+100 BULLISH</span>
      </div>
    </div>
  );
};

const ConvictionPips = ({ n, bias }) => {
  const color = bias === "bullish" ? C.bull : bias === "bearish" ? C.bear : C.brass;
  return (
    <div className="pips" title={`Conviction ${n}/10 — how aligned the five weighted pillars are. Separate from Score (Score = direction + strength; Conviction = agreement).`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="pip" style={i < n ? { background: color, borderColor: color, boxShadow: `0 0 7px ${color}66` } : {}} />
      ))}
      <span className="mono" style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>CONV {n}/10</span>
    </div>
  );
};

const DayCandle = ({ low, high, price, dayOpen, previousClose, decimals = 0 }) => {
  if (low == null || high == null || price == null || high <= low) return null;
  const open = Number.isFinite(Number(dayOpen))
    ? Number(dayOpen)
    : Number.isFinite(Number(previousClose))
      ? Number(previousClose)
      : Number(price);
  const close = Number(price);
  const safeOpen = clamp(open, low, high);
  const safeClose = clamp(close, low, high);
  const trackHeight = 72;
  const railPad = 6;
  const scale = trackHeight - railPad * 2;
  const yFor = (value) => railPad + ((high - value) / (high - low)) * scale;
  const openY = yFor(safeOpen);
  const closeY = yFor(safeClose);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 4);
  const bodyTop = clamp(Math.min(openY, closeY) - 1, railPad, trackHeight - railPad - bodyHeight);
  const wickHeight = Math.max(scale, 1);
  const bullish = close >= open;
  const flat = Math.abs(close - open) < Math.max((high - low) * 0.05, 0.15);
  const toneClass = flat ? "flat" : bullish ? "bull" : "bear";
  return (
    <div className="tk-candle" aria-label={`Daily candlestick with open ${fmtNum(open)}, high ${fmtNum(high)}, low ${fmtNum(low)}, and close ${fmtNum(close)}.`}>
      <div className="candle-axis" aria-hidden="true">
        <span className="candle-axis-line candle-axis-hi">
          <span className="candle-axis-tag">H</span>
          <span className="candle-axis-num">{fmtNum(high, decimals)}</span>
        </span>
        <span className="candle-axis-line candle-axis-lo">
          <span className="candle-axis-tag">L</span>
          <span className="candle-axis-num">{fmtNum(low, decimals)}</span>
        </span>
      </div>
      <div className="candle-rail" style={{ height: `${trackHeight}px` }}>
        <div className="candle-wick" style={{ top: `${railPad}px`, height: `${wickHeight}px` }} />
        <div className={`candle-body ${toneClass}`} style={{ top: `${bodyTop}px`, height: `${bodyHeight}px` }} />
      </div>
    </div>
  );
};

// Compact 7-session candle strip for the top-center of each ticker card. All candles share ONE
// price scale (window min-low … max-high) so the strip reads as the recent path, not five loose
// boxes. The newest candle carries a "now" marker (and a live pulse when the market's open) to tie
// it to the live day candle on the right. Same bull/bear/flat colours as the day candle.
const MiniStrip = ({ candles, live = false }) => {
  if (!Array.isArray(candles) || candles.length < 2) return null;
  const lo = Math.min(...candles.map((c) => c.l));
  const hi = Math.max(...candles.map((c) => c.h));
  const span = (hi - lo) || 1;
  const PAD = 8; // % breathing room top/bottom so extremes don't touch the edges
  const y = (v) => PAD + ((hi - v) / span) * (100 - PAD * 2);
  return (
    <div className="tk-strip" aria-hidden="true">
      {candles.map((c, i) => {
        const yHi = y(c.h), yLo = y(c.l);
        let bodyTop = Math.min(y(c.o), y(c.c));
        const bodyH = Math.max(Math.abs(y(c.c) - y(c.o)), 10); // floor so a doji stays visible
        bodyTop = clamp(bodyTop, PAD, 100 - PAD - bodyH);
        const tone = Math.abs(c.c - c.o) < span * 0.03 ? "flat" : c.c >= c.o ? "bull" : "bear";
        const now = i === candles.length - 1;
        return (
          <div className={`msk${now && live ? " msk-live" : ""}`} key={i}>
            <div className="candle-wick" style={{ top: `${yHi}%`, height: `${Math.max(yLo - yHi, 1)}%` }} />
            <div className={`candle-body ${tone}`} style={{ top: `${bodyTop}%`, height: `${bodyH}%` }} />
          </div>
        );
      })}
    </div>
  );
};

// Compact header candle for the level maps — same visual language as the ticker-card candle,
// shrunk to a single wick+body so it tucks into the card's top-right corner.
const MiniCandle = ({ low, high, price, dayOpen, previousClose, decimals = 0, live = false }) => {
  if (low == null || high == null || price == null || high <= low) return null;
  const open = Number.isFinite(Number(dayOpen))
    ? Number(dayOpen)
    : Number.isFinite(Number(previousClose))
      ? Number(previousClose)
      : Number(price);
  const close = Number(price);
  const safeOpen = clamp(open, low, high);
  const safeClose = clamp(close, low, high);
  // Sized to fill the card header row (set by the two-line title block) without growing the card.
  const trackHeight = 36;
  const railPad = 2;
  const scale = trackHeight - railPad * 2;
  const yFor = (value) => railPad + ((high - value) / (high - low)) * scale;
  const openY = yFor(safeOpen);
  const closeY = yFor(safeClose);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 4);
  const bodyTop = clamp(Math.min(openY, closeY), railPad, trackHeight - railPad - bodyHeight);
  const bullish = close >= open;
  const flat = Math.abs(close - open) < Math.max((high - low) * 0.05, 0.15);
  const toneClass = flat ? "flat" : bullish ? "bull" : "bear";
  const glow = flat ? "#3B82F6" : bullish ? C.bull : C.bear;
  return (
    <div
      className={`mini-candle${live ? " mini-candle-live" : ""}`}
      style={live ? { "--candle-glow": glow } : undefined}
      title={`Open ${fmtNum(open, decimals)} · High ${fmtNum(high, decimals)} · Low ${fmtNum(low, decimals)} · Close ${fmtNum(close, decimals)}${live ? " · market open" : ""}`}
      aria-label={`Daily candlestick: open ${fmtNum(open, decimals)}, high ${fmtNum(high, decimals)}, low ${fmtNum(low, decimals)}, close ${fmtNum(close, decimals)}.`}
    >
      <div className="candle-wick" style={{ top: `${railPad}px`, height: `${scale}px` }} />
      <div className={`candle-body ${toneClass}`} style={{ top: `${bodyTop}px`, height: `${bodyHeight}px` }} />
    </div>
  );
};

const buildSessionRead = ({ market, points, news }) => {
  const tickers = Array.isArray(market?.tickers) ? market.tickers : [];
  const bySymbol = (symbol) => tickers.find((t) => t.symbol === symbol);
  const spx = bySymbol("SPX");
  const ndx = bySymbol("NDX");
  const dji = bySymbol("DJI");
  const vix = bySymbol("VIX");
  const indexMoves = [spx, ndx, dji].filter(Boolean);
  const avgMove = indexMoves.length
    ? indexMoves.reduce((sum, item) => sum + (Number(item.changePct) || 0), 0) / indexMoves.length
    : 0;
  const tone = avgMove > 0.35 ? "Constructive" : avgMove < -0.35 ? "Cautious" : "Mixed";
  const sectors = [...(market?.sectors || [])]
    .filter((s) => s && Number.isFinite(Number(s.changePct)))
    .sort((a, b) => b.changePct - a.changePct);
  const greenCount = sectors.filter((s) => s.changePct > 0).length;
  const totalCount = sectors.length || 11;
  const leaders = sectors[0];
  const laggard = sectors.at(-1);
  const structure = points?.vix?.structure || (Number(vix?.price) > 25 ? "backwardation" : Number(vix?.price) < 16 ? "contango" : "flat");
  const vixPrice = Number(vix?.price);
  const volRead = !Number.isFinite(vixPrice)
    ? "Volatility data is still loading."
    : vixPrice >= 25
      ? `Volatility is elevated at VIX ${fmtNum(vixPrice, 1)}, so moves can stay fast.`
      : vixPrice <= 16
        ? `Volatility is calm at VIX ${fmtNum(vixPrice, 1)}.`
        : `Volatility is manageable at VIX ${fmtNum(vixPrice, 1)}.`;
  const breadthText = String(points?.internals?.breadth || `${greenCount}/${totalCount} sectors green`).replace(/[.\s]+$/, "");
  const breadthPlain = sectors.length ? `${greenCount}/${totalCount} major sectors higher` : breadthText;
  const breadthRead = sectors.length
    ? greenCount >= 7
      ? "Most sectors are participating, which supports the move."
      : greenCount <= 3
        ? "Participation is thin, so rallies need proof."
        : "Sector participation is mixed."
    : breadthText;
  const calendarGroups = points?.calendarGroups || {};
  const calendarFlat = Array.isArray(points?.calendar) ? points.calendar : [];
  const calendarPool = [
    ...(calendarGroups.today || []),
    ...(calendarGroups.tomorrow || []),
    ...(calendarGroups.upcoming || []),
    ...calendarFlat,
  ];
  const nextEventItem = pickCalendarCatalyst(calendarPool);
  const nextEvent = nextEventItem
    ? `${nextEventItem.event}${nextEventItem.date ? ` · ${calendarDateLabel(nextEventItem.date, { weekday: true })}` : ""}${nextEventItem.time ? ` · ${nextEventItem.time}` : ""}`
    : "No major U.S. event queued";
  const newsLine = news?.brief || news?.mood || "";
  const positioning = points?.positioning?.summary || "";
  const indexLine = [spx, ndx, dji].filter(Boolean).map((t) => `${t.symbol} ${fmtSigned(t.changePct, 2, "%")}`).join(", ");
  const summary = `${tone} read: ${indexLine || "major indexes are still loading"}. ${volRead} ${breadthRead}`;
  const cards = [
    {
      key: "Direction",
      value: tone,
      note: indexLine || "Index direction pending",
    },
    {
      key: "Volatility",
      value: `VIX ${fmtNum(vix?.price, 1)}`,
      note: structure === "backwardation" ? "Stress is elevated." : structure === "contango" ? "No panic signal right now." : "Stress is balanced.",
    },
    {
      key: "Breadth",
      value: breadthPlain,
      note: leaders && laggard ? `Best: ${leaders.name}; weakest: ${laggard.name}` : "Breadth read pending",
    },
    {
      key: "Next event",
      value: nextEvent,
      note: nextEventItem?.note || "Watch whether it changes rates, volatility, or index direction.",
    },
  ];
  const note = [positioning ? `Flow color: ${positioning}` : null, newsLine ? `News context: ${newsLine}` : null].filter(Boolean).join(" · ");
  return { summary, cards, note };
};

const ETF_INSTRUMENTS = new Set(["SPY", "QQQ", "DIA"]);

const LevelsLadder = ({ spx, label = "SPX", decimals, ohlc }) => {
  const dec = decimals != null ? decimals : (ETF_INSTRUMENTS.has(label) ? 2 : 0);
  if (!spx || spx.spot == null) return <div style={{ color: C.muted, fontSize: 12 }}>No {label} levels in last sync.</div>;
  const rows = [
    ...(spx.resistances || []).map((v, i) => ({ v, type: "res", label: `R${i + 1}` })),
    ...(spx.pivot != null ? [{ v: spx.pivot, type: "piv", label: "PIVOT" }] : []),
    ...(spx.supports || []).map((v, i) => ({ v, type: "sup", label: `S${i + 1}` })),
  ].filter((r) => typeof r.v === "number" && !isNaN(r.v));
  // Session OHLC drawn as subtle reference rails. O/C labelled on the left edge, H/L on the right.
  const ohlcRows = [
    { v: ohlc?.o, label: "Open", side: "left" },
    { v: ohlc?.c, label: "Close", side: "left" },
    { v: ohlc?.h, label: "High", side: "right" },
    { v: ohlc?.l, label: "Low", side: "right" },
  ].filter((r) => typeof r.v === "number" && !isNaN(r.v));
  const all = [...rows.map((r) => r.v), ...ohlcRows.map((r) => r.v), spx.spot];
  const min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.1 || 10;
  const H = 252, W = 330;
  // Balanced gutters: ~70px left (R/S labels + Open/Close) and ~60px right (values inside + High/Low),
  // so the plot reads centred and the OHLC labels don't bleed into the S/R values or off the card.
  const AX = 70;        // vertical axis / plot left
  const PR = 270;       // plot right edge (lines + zone shading end here)
  const VALX = PR - 4;  // S/R value numbers sit just inside the plot's right edge
  const y = (v) => 14 + ((max + pad - v) / (max - min + 2 * pad)) * (H - 28);
  const colorOf = (t) => (t === "res" ? C.bear : t === "sup" ? C.bull : C.brass);
  const spotRectW = dec > 0 ? 102 : 86;
  const spotCenterX = (AX + 6) + spotRectW / 2;
  // Opening gap: the space between the prior close and today's open. As price retraces into it
  // the gap "fills"; we shade only the portion that is still unfilled (closest to the prior close).
  const gapO = ohlc && Number.isFinite(Number(ohlc.o)) ? Number(ohlc.o) : null;
  const gapC = ohlc && Number.isFinite(Number(ohlc.c)) ? Number(ohlc.c) : null;
  const gapHi = ohlc && Number.isFinite(Number(ohlc.h)) ? Number(ohlc.h) : null;
  const gapLo = ohlc && Number.isFinite(Number(ohlc.l)) ? Number(ohlc.l) : null;
  const gapPts = gapO != null && gapC != null ? gapO - gapC : null;
  const gapPct = gapPts != null && gapC ? (gapPts / gapC) * 100 : null;
  const gapUp = gapPts != null && gapPts > 0;
  // frontier = how deep price has traded back into the gap; unfilled band spans prior close → frontier
  const gapFrontier = gapPts == null ? null : gapUp
    ? (gapLo != null ? clamp(gapLo, gapC, gapO) : gapO)
    : (gapHi != null ? clamp(gapHi, gapO, gapC) : gapO);
  const unfilledPct = gapFrontier != null && gapC ? ((gapFrontier - gapC) / gapC) * 100 : null;
  const hasGap = gapPct != null && Math.abs(gapPct) >= 0.1 && unfilledPct != null && Math.abs(unfilledPct) >= 0.05;
  const gapId = String(label).replace(/[^A-Za-z0-9]/g, "") || "x";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <defs>
        <pattern id={`gapHatch-${gapId}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="rgba(217,160,90,0.05)" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(217,160,90,0.30)" strokeWidth="1" />
        </pattern>
      </defs>
      {/* zone shading: resistance (red) above the live price, support (green) below — readable at a glance */}
      <rect x={AX} y="8" width={PR - AX} height={Math.max(0, y(spx.spot) - 8)} fill="rgba(239,68,68,.07)" />
      <rect x={AX} y={y(spx.spot)} width={PR - AX} height={Math.max(0, (H - 8) - y(spx.spot))} fill="rgba(34,197,94,.07)" />
      {/* opening gap: hatched band over the still-unfilled portion (prior close → retrace frontier) */}
      {hasGap && (() => {
        const gTop = Math.min(y(gapC), y(gapFrontier));
        const gBot = Math.max(y(gapC), y(gapFrontier));
        const gh = gBot - gTop;
        const cx = AX + (PR - AX) * 0.5;  // centred horizontally on the map
        const cy = (gTop + gBot) / 2;
        const wordY = (y(gapO) + y(gapC)) / 2 + 3;  // left "GAP" sits between the Open and Close labels
        return (
          <g style={{ pointerEvents: "none" }}>
            <rect x={AX} y={gTop} width={PR - AX} height={gh} fill={`url(#gapHatch-${gapId})`} />
            <text x={4} y={wordY} textAnchor="start" fontSize="9" fontWeight="700" letterSpacing="0.08em" fill="#D9A05A" fontFamily="JetBrains Mono, monospace">GAP</text>
            {gh >= 12 && (
              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#D9A05A" fontFamily="JetBrains Mono, monospace">{fmtSigned(unfilledPct, 2, "%")}</text>
            )}
          </g>
        );
      })()}
      {/* OHLC reference rails — muted + dotted so they sit under the S/R and pivot lines.
          Open/Close ride the far-left gutter, High/Low the right gutter (clear of the value numbers). */}
      {ohlcRows.map((r, i) => (
        <g key={`ohlc-${i}`} style={{ opacity: 0.5 }}>
          <line x1={AX} y1={y(r.v)} x2={PR} y2={y(r.v)} stroke="#64748B" strokeWidth="1" strokeDasharray="1 3" />
          <text
            x={r.side === "left" ? 4 : PR + 5}
            y={y(r.v) + 3.5}
            textAnchor="start"
            fontSize="9"
            fill="#94A3B8"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="700"
          >
            {r.label}
          </text>
        </g>
      ))}
      <line x1={AX} y1="8" x2={AX} y2={H - 8} stroke="#1E293B" strokeWidth="1" />
      {rows.map((r, i) => (
        <g key={i}>
          <line x1={AX} y1={y(r.v)} x2={PR} y2={y(r.v)} stroke={colorOf(r.type)} strokeWidth={r.type === "piv" ? 1.6 : 1.2} strokeDasharray={r.type === "piv" ? "" : "5 4"} opacity="0.75" />
          <text x={AX - 6} y={y(r.v) + 3.5} textAnchor="end" fontSize="10" fill={colorOf(r.type)} fontFamily="JetBrains Mono, monospace" fontWeight="600">
            {r.label}
          </text>
          <text x={VALX} y={y(r.v) - 4} textAnchor="end" fontSize="10.5" fill={colorOf(r.type)} fontFamily="JetBrains Mono, monospace">
            {fmtNum(r.v, dec)}
          </text>
        </g>
      ))}
      <g>
        <line x1={AX} y1={y(spx.spot)} x2={PR} y2={y(spx.spot)} stroke="#E2E8F0" strokeWidth="2" />
        <circle cx={AX} cy={y(spx.spot)} r="4.5" fill="#E2E8F0">
          <animate attributeName="r" values="4;5.5;4" dur="2s" repeatCount="indefinite" />
        </circle>
        <rect x={AX + 6} y={y(spx.spot) - 19} rx="4" width={spotRectW} height="17" fill="#E2E8F0" />
        <text x={spotCenterX} y={y(spx.spot) - 6.5} textAnchor="middle" fontSize="10.5" fill="#020617" fontWeight="700" fontFamily="JetBrains Mono, monospace">
          {label} {fmtNum(spx.spot, dec)}
        </text>
      </g>
    </svg>
  );
};

const SentimentDonut = ({ headlines }) => {
  const counts = { bullish: 0, neutral: 0, bearish: 0 };
  (headlines || []).forEach((h) => { if (counts[h.sentiment] != null) counts[h.sentiment]++; });
  const data = [
    { name: "Bullish", value: counts.bullish, c: C.bull },
    { name: "Neutral", value: counts.neutral, c: "#3A4456" },
    { name: "Bearish", value: counts.bearish, c: C.bear },
  ].filter((d) => d.value > 0);
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const net = counts.bullish - counts.bearish;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 128, height: 128, flex: "none" }}>
        <svg viewBox="0 0 128 128" style={{ width: 128, height: 128, transform: "rotate(-90deg)" }}>
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1E293B" strokeWidth="16" />
          {(data.length ? data : [{ value: 1, c: "#1E293B" }]).map((d, i) => {
            const length = (d.value / total) * circumference;
            const dash = `${Math.max(0, length - 5)} ${circumference}`;
            const node = (
              <circle
                key={i}
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={d.c}
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return node;
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          <div style={{ textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 19, fontWeight: 700, color: net > 0 ? C.bull : net < 0 ? C.bear : C.muted }}>{net > 0 ? "+" : ""}{net}</div>
            <div className="mono" style={{ fontSize: 8.5, color: C.muted, letterSpacing: ".1em" }}>NET TONE</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[["Bullish", counts.bullish, C.bull], ["Neutral", counts.neutral, C.muted], ["Bearish", counts.bearish, C.bear]].map(([k, v, c]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            <span style={{ color: C.muted, width: 56 }}>{k}</span>
            <span className="mono" style={{ fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Interactive pillar-weight radar. When onChange(newWeights) is supplied, the vertices become drag
// handles — dragging a point sets that pillar's weight and the rest rebalance equally. Each gesture
// redistributes from a snapshot taken at drag-start, so the move is stable and fully reversible.
const FactorRadarChart = ({ weights, onChange, scores = null }) => {
  const data = FACTORS.map((f) => ({
    key: f.key, k: f.label.split(" ")[0], v: Number(weights[f.key]) || 0,
    score: scores && Number.isFinite(Number(scores[f.key])) ? Number(scores[f.key]) : null,
  }));
  const n = data.length;
  // Zoom the radial scale to the current weights (rounded up to a clean bound, with headroom) so a
  // balanced ~20% spread fills most of the chart instead of hugging the center, while still letting a
  // pillar grow toward the per-pillar cap. Drag values are always clamped to the real cap, not this.
  const evenSplit = WEIGHT_TOTAL / n;
  const max = clamp(Math.ceil((Math.max(...data.map((d) => d.v), evenSplit) * 1.3) / 5) * 5, Math.ceil(evenSplit * 1.4), MAX_PILLAR);
  const cx = 150;
  const cy = 120;
  const outer = 80;
  const svgRef = useRef(null);
  const baseRef = useRef(null); // weights snapshot captured at drag-start
  const [drag, setDrag] = useState(null);
  const interactive = typeof onChange === "function";

  const axis = (i) => {
    const a = (-90 + i * (360 / n)) * Math.PI / 180;
    return [Math.cos(a), Math.sin(a)];
  };
  const point = (i, value) => {
    const [ux, uy] = axis(i);
    const r = outer * (value / max);
    return [cx + ux * r, cy + uy * r];
  };
  const polygon = (value) => data.map((_, i) => point(i, value).join(",")).join(" ");
  const valuePolygon = data.map((d, i) => point(i, d.v).join(",")).join(" ");

  const valueFromEvent = (i, e) => {
    const svg = svgRef.current;
    const ctm = svg && svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const loc = pt.matrixTransform(ctm.inverse());
    const [ux, uy] = axis(i);
    const proj = (loc.x - cx) * ux + (loc.y - cy) * uy; // distance along this pillar's spoke
    return clamp(Math.round((proj / outer) * max), 0, MAX_PILLAR);
  };
  const onMove = (e) => {
    if (drag == null || !interactive || !baseRef.current) return;
    const v = valueFromEvent(drag, e);
    if (v != null) onChange(redistributeWeights(baseRef.current, data[drag].key, v));
  };
  const startDrag = (i) => (e) => {
    if (!interactive) return;
    e.preventDefault();
    baseRef.current = { ...weights };
    svgRef.current?.setPointerCapture?.(e.pointerId);
    setDrag(i);
  };
  const endDrag = () => { baseRef.current = null; setDrag(null); };

  return (
    <div style={{ width: "100%", height: 248, userSelect: "none", touchAction: "none" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 300 248"
        style={{ width: "100%", height: "100%", display: "block" }}
        onPointerMove={onMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} points={polygon(max * f)} fill="none" stroke="#243140" strokeWidth="1" />
        ))}
        {/* even-split anchor: where every pillar would sit if weighted equally — vertices outside this
            ring are overweight, inside are underweight, giving the shape a fixed reference to read against */}
        <polygon points={polygon(evenSplit)} fill="none" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
        <text x={cx} y={cy - outer * (evenSplit / max) - 3} textAnchor="middle" fill="#3B82F6" fontSize="7.5" opacity="0.7" fontFamily="JetBrains Mono, monospace">even {fmtPct(evenSplit)}%</text>
        {data.map((d, i) => {
          const [x1, y1] = point(i, 0);
          const [x2, y2] = point(i, max);
          const [lx, ly] = point(i, max * 1.36);
          return (
            <g key={d.key}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#243140" strokeWidth="1" />
              <text x={lx} y={ly - 5} textAnchor="middle" dominantBaseline="middle" fontSize="10.5" fontFamily="JetBrains Mono, monospace">
                {d.score != null && <title>{`Current ${d.k} read: ${d.score > 0 ? "+" : ""}${d.score} (unweighted, -100 to 100) — the weight below is how much it counts toward the call`}</title>}
                <tspan fill="#94A3B8">{d.k}</tspan>
                {d.score != null && (
                  <tspan fill={d.score > 3 ? C.bull : d.score < -3 ? C.bear : C.brass} fontWeight="700"> {d.score > 0 ? "+" : ""}{d.score}</tspan>
                )}
              </text>
              <text x={lx} y={ly + 8} textAnchor="middle" dominantBaseline="middle" fill="#3B82F6" fontSize="10.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">{fmtPct(d.v)}%</text>
            </g>
          );
        })}
        <polygon points={valuePolygon} fill="rgba(59,130,246,.24)" stroke="#3B82F6" strokeWidth="2" />
        {data.map((d, i) => {
          const [x, y] = point(i, d.v);
          return (
            <g key={d.key}>
              {interactive && (
                <circle cx={x} cy={y} r="18" fill="transparent" style={{ cursor: drag === i ? "grabbing" : "grab" }} onPointerDown={startDrag(i)} />
              )}
              <circle cx={x} cy={y} r={drag === i ? 7 : 5} fill="#3B82F6" stroke="#020617" strokeWidth="1.5" style={{ pointerEvents: "none" }} />
              {drag === i && (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={x - 17} y={y - 26} rx="3" width="34" height="16" fill="#3B82F6" />
                  <text x={x} y={y - 14.5} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">{fmtPct(d.v)}%</text>
                </g>
              )}
            </g>
          );
        })}
        {/* center hub — click to reset every pillar back to an even split */}
        {interactive && (
          <g style={{ cursor: "pointer" }} onPointerDown={(e) => { e.preventDefault(); onChange({ ...DEFAULT_WEIGHTS }); }}>
            <title>Reset to an even split</title>
            <circle cx={cx} cy={cy} r="14" fill="transparent" />
            <circle cx={cx} cy={cy} r="3.5" fill="#475569" stroke="#020617" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Level maps: three cards defaulted to the major index ETFs, each retargetable to ANY watchlist
// instrument via the header dropdown. Levels come from the points feed when the symbol is part of
// the index complex, otherwise from the stocklevels endpoint (cached briefly client-side).
const LEVEL_MAP_DEFAULTS = ["SPY", "QQQ", "DIA"];
// Dropdown sub-groups for the level-map ticker picker. Sets referenced lazily so definition order
// relative to SNAP_*_SET doesn't matter. Anything unmatched falls into a trailing "Other" group.
const LM_INDEX_SET = new Set(["SPX", "NDX", "DJI", "RUT", "VIX"]);
const LM_PICKER_GROUPS = [
  ["ETFs", (s) => SNAP_ETF_SET.has(s)],
  ["Futures", (s) => SNAP_FUTURES_SET.has(s)],
  ["Mag 7", (s) => THESIS_STOCK_SET.has(s)],
  ["Indices", (s) => LM_INDEX_SET.has(s)],
];
const _lmLevelsCache = new Map();
const fetchLevelsCached = async (symbol, period = "d") => {
  const key = `${symbol}:${period}`;
  const hit = _lmLevelsCache.get(key);
  if (hit && Date.now() - hit.ts < 2 * 60 * 1000) return hit.data;
  const data = await callDesk("stocklevels", "", { symbol, period }).catch(() => null);
  _lmLevelsCache.set(key, { ts: Date.now(), data });
  return data;
};
const _lmHistCache = new Map();
const fetchHistoryCached = async (symbol) => {
  const hit = _lmHistCache.get(symbol);
  if (hit && Date.now() - hit.ts < 10 * 60 * 1000) return hit.data;
  const data = await callDesk("history", "", { symbol }).catch(() => null);
  _lmHistCache.set(symbol, { ts: Date.now(), data });
  return data;
};

// Pull the active instrument's session OHLC off its market ticker so the level map can draw
// O/H/L/C rails. C uses the prior close so it stays distinct from the live spot line.
const ohlcForSymbol = (tickers, symbol) => {
  const t = (tickers || []).find((x) => x.symbol === symbol);
  if (!t) return null;
  const num = (v) => (typeof v === "number" && !isNaN(v) ? v : null);
  return { o: num(t.dayOpen), h: num(t.dayHigh), l: num(t.dayLow), c: num(t.previousClose) };
};

const lmDecimals = (symbol, tickers) => {
  if (symbol === "US10Y" || symbol === "US02Y") return 3;
  const px = Number((tickers || []).find((x) => x.symbol === symbol)?.price);
  return ETF_INSTRUMENTS.has(symbol) || (Number.isFinite(px) && Math.abs(px) < 1000) ? 2 : 0;
};

// Seven daily candlesticks for the level-map header (today's partial candle is the last one). Rendered
// in HTML with the exact same wick/body classes as the Market Pulse ticker-card candle, so the
// gradient bodies, inset borders, glow and bull/bear/flat tones match one-for-one.
const CandleStrip = ({ candles, decimals = 2, live = false }) => {
  if (!candles?.length) return null;
  const H = 72, n = candles.length, pad = 5;
  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const yFor = (v) => pad + ((max - v) / (max - min || 1)) * (H - 2 * pad);
  return (
    <div className="lm-candles" style={{ height: `${H}px` }} aria-label={`Last ${n} daily candles`}>
      {candles.map((c, i) => {
        const isLast = i === n - 1;
        const up = c.c >= c.o;
        const flat = Math.abs(c.c - c.o) < Math.max((c.h - c.l) * 0.05, Number.EPSILON);
        const toneClass = flat ? "flat" : up ? "bull" : "bear";
        const glow = flat ? "#3B82F6" : up ? C.bull : C.bear;
        const wickTop = yFor(c.h);
        const wickHeight = Math.max(yFor(c.l) - wickTop, 1);
        const bodyTop = yFor(Math.max(c.o, c.c));
        const bodyHeight = Math.max(yFor(Math.min(c.o, c.c)) - bodyTop, 3);
        const dateLabel = new Date(c.t * 1000).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
        return (
          <div
            key={c.t}
            className={`lm-candle${isLast && live ? " lm-candle-live" : ""}`}
            style={isLast && live ? { "--candle-glow": glow } : undefined}
            title={`${dateLabel} — O ${fmtNum(c.o, decimals)} H ${fmtNum(c.h, decimals)} L ${fmtNum(c.l, decimals)} C ${fmtNum(c.c, decimals)}`}
          >
            <div className="candle-wick" style={{ top: `${wickTop}px`, height: `${wickHeight}px` }} />
            <div className={`candle-body ${toneClass}`} style={{ top: `${bodyTop}px`, height: `${bodyHeight}px` }} />
          </div>
        );
      })}
    </div>
  );
};

// Header candles for the active instrument: 5-day history strip, falling back to the single-session
// MiniCandle while history loads (or if the history fetch fails).
const LevelMapCandles = ({ symbol, tickers }) => {
  const [hist, setHist] = useState(null);
  useEffect(() => {
    let dead = false;
    setHist(null);
    fetchHistoryCached(symbol).then((h) => { if (!dead) setHist(h); });
    return () => { dead = true; };
  }, [symbol]);
  const dec = lmDecimals(symbol, tickers);
  if (hist?.candles?.length) return <CandleStrip candles={hist.candles} decimals={dec} live={symbolMarketOpen(symbol)} />;
  const t = (tickers || []).find((x) => x.symbol === symbol);
  if (!t) return null;
  return (
    <MiniCandle low={t.dayLow} high={t.dayHigh} price={t.price} dayOpen={t.dayOpen} previousClose={t.previousClose} decimals={dec} live={symbolMarketOpen(symbol)} />
  );
};

const LevelMapCard = ({ defaultSymbol, storeKey, points, tickers }) => {
  // Persisted per card so the chosen ticker + daily/weekly timeframe survive a refresh.
  const [pref, setPref] = usePersistentState(`overwatch:lm:${storeKey || defaultSymbol}`, { sym: defaultSymbol, period: "d" });
  const active = pref.sym || defaultSymbol;
  const period = pref.period === "w" ? "w" : "d"; // d = daily (session), w = weekly (prior week)
  const setActive = (s) => setPref((p) => ({ ...p, sym: s }));
  const setPeriod = (p2) => setPref((p) => ({ ...p, period: p2 }));
  const symbols = (tickers || []).map((t) => t.symbol);
  // Weekly always comes from the levels endpoint (the points feed only carries daily index levels).
  const pointsData = period === "d" ? points?.[active.toLowerCase()] : null;
  const [fetched, setFetched] = useState(null);
  useEffect(() => {
    if (pointsData) return;
    let dead = false;
    const key = `${active}:${period}`;
    fetchLevelsCached(active, period).then((lv) => { if (!dead) setFetched({ key, levels: lv }); });
    return () => { dead = true; };
  }, [active, period, pointsData]);
  const fetchedData = fetched?.key === `${active}:${period}` ? fetched.levels : null;
  const data = pointsData || fetchedData;
  // Draw the spot line off the live market ticker (same source as the header candles and Market
  // Snapshot) rather than the separately-fetched levels payload, so the price doesn't diverge
  // panel-to-panel. The R/S/pivot levels still come from the points/levels feed.
  const liveT = (tickers || []).find((x) => x.symbol === active);
  const livePrice = liveT && typeof liveT.price === "number" && !isNaN(liveT.price) ? liveT.price : null;
  const spxData = data && livePrice != null ? { ...data, spot: livePrice } : data;
  // Weekly OHLC rails come from the fetched weekly bar; daily uses the live session ticker.
  const ohlc = period === "w" ? (fetchedData?.ohlc || null) : ohlcForSymbol(tickers, active);
  return (
    <Card
      icon={Crosshair}
      title={`${active} level map`}
      sub={`${liveT?.name || ""}${period === "w" ? " · weekly" : ""}`.replace(/^ · /, "")}
      tools={
        <span className="lm-tools">
          <LevelMapCandles symbol={active} tickers={tickers} />
          {liveT && !liveT._stale && Number.isFinite(Number(liveT.changePct)) && (
            <span className="lm-chg" title={`${active} today: ${fmtSigned(liveT.changePct, 2, "%")} · ${fmtSigned(liveT.change, lmDecimals(active, tickers))} pts`}>
              <b style={{ color: chgColor(liveT.changePct) }}>{fmtSigned(liveT.changePct, 2, "%")}</b>
              <small style={{ color: chgColor(liveT.change) }}>{fmtSigned(liveT.change, lmDecimals(active, tickers))}</small>
            </span>
          )}
        </span>
      }
    >
      <div className="lm-map-wrap">
        <LevelsLadder spx={spxData} label={active} decimals={lmDecimals(active, tickers)} ohlc={ohlc} />
      </div>
      {/* Ticker picker + timeframe toggle live in a footer rather than the header, so they never
          compete with the candle strip + change badge for width when a split-view pane compacts the
          card — the header layout stays put regardless of pane width. */}
      <div className="lm-controls">
        <select className="bd-in lm-select" value={active} onChange={(e) => setActive(e.target.value)} title="Map any instrument — grouped by type">
          {!symbols.includes(active) && <option value={active}>{active}</option>}
          {LM_PICKER_GROUPS.map(([label, test]) => {
            const group = symbols.filter(test);
            return group.length ? <optgroup key={label} label={label}>{group.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup> : null;
          })}
          {(() => {
            const rest = symbols.filter((s) => !LM_PICKER_GROUPS.some(([, test]) => test(s)));
            return rest.length ? <optgroup label="Other">{rest.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup> : null;
          })()}
        </select>
        <div className="lm-period" role="group" aria-label="Level timeframe">
          {["d", "w"].map((p) => (
            <button key={p} className={period === p ? "on" : ""} onClick={() => setPeriod(p)} title={p === "d" ? "Daily levels" : "Weekly levels"}>{p.toUpperCase()}</button>
          ))}
        </div>
      </div>
    </Card>
  );
};

/* ================================================================
   TAB — MARKET PULSE
   ================================================================ */

// Market snapshot grid filters. "all" shows the visible board; "mag7" reveals the Mag 7 even though
// they're hidden by default. Sets are matched against ticker symbols.
// Select Sector SPDR ETFs — the live sector-focus complex (ordered by GICS weight). Live-quoted via
// Finnhub, hidden from the board by default, and surfaced in the Sector Focus panel on Market Pulse.
const SECTOR_ETFS = [
  { symbol: "XLK", sector: "Technology" },
  { symbol: "XLF", sector: "Financials" },
  { symbol: "XLV", sector: "Health Care" },
  { symbol: "XLY", sector: "Consumer Discretionary" },
  { symbol: "XLC", sector: "Communication Svcs" },
  { symbol: "XLI", sector: "Industrials" },
  { symbol: "XLP", sector: "Consumer Staples" },
  { symbol: "XLE", sector: "Energy" },
  { symbol: "XLU", sector: "Utilities" },
  { symbol: "XLRE", sector: "Real Estate" },
  { symbol: "XLB", sector: "Materials" },
];
const SECTOR_ETF_META = new Map(SECTOR_ETFS.map((s) => [s.symbol, s.sector]));

const SNAP_FUTURES_SET = new Set(["ES", "NQ", "YM", "RTY"]);
const SNAP_ETF_SET = new Set(["SPY", "QQQ", "DIA", "IWM", "SMH", "HYG", "TLT", "USO", ...SECTOR_ETFS.map((s) => s.symbol)]);
const SNAP_INDEX_SET = new Set(["SPX", "NDX", "DJI", "RUT"]);
const SNAP_SECTOR_SET = new Set(SECTOR_ETFS.map((s) => s.symbol));
const SNAP_FILTER_OPTIONS = [
  { key: "all", label: "All markets", short: "Markets" },
  { key: "live", label: "Live now", short: "Live" },
  { key: "indexes", label: "Indexes", short: "Indexes" },
  { key: "futures", label: "Futures", short: "Futures" },
  { key: "etfs", label: "ETFs", short: "ETFs" },
  { key: "sectors", label: "Sectors", short: "Sectors" },
  { key: "mag7", label: "Mag 7", short: "Mag 7" },
];
const SNAP_FILTER_TEST = {
  live: (t) => symbolMarketOpen(t.symbol),
  indexes: (t) => SNAP_INDEX_SET.has(t.symbol),
  futures: (t) => SNAP_FUTURES_SET.has(t.symbol),
  etfs: (t) => SNAP_ETF_SET.has(t.symbol),
  sectors: (t) => SNAP_SECTOR_SET.has(t.symbol),
  mag7: (t) => THESIS_STOCK_SET.has(t.symbol),
};
// Groups whose members are hidden from the default board (off:true), so focusing them pulls from the
// full fetched universe rather than the visible board.
const SNAP_FROM_HIDDEN = new Set(["sectors", "mag7"]);
// Instrument-type groups the user can hide from the "All markets" view (the dynamic "live" filter and
// "all" itself aren't hideable).
const SNAP_HIDEABLE = ["indexes", "futures", "etfs", "sectors", "mag7"];

// "Markets" dropdown that replaces the old Live-markets toggle in the snapshot header. Each row can
// be tapped to focus that group, or (for instrument-type groups) toggled with the eye button to hide
// that group from the default "All markets" view.
const SnapMarketFilter = ({ value, onChange, anyMarketOpen, hidden = [], onToggleHide }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const current = SNAP_FILTER_OPTIONS.find((o) => o.key === value) || SNAP_FILTER_OPTIONS[0];
  const btnLabel = value === "all" && hidden.length ? `${current.short} −${hidden.length}` : current.short;
  // The menu is portaled to <body> so the snapshot card's overflow:hidden can't clip it; position it
  // under the button and keep it there on scroll/resize. Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
    };
    place();
    const onDoc = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);
  return (
    <span className="snap-filter" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        className={`fchip snap-filter-btn${value !== "all" || hidden.length ? " on" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Focus a market group, or hide groups from the All markets view"
      >
        {value === "live" && <span className={`snap-live-dot${anyMarketOpen ? " on" : ""}`} />}
        {btnLabel}
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} className="snap-filter-menu" style={{ top: pos.top, right: pos.right }} role="listbox" onClick={(e) => e.stopPropagation()}>
          {SNAP_FILTER_OPTIONS.map((o) => {
            const isHidden = hidden.includes(o.key);
            const hideable = onToggleHide && SNAP_HIDEABLE.includes(o.key);
            return (
              <div key={o.key} className={`snap-filter-item${o.key === value ? " on" : ""}${isHidden ? " hidden-group" : ""}`}>
                <button
                  role="option"
                  aria-selected={o.key === value}
                  className="sfi-main"
                  onClick={() => { onChange(o.key); setOpen(false); }}
                >
                  {o.key === "live" && <span className={`snap-live-dot${anyMarketOpen ? " on" : ""}`} />}
                  <span>{o.label}</span>
                  {o.key === value && <Check size={13} className="sfi-check" />}
                </button>
                {hideable && (
                  <button
                    className="sfi-hide"
                    onClick={(e) => { e.stopPropagation(); onToggleHide(o.key); }}
                    aria-pressed={isHidden}
                    title={isHidden ? `Show ${o.label} in All markets` : `Hide ${o.label} from All markets`}
                  >
                    {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </span>
  );
};

const PulseTab = ({ market, points, pointsState, news, vixHint, hiddenSymbols, watchlist, setWatchlist, onRefresh, onGoThesis, morningDiff = null, onDismissDiff }) => {
  const { status, data, error, at } = market;
  // Section-collapse state. These hooks must run before any early return so the hook order stays
  // stable across the idle/loading/error → ready transitions (Rules of Hooks).
  const [tickersOpen, setTickersOpen] = usePersistentState("overwatch:sec:snapshot", false); // Market snapshot — collapsed by default
  const [marketFilter, setMarketFilter] = usePersistentState("overwatch:snap:filter", "all"); // snapshot "Markets" dropdown (expanded only)
  const [hiddenGroups, setHiddenGroups] = usePersistentState("overwatch:snap:hidden", []); // groups excluded from the "All markets" view
  const [showStrip, setShowStrip] = usePersistentState("overwatch:snap:strip", true); // 7-session candle strip on each card
  const toggleHiddenGroup = useCallback((key) => setHiddenGroups((prev) => {
    const set = new Set(Array.isArray(prev) ? prev : []);
    if (set.has(key)) set.delete(key); else set.add(key);
    return [...set].filter((k) => SNAP_HIDEABLE.includes(k));
  }), [setHiddenGroups]);
  const [levelsOpen, setLevelsOpen] = usePersistentState("overwatch:sec:levels", true);    // Level maps — open by default (core read)

  // Hidden watchlist symbols (e.g. the Mag 7, off by default) plus any Thesis-Lab-only single stock
  // are fetched for pricing but kept off the Pulse grid until toggled on in Settings. Memoized so the
  // filter/sort and the session synthesis only recompute when their inputs actually change.
  const hideSet = hiddenSymbols || THESIS_STOCK_SET;
  const tickers = useMemo(() => (data?.tickers || []).filter((t) => !hideSet.has(t.symbol)), [data, hideSet]);
  // The board follows the watchlist order (drag-to-reorder in Settings), reflected instantly rather
  // than waiting for the next sync. Unknown symbols fall to the end, preserving their fetched order.
  const orderIndex = useMemo(() => new Map((watchlist || []).map((w, i) => [w.symbol, i])), [watchlist]);
  const orderedTickers = useMemo(() => {
    if (!orderIndex.size) return orderAssetCards(tickers);
    return [...tickers].sort((a, b) => (orderIndex.get(a.symbol) ?? 1e6) - (orderIndex.get(b.symbol) ?? 1e6));
  }, [tickers, orderIndex]);
  // Level maps can target the full fetched universe (incl. the Mag 7 that are hidden from the grid),
  // grouped in the picker by type.
  const levelTickers = useMemo(() => orderAssetCards(data?.tickers || []), [data]);
  // Any instrument in the watchlist currently trading? Drives the live pulse on the snapshot icon.
  const anyMarketOpen = useMemo(() => orderedTickers.some((t) => symbolMarketOpen(t.symbol)), [orderedTickers]);
  const session = useMemo(() => buildSessionRead({ market: data, points, news }), [data, points, news]);

  // The snapshot grid after the "Markets" filter. Focusing a group that lives in the hidden universe
  // (Sectors, Mag 7) pulls from the full fetched set so it's visible even though those tickers are off
  // the default board; the "All markets" view drops any groups the user has toggled hidden.
  const displayTickers = useMemo(() => {
    if (marketFilter !== "all") {
      const test = SNAP_FILTER_TEST[marketFilter];
      if (!test) return orderedTickers;
      if (SNAP_FROM_HIDDEN.has(marketFilter)) return orderAssetCards((data?.tickers || []).filter(test));
      return orderedTickers.filter(test);
    }
    if (!hiddenGroups.length) return orderedTickers;
    const tests = hiddenGroups.map((g) => SNAP_FILTER_TEST[g]).filter(Boolean);
    return orderedTickers.filter((t) => !tests.some((test) => test(t)));
  }, [marketFilter, hiddenGroups, orderedTickers, data]);

  // Drag-to-reorder the snapshot cards with live reshuffle. Only the default board ("all" filter) is
  // reorderable — the filtered lenses (Live/Mag7/Sectors) are a view, not the board. Committing
  // rewrites the shared watchlist order (the single source of truth used everywhere), so the new
  // arrangement persists and syncs, and only the shown cards move — hidden/off names keep their slots.
  const canReorder = marketFilter === "all" && typeof setWatchlist === "function";
  const [dragSym, setDragSym] = useState(null);
  const dragSymRef = useRef(null); // mirror of dragSym readable synchronously inside drag handlers
  const [liveOrder, setLiveOrder] = useState(null); // symbols in their live (mid-drag) order
  // Clear any stale drag order if the visible set changes out from under a drag (e.g. a sync lands).
  const shownTickers = useMemo(() => {
    if (!liveOrder) return displayTickers;
    const bySym = new Map(displayTickers.map((t) => [t.symbol, t]));
    const seq = liveOrder.map((s) => bySym.get(s)).filter(Boolean);
    displayTickers.forEach((t) => { if (!liveOrder.includes(t.symbol)) seq.push(t); });
    return seq;
  }, [liveOrder, displayTickers]);
  const onCardDragStart = (sym) => (e) => {
    if (!canReorder) return;
    dragSymRef.current = sym;
    setDragSym(sym);
    setLiveOrder(displayTickers.map((t) => t.symbol));
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", sym); } catch { /* some browsers require a payload */ }
  };
  const reshuffleTo = (sym) => {
    const drag = dragSymRef.current;
    if (!canReorder || !drag || sym === drag) return;
    setLiveOrder((prev) => {
      const cur = prev || displayTickers.map((t) => t.symbol);
      const from = cur.indexOf(drag);
      const to = cur.indexOf(sym);
      if (from < 0 || to < 0 || from === to) return cur;
      const next = cur.slice();
      next.splice(from, 1);
      next.splice(to, 0, drag);
      return next;
    });
  };
  const commitReorder = () => {
    if (canReorder && liveOrder && dragSymRef.current) {
      const shown = new Set(liveOrder);
      setWatchlist((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const idxBySym = new Map(list.map((w, i) => [w.symbol, i]));
        const newSeq = liveOrder.filter((s) => idxBySym.has(s)); // shown symbols, new order
        const slots = []; // watchlist positions currently occupied by shown symbols
        list.forEach((w, i) => { if (shown.has(w.symbol)) slots.push(i); });
        if (slots.length !== newSeq.length) return list; // guard: only permute like-for-like
        const next = list.slice();
        slots.forEach((slot, k) => { next[slot] = list[idxBySym.get(newSeq[k])]; });
        return next;
      });
    }
    dragSymRef.current = null;
    setDragSym(null);
    setLiveOrder(null);
  };

  if (status === "idle")
    return (
      <EmptyState
        icon={Activity}
        title="No live data on the desk yet"
        body="Pull fresh prices, sector performance and session tone straight from the live web. One sync arms the whole desk."
        action={<button className="btn btn-brass" onClick={onRefresh}><Zap size={15} /> Sync live data</button>}
      />
    );
  if (status === "loading" && !data)
    return (
      <div className="grid g-pulse">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className="card" key={i}><LoadingBlock lines={2} msg={i === 0 ? "Searching live quotes…" : null} /></div>
        ))}
      </div>
    );
  if (status === "error" && !data) return <ErrBlock msg={error} onRetry={onRefresh} />;

  const vix = tickers.find((t) => t.symbol === "VIX");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {morningDiff && (
        <div className="card morning-diff">
          <div className="morning-diff-head">
            <Sunrise size={14} />
            <span>Since {morningDiff.from}</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={onDismissDiff} title="Dismiss"><X size={13} /></button>
          </div>
          <div className="morning-diff-lines">
            {morningDiff.lines.map((l, i) => (
              <span className={`morning-diff-line ${l.tone}`} key={i}>{l.text}</span>
            ))}
          </div>
        </div>
      )}
      <Card
        icon={Activity}
        title="Session read"
        sub="Plain-English market brief"
        tools={<Freshness at={at} />}
      >
        <div className="session-summary">{session.summary}</div>
      </Card>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className={`collapsible-header${tickersOpen ? " snap-open" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => setTickersOpen((o) => !o)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTickersOpen((o) => !o); } }}
          aria-expanded={tickersOpen}
        >
          <Activity size={14} className={`ic${anyMarketOpen ? " ic-live" : ""}`} />
          <span>Market snapshot</span>
          <small className="snap-count" style={{ marginLeft: 6, fontWeight: 400, opacity: 0.6 }}>
            {tickersOpen && (marketFilter !== "all" || hiddenGroups.length) ? `${displayTickers.length} of ${orderedTickers.length}` : `${orderedTickers.length} instruments`}
          </small>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {tickersOpen && (
              <span className="snap-asof" onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center" }}>
                <SnapFreshness tickers={displayTickers} />
              </span>
            )}
            {tickersOpen && (
              <button
                className={`snap-strip-toggle${showStrip ? " on" : ""}`}
                onClick={(e) => { e.stopPropagation(); setShowStrip((s) => !s); }}
                title={showStrip ? "Hide the 7-session candle strip on each card" : "Show the 7-session candle strip on each card"}
                aria-pressed={showStrip}
              >
                <CandlestickChart size={13} /> 7d
              </button>
            )}
            {tickersOpen && (
              <SnapMarketFilter value={marketFilter} onChange={setMarketFilter} anyMarketOpen={anyMarketOpen} hidden={hiddenGroups} onToggleHide={toggleHiddenGroup} />
            )}
            {tickersOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
        {tickersOpen && (() => {
          return (
          <div style={{ padding: "12px 12px 12px" }}>
            {displayTickers.length ? (
            <div className="grid g-pulse">
            {shownTickers.map((t) => (
              <div
                className={`card tk${canReorder ? " tk-drag" : ""}${dragSym === t.symbol ? " tk-dragging" : ""}`}
                key={t.symbol}
                style={t._stale ? { opacity: 0.5 } : undefined}
                draggable={canReorder || undefined}
                title={canReorder ? "Drag to reorder" : undefined}
                onDragStart={canReorder ? onCardDragStart(t.symbol) : undefined}
                onDragEnter={canReorder ? () => reshuffleTo(t.symbol) : undefined}
                onDragOver={canReorder ? (e) => { if (dragSymRef.current) e.preventDefault(); } : undefined}
                onDrop={canReorder ? (e) => { e.preventDefault(); commitReorder(); } : undefined}
                onDragEnd={canReorder ? commitReorder : undefined}
              >
                <div className="tk-glow" style={{ background: `linear-gradient(90deg,transparent,${chgColor(t.changePct)},transparent)`, opacity: 0.55 }} />
                <div className="tk-top">
                  <span className="tk-sym">{t.symbol}</span>
                  <span className="tk-top-right">
                    {!t._stale && <FreshTag delayed={t.delayed} open={symbolMarketOpen(t.symbol)} delaySec={t.delaySec} />}
                    {t._stale
                      ? <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: ".06em" }}>NO DATA</span>
                      : t.changePct != null && (() => {
                          const up = t.changePct >= 0;
                          const col = up ? C.bull : C.bear;
                          // Pulse whenever the market is trading — delayed or not. The LIVE/delay
                          // chip communicates feed freshness; this glow just means "open now".
                          const live = symbolMarketOpen(t.symbol);
                          const DirIcon = up ? TrendingUp : TrendingDown;
                          return (
                            <span
                              className={`tk-dir${live ? " tk-dir-live" : ""}`}
                              style={live ? { "--dir-glow": col } : undefined}
                              title={live ? (t.delayed ? "Market open — quotes ~15 min delayed" : "Market open — real-time") : undefined}
                            >
                              <DirIcon size={14} color={col} />
                            </span>
                          );
                        })()}
                  </span>
                </div>
                {showStrip && !t._stale && <MiniStrip candles={t.hist} live={symbolMarketOpen(t.symbol)} />}
                <div className="tk-body">
                  <div className="tk-left">
                    <div className="tk-name" title={t.name}>{t.name}</div>
                    <div className="tk-price">{t._stale ? "—" : fmtNum(t.price, t.symbol === "US10Y" ? 3 : 2)}</div>
                    <div className="tk-chg">
                      <span style={{ color: chgColor(t.change) }}>{t._stale ? "—" : fmtSigned(t.change)}</span>
                      <span style={{ color: chgColor(t.changePct) }}>{t._stale ? "—" : fmtSigned(t.changePct, 2, "%")}</span>
                    </div>
                  </div>
                  {!t._stale && <DayCandle low={t.dayLow} high={t.dayHigh} price={t.price} dayOpen={t.dayOpen} previousClose={t.previousClose} decimals={t.symbol === "US10Y" ? 3 : (t.symbol === "DXY" || SNAP_ETF_SET.has(t.symbol) || Math.abs(Number(t.price)) < 100) ? 2 : 0} />}
                </div>
              </div>
            ))}
            </div>
            ) : (
              <div className="snap-empty">
                {marketFilter === "live"
                  ? "No markets are trading right now. Index futures and crypto run nearly around the clock; cash indexes, ETFs and single stocks reopen at the next session."
                  : marketFilter === "mag7"
                    ? "No Mag 7 prices in the last sync — hit Sync to pull them in."
                    : marketFilter === "sectors"
                      ? "No sector ETF prices in the last sync — hit Sync to pull them in."
                      : marketFilter === "all"
                        ? "Every market group is hidden — un-hide a group from the Markets filter to see the board."
                        : "Nothing on the board matches this filter."}
              </div>
            )}
          </div>
          );
        })()}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button
          className="collapsible-header"
          onClick={() => setLevelsOpen((o) => !o)}
          aria-expanded={levelsOpen}
        >
          <Crosshair size={14} className="ic" />
          <span>Level maps</span>
          <small style={{ marginLeft: 6, fontWeight: 400, opacity: 0.6 }}>pivots · S/R · OHLC</small>
          <span style={{ marginLeft: "auto" }}>
            {levelsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>
        {levelsOpen && (
          <div style={{ padding: "0 12px 12px" }}>
            <div className="grid g-data pulse-levels-desktop">
              {LEVEL_MAP_DEFAULTS.map((sym, i) => (
                <LevelMapCard key={sym} defaultSymbol={sym} storeKey={`d${i}`} points={points} tickers={levelTickers} />
              ))}
            </div>
            <div className="pulse-levels-mobile">
              <LevelMapCard defaultSymbol="SPY" storeKey="m" points={points} tickers={levelTickers} />
            </div>
          </div>
        )}
      </div>
      <div className="grid g-market-read">
        <Card icon={Newspaper} title="Wire sentiment" sub="Net tone across pulled headlines">
          <SentimentDonut headlines={news?.headlines || []} />
          {news?.mood && (
            <div style={{ marginTop: 13, paddingTop: 13, borderTop: "1px dashed var(--line)", fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
              <span className="chip b-brass" style={{ marginRight: 8 }}>MOOD</span>{news.mood}
            </div>
          )}
        </Card>
        <Card icon={Shield} title="Volatility regime" sub="VIX zone + structure">
          <VixGauge value={vix?.price ?? null} structure={vixHint} />
        </Card>
        <Card icon={Sparkles} title="Fear & Greed Index" sub="CNN market sentiment">
          <FearGreedGauge data={data?.fearGreed} />
        </Card>
      </div>
      <Card icon={Gauge} title="Market breadth" sub="Participation & live SPDR sector performance">
        <MarketBreadth data={points} tickers={data?.tickers || []} />
      </Card>
      <Card icon={Orbit} title="Sector rotation" sub="Where money is rotating — weekly relative strength vs SPY (RRG)">
        <SectorRotation />
      </Card>
      <DataPointSection points={pointsState} onRefresh={onRefresh} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn" onClick={onGoThesis}>Build today's thesis <ArrowRight size={14} /></button>
      </div>
    </div>
  );
};

/* ================================================================
   TAB — NEWS INTEL
   ================================================================ */

const CAT_TONE = { macro: "b-info", fed: "b-brass", earnings: "b-bull", geopolitical: "b-bear", technical: "", flows: "b-info", volatility: "b-brass" };

const newsKey = (h) => h?.url || h?.title || "";

// Compact mobile stand-in for the News tab's category/sentiment/sort chip rows. On phones those two
// rows wrap to 3-4 lines of chips and read as cluttered, so below the 760px breakpoint they're
// replaced with a single "Filters" trigger that opens all three groups in one portaled panel — same
// dropdown pattern as SnapMarketFilter above. Desktop keeps the original always-visible chip rows.
const NewsFilterMenu = ({ cats, cat, setCat, tone, setTone, sortBy, setSortBy, sortDir, setSortDir }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const activeCount = (cat !== "all" ? 1 : 0) + (tone !== "all" ? 1 : 0) + (sortBy !== "time" || sortDir !== "desc" ? 1 : 0);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const menuW = Math.min(300, window.innerWidth - 24);
      setPos({ top: r.bottom + 6, left: Math.min(r.left, window.innerWidth - menuW - 12) });
    };
    place();
    const onDoc = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);
  const resetAll = () => { setCat("all"); setTone("all"); setSortBy("time"); setSortDir("desc"); };
  return (
    <span className="news-filter" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        className={`fchip news-filter-btn${activeCount ? " on" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Category, sentiment and sort"
      >
        <SlidersHorizontal size={12} />
        Filters{activeCount ? ` · ${activeCount}` : ""}
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} className="news-filter-menu" style={{ top: pos.top, left: pos.left }} role="dialog" aria-label="News filters" onClick={(e) => e.stopPropagation()}>
          <div className="nfm-section">
            <span className="nfm-label">Category</span>
            <div className="nfm-chips">
              {cats.map((c) => (
                <button key={c} className={`fchip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="nfm-section">
            <span className="nfm-label">Sentiment</span>
            <div className="nfm-chips">
              {["all", "bullish", "bearish", "neutral"].map((t) => (
                <button key={t} className={`fchip ${tone === t ? "on" : ""}`} onClick={() => setTone(t)} style={tone === t && t !== "all" ? { color: sentColor(t), borderColor: sentColor(t) } : {}}>{t}</button>
              ))}
            </div>
          </div>
          <div className="nfm-section">
            <span className="nfm-label">Sort</span>
            <div className="nfm-chips">
              {[["time", "Time"], ["impact", "Impact"]].map(([v, lbl]) => (
                <button key={v} className={`fchip ${sortBy === v ? "on" : ""}`} onClick={() => setSortBy(v)}>{lbl}</button>
              ))}
              <button className={`fchip ${sortDir === "desc" ? "on" : ""}`} onClick={() => setSortDir("desc")} title={sortBy === "impact" ? "Highest impact first" : "Newest first"} style={{ padding: "5px 7px" }}><ArrowDown size={13} /></button>
              <button className={`fchip ${sortDir === "asc" ? "on" : ""}`} onClick={() => setSortDir("asc")} title={sortBy === "impact" ? "Lowest impact first" : "Oldest first"} style={{ padding: "5px 7px" }}><ArrowUp size={13} /></button>
            </div>
          </div>
          {activeCount > 0 && <button className="nfm-reset" onClick={resetAll}>Reset filters</button>}
        </div>,
        document.body,
      )}
    </span>
  );
};

const NewsTab = ({ news, onRefresh, onAddNote, inSplit = false }) => {
  const { status, data, error, at } = news;
  const [cat, setCat] = usePersistentState("overwatch:news:cat", "all");
  const [tone, setTone] = usePersistentState("overwatch:news:tone", "all");
  const [sortBy, setSortBy] = usePersistentState("overwatch:news:sortby", "time"); // time | impact
  const [sortDir, setSortDir] = usePersistentState("overwatch:news:sortdir", "desc"); // desc (newest / highest first) | asc

  if (status === "idle")
    return (
      <EmptyState
        icon={Newspaper}
        title="No headlines pulled yet"
        body="Scan the last 24 hours of market-moving news — tagged by category, sentiment and SPX impact."
        action={<button className="btn btn-brass" onClick={onRefresh}><Newspaper size={15} /> Scan the wire</button>}
      />
    );
  if (status === "loading" && !data)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <LoadingBlock lines={1} msg="Scanning the last 24 hours of headlines…" />
        {Array.from({ length: 5 }).map((_, i) => <div className="card" key={i}><LoadingBlock lines={2} /></div>)}
      </div>
    );
  if (status === "error" && !data) return <ErrBlock msg={error} onRetry={onRefresh} />;

  const heads = data?.headlines || [];
  const cats = ["all", ...Array.from(new Set(heads.map((h) => h.category).filter(Boolean)))];
  const sortSign = sortDir === "asc" ? -1 : 1;
  const filtered = heads.filter((h) =>
    (cat === "all" || h.category === cat) &&
    (tone === "all" || h.sentiment === tone)
  ).sort((a, b) => sortSign * (sortBy === "impact"
    ? (b.impact - a.impact) || ((b.providerPublishTime || 0) - (a.providerPublishTime || 0))
    : (b.providerPublishTime || 0) - (a.providerPublishTime || 0)));

  return (
    <div>
      <div>
        <div className="intel-brief">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="chip b-brass">WIRE BRIEF</span>
            <span className="mono" style={{ color: C.faint || C.muted, fontSize: 10 }}>{data?.lastUpdated || at?.label || "latest"}</span>
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mono" style={{ color: C.faint || C.muted, fontSize: 10 }}>{data?.sourceCount ? `${data.sourceCount} raw items screened` : `${heads.length} headlines`}</span>
              <Freshness at={at} />
            </span>
          </div>
          <p>{data?.brief || data?.mood || "No desk brief in the last sync."}</p>
        </div>
        <div className="news-filters-mobile">
          <NewsFilterMenu cats={cats} cat={cat} setCat={setCat} tone={tone} setTone={setTone} sortBy={sortBy} setSortBy={setSortBy} sortDir={sortDir} setSortDir={setSortDir} />
        </div>
        <div className="filter-row news-filters-desktop">
          {cats.map((c) => (
            <button key={c} className={`fchip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
          <span style={{ flex: 1 }} />
          {["all", "bullish", "bearish", "neutral"].map((t) => (
            <button key={t} className={`fchip ${tone === t ? "on" : ""}`} onClick={() => setTone(t)} style={tone === t && t !== "all" ? { color: sentColor(t), borderColor: sentColor(t) } : {}}>{t}</button>
          ))}
        </div>
        <div className="filter-row news-filters-desktop" style={{ marginTop: -3 }}>
          <span style={{ fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".1em", alignSelf: "center", marginRight: 2 }}>SORT</span>
          {[["time", "Time"], ["impact", "Impact"]].map(([v, lbl]) => (
            <button key={v} className={`fchip ${sortBy === v ? "on" : ""}`} onClick={() => setSortBy(v)} title={v === "time" ? "Newest first" : "Most significant first"}>{lbl}</button>
          ))}
          <button className={`fchip ${sortDir === "desc" ? "on" : ""}`} onClick={() => setSortDir("desc")} title={sortBy === "impact" ? "Highest impact first" : "Newest first"} style={{ padding: "5px 7px" }}><ArrowDown size={13} /></button>
          <button className={`fchip ${sortDir === "asc" ? "on" : ""}`} onClick={() => setSortDir("asc")} title={sortBy === "impact" ? "Lowest impact first" : "Oldest first"} style={{ padding: "5px 7px" }}><ArrowUp size={13} /></button>
        </div>
        <div className="news-feed-scroll" style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 1090, overflowY: "auto", paddingRight: 6 }}>
          {filtered.map((h, i) => (
            <div className="news-card" key={i} style={{ borderLeftColor: sentColor(h.sentiment) }}>
              <div className="news-top">
                {h.rank && <span className="chip b-info">#{h.rank}</span>}
                <span className={`chip ${CAT_TONE[h.category] || ""}`}>{h.category}</span>
                <span className="chip" style={{ color: sentColor(h.sentiment), borderColor: sentColor(h.sentiment) + "66" }}>{h.sentiment}</span>
                <ImpactBars n={h.impact} />
                <span className="news-meta">{h.source}{h.timeAgo ? ` · ${h.timeAgo}` : ""}</span>
              </div>
              <div className="news-title">
                {h.url
                  ? <a href={h.url} target="_blank" rel="noreferrer" className="news-title-link" title="Open article in a new tab">{h.title}</a>
                  : <span>{h.title}</span>}
              </div>
              {h.note && <div className="news-note">{h.note}</div>}
              {!!(h.tickers || []).length && (
                <div className="ticker-tags">
                  {(h.tickers || []).map((ticker) => <span className="ticker-tag" key={ticker}>{ticker}</span>)}
                </div>
              )}
              <button className="btn btn-ghost btn-sm news-add" title="Add to desk notes" onClick={() => onAddNote(h.title)}>
                <NotebookPen size={12} /> note
              </button>
            </div>
          ))}
          {!filtered.length && <div style={{ color: C.muted, fontSize: 13, padding: 16 }}>Nothing matches those filters.</div>}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   TAB — DATA POINTS
   ================================================================ */

const calendarEventGroups = (data) => {
  const groups = data?.calendarGroups || { today: data?.calendar || [], tomorrow: [], upcoming: [], recent: [] };
  return {
    today: topCalendarEvents(groups.today || [], 5),
    tomorrow: topCalendarEvents(groups.tomorrow || [], 5),
    upcoming: topCalendarEvents(groups.upcoming || [], 5),
    // Show recent catalysts in date order (newest first) rather than the server's priority order.
    recent: [...(groups.recent || [])].sort((a, b) => {
      const ta = Date.parse(a?.date), tb = Date.parse(b?.date);
      if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
      return tb - ta;
    }),
  };
};

const calendarEventCount = (groups) => ["today", "tomorrow", "upcoming"].reduce((sum, key) => sum + (groups?.[key]?.length || 0), 0);

const nextCalendarEvent = (groups) => {
  const pool = [
    ...(groups?.today || []),
    ...(groups?.tomorrow || []),
    ...(groups?.upcoming || []),
  ];
  return pickCalendarCatalyst(pool);
};

const calendarImpactColor = (importance) => (importance === "high" ? C.bear : importance === "medium" ? C.brass : C.muted);
// Compact figure formatter for calendar prev/est/actual readings.
const calFig = (v) => (v == null ? "—" : fmtNum(Number(v), Math.abs(Number(v)) < 100 ? 1 : 0));

// Embedded TradingView economic-calendar widget. The full tradingview.com calendar page
// can't be framed (X-Frame-Options), so we use TradingView's official embed widget, which
// renders the same live calendar inside an iframe it injects into our container.
const TradingViewCalendarWidget = ({ lightMode = false }) => {
  const containerRef = useRef(null);
  // Mask the empty container while the embed script downloads and injects its iframe, so the panel
  // shows a "loading" state instead of a dead blank (which reads as lag).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let revealTimer = null;
    let pollTimer = null;
    setLoading(true);
    container.innerHTML = "";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    widget.style.width = "100%";
    container.appendChild(widget);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: lightMode ? "light" : "dark",
      // Keep transparency off: the Events widget ignores colorTheme when isTransparent is true, so
      // force it to paint its own surface matching the app theme (light in light mode, dark otherwise).
      isTransparent: false,
      locale: "en",
      countryFilter: "us",
      importanceFilter: "1",
      width: "100%",
      height: "100%",
    });
    container.appendChild(script);
    // Reveal once the widget's iframe exists (plus a short beat for first paint); hard fallback so the
    // skeleton never sticks if detection misses.
    const start = Date.now();
    const poll = () => {
      if (cancelled) return;
      if (container.querySelector("iframe")) {
        revealTimer = setTimeout(() => !cancelled && setLoading(false), 400);
        return;
      }
      if (Date.now() - start > 12000) { setLoading(false); return; }
      pollTimer = setTimeout(poll, 150);
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      clearTimeout(pollTimer);
      container.innerHTML = "";
    };
  }, [lightMode]);
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {loading && <div className="tv-skeleton" aria-hidden="true"><RefreshCw size={16} className="spin" /> Loading calendar…</div>}
    </div>
  );
};

const CalendarGroup = ({ label, items = [], empty, mode = "time" }) => (
  <div className="cal-group">
    <div className="cal-group-title">
      <b>{label}</b>
      <span>{items.length} event{items.length === 1 ? "" : "s"}</span>
    </div>
    {items.length ? items.map((c, i) => (
      <div className={`cal-row${c.structural ? " structural" : ""}`} key={`${label}-${i}`}>
        <span className="cal-time">{mode === "date" ? (calendarDateLabel(c.date, { weekday: true }) || c.time || "Date pending") : c.time}</span>
        <span className="cal-ev">
          <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            {c.event}
            {c.structural && <span className="cal-structural-tag">{c.structuralType?.replace("-", " ") || "structure"}</span>}
          </span>
          {c.note && c.structural && <div className="cal-note">{c.note}</div>}
          {(c.period || c.source) && <div className="cal-meta">{[c.period, c.source].filter(Boolean).join(" · ")}</div>}
        </span>
        <span className="cal-imp" style={{ background: calendarImpactColor(c.importance), boxShadow: c.importance === "high" ? `0 0 7px ${C.bear}99` : "none" }} title={c.importance} />
      </div>
    )) : (
      <div style={{ color: C.muted, fontSize: 12.5 }}>{empty}</div>
    )}
  </div>
);

const CalendarTab = ({ points, onRefresh, inSplit = false, lightMode = false }) => {
  const { status, data, error, at } = points;
  const [tvOpen, setTvOpen] = useState(false);

  // Calendar reader: Esc closes; lock background scroll for the full-screen overlay (not in-pane).
  useEffect(() => {
    if (!tvOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setTvOpen(false); };
    window.addEventListener("keydown", onKey);
    if (!inSplit) document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [tvOpen, inSplit]);
  if (status === "idle")
    return (
      <EmptyState
        icon={CalendarDays}
        title="Calendar not loaded"
        body="Pull today's releases, tomorrow's setup, and the major U.S. events still ahead this week."
        action={<button className="btn btn-brass" onClick={onRefresh}><CalendarDays size={15} /> Pull calendar</button>}
      />
    );
  if (status === "loading" && !data)
    return (
      <div className="calendar-grid">
        {Array.from({ length: 3 }).map((_, i) => <div className="card" key={i}><LoadingBlock lines={4} msg={i === 0 ? "Gathering calendar events…" : null} /></div>)}
      </div>
    );
  if (status === "error" && !data) return <ErrBlock msg={error} onRetry={onRefresh} />;

  const groups = calendarEventGroups(data);
  const next = nextCalendarEvent(groups);
  const total = calendarEventCount(groups);
  const highImpact = ["today", "tomorrow", "upcoming"].reduce(
    (sum, key) => sum + (groups[key] || []).filter((item) => item.importance === "high").length,
    0,
  );
  const nextStruct = data?.nextStructural || null;

  // Pop-out calendar reader: full-screen on mobile, large modal on desktop, in-pane in split view.
  const calReader = (
    <>
      <div className="nl-reader-head">
        <CalendarDays size={15} style={{ opacity: 0.6, flex: "none" }} />
        <div className="nl-reader-title">
          <span className="nl-reader-name">TradingView Economic Calendar</span>
          <span className="nl-reader-date">Live global macro calendar</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setTvOpen(false)} title="Close (Esc)"><X size={16} /></button>
      </div>
      <div className="cal-reader-body"><TradingViewCalendarWidget lightMode={lightMode} /></div>
    </>
  );

  // In split view, take over just this pane (inline) so the other pane stays visible.
  if (inSplit && tvOpen) {
    return <div className="nl-reader nl-reader-inpane">{calReader}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
        <Freshness at={at} />
      </div>

      <div className="calendar-heroes">
      {nextStruct && (
        <div className="struct-hero">
          <div className="struct-hero-label">
            <Zap size={13} />
            Next liquidity event
          </div>
          <h3>{nextStruct.event}</h3>
          <p>{nextStruct.note}</p>
          <div className="struct-date">{calendarDateLabel(nextStruct.date) || nextStruct.date} · {nextStruct.time}</div>
        </div>
      )}

      <div className="calendar-hero">
        <div className="calendar-hero-top">
          <div className="calendar-next">
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`chip ${next?.importance === "high" ? "b-bear" : next?.importance === "medium" ? "b-brass" : "b-info"}`}>
                {next ? `${next.importance || "event"} impact` : "No major event"}
              </span>
              {data?.calendarAsOf && <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>data as of {data.calendarAsOf}</span>}
            </div>
            <h2>{next ? next.event : "No major U.S. event queued"}</h2>
            <p>
              {next
                ? `${next.time || "Time pending"}${next.period ? ` · ${next.period}` : ""}${next.source ? ` · ${next.source}` : ""}`
                : "The calendar is quiet in the latest sync. Keep an eye on headlines and price action instead."}
            </p>
          </div>
          <div className="calendar-summary">
            <div className="calendar-summary-tile"><b>{groups.today?.length || 0}</b><span>Today</span></div>
            <div className="calendar-summary-tile"><b>{groups.tomorrow?.length || 0}</b><span>Tomorrow</span></div>
            <div className="calendar-summary-tile"><b>{highImpact}</b><span>High impact</span></div>
          </div>
        </div>
      </div>
      </div>
      <div className="calendar-grid">
        <div className="cal-left-col">
          <Card
            className="cal-embed-card"
            icon={CalendarDays}
            title="Economic calendar"
            sub="Live U.S. macro · TradingView"
            tools={<button className="btn btn-ghost btn-sm" onClick={() => setTvOpen(true)} title="Expand to full view"><Maximize2 size={14} /></button>}
          >
            <div className="cal-embed-card-body"><TradingViewCalendarWidget lightMode={lightMode} /></div>
          </Card>
          {!!(groups.recent || []).length && (
            <Card icon={History} title="Recent catalysts" sub="High-impact events from the past 7 days — context for recent price action">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {groups.recent.map((c, i) => (
                  <div className={`recent-row${c.structural ? " structural" : ""}`} key={`recent-${i}`} style={c.structural ? { background: "linear-gradient(90deg,rgba(59,130,246,.06),transparent)", borderLeft: "2px solid var(--brass)", paddingLeft: 10, borderRadius: 4 } : {}}>
                    <span className="recent-date">{calendarDateLabel(c.date) || c.date}</span>
                    <span className="recent-ev">
                      {c.event}
                      {c.structural && <span className="cal-structural-tag">{c.structuralType?.replace("-", " ") || "structure"}</span>}
                    </span>
                    {(c.previous != null || c.forecast != null || c.actual != null) && (
                      <span className="recent-figs">
                        {c.previous != null && <span title="Previous reading">prev {calFig(c.previous)}</span>}
                        {c.forecast != null && <span title="Consensus estimate">est {calFig(c.forecast)}</span>}
                        {c.actual != null && <span className="recent-actual" title="Actual">act {calFig(c.actual)}</span>}
                      </span>
                    )}
                    <span className="cal-imp" style={{ background: calendarImpactColor(c.importance), boxShadow: c.importance === "high" ? `0 0 7px ${C.bear}99` : "none" }} title={c.importance} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        <div className="cal-right-col">
          <Card icon={AlertTriangle} title="Major Upcoming" sub={`${groups.upcoming?.length || 0} major event${groups.upcoming?.length === 1 ? "" : "s"} this week${data?.calendarSource ? ` · ${data.calendarSource}` : ""}`}>
            <CalendarGroup label="Major Upcoming" items={groups.upcoming || []} empty="No additional major market releases found this week." mode="date" />
          </Card>
          <Card icon={CalendarDays} title="On deck" sub="Today & tomorrow · U.S. releases">
            <CalendarGroup label={`Today · ${calendarDateLabel(data?.calendarRange?.today) || "—"}`} items={groups.today || []} empty="No U.S. releases today." />
            <div style={{ height: 10 }} />
            <CalendarGroup label={`Tomorrow · ${calendarDateLabel(data?.calendarRange?.tomorrow) || "—"}`} items={groups.tomorrow || []} empty="No U.S. releases tomorrow." />
          </Card>
        </div>
      </div>

      {!total && !(groups.recent || []).length && (
        <div style={{ color: C.muted, fontSize: 12.5, textAlign: "center" }}>
          No calendar events came back in the latest sync. The data service may be quiet or temporarily unavailable.
        </div>
      )}

      {tvOpen && createPortal(
        <div className="nl-reader-overlay" onClick={() => setTvOpen(false)}>
          <div className="nl-reader" onClick={(e) => e.stopPropagation()}>{calReader}</div>
        </div>,
        document.body
      )}
    </div>
  );
};

const scoreTone = (score) => {
  const n = Number(score);
  if (!Number.isFinite(n)) return C.muted;
  return n >= 20 ? C.bull : n <= -20 ? C.bear : C.brass;
};

const RegimeScoreRail = ({ score, leftLabel = "Defensive", rightLabel = "Constructive" }) => {
  const n = Number.isFinite(Number(score)) ? Number(score) : 0;
  const left = ((clamp(n, -100, 100) + 100) / 200) * 100;
  const color = scoreTone(n);
  return (
    <div className="regime-rail-wrap">
      <div className="regime-rail">
        <span className="regime-zero" />
        <span className="regime-caret" style={{ left: `${left}%`, background: color, boxShadow: `0 0 12px ${color}66` }} />
      </div>
      <div className="regime-rail-labels">
        <span>{leftLabel}</span>
        <b style={{ color }}>{fmtSigned(n, 0)}</b>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

// Diverging per-sector bar chart from the live SPDR quotes: one row per sector, sorted strongest →
// weakest, bars growing right (green) / left (red) from a center zero line. Replaces the abstract
// distribution bar + count pills and the SPDR tiles with a single quantitative view.
const SectorBreadthBars = ({ tickers = [] }) => {
  const bySym = new Map(tickers.map((t) => [t.symbol, t]));
  const rows = SECTOR_ETFS
    .map(({ symbol, sector }) => {
      const t = bySym.get(symbol);
      return t && !t._stale && t.changePct != null
        ? { symbol, sector, changePct: t.changePct, price: t.price, delayed: t.delayed }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.changePct - a.changePct);
  if (!rows.length) return <div style={{ color: C.muted, fontSize: 12 }}>No sector ETF quotes in the last sync — hit Sync to pull them in.</div>;
  const maxAbs = Math.max(0.4, ...rows.map((r) => Math.abs(r.changePct)));
  return (
    <div className="sbar" aria-label="Per-sector performance vs prior close">
      {rows.map((r) => {
        const up = r.changePct >= 0;
        const col = chgColor(r.changePct);
        const w = clamp((Math.abs(r.changePct) / maxAbs) * 50, 0, 50);
        return (
          <div className="sbar-row" key={r.symbol} title={`${r.sector} (${r.symbol}) · ${fmtNum(r.price, 2)} · ${fmtSigned(r.changePct, 2, "%")}${r.delayed ? " · delayed" : ""}`}>
            <span className="sbar-name">{r.sector}</span>
            <div className="sbar-track">
              <span className="sbar-zero" />
              <span
                className={`sbar-fill ${up ? "up" : "down"}`}
                style={up ? { left: "50%", width: `${w}%`, background: col } : { right: "50%", width: `${w}%`, background: col }}
              />
            </div>
            <b className="sbar-val" style={{ color: col }}>{fmtSigned(r.changePct, 2, "%")}</b>
          </div>
        );
      })}
    </div>
  );
};

const MarketBreadth = ({ data, tickers = [] }) => {
  const internals = data?.internals || {};
  const breadth = internals.breadthDetail || {};
  const sectors = breadth.sectors || [];
  const total = breadth.total || sectors.length || 11;
  const advancers = Number.isFinite(Number(breadth.advancers)) ? Number(breadth.advancers) : sectors.filter((s) => s.changePct > 0).length;
  const pctPositive = Number.isFinite(Number(breadth.pctPositive)) ? clamp(Number(breadth.pctPositive), 0, 100) : Math.round((advancers / total) * 100);
  const tone = pctPositive >= 65 ? C.bull : pctPositive <= 35 ? C.bear : C.brass;
  const avg = Number.isFinite(Number(breadth.avgChange)) ? Number(breadth.avgChange) : null;

  return (
    <div className="market-breadth">
      <div className="market-breadth-hero">
        <div className="market-breadth-count">
          <b style={{ color: tone }}>{advancers}<span>/{total}</span></b>
          <small>sectors green{avg != null ? ` · avg ${fmtSigned(avg, 2, "%")}` : ""}</small>
        </div>
        <p>{breadth.read || internals.breadth || "Sector breadth is still loading."}</p>
      </div>
      <div className="breadth-meter">
        <span className="breadth-fill" style={{ width: `${pctPositive}%` }} />
        <span className="breadth-mid" />
      </div>
      <div className="breadth-labels">
        <span>Weak participation</span>
        <span>{pctPositive}% sectors positive</span>
        <span>Broad participation</span>
      </div>
      <SectorBreadthBars tickers={tickers} />
    </div>
  );
};

/* ================================================================
   SECTOR ROTATION — RRG-style relative rotation graph
   ================================================================ */
const RRG_QUADRANTS = {
  leading: { label: "Leading", color: C.bull, blurb: "outperforming & accelerating" },
  weakening: { label: "Weakening", color: "#EAB308", blurb: "outperforming but slowing" },
  lagging: { label: "Lagging", color: C.bear, blurb: "underperforming & decelerating" },
  improving: { label: "Improving", color: C.brass, blurb: "underperforming but turning up" },
};

// RRG plot: each sector's weekly (RS-ratio, RS-momentum) trail vs SPY. Center (100,100) splits the
// four quadrants; sectors typically rotate clockwise Improving → Leading → Weakening → Lagging.
const RotationGraph = ({ sectors, focus, onFocus }) => {
  const W = 640, H = 430, P = { t: 26, r: 20, b: 36, l: 46 };
  const pts = sectors.flatMap((s) => s.tail);
  const extX = Math.max(3, ...pts.map((p) => Math.abs(p.ratio - 100))) * 1.18;
  const extY = Math.max(1.6, ...pts.map((p) => Math.abs(p.momentum - 100))) * 1.18;
  const x = (v) => P.l + ((v - (100 - extX)) / (2 * extX)) * (W - P.l - P.r);
  const y = (v) => P.t + (((100 + extY) - v) / (2 * extY)) * (H - P.t - P.b);
  const cx = x(100), cy = y(100);
  const quadFill = {
    leading: { x: cx, y: P.t, w: W - P.r - cx, h: cy - P.t },
    weakening: { x: cx, y: cy, w: W - P.r - cx, h: H - P.b - cy },
    lagging: { x: P.l, y: cy, w: cx - P.l, h: H - P.b - cy },
    improving: { x: P.l, y: P.t, w: cx - P.l, h: cy - P.t },
  };
  const corner = {
    leading: { x: W - P.r - 8, y: P.t + 15, anchor: "end" },
    weakening: { x: W - P.r - 8, y: H - P.b - 8, anchor: "end" },
    lagging: { x: P.l + 8, y: H - P.b - 8, anchor: "start" },
    improving: { x: P.l + 8, y: P.t + 15, anchor: "start" },
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rrg-plot" role="img" aria-label="Sector rotation graph: relative strength vs momentum by sector">
      <defs>
        <filter id="rrg-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {Object.entries(quadFill).map(([key, r]) => (
        <rect key={key} x={r.x} y={r.y} width={Math.max(r.w, 0)} height={Math.max(r.h, 0)} fill={RRG_QUADRANTS[key].color} opacity="0.055" />
      ))}
      {Object.entries(corner).map(([key, c]) => (
        <text key={key} x={c.x} y={c.y} textAnchor={c.anchor} className="rrg-quad-label" fill={RRG_QUADRANTS[key].color}>
          {RRG_QUADRANTS[key].label.toUpperCase()}
        </text>
      ))}
      <line x1={cx} y1={P.t} x2={cx} y2={H - P.b} className="rrg-axis" />
      <line x1={P.l} y1={cy} x2={W - P.r} y2={cy} className="rrg-axis" />
      <text x={W - P.r} y={H - 10} textAnchor="end" className="rrg-axis-label">relative strength vs SPY →</text>
      <text x={14} y={P.t + 4} className="rrg-axis-label" transform={`rotate(-90 14 ${P.t + 4})`} textAnchor="end">RS momentum →</text>
      {sectors.map((s) => {
        const color = RRG_QUADRANTS[s.quadrant].color;
        const head = s.tail[s.tail.length - 1];
        const dimmed = focus && focus !== s.symbol;
        const path = s.tail.map((p, i) => `${i ? "L" : "M"}${x(p.ratio).toFixed(1)} ${y(p.momentum).toFixed(1)}`).join(" ");
        const labelLeft = x(head.ratio) > W - P.r - 58;
        return (
          <g
            key={s.symbol}
            className={`rrg-sector${dimmed ? " rrg-dim" : ""}`}
            onClick={() => onFocus(focus === s.symbol ? null : s.symbol)}
            style={{ cursor: "pointer" }}
          >
            <title>{`${s.name} (${s.symbol}) — ${RRG_QUADRANTS[s.quadrant].label}: RS ${fmtNum(head.ratio, 1)}, momentum ${fmtNum(head.momentum, 1)}`}</title>
            <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" opacity="0.6" />
            {s.tail.slice(0, -1).map((p, i) => (
              <circle key={p.t} cx={x(p.ratio)} cy={y(p.momentum)} r={1.6 + i * 0.5} fill={color} opacity={0.25 + (i / s.tail.length) * 0.45} />
            ))}
            <circle cx={x(head.ratio)} cy={y(head.momentum)} r="9" fill={color} opacity="0.16" />
            <circle cx={x(head.ratio)} cy={y(head.momentum)} r="5.5" fill={color} stroke="var(--panel2)" strokeWidth="1.5" filter="url(#rrg-glow)" />
            <text
              x={x(head.ratio) + (labelLeft ? -9 : 9)}
              y={y(head.momentum) + 4}
              textAnchor={labelLeft ? "end" : "start"}
              className="rrg-sym"
              fill={color}
            >
              {s.symbol}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

let _rotationClientCache = null;
const SectorRotation = () => {
  const [state, setState] = useState({ status: "loading", data: null });
  const [focus, setFocus] = useState(null);
  const [hidden, setHidden] = useState(() => new Set());
  const [nonce, setNonce] = useState(0);
  const toggleQuad = (key) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  useEffect(() => {
    let dead = false;
    if (_rotationClientCache && Date.now() - _rotationClientCache.ts < 10 * 60 * 1000) {
      setState({ status: "ready", data: _rotationClientCache.data });
      return () => { dead = true; };
    }
    setState({ status: "loading", data: null });
    callDesk("rotation")
      .then((data) => {
        if (dead) return;
        _rotationClientCache = { ts: Date.now(), data };
        setState({ status: "ready", data });
      })
      .catch(() => { if (!dead) setState({ status: "error", data: null }); });
    return () => { dead = true; };
  }, [nonce]);

  if (state.status === "loading") return <LoadingBlock lines={4} msg="Charting weekly sector rotation vs SPY…" />;
  if (state.status === "error" || !state.data?.sectors?.length)
    return <ErrBlock msg="Sector rotation history is unavailable right now." onRetry={() => { _rotationClientCache = null; setNonce((n) => n + 1); }} />;

  const { sectors, counts, read, weeks } = state.data;
  const visibleSectors = sectors.filter((s) => !hidden.has(s.quadrant));
  const focusedRaw = focus ? sectors.find((s) => s.symbol === focus) : null;
  const focused = focusedRaw && !hidden.has(focusedRaw.quadrant) ? focusedRaw : null;
  return (
    <div className="rrg">
      <div className="rrg-legend">
        {Object.entries(RRG_QUADRANTS).map(([key, q]) => (
          <button
            key={key}
            type="button"
            className={`rrg-key${hidden.has(key) ? " off" : ""}`}
            style={{ "--rrg-c": q.color }}
            title={`${q.blurb} — tap to ${hidden.has(key) ? "show" : "hide"}`}
            aria-pressed={!hidden.has(key)}
            onClick={() => toggleQuad(key)}
          >
            <i style={{ background: q.color }} />{q.label}<b>{counts?.[key] ?? 0}</b>
          </button>
        ))}
      </div>
      <RotationGraph sectors={visibleSectors} focus={focus} onFocus={setFocus} />
      <div className="rrg-chips">
        {visibleSectors.map((s) => (
          <button
            key={s.symbol}
            className={`rrg-chip${focus === s.symbol ? " on" : ""}`}
            style={{ "--rrg-c": RRG_QUADRANTS[s.quadrant].color }}
            onClick={() => setFocus(focus === s.symbol ? null : s.symbol)}
            title={`${s.name} — ${RRG_QUADRANTS[s.quadrant].label}`}
          >
            {s.symbol}
          </button>
        ))}
      </div>
      <div className="rrg-read">
        {focused
          ? `${focused.name} (${focused.symbol}) is ${RRG_QUADRANTS[focused.quadrant].label.toLowerCase()} — ${RRG_QUADRANTS[focused.quadrant].blurb}${focused.heading !== focused.quadrant ? `, and its ${weeks}-week path points toward ${RRG_QUADRANTS[focused.heading].label.toLowerCase()}` : ""}.`
          : read}
      </div>
      <div className="rrg-hint">Each trail is {weeks} weeks of relative strength vs SPY. Sectors normally rotate clockwise: Improving → Leading → Weakening → Lagging. Tap a sector to isolate its path.</div>
    </div>
  );
};

const VolStructureMap = ({ detail = {} }) => {
  const bands = detail.bands || [
    { label: "Calm", min: 0, max: 16 },
    { label: "Normal", min: 16, max: 21 },
    { label: "Elevated", min: 21, max: 27 },
    { label: "Stress", min: 27, max: 40 },
  ];
  const vix = Number(detail.vix);
  // The bands render as equal-width columns, so position the marker by the band VIX falls into and
  // its fraction within that band — not a raw vix/40 scale (which misaligned the marker with the
  // bands and barely moved across the realistic VIX range, making it look frozen).
  const n = bands.length;
  const slot = 100 / n;
  let marker = null;
  if (Number.isFinite(vix)) {
    if (vix <= bands[0].min) marker = 0;
    else if (vix >= bands[n - 1].max) marker = 100;
    else {
      let i = bands.findIndex((b) => vix >= b.min && vix < b.max);
      if (i === -1) i = n - 1;
      const b = bands[i];
      const frac = clamp((vix - b.min) / ((b.max - b.min) || 1), 0, 1);
      marker = (i + frac) * slot;
    }
    marker = clamp(marker, 0, 100);
  }
  const zone = detail.zone || (Number.isFinite(vix) ? bands.find((b) => vix >= b.min && vix < b.max)?.label?.toLowerCase() : null);
  return (
    <div className="vol-map">
      <div className="vol-map-top">
        <span className="vol-map-vix">VIX <b>{Number.isFinite(vix) ? fmtNum(vix, 1) : "—"}</b></span>
        {zone && <span className="vol-map-zone">{zone}</span>}
      </div>
      <div className="vol-bands">
        {bands.map((band) => (
          <span key={band.label} className={`vol-band vol-${band.label.toLowerCase()}`}>
            <b>{band.label}</b>
            <small>{band.min}-{band.max}</small>
          </span>
        ))}
        {marker != null && <span className="vol-marker" style={{ left: `${marker}%` }} title={`VIX ${fmtNum(vix, 1)}`} />}
      </div>
      <div className="vol-map-read">{detail.read || "Volatility structure is still resolving."}</div>
    </div>
  );
};

const InternalsRegime = ({ data }) => {
  const internals = data?.internals || {};
  const breadth = internals.breadthDetail || {};
  const trend = internals.trendDetail || {};
  const vol = internals.volDetail || {};
  const sectors = breadth.sectors || [];
  const total = breadth.total || sectors.length || 11;
  const advancers = Number.isFinite(Number(breadth.advancers)) ? Number(breadth.advancers) : sectors.filter((s) => s.changePct > 0).length;
  const pctPositive = Number.isFinite(Number(breadth.pctPositive)) ? clamp(Number(breadth.pctPositive), 0, 100) : Math.round((advancers / total) * 100);
  const trendState = trend.state || internals.trend || "range";
  const trendColor = trendState === "uptrend" ? C.bull : trendState === "downtrend" ? C.bear : C.brass;
  const volColor = vol.zone === "stress" || vol.structure === "backwardation" ? C.bear : vol.zone === "calm" || vol.structure === "contango" ? C.bull : C.brass;
  const strongest = breadth.strongest || sectors.slice(0, 3);
  const weakest = breadth.weakest || sectors.slice(-3).reverse();

  return (
    <div className="internals-regime">
      <div className="internals-hero">
        <div>
          <span className="internals-kicker">Current regime</span>
          <h3>{trendState.replace("-", " ")} · {vol.zone || data?.vix?.structure || "vol pending"}</h3>
          <p>{internals.summary || trend.read || "The internal regime is still resolving from the latest market sync."}</p>
        </div>
        <div className="internals-scorecard">
          <span>Regime components</span>
          <div style={{ display: "flex", gap: 16, marginTop: 5 }}>
            {[["Trend", trend.score], ["Breadth", breadth.score], ["Vol", vol.score]].map(([lbl, sc]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <b style={{ display: "block", color: scoreTone(sc), fontSize: 18, lineHeight: 1.05 }}>{Number.isFinite(Number(sc)) ? fmtSigned(sc, 0) : "—"}</b>
                <span style={{ fontSize: 9, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {internals.divergence && (
        <div className="guard g-amber" style={{ marginTop: 12 }}>
          <b><AlertTriangle size={12} /> Trend vs sentiment divergence</b>
          {internals.divergence}
        </div>
      )}

      <div className="internals-grid">
        <div className="internals-tile">
          <span>Breadth participation</span>
          <b style={{ color: pctPositive >= 65 ? C.bull : pctPositive <= 35 ? C.bear : C.brass }}>{advancers}/{total}</b>
          <small>{pctPositive}% positive · {breadth.tone || "participation pending"}</small>
        </div>
        <div className="internals-tile">
          <span>Trend state</span>
          <b style={{ color: trendColor }}>{trendState}</b>
          <small>{trend.indexTone != null ? `Index tone ${fmtSigned(trend.indexTone, 2, "%")}` : "Index tone pending"}</small>
        </div>
        <div className="internals-tile">
          <span>Vol structure</span>
          <b style={{ color: volColor }}>{vol.structure || data?.vix?.structure || "—"}</b>
          <small>VIX {fmtNum(vol.vix ?? data?.vix?.spot, 1)} · {vol.zone || "zone pending"}</small>
        </div>
      </div>

      <div className="internals-two">
        <div className="internals-section">
          <div className="internals-section-head">
            <b>Trend state</b>
            <span>{trend.read || "Trend state is based on index direction, breadth and VIX pressure."}</span>
          </div>
          <RegimeScoreRail score={trend.score} />
          <div className="internals-components">
            {(trend.components || []).map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="internals-section">
          <div className="internals-section-head">
            <b>Vol structure</b>
            <span>Use this to decide whether levels deserve patience or faster risk control.</span>
          </div>
          <VolStructureMap detail={vol} />
        </div>
      </div>

      <div className="internals-two">
        <div className="internals-section compact">
          <div className="internals-section-head">
            <b>Leadership</b>
            <span>{strongest.length ? "Where buyers are showing up." : "Leadership pending."}</span>
          </div>
          <div className="leader-list">
            {strongest.map((item) => <span key={item.name}>{item.name}<b style={{ color: chgColor(item.changePct) }}>{fmtSigned(item.changePct, 2, "%")}</b></span>)}
          </div>
        </div>
        <div className="internals-section compact">
          <div className="internals-section-head">
            <b>Pressure</b>
            <span>{weakest.length ? "Where weakness can spread from." : "Pressure pending."}</span>
          </div>
          <div className="leader-list">
            {weakest.map((item) => <span key={item.name}>{item.name}<b style={{ color: chgColor(item.changePct) }}>{fmtSigned(item.changePct, 2, "%")}</b></span>)}
          </div>
        </div>
      </div>

      <div className="internals-footer">
        <div>
          <b>Put/call</b>
          <span>{fmtNum(internals.putCall)} · {internals.putCallRead || "Options pressure is not available in this sync."}</span>
        </div>
        <div>
          <b>Desk translation</b>
          <span>{trendState === "uptrend" && pctPositive >= 55 ? "Price and participation are aligned. Pullbacks deserve more respect if VIX stays contained." : trendState === "downtrend" || pctPositive <= 35 ? "Price or participation is defensive. Treat bounces as suspect until breadth repairs." : "Signals are mixed. Let levels confirm before sizing a directional thesis."}</span>
        </div>
      </div>
    </div>
  );
};

const DataPointSection = ({ points, onRefresh }) => {
  const { status, data, error, at } = points;
  if (status === "idle")
    return (
      <EmptyState
        icon={Crosshair}
        title="Internals not loaded"
        body="Pull SPX, NDX, and DJI levels, VIX structure, put/call, breadth, the day's economic calendar and positioning notes."
        action={<button className="btn btn-brass" onClick={onRefresh}><Crosshair size={15} /> Pull internals</button>}
      />
    );
  if (status === "loading" && !data)
    return (
      <div className="grid g-data">
        {Array.from({ length: 6 }).map((_, i) => <div className="card" key={i}><LoadingBlock lines={4} msg={i === 0 ? "Gathering levels + internals…" : null} /></div>)}
      </div>
    );
  if (status === "error" && !data) return <ErrBlock msg={error} onRetry={onRefresh} />;

  const pos = data?.positioning;
  const posSummary = typeof pos === "string" ? pos : pos?.summary;
  const flowRows = Array.isArray(pos?.flows) ? pos.flows : [];
  const signalRows = Array.isArray(pos?.signals) ? pos.signals : [];
  const noteRows = Array.isArray(pos?.notes) ? pos.notes : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
        <Freshness at={at} />
      </div>
      <div className="grid g-2" style={{ alignItems: "start" }}>
        <Card icon={Activity} title="Internals regime" sub="Breadth, trend state, volatility structure">
          <InternalsRegime data={data} />
        </Card>
        <Card icon={History} title="Positioning & flows" sub="ETF proxies, credit, havens, sentiment components">
          {posSummary ? (
            <div className="flow-summary">
              <span className={`chip ${pos?.posture === "risk-on" ? "b-bull" : pos?.posture === "defensive" ? "b-bear" : "b-brass"}`} style={{ marginRight: 8 }}>{pos?.posture || "mixed"}</span>
              {posSummary}
            </div>
          ) : (
            <div style={{ color: C.muted, fontSize: 12.5 }}>No flow proxy data in last sync.</div>
          )}
          {!!flowRows.length && (
            <div style={{ marginTop: 12 }}>
              {flowRows.slice(0, 8).map((item) => (
                <div className="flow-row" key={item.symbol}>
                  <span className="flow-sym">{item.symbol}</span>
                  <div>
                    <div className="flow-label">{item.label}</div>
                    <div className="flow-read">{item.read}</div>
                  </div>
                  <div className="flow-val" style={{ color: chgColor(item.changePct) }}>
                    {fmtSigned(item.changePct, 2, "%")}
                    {item.relativeVolume != null && <div style={{ color: C.faint || C.muted, marginTop: 2 }}>{fmtNum(item.relativeVolume, 2)}x vol</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!!signalRows.length && (
            <div className="grid g-3" style={{ gap: 8, marginTop: 12 }}>
              {signalRows.slice(0, 3).map((item) => (
                <div className="flow-signal" key={item.label}>
                  <b>{item.label}</b>
                  <span style={{ color: item.tone?.includes("fear") ? C.bear : item.tone?.includes("greed") ? C.bull : C.brass }}>{item.value}</span>
                  <p>{item.tone} · {item.note}</p>
                </div>
              ))}
            </div>
          )}
          {!!noteRows.length && (
            <div className="watch-list" style={{ marginTop: 12 }}>
              {noteRows.map((item, i) => <div className="watch-item" key={i}>{item}</div>)}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

/* ================================================================
   QUANT TOOLS — Black-Scholes pricing, Greeks, implied vol, hedges
   ================================================================ */

const numOr = (v, fallback) => {
  const n = Number(v);
  return v === "" || v === null || v === undefined || Number.isNaN(n) ? fallback : n;
};

const fmtUsd = (n, dp = 0) =>
  Number.isFinite(Number(n))
    ? (Number(n) < 0 ? "−$" : "$") +
      Math.abs(Number(n)).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })
    : "—";

const roundStrike = (S) => {
  if (!(S > 0)) return 0;
  const step = S >= 2000 ? 25 : S >= 1000 ? 10 : S >= 100 ? 5 : 1;
  return Math.round(S / step) * step;
};

const _normPDF = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
const _normCDF = (x) => {
  // Abramowitz & Stegun 7.1.26
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - p : p;
};

// Black-Scholes-Merton with continuous dividend yield. T in years, sigma/r/q as decimals.
// vega per 1 vol point, theta per calendar day, rho per 1% rate.
const blackScholes = ({ S, K, T, r = 0, q = 0, sigma, type = "call" }) => {
  S = Number(S); K = Number(K); T = Number(T); r = Number(r); q = Number(q); sigma = Number(sigma);
  const isPut = type === "put";
  if (!(S > 0) || !(K > 0) || !(sigma > 0) || !(T > 0)) {
    const intrinsic = isPut ? Math.max(K - S, 0) : Math.max(S - K, 0);
    return { price: intrinsic, delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const eqt = Math.exp(-q * T);
  const ert = Math.exp(-r * T);
  const pdf = _normPDF(d1);
  const gamma = (eqt * pdf) / (S * sigma * sqrtT);
  const vega = (S * eqt * pdf * sqrtT) / 100;
  let price, delta, rho, theta;
  if (isPut) {
    const nNd1 = _normCDF(-d1), nNd2 = _normCDF(-d2);
    price = K * ert * nNd2 - S * eqt * nNd1;
    delta = -eqt * nNd1;
    rho = (-K * T * ert * nNd2) / 100;
    theta = ((-(S * eqt * pdf * sigma)) / (2 * sqrtT) + q * S * eqt * nNd1 - r * K * ert * nNd2) / 365;
  } else {
    const Nd1 = _normCDF(d1), Nd2 = _normCDF(d2);
    price = S * eqt * Nd1 - K * ert * Nd2;
    delta = eqt * Nd1;
    rho = (K * T * ert * Nd2) / 100;
    theta = ((-(S * eqt * pdf * sigma)) / (2 * sqrtT) - q * S * eqt * Nd1 + r * K * ert * Nd2) / 365;
  }
  return { price, delta, gamma, theta, vega, rho };
};

// Implied volatility via bisection — robust across the full price range.
const impliedVol = ({ S, K, T, r = 0, q = 0, type = "call", marketPrice }) => {
  S = Number(S); K = Number(K); T = Number(T); marketPrice = Number(marketPrice);
  if (!(marketPrice > 0) || !(S > 0) || !(K > 0) || !(T > 0)) return null;
  const priceAt = (v) => blackScholes({ S, K, T, r, q, sigma: v, type }).price;
  let lo = 1e-4, hi = 5, mid = 0;
  if (marketPrice <= priceAt(lo) || marketPrice >= priceAt(hi)) return null;
  for (let i = 0; i < 80; i++) {
    mid = (lo + hi) / 2;
    const p = priceAt(mid);
    if (Math.abs(p - marketPrice) < 1e-5) break;
    if (p > marketPrice) hi = mid; else lo = mid;
  }
  return mid;
};

const FUTURES_MULT = { ES: 50, NQ: 20, YM: 5, RTY: 50 };

// Reads spot / vol / rate from the live feed for auto-fill (every field stays editable).
const deskLiveContext = (market, points, instrument) => {
  const cfg = thesisInstrumentConfig(instrument);
  const tickers = market?.tickers || [];
  const find = (sym) => tickers.find((x) => x.symbol === sym);
  const priceOf = (sym) => {
    const tk = find(sym);
    if (tk && Number.isFinite(Number(tk.price))) return Number(tk.price);
    const c = thesisInstrumentConfig(sym);
    const pt = points?.[c.pointsKey]?.spot;
    return Number.isFinite(Number(pt)) ? Number(pt) : null;
  };
  const vix = find("VIX")?.price ?? points?.vix?.spot;
  const us10 = find("US10Y")?.price;
  const isStock = cfg.group === "stock";
  return {
    cfg,
    isStock,
    spot: priceOf(cfg.symbol),
    // VIX ≈ annualized IV for the broad index, a fair auto-fill for index/ETF instruments.
    // It is NOT a single stock's implied vol, so leave it blank for stocks and let the user enter it.
    sigmaPct: isStock ? null : (Number.isFinite(Number(vix)) ? Number(vix) : null),
    ratePct: Number.isFinite(Number(us10)) ? Number(us10) : null,
    futSym: cfg.futures,
    futMult: FUTURES_MULT[cfg.futures] || 50,
    priceOf,
  };
};

const DEFAULT_DESK_TOOLS = {
  feedToThesis: false,
  env: { spot: "", sigmaPct: "", ratePct: "", divPct: "1.3", days: "30" },
  options: { strike: "", type: "call", marketPrice: "", feed: false },
  // Second options-calculator leg, used only when a secondary instrument is in focus. Independent
  // pricing environment + option fields so both legs can be priced side by side.
  env2: { spot: "", sigmaPct: "", ratePct: "", divPct: "1.3", days: "30" },
  options2: { strike: "", type: "call", marketPrice: "", feed: false },
};

// Deep-merge a saved deskTools blob (from local storage or the cloud) onto the defaults, keeping
// only known sub-objects. A retired `hedge` key from an older save is dropped on the floor.
const mergeSavedDeskTools = (base, saved) => {
  if (!saved || typeof saved !== "object") return base;
  const { hedge: _retiredHedge, ...rest } = saved;
  return {
    ...base,
    ...rest,
    env: { ...base.env, ...(rest.env || {}) },
    options: { ...base.options, ...(rest.options || {}) },
    env2: { ...base.env2, ...(rest.env2 || {}) },
    options2: { ...base.options2, ...(rest.options2 || {}) },
  };
};

// Resolves the shared pricing environment (auto-fill + overrides) into numeric values.
const resolveEnv = (env, live) => ({
  S: numOr(env.spot, live.spot ?? 0),
  sigma: numOr(env.sigmaPct, live.sigmaPct ?? 20) / 100,
  r: numOr(env.ratePct, live.ratePct ?? 4.3) / 100,
  q: numOr(env.divPct, 1.3) / 100,
  days: numOr(env.days, 30),
  T: numOr(env.days, 30) / 365,
});

// Does a strike sit on top of a thesis's own upside/downside level (within half a strike step)?
// Used to tell the AI (and the user) when the fed options scenario isn't an arbitrary strike pick,
// but is deliberately scoped to the thesis's own target or invalidation.
const alignedLevelTag = (K, thesisLevels) => {
  if (!(K > 0) || !thesisLevels) return null;
  const step = K >= 2000 ? 25 : K >= 1000 ? 10 : K >= 100 ? 5 : 1;
  if (thesisLevels.up > 0 && Math.abs(K - thesisLevels.up) <= step / 2) return "target";
  if (thesisLevels.down > 0 && Math.abs(K - thesisLevels.down) <= step / 2) return "invalidation";
  return null;
};

// Builds a compact human-readable summary of the enabled desk tools for the AI synthesis.
const buildDeskToolsContext = ({ deskTools, market, points, instrument, thesisLevels = null }) => {
  const live = deskLiveContext(market, points, instrument);
  const { S, sigma, r, q, days, T } = resolveEnv(deskTools.env, live);
  const lines = [];
  // Spot-dependent context (the options scenario) only when a focus spot is available.
  if (S > 0) {
    lines.push(
      `Pricing environment: ${live.cfg.symbol} spot ${fmtNum(S, 2)}, IV ${fmtNum(sigma * 100, 1)}%, ${days}d to expiry, rate ${fmtNum(r * 100, 2)}%, dividend ${fmtNum(q * 100, 2)}%.`
    );
    if (deskTools.options.feed) {
      const oStrike = numOr(deskTools.options.strike, roundStrike(S));
      const obs = blackScholes({ S, K: oStrike, T, r, q, sigma, type: deskTools.options.type });
      const tag = alignedLevelTag(oStrike, thesisLevels);
      lines.push(
        `Options scenario: ${deskTools.options.type.toUpperCase()} ${fmtNum(oStrike, 0)} theo ${fmtNum(obs.price, 2)} (Δ ${fmtNum(obs.delta, 2)}, Γ ${fmtNum(obs.gamma, 4)}, Θ ${fmtNum(obs.theta, 2)}/day, vega ${fmtNum(obs.vega, 2)}/pt)`
        + (tag ? ` — strike is deliberately set at the desk's own ${tag} level, not an arbitrary pick.` : ".")
      );
    }
  }

  return lines.join("\n");
};

// Short chip labels for the structures fed into a thesis — rendered back in the output as confirmation.
const deskStructureLabels = ({ deskTools, market, points, instrument, thesisLevels = null }) => {
  const live = deskLiveContext(market, points, instrument);
  const { S, days } = resolveEnv(deskTools.env, live);
  const out = [];
  const o = deskTools.options;
  if (S > 0 && o.feed) {
    const K = numOr(o.strike, roundStrike(S));
    const tag = alignedLevelTag(K, thesisLevels);
    out.push(`Options: ${o.type} ${fmtNum(K, 0)} · ${days}d${tag ? ` (${tag})` : ""}`);
  }
  return out;
};

// Numeric snapshot of the fed desk structures for the thesis output's Trade structure card. Computed
// deterministically from the same Black-Scholes math, so it renders concrete entry / risk / exits
// whether or not the AI narrative mentions the trade. Stored on the thesis entry at generation time.
const buildTradeStructures = ({ deskTools, market, points, instrument, thesisLevels = null }) => {
  const live = deskLiveContext(market, points, instrument);
  const { S, sigma, r, q, days, T } = resolveEnv(deskTools.env, live);
  const out = [];
  if (S > 0 && deskTools.options.feed) {
    const type = deskTools.options.type;
    const K = numOr(deskTools.options.strike, roundStrike(S));
    const bs = blackScholes({ S, K, T, r, q, sigma, type });
    const entry = bs.price;
    const breakeven = type === "call" ? K + entry : K - entry;
    // Payoff ladder — reprice the contract across a spread of underlying moves at the same DTE.
    const rowAt = (sp, label = null) => {
      const val = blackScholes({ S: sp, K, T, r, q, sigma, type }).price;
      return { movePct: ((sp - S) / S) * 100, spot: sp, val, pnlPct: entry > 0 ? ((val - entry) / entry) * 100 : 0, label };
    };
    const ladder = [-0.05, -0.025, 0, 0.025, 0.05].map((m) => rowAt(S * (1 + m)));
    // Land extra rows exactly on the thesis's own levels so the exits map to the call.
    [["Target", thesisLevels?.up], ["Invalidation", thesisLevels?.down]].forEach(([label, lv]) => {
      if (lv > S * 0.5 && lv < S * 1.5 && Math.abs(lv - S) / S > 0.0005) ladder.push(rowAt(lv, label));
    });
    ladder.sort((a, b) => a.spot - b.spot);
    out.push({
      kind: "option", symbol: live.cfg.symbol, type, strike: K, days, spot: S, iv: sigma * 100,
      entry, cost: entry * 100, breakeven, maxRisk: entry * 100,
      delta: bs.delta, theta: bs.theta, vega: bs.vega, ladder,
    });
  }
  return out;
};

// Directional alignment of a structure vs the thesis bias, for the alignment flag.
const structAlignment = (type, bias) => {
  if (bias === "bullish") return type === "call" ? "aligned" : "counter";
  if (bias === "bearish") return type === "put" ? "aligned" : "counter";
  return "neutral";
};

// Renders the fed desk structures as concrete trade plans (entry / risk / exits), computed
// deterministically — independent of the AI narrative.
const TradeStructureCard = ({ structures, bias }) => {
  if (!structures?.length) return null;
  return (
    <Card icon={Scale} title="Trade structure" sub="Priced from your desk tools — entry, risk & exits">
      <div className="tstruct-list">
        {structures.map((s, i) => {
          if (s.kind === "option") {
            const align = structAlignment(s.type, bias);
            return (
              <div className="tstruct" key={i}>
                <div className="tstruct-head">
                  <span className="tstruct-title">{s.symbol} {s.type.toUpperCase()} {fmtNum(s.strike, 0)} · {s.days}d</span>
                  {align !== "neutral" && (
                    <span className={`tstruct-flag ${align === "aligned" ? "ok" : "warn"}`}>
                      {align === "aligned" ? "Aligned with bias" : `Counter to ${bias} bias`}
                    </span>
                  )}
                </div>
                <div className="tstruct-stats">
                  <div className="tstruct-stat"><span>Entry</span><b>${fmtNum(s.entry, 2)}</b><small>{fmtUsd(s.cost, 0)}/contract</small></div>
                  <div className="tstruct-stat"><span>Breakeven</span><b>{fmtNum(s.breakeven, 2)}</b><small>at expiry</small></div>
                  <div className="tstruct-stat"><span>Max risk</span><b>{fmtUsd(s.maxRisk, 0)}</b><small>premium (long)</small></div>
                  <div className="tstruct-stat"><span>Theta</span><b>${fmtNum(s.theta, 2)}</b><small>decay/day</small></div>
                </div>
                <div className="tstruct-ladder">
                  <div className="tstruct-ladder-row tstruct-ladder-head"><span>{s.symbol} move</span><span>Contract</span><span>P/L</span></div>
                  {s.ladder.map((row, j) => (
                    <div className={`tstruct-ladder-row${row.label ? " tstruct-ladder-level" : ""}`} key={j}>
                      <span>
                        {fmtSigned(row.movePct, 1, "%")} → {fmtNum(row.spot, 2)}
                        {row.label && <span className={`tstruct-lvl-tag ${row.label === "Target" ? "ok" : "warn"}`}>{row.label}</span>}
                      </span>
                      <span>${fmtNum(row.val, 2)}</span>
                      <span style={{ color: row.pnlPct >= 0 ? C.bull : C.bear, fontWeight: 600 }}>{fmtSigned(row.pnlPct, 0, "%")}</span>
                    </div>
                  ))}
                </div>
                <div className="tstruct-note">Manage against the ladder: scale out toward the upside rows as the thesis target fills; full premium ({fmtUsd(s.maxRisk, 0)}) is the hard cap if it expires worthless. Theta bleeds ~${fmtNum(Math.abs(s.theta), 2)}/day while you wait.</div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </Card>
  );
};

// Trade journal — log the trade actually taken against a thesis (entry/exit/size/note). P/L is
// (exit − entry) × size, sign-flipped for shorts; stored on the archive entry and rolled up in
// the Library scoreboard.
const TradeLogCard = ({ entry, onLogTrade }) => {
  const t = entry?._trade;
  const [editing, setEditing] = useState(false);
  const [side, setSide] = useState(t?.side || "long");
  const [entryPx, setEntryPx] = useState(t?.entry ?? "");
  const [exitPx, setExitPx] = useState(t?.exit ?? "");
  const [size, setSize] = useState(t?.size ?? "1");
  const [note, setNote] = useState(t?.note || "");
  if (!entry?._id) return null;
  const pnl = (Number(exitPx) - Number(entryPx)) * (Number(size) || 0) * (side === "short" ? -1 : 1);
  const valid = Number(entryPx) > 0 && Number(exitPx) > 0 && Number(size) > 0;
  const save = () => {
    onLogTrade(entry._id, { side, entry: Number(entryPx), exit: Number(exitPx), size: Number(size), note: note.trim(), pnl, ts: Date.now() });
    setEditing(false);
  };
  if (!t && !editing) {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 15px" }}>
        <NotebookPen size={14} color={C.brass} />
        <span style={{ fontSize: 12.5, color: C.muted, flex: 1 }}>Took this trade? Log it to grade your own execution in the Library scoreboard.</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Log trade</button>
      </div>
    );
  }
  if (t && !editing) {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 15px", flexWrap: "wrap" }}>
        <NotebookPen size={14} color={C.brass} />
        <span style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 600 }}>
          {t.side === "short" ? "Short" : "Long"} {fmtNum(t.size, 2)} @ {fmtNum(t.entry, 2)} → {fmtNum(t.exit, 2)}
        </span>
        <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: t.pnl >= 0 ? C.bull : C.bear }}>{t.pnl >= 0 ? "+" : "−"}{fmtUsd(Math.abs(t.pnl), 2)}</span>
        {t.note && <span style={{ fontSize: 12, color: C.muted, flex: 1, minWidth: 120 }}>{t.note}</span>}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-ghost btn-sm" title="Remove trade log" onClick={() => onLogTrade(entry._id, null)}><Trash2 size={12} /></button>
        </span>
      </div>
    );
  }
  return (
    <Card icon={NotebookPen} title="Log trade" sub="Record what you actually did against this thesis">
      <div className="seg" style={{ maxWidth: 220, marginBottom: 12 }}>
        {["long", "short"].map((s) => (
          <button key={s} className={`${side === s ? "on" : ""} ${s === "long" ? "sg-bull" : "sg-bear"}`} onClick={() => setSide(s)}>{s}</button>
        ))}
      </div>
      <div className="grid g-3" style={{ gap: 10 }}>
        <NumField label="Entry" value={entryPx} placeholder="fill price" onChange={setEntryPx} />
        <NumField label="Exit" value={exitPx} placeholder="fill price" onChange={setExitPx} />
        <NumField label="Size" hint="shares / contracts×100" value={size} placeholder="1" onChange={setSize} />
      </div>
      <div className="lab-field">
        <span className="lab-label">Note — optional</span>
        <textarea className="bd-ta" style={{ minHeight: 54 }} placeholder="e.g. took the retest, out on the theta clock" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <button className="btn btn-brass" disabled={!valid} onClick={save}><Check size={14} /> Save trade</button>
        <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
        {valid && <span className="mono" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: pnl >= 0 ? C.bull : C.bear }}>P/L {pnl >= 0 ? "+" : "−"}{fmtUsd(Math.abs(pnl), 2)}</span>}
      </div>
    </Card>
  );
};

/* ---------- small shared tool UI primitives ---------- */

const NumField = ({ label, hint, value, onChange, step = "any", suffix, placeholder }) => (
  <label className="lab-field" style={{ marginTop: 0, display: "block" }}>
    <span className="lab-label">
      {label}
      {hint && <span style={{ color: C.muted, marginLeft: 6, letterSpacing: 0, textTransform: "none" }}>{hint}</span>}
    </span>
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        className="bd-in mono-in"
        style={{ textTransform: "none", paddingRight: suffix ? 30 : undefined }}
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {suffix && <span className="mono" style={{ position: "absolute", right: 11, color: C.muted, fontSize: 11 }}>{suffix}</span>}
    </div>
  </label>
);

const ToolStat = ({ k, v, color, sub }) => (
  <div className="metric">
    <span className="metric-k" style={color ? { color } : undefined}>{k}</span>
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: color || "var(--text)" }}>{v}</span>
    {sub && <span className="metric-note">{sub}</span>}
  </div>
);

// P/L-at-expiry curve. `payoff(price)` returns total $ P/L; profit shaded green, loss red.
const PayoffChart = ({ payoff, lo, hi, spot, markers = [], title }) => {
  if (!(hi > lo) || typeof payoff !== "function") return null;
  const W = 640, H = 180, padL = 8, padR = 8, padT = 14, padB = 18;
  const N = 100;
  const xs = [], ys = [];
  for (let i = 0; i <= N; i++) { const s = lo + ((hi - lo) * i) / N; const y = payoff(s); xs.push(s); ys.push(Number.isFinite(y) ? y : 0); }
  let yMin = Math.min(0, ...ys), yMax = Math.max(0, ...ys);
  const span = yMax - yMin || 1;
  yMin -= span * 0.14; yMax += span * 0.14;
  const px = (s) => padL + ((s - lo) / (hi - lo)) * (W - padL - padR);
  const py = (val) => padT + (1 - (val - yMin) / (yMax - yMin)) * (H - padT - padB);
  const zeroY = py(0);
  const line = xs.map((s, i) => `${px(s).toFixed(1)},${py(ys[i]).toFixed(1)}`).join(" ");
  const area = (clampFn) => {
    let d = `M ${px(lo).toFixed(1)} ${zeroY.toFixed(1)}`;
    xs.forEach((s, i) => { d += ` L ${px(s).toFixed(1)} ${py(clampFn(ys[i])).toFixed(1)}`; });
    return d + ` L ${px(hi).toFixed(1)} ${zeroY.toFixed(1)} Z`;
  };
  return (
    <div style={{ marginTop: 12 }}>
      {title && <div className="lab-label" style={{ marginBottom: 4 }}>{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <path d={area((val) => Math.max(val, 0))} fill="rgba(34,197,94,.15)" />
        <path d={area((val) => Math.min(val, 0))} fill="rgba(239,68,68,.15)" />
        <line x1={padL} y1={zeroY} x2={W - padR} y2={zeroY} style={{ stroke: "var(--line2)" }} strokeWidth="1" strokeDasharray="3 3" />
        <polyline points={line} fill="none" style={{ stroke: "var(--brass)" }} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {spot != null && spot >= lo && spot <= hi && (
          <>
            <line x1={px(spot)} y1={padT} x2={px(spot)} y2={H - padB} style={{ stroke: "var(--text)" }} strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
            <text x={clamp(px(spot), 18, W - 18)} y={H - 5} fontSize="9" style={{ fill: "var(--muted)" }} textAnchor="middle" fontFamily="'JetBrains Mono',monospace">spot {fmtNum(spot, 0)}</text>
          </>
        )}
        {markers.filter((m) => m.x != null && m.x >= lo && m.x <= hi).map((m, i) => (
          <g key={i}>
            <line x1={px(m.x)} y1={padT} x2={px(m.x)} y2={H - padB} style={{ stroke: m.color || "var(--faint)" }} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <text x={clamp(px(m.x), 20, W - 20)} y={padT + 8} fontSize="9" style={{ fill: m.color || "var(--muted)" }} textAnchor="middle" fontFamily="'JetBrains Mono',monospace">{m.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const FeedToggle = ({ on, onToggle, summary }) => (
  <div className="card" style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 16px" }}>
    <button
      onClick={() => onToggle(!on)}
      style={{ width: 40, height: 23, borderRadius: 23, border: "none", background: on ? C.brass : "var(--line2)", position: "relative", flex: "none", cursor: "pointer", transition: ".2s" }}
      title="Feed these structures into the AI thesis"
    >
      <span style={{ position: "absolute", top: 2.5, left: on ? 19 : 2.5, width: 18, height: 18, borderRadius: "50%", background: "#0c0f14", transition: ".2s" }} />
    </button>
    <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
      <b style={{ color: "var(--text)", fontSize: 13 }}>Send desk tools to the thesis</b>
      <div>
        {on
          ? <>Master switch is on — the next thesis run will reference: <span style={{ color: C.brass }}>{summary}</span>.</>
          : "Master switch — when on, the next thesis run factors in the options scenario you've enabled below."}
      </div>
    </div>
  </div>
);

/* ---------- Options pricing calculator ---------- */

const OptionsCalculator = ({ env, setEnv, opt, setOpt, onReset, live, feedOn = false, heading = null, showFeed = true, symbol = null, onPickTicker = null, pickExclude = null, thesis = null }) => {
  const { S, sigma, r, q, days, T } = resolveEnv(env, live);
  // Match-thesis affordance: only offered when the thesis on screen was generated for this same
  // instrument, so "Target" / "Invalidation" pulls the desk's own levels rather than a stale read.
  const thesisForSymbol = thesis && thesis._instrument === symbol ? thesis : null;
  const thesisTarget = thesisForSymbol ? parseFirstPrice(thesisForSymbol.levels?.upside) : null;
  const thesisInvalidation = thesisForSymbol ? parseFirstPrice(thesisForSymbol.levels?.downside) : null;
  const matchThesis = (type, level) => { setOpt("type", type); setOpt("strike", String(roundStrike(level))); setOpt("feed", true); };
  // Have any calculator inputs been changed from their defaults? Drives the Reset control.
  const DEF = DEFAULT_DESK_TOOLS;
  const inputsDirty =
    env.spot !== DEF.env.spot || env.sigmaPct !== DEF.env.sigmaPct || env.ratePct !== DEF.env.ratePct ||
    env.divPct !== DEF.env.divPct || env.days !== DEF.env.days ||
    opt.strike !== DEF.options.strike || opt.type !== DEF.options.type ||
    opt.marketPrice !== DEF.options.marketPrice || opt.feed !== DEF.options.feed;
  const K = numOr(opt.strike, roundStrike(S));
  const bs = blackScholes({ S, K, T, r, q, sigma, type: opt.type });
  const iv = impliedVol({ S, K, T, r, q, type: opt.type, marketPrice: opt.marketPrice });
  const valid = S > 0 && K > 0 && T > 0 && sigma > 0;
  const moneyness = K > 0 && S > 0 ? S / K : null;
  const itm = K < S ? (opt.type === "call" ? "in" : "out of") : K > S ? (opt.type === "call" ? "out of" : "in") : "at";

  return (
    <div>
      {heading && <div className="opt-leg-heading">{heading}</div>}
      <div className="grid g-2" style={{ alignItems: "start" }}>
      <Card
        icon={Calculator}
        title="Inputs"
        sub={`${live.cfg?.label || "—"} @ ${fmtNum(live.spot ?? 0, 2)} · auto-filled from the live feed — override any field`}
        tools={inputsDirty ? <button className="btn btn-ghost btn-sm" title="Reset all calculator inputs to defaults" onClick={onReset}><RotateCcw size={12} /> Reset</button> : null}
      >
        {onPickTicker && (
          <div className="lab-field" style={{ marginBottom: 14 }}>
            <span className="lab-label">Ticker</span>
            <InstrumentSelect value={symbol} onChange={onPickTicker} exclude={pickExclude} />
          </div>
        )}
        <div className="seg" style={{ marginBottom: 14 }}>
          {["call", "put"].map((ty) => (
            <button key={ty} className={opt.type === ty ? "on" : ""} onClick={() => setOpt("type", ty)}>{ty.toUpperCase()}</button>
          ))}
        </div>
        {(thesisTarget || thesisInvalidation) && (
          <div className="lab-field" style={{ marginBottom: 14 }}>
            <span className="lab-label">Match thesis</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {thesisTarget && (
                <button className="btn btn-sm" title="Price a call at the thesis's own upside target" onClick={() => matchThesis("call", thesisTarget)}>
                  Target {fmtNum(thesisTarget, 0)}
                </button>
              )}
              {thesisInvalidation && (
                <button className="btn btn-sm" title="Price a put at the thesis's own invalidation level" onClick={() => matchThesis("put", thesisInvalidation)}>
                  Invalidation {fmtNum(thesisInvalidation, 0)}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="grid g-3" style={{ gap: 10 }}>
          <NumField label="Spot" value={env.spot} placeholder={fmtNum(live.spot ?? 0, 2)} onChange={(v) => setEnv("spot", v)} />
          <NumField label="Strike" value={opt.strike} placeholder={fmtNum(roundStrike(S), 0)} onChange={(v) => setOpt("strike", v)} />
          <NumField label="Days" hint="to expiry" value={env.days} placeholder="30" onChange={(v) => setEnv("days", v)} />
          <NumField label="Impl vol" suffix="%" value={env.sigmaPct} placeholder={fmtNum(live.sigmaPct ?? 20, 1)} onChange={(v) => setEnv("sigmaPct", v)} />
          <NumField label="Rate" suffix="%" value={env.ratePct} placeholder={fmtNum(live.ratePct ?? 4.3, 2)} onChange={(v) => setEnv("ratePct", v)} />
          <NumField label="Div yld" suffix="%" value={env.divPct} placeholder="1.3" onChange={(v) => setEnv("divPct", v)} />
        </div>
        {live.isStock && !env.sigmaPct && (
          <div style={{ marginTop: 8, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
            VIX is index implied vol, not {live.cfg?.label}'s — enter {live.cfg?.label}'s own IV for accurate Greeks.
          </div>
        )}
        <div className="lab-field">
          <span className="lab-label">Implied vol solver</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input className="bd-in mono-in" style={{ textTransform: "none" }} type="number" inputMode="decimal" placeholder="market option price" value={opt.marketPrice} onChange={(e) => setOpt("marketPrice", e.target.value)} />
            <button className="btn btn-sm" disabled={iv == null} onClick={() => setEnv("sigmaPct", fmtNum(iv * 100, 2))} title="Use the solved IV above">Apply IV</button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12.5, color: C.muted }}>
            {opt.marketPrice
              ? iv != null
                ? <>Solved IV: <b style={{ color: C.brass }}>{fmtNum(iv * 100, 2)}%</b> — press Apply to price the Greeks at this vol.</>
                : "No solution — that price is outside the no-arbitrage bounds."
              : "Enter a quoted price to back out its implied volatility."}
          </div>
        </div>
        {showFeed && (
          <div className="lab-field" style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <button
              onClick={() => setOpt("feed", !opt.feed)}
              style={{ width: 38, height: 22, borderRadius: 22, border: "none", background: opt.feed ? C.brass : "var(--line2)", position: "relative", flex: "none", cursor: "pointer", transition: ".2s" }}
              title="Include this options scenario when feeding the thesis"
            >
              <span style={{ position: "absolute", top: 2.5, left: opt.feed ? 18 : 2.5, width: 17, height: 17, borderRadius: "50%", background: "#0c0f14", transition: ".2s" }} />
            </button>
            <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.45 }}>
              <b style={{ color: "var(--text)" }}>Add this scenario to the thesis</b> — includes this specific options scenario in the desk-tools bundle.
              {opt.feed && !feedOn && (
                <span style={{ color: C.brass }}> Turn on “Send desk tools to the thesis” above for this to apply.</span>
              )}
            </span>
          </div>
        )}
      </Card>

      <Card icon={Sigma} title="Theoretical value & Greeks" sub={`${opt.type.toUpperCase()} ${fmtNum(K, 0)} · ${days}d · IV ${fmtNum(sigma * 100, 1)}%`}>
        {!valid ? (
          <EmptyState icon={Calculator} title="Need a spot price" body="Sync the Market Pulse so the calculator can read a live spot, or type one into the Spot field." />
        ) : (
          <>
            <div className="grid g-3" style={{ gap: 10 }}>
              <ToolStat k="Theo price" v={fmtNum(bs.price, 2)} color={C.brass} sub={`${fmtUsd(bs.price * 100, 0)} / contract`} />
              <ToolStat k="Delta" v={fmtNum(bs.delta, 3)} sub="per $1 spot" />
              <ToolStat k="Gamma" v={fmtNum(bs.gamma, 4)} sub="Δ change / $1" />
              <ToolStat k="Theta" v={fmtNum(bs.theta, 2)} color={C.bear} sub="decay / day" />
              <ToolStat k="Vega" v={fmtNum(bs.vega, 2)} sub="per 1 vol pt" />
              <ToolStat k="Rho" v={fmtNum(bs.rho, 2)} sub="per 1% rate" />
            </div>
            <div style={{ marginTop: 13, fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
              Spot is <b style={{ color: "var(--text)" }}>{fmtNum((moneyness || 0) * 100, 1)}%</b> of strike — this {opt.type} is <b style={{ color: itm === "in" ? C.bull : itm === "out of" ? C.bear : C.brass }}>{itm}-the-money</b>.
              {" "}One contract controls {fmtUsd(S * 100, 0)} of notional.
            </div>
          </>
        )}
      </Card>
      </div>
    </div>
  );
};

/* ================================================================
   TAB — THESIS LAB
   ================================================================ */

const ThesisTab = ({ instrument, setInstrument, secondary, setSecondary, weights, setWeights, lean, setLean, risk, setRisk, notes, setNotes, persona, setPersona, thesis, onGenerate, onLogTrade, history, viewing, setViewing, onDeleteHist, anyData, deskTools, setDeskTools, market, news, points, onGoLibrary, notify }) => {
  const pillarScores = useMemo(() => computePillarFactorScores({ market, news, points }), [market, news, points]);
  // Nothing generated this session and nothing explicitly recalled — default to the most recent
  // archived thesis (newest-first) rather than an empty prompt, same unwrap as the Library's row click.
  const latestArchived = history.length ? (history[0]._type === "newsletter" ? (history[0]._thesis || history[0]) : history[0]) : null;
  const t = viewing || thesis.data || latestArchived;
  const biasColor = t?.bias === "bullish" ? C.bull : t?.bias === "bearish" ? C.bear : C.brass;
  // Up/down nav across the saved thesis archive (newest first), mirroring the newsletter reader.
  // Index 0 is the live latest — stepping onto it drops back to the live card (setViewing(null)).
  const navIdx = t?._id ? history.findIndex((e) => e._id === t._id) : -1;
  const goThesis = (delta) => {
    if (navIdx < 0) return;
    const next = history[navIdx + delta];
    if (!next) return;
    setViewing(thesis.data && next._id === thesis.data._id ? null : next);
  };
  // "Inputs changed — regenerate": compare the live controls against the inputs the displayed
  // thesis was actually generated from, so a stale output after tweaking a control is signalled.
  const inputSig = (o) => JSON.stringify({
    instrument: o.instrument, secondary: o.secondary || "",
    weights: o.weights, lean: o.lean, risk: o.risk, notes: (o.notes || "").trim(), persona: o.persona || DEFAULT_PERSONA,
  });
  const currentSig = inputSig({ instrument, secondary, weights, lean, risk, notes, persona });
  const thesisSig = thesis.data
    ? inputSig({ instrument: thesis.data._instrument, secondary: thesis.data.secondary, weights: thesis.data._weights, lean: thesis.data._lean, risk: thesis.data._risk, notes: thesis.data._notes, persona: thesis.data._persona })
    : null;
  const inputsDirty = !viewing && thesis.status === "ready" && !!thesis.data && currentSig !== thesisSig;
  const activeInstrument = thesisInstrumentConfig(instrument);
  const [toolView, setToolView] = usePersistentState("overwatch:thesis:toolview", "synthesis");
  // Thesis Lab sub-nav. Synthesis leads: it's the tab's core job and the default landing view, so the
  // first tab, the default, and the primary CTA all line up. Algo Lab sits last — standalone research
  // that doesn't feed the thesis.
  const TOOL_TABS = [
    { id: "synthesis", label: "Synthesis", Icon: Sparkles },
    { id: "options", label: "Options Calc", Icon: Calculator },
    { id: "algo", label: "Algo Lab", Icon: Bot },
  ];
  const toolSeg = (
    <div className="seg" style={{ maxWidth: 720 }}>
      {TOOL_TABS.map((t) => (
        <button key={t.id} className={toolView === t.id ? "on" : ""} onClick={() => setToolView(t.id)}>
          <t.Icon size={13} /> {t.label}
        </button>
      ))}
    </div>
  );
  const [copied, setCopied] = useState(false);
  const copyThesis = (thesisObj) => {
    const text = buildThesisText(thesisObj);
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {});
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch {}
      document.body.removeChild(ta);
    }
  };
  const [shareState, setShareState] = useState("idle"); // idle | saving | done | error
  const shareThesis = async (thesisObj) => {
    setShareState("saving");
    try {
      const { url } = await callDesk("saveshared", undefined, { html: buildThesisPrintHTML(thesisObj) });
      const full = `${window.location.origin}${url}`;
      try { await navigator.clipboard?.writeText(full); } catch {}
      setShareState("done");
      setTimeout(() => setShareState("idle"), 2200);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2600);
    }
  };

  const live = deskLiveContext(market, points, instrument);
  const hasSecondary = !!(secondary && secondary !== instrument);
  const live2 = hasSecondary ? deskLiveContext(market, points, secondary) : null;
  // Spot and IV are instrument-specific — clear any prior overrides when the focus changes so the
  // Options/Hedge tools re-derive from the new instrument's live feed instead of carrying a stale value.
  useEffect(() => {
    setDeskTools((d) => (d.env.spot === "" && d.env.sigmaPct === "") ? d : ({ ...d, env: { ...d.env, spot: "", sigmaPct: "" } }));
  }, [instrument, setDeskTools]);
  // Same for the secondary leg's calculator environment.
  useEffect(() => {
    setDeskTools((d) => (d.env2.spot === "" && d.env2.sigmaPct === "") ? d : ({ ...d, env2: { ...d.env2, spot: "", sigmaPct: "" } }));
  }, [secondary, setDeskTools]);
  const setEnv = (k, val) => setDeskTools((d) => ({ ...d, env: { ...d.env, [k]: val } }));
  const setOpt = (k, val) => setDeskTools((d) => ({ ...d, options: { ...d.options, [k]: val } }));
  const setEnv2 = (k, val) => setDeskTools((d) => ({ ...d, env2: { ...d.env2, [k]: val } }));
  const setOpt2 = (k, val) => setDeskTools((d) => ({ ...d, options2: { ...d.options2, [k]: val } }));
  // Reset the options calculator's inputs (shared pricing environment + option fields) to defaults,
  // which also restores the auto-fill-from-live-feed behavior for spot/IV/rate.
  const resetOptionsCalc = () => setDeskTools((d) => ({ ...d, env: { ...DEFAULT_DESK_TOOLS.env }, options: { ...DEFAULT_DESK_TOOLS.options } }));
  const resetOptionsCalc2 = () => setDeskTools((d) => ({ ...d, env2: { ...DEFAULT_DESK_TOOLS.env2 }, options2: { ...DEFAULT_DESK_TOOLS.options2 } }));
  const setFeed = (on) => setDeskTools((d) => ({ ...d, feedToThesis: on }));
  const feedSummary = deskTools.options.feed ? "options scenario" : "nothing yet — toggle the options scenario";
  const weightSum = Math.round(FACTORS.reduce((s, f) => s + (Number(weights[f.key]) || 0), 0));
  // Once a thesis is on the tape (or one is loading / errored), split into controls-left + output-right.
  // Before that, the controls ride consolidated across the top instead of leaving a big empty pane.
  const showSplit = !!t || thesis.status === "loading" || thesis.status === "error";

  if (toolView !== "synthesis") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {toolSeg}
        {toolView === "options" && <FeedToggle on={deskTools.feedToThesis} onToggle={setFeed} summary={feedSummary} />}
        {toolView === "algo" && (
          <>
            <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 15px" }}>
              <Bot size={14} color={C.brass} />
              <span style={{ fontSize: 12.5, color: C.muted }}>
                Standalone research — the Algo Lab backtests and monitors your scalper independently; it is not fed into the thesis synthesis.
              </span>
            </div>
            <StrategyLabTab notify={notify} />
          </>
        )}
        {toolView === "options" && (
          hasSecondary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <OptionsCalculator env={deskTools.env} setEnv={setEnv} opt={deskTools.options} setOpt={setOpt} onReset={resetOptionsCalc} live={live} feedOn={deskTools.feedToThesis} heading={`Primary · ${live.cfg?.label || activeInstrument.name}`} symbol={instrument} onPickTicker={setInstrument} pickExclude={secondary} thesis={t} />
              <OptionsCalculator env={deskTools.env2} setEnv={setEnv2} opt={deskTools.options2} setOpt={setOpt2} onReset={resetOptionsCalc2} live={live2} heading={`Secondary · ${live2.cfg?.label || secondary}`} showFeed={false} symbol={secondary} onPickTicker={setSecondary} pickExclude={instrument} />
            </div>
          ) : (
            <OptionsCalculator env={deskTools.env} setEnv={setEnv} opt={deskTools.options} setOpt={setOpt} onReset={resetOptionsCalc} live={live} feedOn={deskTools.feedToThesis} symbol={instrument} onPickTicker={setInstrument} thesis={t} />
          )
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {toolSeg}
      {deskTools.feedToThesis && (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 15px" }}>
          <Scale size={14} color={C.brass} />
          <span style={{ fontSize: 12.5, color: C.muted }}>
            Desk tools are feeding the synthesis — {feedSummary} will be referenced in the next thesis run.
          </span>
        </div>
      )}
    <div className={showSplit ? "grid g-thesis" : "grid g-thesis-top"} style={{ alignItems: "start" }}>
      {/* controls — stacked sidebar once a thesis is up, 3-up band across the top when idle */}
      <div style={showSplit ? { display: "flex", flexDirection: "column", gap: 14 } : { display: "contents" }}>
        <Card
          icon={FlaskConical}
          title="Pillar weights"
          sub={`Drag the points — fixed 100-point budget, raising one pillar pulls equally from the rest (max ${MAX_PILLAR}% each)`}
          tools={<button className="btn btn-ghost btn-sm" title="Reset to an even split" onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}><RotateCcw size={12} /> Even</button>}
        >
          <FactorRadarChart weights={weights} onChange={setWeights} scores={pillarScores} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <span className="lab-label" style={{ margin: 0 }}>Allocated</span>
            <span className="mono" style={{ fontSize: 12, color: weightSum === WEIGHT_TOTAL ? C.brass : C.bear }}>{weightSum} / {WEIGHT_TOTAL}</span>
          </div>
          <div style={{ marginTop: 9, paddingTop: 9, borderTop: "1px dashed var(--line)", fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
            Pillars read the <b style={{ color: "var(--text)" }}>broad-market regime</b> (tape, breadth, VIX, flows, calendar) — the focus instrument sets the levels and execution proxy, not the pillar scores.
          </div>
        </Card>
        <Card icon={NotebookPen} title="Instrument focus" sub="Choose which instrument the thesis is built for">
          <InstrumentSelect value={instrument} onChange={setInstrument} />
          <div style={{ marginTop: 12, fontSize: 12.5, color: C.muted }}>
            Primary build target: <span style={{ color: "var(--text)" }}>{activeInstrument.name}</span>
            {activeInstrument.futures !== activeInstrument.symbol && (
              <> with {activeInstrument.futures} as the {activeInstrument.group === "stock" ? "index hedge" : "live execution"} proxy</>
            )}.
            {activeInstrument.group === "stock" && <> Single stock — priced live for the lab tools (kept off the Market Pulse grid).</>}
          </div>
          <div className="lab-field">
            <span className="lab-label">Pair with — optional relative-value leg</span>
            <InstrumentSelect value={secondary === instrument ? "" : secondary} onChange={setSecondary} noneLabel="None — single-instrument thesis" />
            {secondary && secondary !== instrument && (
              <div style={{ marginTop: 8, fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>
                Adds a relative-value read ({activeInstrument.symbol} vs {thesisInstrumentConfig(secondary).symbol}) to the thesis. The primary call stays built for {activeInstrument.symbol}.
              </div>
            )}
          </div>
        </Card>
        <Card icon={Crosshair} title="Desk stance">
          <span className="lab-label">Desk lead — whose psychology and strategy write the call</span>
          <select className="bd-in" value={persona} onChange={(e) => setPersona(e.target.value)}>
            {Object.entries(PERSONAS).map(([id, p]) => (
              <option key={id} value={id}>{p.name}</option>
            ))}
          </select>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 7, marginBottom: 14, lineHeight: 1.5 }}>
            {(PERSONAS[persona] || PERSONAS[DEFAULT_PERSONA]).style}
          </div>
          <span className="lab-label">Directional lean</span>
          <div className="seg">
            {["auto", "bull", "neutral", "bear"].map((l) => (
              <button key={l} className={`${lean === l ? "on" : ""} ${l === "bull" ? "sg-bull" : l === "bear" ? "sg-bear" : ""}`} onClick={() => setLean(l)}>
                {l === "auto" ? "Let data decide" : l}
              </button>
            ))}
          </div>
          {lean !== "auto" && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 7, lineHeight: 1.5 }}>
              Your lean is a tiebreaker layered on top of the weighted data — it tilts the score, but the desk will push back and flag the conflict if the pillars disagree.
            </div>
          )}
          <div className="lab-field">
            <span className="lab-label">Desk notes — fed into the synthesis</span>
            <textarea className="bd-ta" placeholder="e.g. TD Sequential 9 printed on the daily. Respecting 2-hr max hold today." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className={`btn btn-brass${inputsDirty ? " btn-dirty" : ""}`} style={{ width: "100%", justifyContent: "center", marginTop: 15, padding: "12px" }} onClick={onGenerate} disabled={thesis.status === "loading" || !anyData} title={!anyData ? "Sync data first" : inputsDirty ? "Inputs changed since the last run" : ""}>
            {thesis.status === "loading"
              ? <><RefreshCw size={15} className="spin" /> Synthesizing…</>
              : inputsDirty
                ? <><RefreshCw size={15} /> Regenerate — inputs changed</>
                : t ? <><Sparkles size={15} /> Regenerate thesis</> : <><Sparkles size={15} /> Generate today's thesis</>}
          </button>
          {!anyData && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 9, textAlign: "center" }}>Sync at least one data module first — the desk won't call a bias blind.</div>}
        </Card>
      </div>

      {/* output — only once a thesis exists / is loading / errored */}
      {showSplit && (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {viewing && (
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 15px" }}>
            <History size={14} color={C.brass} />
            <span style={{ fontSize: 12.5, color: C.muted }}>Viewing archived thesis — {archiveStamp(viewing)}</span>
            <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {onGoLibrary && <button className="btn btn-sm" onClick={onGoLibrary}><History size={13} /> Back to library</button>}
              <button className="btn btn-sm" onClick={() => setViewing(null)}>Back to latest</button>
            </span>
          </div>
        )}
        {thesis.status === "error" && !t && <ErrBlock msg={thesis.error} onRetry={onGenerate} />}
        {thesis.status === "loading" && !t && (
          <div className="th-hero"><LoadingBlock lines={4} msg="Weighing pillars, stress-testing the lean, writing the call…" /></div>
        )}
        {t && (
          <>
            <div className="th-hero">
              {history.length > 1 && navIdx >= 0 && (
                <div className="th-nav">
                  <span className="th-nav-pos">{navIdx + 1} / {history.length}</span>
                  <button className="btn btn-ghost btn-sm" disabled={navIdx <= 0} onClick={() => goThesis(-1)} title="Newer thesis"><ChevronUp size={15} /></button>
                  <button className="btn btn-ghost btn-sm" disabled={navIdx >= history.length - 1} onClick={() => goThesis(1)} title="Older thesis"><ChevronDown size={15} /></button>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 230 }}>
                  <div className="th-bias" style={{ color: biasColor, textShadow: `0 0 28px ${biasColor}44` }}>{(t.bias || "").toUpperCase()}</div>
                  <div className="th-head">"{t.headline}"</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-end" }}>
                  <span className="chip">{(t.instrument || instrument)} FOCUS</span>
                  <span
                    className="chip"
                    style={{ color: biasColor, borderColor: biasColor + "66" }}
                    title="Score — the signed weighted total across the five pillars (sign = direction, magnitude = strength, roughly -100…+100). Separate from Conviction (0–10), which measures how much the pillars agree."
                  >SCORE {fmtSigned(t.score, 0)}</span>
                  <ConvictionPips n={t.conviction || 0} bias={t.bias} />
                </div>
              </div>
              <BiasSpectrum score={t.score} />
              {t.stance && Number.isFinite(t.stance.baseScore) && t.stance.baseScore !== t.score && (
                <div style={{ marginTop: 6, fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".02em" }}>
                  Pillar base {fmtSigned(t.stance.baseScore, 1)} → {fmtSigned(t.score, 0)} after desk stance
                </div>
              )}
              <div className="th-summary">{t.summary}</div>
              {(t.deskRead || t.jackRead) && (
                <div className="th-pairread th-jackread">
                  <b><UserRound size={12} /> {t._personaName || "Jack"}'s read</b>
                  <span>{t.deskRead || t.jackRead}</span>
                </div>
              )}
              {t.pairRead && (
                <div className="th-pairread">
                  <b><Scale size={12} /> Pair read{t.secondary ? ` · ${t.instrument || instrument} vs ${t.secondary}` : ""}</b>
                  <span>{t.pairRead}</span>
                </div>
              )}
              {(t.timingNote || t.timestamp || t._generatedAt) && (
                <div className="timing-note">
                  <b>Timing context</b>
                  {t.timingNote || `${t.timestamp || t._generatedAt} · Quote snapshot ${t._quoteAsOf || "timestamp unavailable"}`}
                </div>
              )}
              {(t._deskStructures || []).length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div className="lab-label" style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
                    <Scale size={12} color={C.brass} /> Structures fed into this call
                  </div>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {t._deskStructures.map((s, i) => (
                      <span className="chip" key={i} style={{ textTransform: "none", letterSpacing: 0, fontSize: 10.5, borderColor: C.brass + "66", color: C.brass }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid g-2">
              <Card title="Bull case" icon={TrendingUp}>
                <ul className="case-list case-bull">{(t.bullCase || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
              </Card>
              <Card title="Bear case" icon={TrendingDown}>
                <ul className="case-list case-bear">{(t.bearCase || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
              </Card>
            </div>
            <Card title="Levels that matter" icon={Crosshair} sub="Action level, targets up & down">
              <div className="grid g-3">
                <div className="metric"><span className="metric-k" style={{ color: C.brass }}>Action level</span><span className="metric-note" style={{ color: "var(--text)", fontSize: 12.5 }}>{t.levels?.action || "—"}</span></div>
                <div className="metric"><span className="metric-k" style={{ color: C.bull }}>Upside</span><span className="metric-note" style={{ color: "var(--text)", fontSize: 12.5 }}>{t.levels?.upside || "—"}</span></div>
                <div className="metric"><span className="metric-k" style={{ color: C.bear }}>Downside</span><span className="metric-note" style={{ color: "var(--text)", fontSize: 12.5 }}>{t.levels?.downside || "—"}</span></div>
              </div>
              <div style={{ marginTop: 13, fontSize: 13, lineHeight: 1.7 }}>
                <span className="chip b-info" style={{ marginRight: 9 }}>GAME PLAN</span>{t.gamePlan}
              </div>
            </Card>
            {(t._tradeStructures || []).length > 0 && <TradeStructureCard structures={t._tradeStructures} bias={t.bias} />}
            <TradeLogCard key={t._id || "trade"} entry={t} onLogTrade={onLogTrade} />
            <div className="grid g-2">
              <div className="guard g-red"><b><AlertTriangle size={12} /> Thesis invalidation</b>{t.invalidation}</div>
              <div className="guard g-amber"><b><Shield size={12} /> Stand-aside conditions</b>{t.standAside}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => copyThesis(t)} title="Copy thesis as text">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
              <button className="btn" onClick={() => shareThesis(t)} disabled={shareState === "saving"} title="Create a shareable link">
                {shareState === "saving" ? <><RefreshCw size={14} className="spin" /> Saving…</>
                  : shareState === "done" ? <><Check size={14} /> Link copied</>
                    : shareState === "error" ? <><AlertTriangle size={14} /> Failed</>
                      : <><Share2 size={14} /> Share</>}
              </button>
              <button className="btn" onClick={() => downloadPDF(buildThesisPrintHTML(t), `overwatch-thesis-${t._date || t.instrument || "today"}.pdf`)} title="Download thesis as PDF">
                <FileText size={14} /> Download PDF
              </button>
            </div>
          </>
        )}

      </div>
      )}
    </div>
    {!showSplit && (
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 15px" }}>
        <FlaskConical size={14} color={C.brass} />
        <span style={{ fontSize: 12.5, color: C.muted }}>
          No thesis on the tape yet — set your pillar weights and stance above, then hit <b style={{ color: "var(--text)" }}>Generate today's thesis</b>. The desk weighs live prices, headlines and internals into one directional call.
        </span>
      </div>
    )}
    </div>
  );
};

const buildThesisText = (t) => {
  if (!t) return "";
  const lines = [
    `OVERWATCH THESIS — ${t.instrument || "SPX"}${t._date ? ` — ${t._date}` : ""}`,
    `Bias: ${(t.bias || "—").toUpperCase()} · Score ${fmtSigned(t.score, 0)} · Conviction ${t.conviction ?? "—"}/10`,
    t.headline ? `\n"${t.headline}"` : "",
    t.summary ? `\n${t.summary}` : "",
  ];
  if (t.deskRead || t.jackRead) lines.push(`\n${(t._personaName || "JACK").toUpperCase()}'S READ\n${t.deskRead || t.jackRead}`);
  if ((t.bullCase || []).length) lines.push(`\nBULL CASE\n${t.bullCase.map((b) => `• ${b}`).join("\n")}`);
  if ((t.bearCase || []).length) lines.push(`\nBEAR CASE\n${t.bearCase.map((b) => `• ${b}`).join("\n")}`);
  const lv = t.levels || {};
  if (lv.action || lv.upside || lv.downside) {
    lines.push(`\nLEVELS\nAction: ${lv.action || "—"}\nUpside: ${lv.upside || "—"}\nDownside: ${lv.downside || "—"}`);
  }
  if (t.gamePlan) lines.push(`\nGAME PLAN\n${t.gamePlan}`);
  if (t.invalidation) lines.push(`\nInvalidation: ${t.invalidation}`);
  if (t.standAside) lines.push(`Stand-aside: ${t.standAside}`);
  lines.push(`\n— Overwatch Daily Bias Desk · verify levels independently · not financial advice`);
  return lines.filter((l) => l !== "").join("\n");
};

const buildThesisPrintHTML = (t) => {
  if (!t) return "";
  const biasColor = t.bias === "bullish" ? "#22c55e" : t.bias === "bearish" ? "#ef4444" : "#c9a84c";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Overwatch Thesis — ${t._date || t.instrument || ""}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#111;background:#fff;padding:32px 48px;max-width:800px;margin:0 auto}
    h1{font-size:22px;letter-spacing:.04em;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;border-bottom:3px solid #111;padding-bottom:8px;margin-bottom:6px}
    .meta{font-size:11px;color:#555;margin-bottom:18px;font-family:Arial,sans-serif;letter-spacing:.02em}
    .bias{font-size:32px;font-weight:900;letter-spacing:.08em;color:${biasColor};font-family:'Helvetica Neue',Arial,sans-serif}
    h2{font-size:14px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;margin:18px 0 6px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #ddd;padding-bottom:3px}
    p{margin-bottom:10px;line-height:1.65}
    ul{margin:6px 0 10px 18px;line-height:1.7}
    table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11.5px}
    th{background:#f0f0f0;padding:5px 8px;text-align:left;font-family:Arial,sans-serif;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em}
    td{padding:4px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top}
    td.lbl{width:140px;color:#555;font-family:Arial,sans-serif;font-size:11px;font-weight:600}
    .headline{font-size:18px;font-style:italic;margin:10px 0 14px;line-height:1.4}
    .callout{background:#f8f8f8;border-left:3px solid #c9a84c;padding:10px 14px;margin:12px 0;font-size:12px;line-height:1.6}
    .bull{color:#16a34a}.bear{color:#dc2626}
    .guard{padding:8px 12px;margin:6px 0;border-left:3px solid #999;font-size:12px;background:#fafafa}
    .guard.red{border-color:#dc2626}.guard.amber{border-color:#d97706}
    .footer{margin-top:28px;padding-top:10px;border-top:1px solid #ccc;font-size:10px;color:#777;font-family:Arial,sans-serif}
    @media print{body{padding:20px 30px}.bias{font-size:26px}}
  </style></head><body>
    <h1>OVERWATCH DAILY THESIS</h1>
    <div class="meta">${t._date || ""} &nbsp;·&nbsp; Instrument: <b>${t.instrument || "SPX"}</b> &nbsp;·&nbsp; Score: <b style="color:${biasColor}">${t.score >= 0 ? "+" : ""}${t.score ?? 0}</b> &nbsp;·&nbsp; Conviction ${t.conviction ?? "—"}/10 &nbsp;·&nbsp; ${t.timestamp || t._generatedAt || ""}</div>
    <div class="bias">${(t.bias || "—").toUpperCase()}</div>
    <div class="headline">"${t.headline}"</div>
    <p>${t.summary || ""}</p>

    ${(t.deskRead || t.jackRead) ? `<div class="callout"><b>${t._personaName || "Jack"}'s read:</b> ${t.deskRead || t.jackRead}</div>` : ""}

    ${(t._deskStructures || []).length ? `<div class="callout"><b>Structures fed into this call:</b> ${t._deskStructures.join(" &nbsp;·&nbsp; ")}</div>` : ""}

    ${(t.drivers || []).length ? `<div class="callout"><b>Key drivers:</b> ${t.drivers.join(" · ")}</div>` : ""}

    ${(t.bullCase || []).length ? `
    <h2>Bull case</h2>
    <ul class="bull">${t.bullCase.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}

    ${(t.bearCase || []).length ? `
    <h2>Bear case</h2>
    <ul class="bear">${t.bearCase.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}

    <h2>Levels that matter</h2>
    <table><tbody>
      ${t.levels?.action ? `<tr><td class="lbl">Action level</td><td>${t.levels.action}</td></tr>` : ""}
      ${t.levels?.upside ? `<tr><td class="lbl">Upside target</td><td>${t.levels.upside}</td></tr>` : ""}
      ${t.levels?.downside ? `<tr><td class="lbl">Downside target</td><td>${t.levels.downside}</td></tr>` : ""}
      ${t.gamePlan ? `<tr><td class="lbl">Game plan</td><td>${t.gamePlan}</td></tr>` : ""}
    </tbody></table>

    <div class="guard red"><b>Thesis invalidation:</b> ${t.invalidation || "—"}</div>
    <div class="guard amber"><b>Stand-aside conditions:</b> ${t.standAside || "—"}</div>

    <div class="footer">Overwatch Daily Bias Desk &nbsp;·&nbsp; Live public market data + optional AI synthesis &nbsp;·&nbsp; Verify before trading &nbsp;·&nbsp; Not financial advice</div>
  </body></html>`;
};

const downloadPDF = (html, filename) => {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
};

/* ================================================================
   TAB — ARCHIVES
   ================================================================ */

/* ----------------------------------------------------------------
   ACADEMY — curated educational videos (YouTube unlisted embeds)

   To add a lesson: upload the HeyGen export to YouTube as *Unlisted*,
   copy the video ID from the share URL (the part after `?v=` or after
   `youtu.be/`), and paste it into `embedId` below. Leave `embedId` empty
   to show the lesson as a "Coming soon" placeholder tile.
   ---------------------------------------------------------------- */
const ACADEMY_MODULES = [
  {
    id: "desk-school",
    title: "Desk School with Jack",
    level: "Literacy",
    summary: "The vocabulary the dashboard assumes you know — taught from the ground up.",
    videos: [
      { id: "a1", title: "Stock Market Liquidity", summary: "Bid/ask, spread, the order book, depth, slippage and volume — the foundation for reading levels and fills.", durationSec: 0, embedId: "UxdQCZNIJFk", tags: ["liquidity"] },
      { id: "a2", title: "What Is a “Daily Bias”?", summary: "Bullish, neutral, bearish — why pros set a directional bias pre-market. It's the desk's core output: the Daily Bias score.", durationSec: 0, embedId: "", tags: ["bias"] },
      { id: "a3", title: "Market Regimes & the VIX", summary: "Calm / Normal / Elevated / Stress, volatility, and risk-on vs risk-off — what powers the Current Regime read and the VIX tile.", durationSec: 0, embedId: "", tags: ["volatility"] },
      { id: "a4", title: "Support, Resistance & Pivots", summary: "Key levels, pivots, and how an “action level” is set — the backbone of the level map and the PIVOT timeframe.", durationSec: 0, embedId: "", tags: ["levels"] },
      { id: "a5", title: "The Instruments That Move Markets", summary: "ES/NQ/YM, the Dollar Index, the 10-Year yield, Gold, WTI and Bitcoin — and how they interrelate (intermarket). The whole Market Pulse grid.", durationSec: 0, embedId: "", tags: ["intermarket"] },
      { id: "a6", title: "Macro Drivers & Event Risk", summary: "CPI, FOMC, NFP — why the calendar dictates the day. Feeds the Calendar tab and the Event Risk lens.", durationSec: 0, embedId: "", tags: ["macro"] },
      { id: "a7", title: "Sentiment & Positioning (Flows)", summary: "Sentiment gauges, flow proxies and contrarian reads — the Sentiment and Positioning/Flows lenses.", durationSec: 0, embedId: "", tags: ["sentiment"] },
      { id: "a8", title: "Risk Appetite: Risk-On vs Risk-Off", summary: "How capital rotates and how to read cross-asset signals — the risk-appetite radar.", durationSec: 0, embedId: "", tags: ["risk"] },
      { id: "a9", title: "Building Conviction", summary: "What conviction means, the factors that score it, and when to size up vs stand aside — the Score · Conviction /10 mechanic.", durationSec: 0, embedId: "", tags: ["conviction"] },
    ],
  },
  {
    id: "using-overwatch",
    title: "Using Overwatch",
    level: "Walkthrough",
    summary: "Product walkthroughs — how to actually drive the desk.",
    videos: [
      { id: "b1", title: "Overwatch in 90 Seconds", summary: "The elevator pitch — what the desk does and who it's for.", durationSec: 0, embedId: "", tags: ["overview"] },
      { id: "b2", title: "The Morning Routine", summary: "The full pipeline: sync data → call the bias → build the thesis → publish the note.", durationSec: 0, embedId: "", tags: ["workflow"] },
      { id: "b3", title: "Market Pulse Deep-Dive", summary: "Reading the instrument grid, the sessions (pre-market / open / after-hours) and Prev / 1W / 1M / Pivot.", durationSec: 0, embedId: "", tags: ["market-pulse"] },
      { id: "b4", title: "Inside the Thesis Lab", summary: "Turning the five lenses into a structured thesis and game plan.", durationSec: 0, embedId: "", tags: ["thesis"] },
      { id: "b5", title: "Publishing the Morning Note", summary: "The newsletter output and how desk notes feed the synthesis.", durationSec: 0, embedId: "", tags: ["newsletter"] },
    ],
  },
  {
    id: "on-the-desk",
    title: "On the Desk",
    level: "Capstone",
    summary: "The applied finale — literacy meets product in a real session.",
    videos: [
      { id: "c1", title: "A Day on the Overwatch Desk", summary: "Jack runs a real morning end-to-end, tying the literacy back to the product.", durationSec: 0, embedId: "", tags: ["capstone"] },
    ],
  },
];

const fmtVideoDuration = (seconds) => {
  const n = Number(seconds) || 0;
  if (n <= 0) return null;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const AcademyCard = () => {
  const [open, setOpen] = usePersistentState("overwatch:sec:academy", false); // collapsed by default
  const [active, setActive] = useState(null);
  // Only the "On the Desk" capstone has its coming-soon (unpublished) videos stripped; every other
  // section keeps its roadmap tiles.
  const modules = ACADEMY_MODULES.map((mod) =>
    mod.id === "on-the-desk" ? { ...mod, videos: (mod.videos || []).filter((v) => v.embedId) } : mod
  );
  const allVideos = modules.flatMap((mod) => mod.videos || []);
  const readyCount = allVideos.filter((v) => v.embedId).length;
  const totalCount = allVideos.length || 1;
  const pctReady = Math.round((readyCount / totalCount) * 100);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <Card
      icon={GraduationCap}
      title="Academy"
      sub="Educational trading videos — produced in-house"
      tools={<span className="chip b-brass" style={{ fontSize: 10 }} title="Lessons published so far">{readyCount}/{totalCount} live</span>}
      collapsible
      open={open}
      onToggle={() => setOpen((o) => !o)}
    >
      {open && (<>
      <div style={{ marginBottom: 14 }}>
        <div className="academy-progress"><span style={{ width: `${pctReady}%` }} /></div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>
          {readyCount} of {totalCount} lessons published — the curriculum below fills in as new videos drop.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {modules.map((mod) => (
          <div key={mod.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, flexWrap: "wrap" }}>
              <span className="disp" style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{mod.title}</span>
              {mod.level && <span className="chip b-brass" style={{ fontSize: 10 }}>{mod.level}</span>}
              {mod.summary && <span style={{ fontSize: 11.5, color: C.muted }}>{mod.summary}</span>}
            </div>
            <div className="academy-grid">
              {(mod.videos || []).map((v, vi) => {
                const ready = !!v.embedId;
                const thumb = ready ? `https://img.youtube.com/vi/${v.embedId}/hqdefault.jpg` : null;
                const dur = fmtVideoDuration(v.durationSec);
                return (
                  <button
                    key={v.id}
                    className={`academy-card${ready ? "" : " coming"}`}
                    onClick={() => ready && setActive(v)}
                    disabled={!ready}
                    title={ready ? v.title : "Coming soon"}
                  >
                    <span className="academy-thumb" style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}>
                      <span className="academy-ep">{String(vi + 1).padStart(2, "0")}</span>
                      {ready ? <PlayCircle size={34} className="academy-play" /> : <span className="academy-soon"><Lock size={11} /> Coming soon</span>}
                      {dur && <span className="academy-dur">{dur}</span>}
                    </span>
                    <span className="academy-title">{v.title}</span>
                    {v.summary && <span className="academy-sub">{v.summary}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </>)}

      {active && (
        <div className="academy-modal" onClick={() => setActive(null)}>
          <div className="academy-modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="academy-modal-head">
              <span className="disp" style={{ fontWeight: 600, fontSize: 15 }}>{active.title}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setActive(null)} title="Close"><X size={16} /></button>
            </div>
            <div className="academy-player">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${active.embedId}?autoplay=1&rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {active.summary && <div style={{ padding: "12px 16px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{active.summary}</div>}
          </div>
        </div>
      )}
    </Card>
  );
};

// Per-type identity for Jacks Journal rows: a distinct icon + color so the wrap / pre-market /
// prediction-market entries are scannable at a glance instead of all reading as the same chip.
const JOURNAL_TYPE_META = {
  premarket: { Icon: Sun, color: "#E0A93C" },        // morning / pre-market — amber
  wrap: { Icon: Moon, color: "#8B7CF6" },            // end-of-day wrap — violet
  predmarkets: { Icon: TrendingUp, color: "#2DD4BF" }, // prediction markets — teal
  thesis: { Icon: Sparkles, color: "#3B82F6" },      // daily thesis — blue
};
const journalTypeMeta = (type) =>
  JOURNAL_TYPE_META[String(type || "wrap").toLowerCase()] || { Icon: Mail, color: "var(--muted)" };

// Reactive desktop check (matchMedia) — drives how many library rows show collapsed.
const useIsDesktop = (bp = 768) => {
  const [desk, setDesk] = useState(() => (typeof window === "undefined" ? true : window.innerWidth >= bp));
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${bp}px)`);
    const on = () => setDesk(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [bp]);
  return desk;
};

// Only this account can delete Jacks Journal entries — it's a shared cloud archive (every signed-in
// user reads the same list via /api/archive), so unlike the per-user watchlist/thesis library this
// isn't gated on "signed in", it's gated on WHO. The server enforces the same check independently
// (api/archive/delete.js) — this is just what shows the control.
const JOURNAL_ADMIN_EMAIL = "malachuk@gmail.com";

const CloudNewsletterList = ({ inSplit = false, auth = null }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Persist the open newsletter so a refresh reopens the reader instead of dumping you back to the list.
  const [previewId, setPreviewId] = usePersistentState("overwatch:journal:open", null);
  const [expanded, setExpanded] = useState(false);
  const isDesktop = useIsDesktop();
  const collapsedCount = isDesktop ? 7 : 3;
  const canDelete = auth?.email && auth.email.toLowerCase() === JOURNAL_ADMIN_EMAIL;
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const deleteEntry = async (id, e) => {
    e.stopPropagation();
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId((cur) => (cur === id ? null : cur)), 4000);
      return;
    }
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      const token = await auth.getToken();
      const res = await fetch("/api/archive/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        setPreviewId((cur) => (cur === id ? null : cur));
      }
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetch("/api/archive?limit=50")
      .then((r) => r.json())
      .then((r) => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reader overlay: Esc closes, ← / → move between letters; lock background scroll while open.
  useEffect(() => {
    if (!previewId) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setPreviewId(null); return; }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const i = items.findIndex((x) => x.id === previewId);
        const n = items[i + (e.key === "ArrowRight" ? 1 : -1)];
        if (n) setPreviewId(n.id);
      }
    };
    window.addEventListener("keydown", onKey);
    // only lock background scroll for the full-screen overlay; the in-pane reader leaves the page scrollable
    if (!inSplit) document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [previewId, items, inSplit]);

  if (loading) return <div style={{ color: C.muted, fontSize: 12.5, padding: "8px 0" }}>Loading cloud newsletters…</div>;
  if (!items.length) return <div style={{ color: C.muted, fontSize: 12.5 }}>No automated newsletters archived yet.</div>;

  const biasColor = (b) => b?.includes("bullish") ? C.bull : b?.includes("bearish") ? C.bear : C.brass;
  const rowDate = (sentAt) => `${new Date(sentAt).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" })} ${new Date(sentAt).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" })}`;
  const filtered = items;
  const effectiveExpanded = expanded;
  // Desktop scrolls the full archive inside a fixed-height pane; mobile keeps the show-more collapse.
  const showAll = isDesktop || effectiveExpanded;
  const shown = showAll ? filtered : filtered.slice(0, collapsedCount);

  // Reader navigation runs over the full archive (newest first).
  const current = previewId ? items.find((i) => i.id === previewId) : null;
  const idx = current ? items.findIndex((i) => i.id === previewId) : -1;
  const go = (delta) => { const n = items[idx + delta]; if (n) setPreviewId(n.id); };

  const reader = current ? (
    <>
      <div className="nl-reader-head">
        <Mail size={15} style={{ opacity: 0.6, flex: "none" }} />
        <div className="nl-reader-title">
          <span className="nl-reader-name">{current.title || "Newsletter"}</span>
          <span className="nl-reader-date">{rowDate(current.sentAt)}{current.instrument ? ` · ${current.instrument}` : ""}</span>
        </div>
        <div className="nl-reader-nav">
          <button className="btn btn-ghost btn-sm" disabled={idx <= 0} onClick={() => go(-1)} title="Newer (←)"><ChevronUp size={15} /></button>
          <button className="btn btn-ghost btn-sm" disabled={idx < 0 || idx >= items.length - 1} onClick={() => go(1)} title="Older (→)"><ChevronDown size={15} /></button>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setPreviewId(null)} title="Close (Esc)"><X size={16} /></button>
      </div>
      <iframe key={current.id} src={`/api/archive/${current.id}?rv=2`} title="Newsletter" className="nl-reader-frame" />
    </>
  ) : null;

  // In split view, take over just this pane (inline) so the other pane stays visible.
  if (inSplit && current) {
    return <div className="nl-reader nl-reader-inpane">{reader}</div>;
  }

  return (
    <>
      <div className={showAll ? "hist-scroll" : undefined} style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: showAll ? 380 : "none", overflowY: showAll ? "auto" : "visible" }}>
        {shown.map((item) => (
          <div key={item.id} className="hist-row" onClick={() => setPreviewId(previewId === item.id ? null : item.id)}>
            <span className="mono hist-date" style={{ fontSize: 10.5, color: C.muted, width: 148, flex: "none", whiteSpace: "nowrap" }}>
              {new Date(item.sentAt).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" })}
              {" "}
              {new Date(item.sentAt).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" })}
            </span>
            {(() => {
              const m = journalTypeMeta(item.type);
              const Ic = m.Icon;
              return (
                <span className="chip" style={{ flex: "none", fontSize: 10, color: m.color, borderColor: m.color + "66", background: m.color + "14", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Ic size={11} /> {item.type || "wrap"}
                </span>
              );
            })()}
            {item.bias && <span className="chip" style={{ color: biasColor(item.bias), borderColor: biasColor(item.bias) + "66", flex: "none", fontSize: 10 }}>{item.bias}</span>}
            <span className="chip" style={{ flex: "none", fontSize: 10 }}>{item.instrument || "SPX"}</span>
            <span className="hist-title" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: "var(--text)" }}>
              {item.title || "Untitled"}
            </span>
            {item.score != null && <span className="mono" style={{ fontSize: 11, color: C.muted, flex: "none" }}>{item.score}</span>}
            <a href={item.url || `/api/archive/${item.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flex: "none" }} title="Open full page" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={12} />
            </a>
            {canDelete && (
              <button
                className={`btn btn-sm ${confirmDeleteId === item.id ? "btn-danger" : "btn-ghost"}`}
                style={{ flex: "none" }}
                disabled={deletingId === item.id}
                title={confirmDeleteId === item.id ? "Click again to permanently delete" : "Delete this journal entry"}
                onClick={(e) => deleteEntry(item.id, e)}
              >
                {deletingId === item.id ? <RefreshCw size={12} className="spin" /> : <Trash2 size={12} />}
              </button>
            )}
          </div>
        ))}
      </div>
      {!isDesktop && filtered.length > collapsedCount && (
        <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12, gap: 6, marginTop: 8 }} onClick={() => setExpanded((e) => !e)}>
          {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {filtered.length - collapsedCount} more</>}
        </button>
      )}
      {current && createPortal(
        <div className="nl-reader-overlay" onClick={() => setPreviewId(null)}>
          <div className="nl-reader" onClick={(e) => e.stopPropagation()}>{reader}</div>
        </div>,
        document.body
      )}
    </>
  );
};

// Library scoreboard — rolls graded thesis calls and logged trades into hit rates and P/L, so the
// library answers "are my calls any good?" instead of just storing them.
const OUTCOME_META = {
  hit: { label: "HIT", color: "#22C55E" },
  miss: { label: "MISS", color: "#EF4444" },
  flat: { label: "FLAT", color: "#94A3B8" },
};
const ArchiveTab = ({
  archiveHistory,
  viewing,
  setViewing,
  onDeleteEntry,
  onGoThesis,
  inSplit = false,
  auth = null,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [journalOpen, setJournalOpen] = usePersistentState("overwatch:sec:journal", true);
  const [libraryOpen, setLibraryOpen] = usePersistentState("overwatch:sec:library", false); // collapsed by default
  const isDesktop = useIsDesktop();
  const collapsedCount = isDesktop ? 7 : 3;
  const filteredHistory = archiveHistory;
  const effectiveExpanded = expanded;
  // Desktop scrolls the full library inside a fixed-height pane; mobile keeps the show-more collapse.
  const showAll = isDesktop || effectiveExpanded;
  const shownHistory = showAll ? filteredHistory : filteredHistory.slice(0, collapsedCount);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card
        icon={Mail}
        title="Jacks Journal"
        sub="Market wraps delivered by the Overwatch automation — stored in the cloud"
        collapsible
        open={journalOpen}
        onToggle={() => setJournalOpen((o) => !o)}
      >
        {journalOpen && <CloudNewsletterList inSplit={inSplit} auth={auth} />}
      </Card>
      <Card
        icon={History}
        title="Thesis Library"
        sub={archiveHistory.length ? `${archiveHistory.length} saved entr${archiveHistory.length === 1 ? "y" : "ies"} — thesis archive · synced across devices` : "No archived entries yet"}
        collapsible
        open={libraryOpen}
        onToggle={() => setLibraryOpen((o) => !o)}
      >
        {libraryOpen && (<>
        {!archiveHistory.length && (
          <div style={{ color: C.muted, fontSize: 12.5 }}>Every thesis lands here automatically.</div>
        )}
        <div className={showAll ? "hist-scroll" : undefined} style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: showAll ? 380 : "none", overflowY: showAll ? "auto" : "visible" }}>
          {shownHistory.map((entry) => {
            const t = entry._type === "newsletter" ? entry._thesis : entry;
            const biasColor = t?.bias === "bullish" ? C.bull : t?.bias === "bearish" ? C.bear : C.brass;
            const isViewingThis = viewing?._id === entry._id;
            return (
              <div
                key={entry._id}
                className={`hist-row ${isViewingThis ? "viewing" : ""}`}
                onClick={() => { setViewing(entry._type === "newsletter" ? entry._thesis || entry : entry); onGoThesis?.(); }}
              >
                <span className="mono hist-date" style={{ fontSize: 10.5, color: C.muted, width: 148, flex: "none", whiteSpace: "nowrap" }}>{archiveStamp(entry)}</span>
                <span className="chip" style={{ flex: "none", fontSize: 10, color: C.muted, borderColor: "var(--border)" }}>Thesis</span>
                <span className="chip" style={{ color: biasColor, borderColor: biasColor + "66", flex: "none", fontSize: 10 }}>{t?.bias || "—"}</span>
                {entry._outcome && OUTCOME_META[entry._outcome.result] && (
                  <span className="chip" title={`Graded ${fmtSigned(entry._outcome.changePct, 2, "%")} vs the call`} style={{ color: OUTCOME_META[entry._outcome.result].color, borderColor: OUTCOME_META[entry._outcome.result].color + "66", flex: "none", fontSize: 10 }}>
                    {OUTCOME_META[entry._outcome.result].label}
                  </span>
                )}
                {entry._trade && Number.isFinite(entry._trade.pnl) && (
                  <span className="mono chip" style={{ flex: "none", fontSize: 10, color: entry._trade.pnl >= 0 ? C.bull : C.bear, borderColor: (entry._trade.pnl >= 0 ? C.bull : C.bear) + "66" }}>
                    {entry._trade.pnl >= 0 ? "+" : "−"}${fmtNum(Math.abs(entry._trade.pnl), 0)}
                  </span>
                )}
                <span className="chip" style={{ flex: "none", fontSize: 10 }}>{entry.instrument || t?.instrument || "SPX"}</span>
                <span className="hist-title" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: "var(--text)" }}>
                  {entry.headline || t?.headline || "—"}
                </span>
                {t?.score != null && <span className="mono" style={{ fontSize: 11, color: C.muted, flex: "none" }}>{fmtSigned(t.score, 0)}</span>}
                <button className="btn btn-ghost btn-sm" style={{ flex: "none" }} title="Download PDF" onClick={(e) => {
                  e.stopPropagation();
                  downloadPDF(buildThesisPrintHTML(t || entry), `overwatch-thesis-${entry._date || entry.instrument || "archived"}.pdf`);
                }}>
                  <FileText size={12} />
                </button>
                <button className="btn btn-ghost btn-sm" style={{ flex: "none" }} title="Delete" onClick={(e) => { e.stopPropagation(); onDeleteEntry(entry._id); }}>
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
        {!isDesktop && filteredHistory.length > collapsedCount && (
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12, gap: 6, marginTop: 8 }} onClick={() => setExpanded((e) => !e)}>
            {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show {filteredHistory.length - collapsedCount} more</>}
          </button>
        )}
        </>)}
      </Card>
      <AcademyCard />
    </div>
  );
};

/* ================================================================
   SETTINGS DRAWER + TOASTS
   ================================================================ */

const SettingsDrawer = ({ open, onClose, watchlist, setWatchlist, onClearHistory, onResetAll, storageOk, notify, auth }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  if (!open) return null;

  // Flip a symbol's visibility on the Pulse grid without dropping it from the board.
  const toggleTicker = (symbol) => setWatchlist(watchlist.map((x) => {
    if (x.symbol !== symbol) return x;
    if (x.off) { const { off, ...rest } = x; return rest; }
    return { ...x, off: true };
  }));

  // Drag-to-reorder the watchlist (and therefore the Market Pulse card order).
  const moveRow = (from, to) => {
    if (from == null || to == null || from === to) return;
    setWatchlist((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <Settings size={16} color={C.brass} />
          <span className="disp" style={{ fontWeight: 600, fontSize: 15, marginLeft: 9, letterSpacing: ".04em" }}>DESK SETTINGS</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={onClose}><X size={15} /></button>
        </div>

        {CLERK_ENABLED && (
          <div className={`sync-status${auth?.signedIn ? " on" : ""}`}>
            {auth?.signedIn
              ? <><Check size={13} /> <span>Synced to your account{auth.email ? ` · ${auth.email}` : ""}. Your watchlist, weights and library follow you across devices.</span></>
              : <><LogIn size={13} /> <span>Sign in (top bar) to sync your watchlist, weights and thesis library across devices. Not signed in, everything stays in this browser.</span></>}
          </div>
        )}

        <span className="lab-label">Watchlist · {watchlist.length}</span>
        <div style={{ fontSize: 10.5, color: C.faint || C.muted, margin: "-4px 0 10px" }}>Drag the handle to reorder cards on Market Pulse. Use Show / Hide to control what appears — hidden names still price for the Thesis Lab.</div>
        <div className="wl-list">
          {watchlist.map((w, i) => (
            <div
              key={w.symbol}
              className={`wl-row${w.off ? " off" : ""}${dragIndex === i ? " dragging" : ""}${overIndex === i && dragIndex !== null && dragIndex !== i ? " over" : ""}`}
              draggable
              onDragStart={(e) => { setDragIndex(i); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { e.preventDefault(); if (overIndex !== i) setOverIndex(i); }}
              onDrop={(e) => { e.preventDefault(); moveRow(dragIndex, i); setDragIndex(null); setOverIndex(null); }}
              onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            >
              <span className="wl-grip" title="Drag to reorder"><GripVertical size={15} /></span>
              <span className="wl-sym mono">{w.symbol}</span>
              <span className="wl-name">{w.name}</span>
              <button
                className={`wl-vis${w.off ? "" : " on"}`}
                onClick={() => toggleTicker(w.symbol)}
                title={w.off ? "Hidden — show this card on Market Pulse" : "Shown — hide this card from Market Pulse"}
              >
                {w.off ? <><EyeOff size={13} /> Hidden</> : <><Eye size={13} /> Shown</>}
              </button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => { setWatchlist(DEFAULT_WATCHLIST); notify("Watchlist restored to desk defaults", "ok"); }}>
          <RotateCcw size={12} /> Restore default board
        </button>

        <div style={{ borderTop: "1px solid var(--line)", margin: "22px 0 18px" }} />
        <span className="lab-label">Danger zone</span>
        {!confirmClear ? (
          <button className="btn btn-sm btn-danger" onClick={() => setConfirmClear(true)}><Trash2 size={13} /> Clear thesis archive</button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm btn-danger" onClick={() => { onClearHistory(); setConfirmClear(false); }}><AlertTriangle size={13} /> Confirm — wipe it</button>
            <button className="btn btn-sm" onClick={() => setConfirmClear(false)}>Keep it</button>
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--line)", margin: "22px 0 18px" }} />
        <span className="lab-label">Reset desk</span>
        {!confirmReset ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(true)}><RotateCcw size={13} /> Reset all to defaults</button>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-sm btn-danger" onClick={() => onResetAll?.()}><AlertTriangle size={13} /> Confirm — reset everything</button>
            <button className="btn btn-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        )}
        <div style={{ fontSize: 11, color: C.muted, marginTop: 7, lineHeight: 1.5 }}>
          Restores every toggle, filter, watchlist and layout to desk defaults and reloads. Your saved thesis archive is kept.
        </div>

        <div style={{ borderTop: "1px solid var(--line)", margin: "22px 0 14px" }} />
        <div className="mono" style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.8, letterSpacing: ".03em" }}>
          {storageOk
            ? "● Settings and thesis archive persist in this browser."
            : "○ Persistent storage unavailable here — settings and archives live for this session only."}
        </div>
      </div>
    </>
  );
};

const Toasts = ({ items }) => (
  <div className="toasts">
    {items.map((t) => (
      <div key={t.id} className={`toast ${t.kind === "err" ? "t-err" : "t-ok"}`}>
        {t.kind === "err" ? <AlertTriangle size={15} color={C.bear} /> : <Check size={15} color={C.bull} />}
        <span>{t.msg}</span>
      </div>
    ))}
  </div>
);

/* ================================================================
   TAB — CHARTS
   ================================================================ */

const CHART_PRESETS = [
  { symbol: "AMEX:SPY",       label: "SPY" },
  { symbol: "NASDAQ:QQQ",     label: "QQQ" },
  { symbol: "AMEX:DIA",       label: "DIA" },
  { symbol: "AMEX:IWM",       label: "IWM" },
  { symbol: "NASDAQ:AAPL",    label: "AAPL" },
  { symbol: "NASDAQ:MSFT",    label: "MSFT" },
  { symbol: "NASDAQ:NVDA",    label: "NVDA" },
  { symbol: "NASDAQ:AMZN",    label: "AMZN" },
  { symbol: "NASDAQ:META",    label: "META" },
  { symbol: "NASDAQ:GOOGL",   label: "GOOGL" },
  { symbol: "NASDAQ:TSLA",    label: "TSLA" },
  { symbol: "COINBASE:BTCUSD", label: "BTC" },
];

// Map a thesis instrument to the chart it should feature. Index futures have no direct preset, so
// they proxy to their tracking ETF (ES→SPY, NQ→QQQ, …) — the same chart a trader reads them against.
const THESIS_CHART_SYMBOL = {
  SPY: "AMEX:SPY", QQQ: "NASDAQ:QQQ", DIA: "AMEX:DIA", IWM: "AMEX:IWM",
  ES: "AMEX:SPY", NQ: "NASDAQ:QQQ", YM: "AMEX:DIA", RTY: "AMEX:IWM",
  AAPL: "NASDAQ:AAPL", MSFT: "NASDAQ:MSFT", NVDA: "NASDAQ:NVDA", AMZN: "NASDAQ:AMZN",
  META: "NASDAQ:META", GOOGL: "NASDAQ:GOOGL", TSLA: "NASDAQ:TSLA",
};

const TV_INTERVALS = [
  { value: "5",   label: "5m" },
  { value: "15",  label: "15m" },
  { value: "60",  label: "1H" },
  { value: "D",   label: "1D" },
  { value: "W",   label: "1W" },
];

let tvScriptPromise = null;
const loadTvScript = () => {
  if (window.TradingView) return Promise.resolve();
  if (tvScriptPromise) return tvScriptPromise;
  tvScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return tvScriptPromise;
};

const TradingViewChart = ({ symbol, lightMode, interval = "D", prefix = "tv-chart" }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  // Mask the widget while it (re)initializes — a theme/symbol/interval change tears the iframe down
  // and rebuilds it, during which TradingView briefly paints "O0 H0 L0 C0" before its data loads.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let revealTimer = null;
    let pollTimer = null;
    setLoading(true);
    containerRef.current.innerHTML = "";
    loadTvScript().then(() => {
      if (cancelled || !containerRef.current || !window.TradingView) return;
      widgetRef.current = new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbol,
        interval,
        timezone: "America/New_York",
        theme: lightMode ? "light" : "dark",
        style: "1",
        locale: "en",
        toolbar_bg: lightMode ? "#FFFFFF" : "#0D1117",
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        autosize: true,
        studies: ["MASimple@tv-basicstudies"],
      });
    });
    // Drop the skeleton once the widget iframe exists plus a short beat for its first real paint;
    // a hard fallback guarantees it never sticks if detection misses.
    const start = Date.now();
    const poll = () => {
      if (cancelled) return;
      if (containerRef.current?.querySelector("iframe")) {
        revealTimer = setTimeout(() => !cancelled && setLoading(false), 700);
        return;
      }
      if (Date.now() - start > 12000) { setLoading(false); return; }
      pollTimer = setTimeout(poll, 150);
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      clearTimeout(pollTimer);
      widgetRef.current = null;
    };
  }, [symbol, lightMode, interval]);

  const id = `${prefix}-${symbol.replace(/[^a-zA-Z0-9]/g, "-")}`;
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div ref={containerRef} id={id} style={{ height: "100%", width: "100%" }} />
      {loading && <div className="tv-skeleton" aria-hidden="true"><RefreshCw size={16} className="spin" /> Loading chart…</div>}
    </div>
  );
};

const ChartsTab = ({ lightMode, compact = false, focusSymbol = null }) => {
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
  const [selected, setSelected] = useState(() => {
    const valid = new Set(CHART_PRESETS.map((p) => p.symbol));
    try {
      const saved = JSON.parse(localStorage.getItem("overwatch:charts") || "null");
      if (Array.isArray(saved)) {
        const kept = saved.filter((s) => valid.has(s));
        if (kept.length) return kept;
      }
    } catch {}
    return ["AMEX:SPY", "NASDAQ:QQQ", "AMEX:DIA", "AMEX:IWM"];
  });
  const [interval, setInterval] = useState("D");
  const [layout, setLayout] = usePersistentState("overwatch:charts:layout", "auto"); // regular: auto | 1 | 2 | 3
  const [splitLayout, setSplitLayout] = usePersistentState("overwatch:charts:splitlayout", "1"); // split pane: 1 | 2
  const [activeSymbol, setActiveSymbol] = useState(() => selected[0] || "AMEX:SPY");
  const [fsSymbol, setFsSymbol] = useState(null);

  // Mobile-only: size the chart frame to fill exactly the space between itself and the floating
  // bottom nav (measured live, not guessed via a fixed calc()), so the interval toggles + chart +
  // symbol strip all fit above the nav with no vertical swipe needed. The page can still scroll to
  // reveal the footer disclaimer below the nav — that's fine, only the interactive chart shouldn't
  // require it.
  const mobileFrameWrapRef = useRef(null);
  const mobileStripRef = useRef(null);
  const [mobileFrameH, setMobileFrameH] = useState(420);
  useEffect(() => {
    if (!isMobileView) return;
    const recalc = () => {
      const frameEl = mobileFrameWrapRef.current;
      const stripEl = mobileStripRef.current;
      if (!frameEl) return;
      const navEl = document.querySelector(".bd-bottom-nav");
      const navRect = navEl?.getBoundingClientRect();
      // Hidden/absent nav (display:none) reports an all-zero rect — fall back to a sane clearance.
      const navTop = navRect && navRect.height > 0 ? navRect.top : window.innerHeight - 100;
      const frameTop = frameEl.getBoundingClientRect().top;
      const stripH = stripEl?.getBoundingClientRect().height || 0;
      const available = navTop - frameTop - stripH - 20;
      setMobileFrameH(Math.max(280, Math.round(available)));
    };
    recalc();
    const id = requestAnimationFrame(recalc); // strip/nav may not have painted yet on first pass
    window.addEventListener("resize", recalc);
    window.addEventListener("orientationchange", recalc);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", recalc);
    };
  }, [isMobileView, interval, activeSymbol]);

  useEffect(() => {
    try { localStorage.setItem("overwatch:charts", JSON.stringify(selected)); } catch {}
  }, [selected]);

  useEffect(() => {
    if (!selected.includes(activeSymbol)) setActiveSymbol(selected[0]);
  }, [selected, activeSymbol]);

  // Follow the thesis instrument: feature its chart (top of the grid / active pane), adding it if
  // it isn't already shown. Runs when the focus changes or the Charts tab (re)mounts.
  useEffect(() => {
    if (!focusSymbol) return;
    setSelected((prev) => (prev[0] === focusSymbol ? prev : [focusSymbol, ...prev.filter((s) => s !== focusSymbol)]));
    setActiveSymbol(focusSymbol);
  }, [focusSymbol]);

  useEffect(() => {
    if (!fsSymbol) return;
    const onKey = (e) => { if (e.key === "Escape") setFsSymbol(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fsSymbol]);

  const toggle = (sym) => {
    setSelected((prev) => {
      if (prev.includes(sym)) return prev.length > 1 ? prev.filter((s) => s !== sym) : prev;
      return [...prev, sym];
    });
  };

  const symbolLabel = (sym) => CHART_PRESETS.find((p) => p.symbol === sym)?.label || sym.split(":").pop();

  // Grid columns. Split panes are half-width so they cap at 2; the regular view goes up to 3.
  // Each context keeps its own choice. "auto" fills up to the cap based on how many charts are shown.
  const activeLayout = compact ? splitLayout : layout;
  const setActiveLayout = compact ? setSplitLayout : setLayout;
  const maxCols = compact ? 2 : 3;
  const rawCols = activeLayout === "auto" ? (selected.length <= 2 ? 1 : maxCols) : Math.min(Number(activeLayout) || 1, maxCols);
  const cols = Math.max(1, Math.min(rawCols, selected.length));
  const chartH = compact ? (cols >= 2 ? 300 : 340) : cols >= 3 ? 320 : cols === 2 ? 420 : 520;
  const layoutOptions = compact ? [["1", "1"], ["2", "2"]] : [["auto", "Auto"], ["1", "1"], ["2", "2"], ["3", "3"]];

  const fsOverlay = fsSymbol ? (
    <div className="chart-fs-overlay">
      <div className="chart-fs-header">
        <CandlestickChart size={15} style={{ opacity: 0.6 }} />
        <span className="chart-fs-title">{symbolLabel(fsSymbol)}</span>
        <div className="seg">
          {TV_INTERVALS.map((iv) => (
            <button key={iv.value} className={interval === iv.value ? "on" : ""} onClick={() => setInterval(iv.value)}>{iv.label}</button>
          ))}
        </div>
        <button className="chart-fs-btn" onClick={() => setFsSymbol(null)} title="Exit fullscreen (Esc)">
          <Minimize2 size={17} />
        </button>
      </div>
      <div className="chart-fs-body">
        <TradingViewChart key={`fs-${fsSymbol}-${interval}`} prefix="tv-fs" symbol={fsSymbol} lightMode={lightMode} interval={interval} />
      </div>
    </div>
  ) : null;

  if (isMobileView) {
    return (
      <>
        {fsOverlay}
        <div className="tab-charts">
          <Card icon={CandlestickChart} title="TradingView charts" sub="Interactive charts with drawing tools & indicators">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <div className="seg">
                {TV_INTERVALS.map((iv) => (
                  <button key={iv.value} className={interval === iv.value ? "on" : ""} onClick={() => setInterval(iv.value)}>{iv.label}</button>
                ))}
              </div>
            </div>
            <div key={`${activeSymbol}-${interval}`} ref={mobileFrameWrapRef} style={{ height: mobileFrameH, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 12, position: "relative" }}>
              <TradingViewChart symbol={activeSymbol} lightMode={lightMode} interval={interval} />
              <button className="chart-expand-btn" onClick={() => setFsSymbol(activeSymbol)} title="Fullscreen">
                <Maximize2 size={14} />
              </button>
            </div>
            <div className="chart-symbol-strip" ref={mobileStripRef}>
              {CHART_PRESETS.map((p) => (
                <button
                  key={p.symbol}
                  className={`chart-symbol-pill${activeSymbol === p.symbol ? " on" : ""}${selected.includes(p.symbol) ? " pinned" : ""}`}
                  onClick={() => {
                    setActiveSymbol(p.symbol);
                    if (!selected.includes(p.symbol)) setSelected((prev) => [...prev, p.symbol]);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {fsOverlay}
      <div className="tab-charts">
        <Card icon={CandlestickChart} title="TradingView charts" sub="Interactive charts with drawing tools & indicators">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <div className="seg">
              {CHART_PRESETS.map((p) => (
                <button key={p.symbol} className={selected.includes(p.symbol) ? "on" : ""} onClick={() => toggle(p.symbol)}>{p.label}</button>
              ))}
            </div>
            <div className="seg" style={{ marginLeft: "auto" }}>
              {TV_INTERVALS.map((iv) => (
                <button key={iv.value} className={interval === iv.value ? "on" : ""} onClick={() => setInterval(iv.value)}>{iv.label}</button>
              ))}
            </div>
            <div className="seg" title="Chart grid columns">
              {layoutOptions.map(([m, lbl]) => (
                <button key={m} className={activeLayout === m ? "on" : ""} onClick={() => setActiveLayout(m)}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
            {selected.map((sym) => (
              <div key={`${sym}-${interval}`} style={{ height: chartH, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)", position: "relative" }}>
                <TradingViewChart symbol={sym} lightMode={lightMode} interval={interval} />
                <button className="chart-expand-btn" onClick={() => setFsSymbol(sym)} title="Fullscreen">
                  <Maximize2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

/* ================================================================
   STRATEGY LAB — algorithmic strategy backtester
   ================================================================ */

// Frontend for the desk's "VIX Range Intraday Reversal Momentum Scalper" — the inputs mirror the
// TradingView strategy one-for-one and the replay itself runs server-side (`backtest` operation).
const ALGO_PARAMS_KEY = "overwatch:algo:params";
const ALGO_DEFAULTS = {
  symbol: "SPY", interval: "1h",
  emaLen: 21, atrMult: 2.5, rsiOS: 30, rsiOB: 70,
  rr: 3, stopAtr: 1, startHour: 11, endHour: 16,
  vixMin: 10, vixMax: 40, qtyPct: 100, vixMode: "sameday",
};
const ALGO_SYMBOL_GROUPS = [
  ["Index ETFs", ["SPY", "QQQ", "DIA", "IWM", "SMH"]],
  ["Rates & commodities", ["TLT", "HYG", "USO"]],
  ["Sector SPDRs", ["XLK", "XLF", "XLV", "XLY", "XLC", "XLI", "XLP", "XLE", "XLU", "XLRE", "XLB"]],
  ["Mag 7", ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA"]],
];
const ALGO_EXIT_LABEL = { tp: "target", sl: "stop", time: "flat @ close", reverse: "reversed", end: "open @ end" };

// Trade timestamps print in ET — the strategy's session window and exchange clock both live there.
const algoTime = (ts) =>
  new Date(ts * 1000).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const algoDate = (ts) =>
  new Date(ts * 1000).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "2-digit" });

// Cumulative equity for the run: dashed baseline at starting capital, line/area tinted by outcome.
const EquityCurve = ({ curve, capital }) => {
  if (!Array.isArray(curve) || curve.length < 2) return null;
  const W = 640, H = 170, padT = 12, padB = 20, padL = 8, padR = 8;
  let lo = capital, hi = capital;
  for (const p of curve) { if (p.eq < lo) lo = p.eq; if (p.eq > hi) hi = p.eq; }
  const span = hi - lo || 1;
  lo -= span * 0.08; hi += span * 0.08;
  const x = (i) => padL + (i / (curve.length - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const line = curve.map((p, i) => `${x(i).toFixed(1)},${y(p.eq).toFixed(1)}`).join(" ");
  const col = curve[curve.length - 1].eq >= capital ? C.bull : C.bear;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Backtest equity curve">
      <defs>
        <linearGradient id="algoEqFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".26" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={padL} x2={W - padR} y1={y(capital)} y2={y(capital)} stroke="var(--line2)" strokeDasharray="4 4" />
      <polygon points={`${x(0).toFixed(1)},${y(capital).toFixed(1)} ${line} ${x(curve.length - 1).toFixed(1)},${y(capital).toFixed(1)}`} fill="url(#algoEqFill)" />
      <polyline points={line} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" />
      <text x={padL} y={H - 6} fill="var(--faint)" fontSize="10" fontFamily="'JetBrains Mono',monospace">{algoDate(curve[0].t)}</text>
      <text x={W - padR} y={H - 6} textAnchor="end" fill="var(--faint)" fontSize="10" fontFamily="'JetBrains Mono',monospace">{algoDate(curve[curve.length - 1].t)}</text>
    </svg>
  );
};

const StrategyLabTab = ({ notify = null }) => {
  const [saved, setSaved] = usePersistentState(ALGO_PARAMS_KEY, ALGO_DEFAULTS);
  const p = { ...ALGO_DEFAULTS, ...saved };
  const set = (k, v) => setSaved((prev) => ({ ...ALGO_DEFAULTS, ...prev, [k]: v }));
  const [bt, setBt] = useState({ status: "idle", data: null, error: null });
  const dirty = Object.keys(ALGO_DEFAULTS).some((k) => String(p[k]) !== String(ALGO_DEFAULTS[k]));
  // One-time migration: the position default changed 10% -> 100%. usePersistentState wrote the old
  // default through on first mount, so existing devices carry qtyPct:10; lift it to the new default
  // once. Flag-guarded so a later deliberate 10% is never re-clobbered.
  useEffect(() => {
    try {
      if (localStorage.getItem("overwatch:algo:qtypct100") === "1") return;
      localStorage.setItem("overwatch:algo:qtypct100", "1");
      setSaved((prev) => {
        const cur = { ...ALGO_DEFAULTS, ...prev };
        return Number(cur.qtyPct) === 10 ? { ...cur, qtyPct: 100 } : prev;
      });
    } catch { /* storage unavailable — new default applies anyway */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildParams = () => ({
    symbol: p.symbol, interval: p.interval, vixMode: p.vixMode,
    emaLen: numOr(p.emaLen, ALGO_DEFAULTS.emaLen), atrMult: numOr(p.atrMult, ALGO_DEFAULTS.atrMult),
    rsiOS: numOr(p.rsiOS, ALGO_DEFAULTS.rsiOS), rsiOB: numOr(p.rsiOB, ALGO_DEFAULTS.rsiOB),
    rr: numOr(p.rr, ALGO_DEFAULTS.rr), stopAtr: numOr(p.stopAtr, ALGO_DEFAULTS.stopAtr),
    startHour: numOr(p.startHour, ALGO_DEFAULTS.startHour), endHour: numOr(p.endHour, ALGO_DEFAULTS.endHour),
    vixMin: numOr(p.vixMin, ALGO_DEFAULTS.vixMin), vixMax: numOr(p.vixMax, ALGO_DEFAULTS.vixMax),
    qtyPct: numOr(p.qtyPct, ALGO_DEFAULTS.qtyPct),
  });

  const runNow = async () => {
    setBt((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const data = await callDesk("backtest", "", { params: buildParams() });
      setBt({ status: "done", data, error: null });
    } catch (e) {
      setBt({ status: "error", data: null, error: e.message });
    }
  };

  // Auto-run the backtest once when the lab opens, using the saved (or default) settings, so results
  // are already populated before the user touches "Run backtest". Runs per mount (i.e. each time the
  // tab is opened), guarded so it fires only once.
  const didAutoRun = useRef(false);
  useEffect(() => {
    if (didAutoRun.current) return;
    didAutoRun.current = true;
    runNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- live signal monitor ---
  // Params re-poll after a short debounce (so typing doesn't spam the API), then every 60s while
  // the tab is open. Signals are detected server-side on completed bars (still journaled to Redis
  // by the endpoint; the UI just surfaces the latest bar's live read).
  const [live, setLive] = useState({ status: "idle", data: null, error: null });
  const [pollSeq, setPollSeq] = useState(0);
  const toastRef = useRef(null);
  const liveParamStr = JSON.stringify(buildParams());
  const [liveKey, setLiveKey] = useState(liveParamStr);
  useEffect(() => {
    const t = setTimeout(() => setLiveKey(liveParamStr), 700);
    return () => clearTimeout(t);
  }, [liveParamStr]);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      try {
        const data = await callDesk("algolive", "", { params: JSON.parse(liveKey) });
        if (!alive) return;
        setLive({ status: "done", data, error: null });
        const sig = data?.state?.signal;
        if (sig && typeof notify === "function") {
          const sigId = `${data.state.barTs}|${sig}`;
          if (toastRef.current !== sigId) {
            toastRef.current = sigId;
            notify(`Scalper ${sig.toUpperCase()} setup live on ${JSON.parse(liveKey).symbol}`, "ok");
          }
        }
      } catch (e) {
        if (alive) setLive((prev) => ({ status: "error", data: prev.data, error: e.message }));
      }
    };
    tick();
    const iv = setInterval(tick, 60000);
    return () => { alive = false; clearInterval(iv); };
  }, [liveKey, pollSeq, notify]);

  const s = bt.data?.stats, m = bt.data?.meta;

  // Live-signal derived state. Hoisted out of the render so the live-signal readout can live inside
  // the Strategy inputs card.
  const st = live.data?.state;
  const OS = numOr(p.rsiOS, ALGO_DEFAULTS.rsiOS), OB = numOr(p.rsiOB, ALGO_DEFAULTS.rsiOB);
  const vMin = numOr(p.vixMin, ALGO_DEFAULTS.vixMin), vMax = numOr(p.vixMax, ALGO_DEFAULTS.vixMax);
  const sH = numOr(p.startHour, ALGO_DEFAULTS.startHour), eH = numOr(p.endHour, ALGO_DEFAULTS.endHour);
  const outside = st && st.lowerKC != null && (st.price < st.lowerKC || st.price > st.upperKC);
  const rsiHit = st && st.rsi != null && (st.rsi < OS || st.rsi > OB);
  const check = (state, label, reading) => (
    <div className="algo-check" key={label}>
      <span className={`algo-check-dot ${state}`} />
      <span className="algo-check-label">{label}</span>
      <span className="algo-check-read">{reading}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="grid g-2" style={{ alignItems: "start" }}>
        <Card
          icon={SlidersHorizontal}
          title="Strategy inputs"
          sub="VIX Range Intraday Reversal Momentum Scalper — Keltner-band fade with RSI confirmation"
          tools={dirty ? <button className="btn btn-ghost btn-sm" title="Reset every input to the strategy's defaults" onClick={() => setSaved(ALGO_DEFAULTS)}><RotateCcw size={12} /> Reset</button> : null}
        >
          {/* Live signal monitor — kept at the top of the card so the current read is the first thing
              you see; the same parameters below drive both this readout and the backtest. */}
          <div style={{ marginBottom: 16, borderBottom: "1px solid var(--line)", paddingBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
              <Zap size={14} style={{ color: C.brass, flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--text)" }}>Live signal</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Evaluates completed {p.interval} bars · auto-refreshes every 60s</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", flexShrink: 0 }} title="Re-check the latest bar now" onClick={() => setPollSeq((n) => n + 1)}>
                <RefreshCw size={12} className={live.status === "idle" || (live.status !== "error" && !live.data) ? "spin" : undefined} /> Refresh
              </button>
            </div>
            {!st && live.status !== "error" && <LoadingBlock lines={3} msg="Reading the latest bars…" />}
            {live.status === "error" && !st && <ErrBlock msg={live.error} onRetry={() => setPollSeq((n) => n + 1)} />}
            {st && (
              <>
                <div className="algo-hero" style={st.signal ? { borderColor: st.signal === "long" ? "rgba(34,197,94,.45)" : "rgba(239,68,68,.45)" } : undefined}>
                  <span className="algo-hero-badge" style={{ color: st.signal === "long" ? C.bull : st.signal === "short" ? C.bear : "var(--muted)" }}>
                    {st.signal === "long" ? "LONG SETUP" : st.signal === "short" ? "SHORT SETUP" : "NO SETUP"}
                  </span>
                  <span className="algo-jmeta">
                    {st.signal
                      ? `stop ${fmtNum(st.sl, 2)} · target ${fmtNum(st.tp, 2)} · ${algoTime(st.barTs)} bar`
                      : `last completed bar ${algoTime(st.barTs)} ET · close ${fmtNum(st.price, 2)}`}
                  </span>
                </div>
                <div>
                  {check(outside ? "pass" : "wait", "Keltner band", st.lowerKC == null ? "warming up" : `close ${fmtNum(st.price, 2)} · bands ${fmtNum(st.lowerKC, 2)} – ${fmtNum(st.upperKC, 2)}`)}
                  {check(rsiHit ? "pass" : "wait", "RSI-14", st.rsi == null ? "warming up" : `${fmtNum(st.rsi, 1)} · needs <${OS} long or >${OB} short`)}
                  {check(st.vixOK ? "pass" : "fail", "VIX regime", st.vix == null ? "unavailable" : `${fmtNum(st.vix, 2)} · gate ${vMin} – ${vMax}`)}
                  {check(st.inWindow ? "pass" : "fail", "Session window", `bar ${st.etHour}:${String(st.etMinute).padStart(2, "0")} ET · trades ${sH}:00 → ${eH}:00`)}
                </div>
                <div style={{ marginTop: 11, fontSize: 11.5, color: "var(--faint)", lineHeight: 1.5 }}>
                  Signals fire on bar close, never mid-bar. Detection runs while the desk is open — signals that print while it's closed
                  aren't journaled.
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginBottom: 14 }}>
            <label className="lab-field" style={{ marginTop: 0 }}>
              <span className="lab-label">Symbol</span>
              <select className="bd-in" style={{ width: "auto", minWidth: 96 }} value={p.symbol} onChange={(e) => set("symbol", e.target.value)}>
                {ALGO_SYMBOL_GROUPS.map(([group, syms]) => (
                  <optgroup key={group} label={group}>
                    {syms.map((sym) => <option key={sym} value={sym}>{sym}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <div className="lab-field" style={{ marginTop: 0 }}>
              <span className="lab-label">Timeframe</span>
              <div className="seg">
                {["15m", "30m", "1h"].map((iv) => (
                  <button key={iv} className={p.interval === iv ? "on" : ""} onClick={() => set("interval", iv)} title={iv === "1h" ? "~2 years of history" : "~60 trading days of history"}>{iv}</button>
                ))}
              </div>
            </div>
            <div className="lab-field" style={{ marginTop: 0 }}>
              <span className="lab-label" title="How the daily VIX regime gate reads the tape">VIX gate</span>
              <div className="seg">
                <button className={p.vixMode === "sameday" ? "on" : ""} onClick={() => set("vixMode", "sameday")} title="Gate each bar with that day's VIX close — what a TradingView backtest sees on history (slight lookahead)">Same-day</button>
                <button className={p.vixMode === "prior" ? "on" : ""} onClick={() => set("vixMode", "prior")} title="Gate with the previous session's VIX close — what you'd actually know at trade time (no lookahead)">Prior-day</button>
              </div>
            </div>
          </div>
          <div className="grid g-3" style={{ gap: 10 }}>
            <NumField label="EMA period" value={p.emaLen} placeholder="21" onChange={(v) => set("emaLen", v)} />
            <NumField label="Keltner ATR" hint="× width" value={p.atrMult} placeholder="2.5" onChange={(v) => set("atrMult", v)} />
            <NumField label="Stop loss" hint="× ATR" value={p.stopAtr} placeholder="2" onChange={(v) => set("stopAtr", v)} />
            <NumField label="RSI oversold" value={p.rsiOS} placeholder="30" onChange={(v) => set("rsiOS", v)} />
            <NumField label="RSI overbought" value={p.rsiOB} placeholder="70" onChange={(v) => set("rsiOB", v)} />
            <NumField label="Reward : risk" value={p.rr} placeholder="3" onChange={(v) => set("rr", v)} />
            <NumField label="First entry" hint="ET hour" value={p.startHour} placeholder="11" onChange={(v) => set("startHour", v)} />
            <NumField label="Last entry" hint="ET hour" value={p.endHour} placeholder="16" onChange={(v) => set("endHour", v)} />
            <NumField label="Position" suffix="%" hint="of equity" value={p.qtyPct} placeholder="100" onChange={(v) => set("qtyPct", v)} />
            <NumField label="VIX min" value={p.vixMin} placeholder="15" onChange={(v) => set("vixMin", v)} />
            <NumField label="VIX max" value={p.vixMax} placeholder="40" onChange={(v) => set("vixMax", v)} />
          </div>
          <div style={{ marginTop: 12, fontSize: 11.5, color: C.muted, lineHeight: 1.55 }}>
            Free intraday history caps the window: ~60 trading days at 15m/30m, ~2 years at 1h.
            The flat-by-close order fires at (last entry − 1):21 ET, exactly like the Pine script — set last entry past 17 and it never
            triggers, so trades ride until stop or target.
          </div>
          <button className="btn btn-brass" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} disabled={bt.status === "loading"} onClick={runNow}>
            {bt.status === "loading" ? <><RefreshCw size={14} className="spin" /> Replaying bars…</> : <><PlayCircle size={14} /> Run backtest</>}
          </button>

        </Card>

        <Card
          icon={TrendingUp}
          title="Backtest results"
          sub={m ? `${m.symbol} · ${m.interval} · ${m.bars} bars · ${algoDate(m.from)} → ${algoDate(m.to)}` : "Set the inputs, then run the replay"}
        >
          {bt.status === "idle" && (
            <EmptyState icon={Bot} title="No run yet" body="Run the backtest to replay your scalper over the recent tape and see P/L, win rate, drawdown, and every trade it took." />
          )}
          {bt.status === "loading" && !bt.data && <LoadingBlock lines={4} msg="Fetching bars and replaying the strategy…" />}
          {bt.status === "error" && <ErrBlock msg={bt.error} onRetry={runNow} />}
          {bt.data && bt.status !== "error" && (
            <div style={{ opacity: bt.status === "loading" ? 0.5 : 1, transition: "opacity .15s" }}>
              {s.trades === 0 && (
                <div style={{ marginBottom: 12, fontSize: 12.5, color: C.muted }}>
                  No signals fired in this window with these settings — loosen the RSI bands, widen the VIX gate, or extend the session window.
                </div>
              )}
              <div className="grid g-3" style={{ gap: 10 }}>
                <ToolStat k="Net P/L" v={fmtUsd(s.netPnl, 2)} color={chgColor(s.netPnl)} sub={`${fmtSigned(s.netPnlPct, 2, "%")} on ${fmtUsd(m.capital)}`} />
                <ToolStat k="Win rate" v={s.winRate == null ? "—" : `${fmtNum(s.winRate, 1)}%`} sub={`${s.wins} of ${s.trades} trades`} />
                <ToolStat k="Profit factor" v={s.profitFactor == null ? "∞" : fmtNum(s.profitFactor, 2)} sub="gross win ÷ gross loss" />
                <ToolStat k="Max drawdown" v={fmtUsd(s.maxDrawdown, 0)} color={s.maxDrawdown > 0 ? C.bear : undefined} sub={`${fmtNum(s.maxDrawdownPct, 2)}% off peak`} />
                <ToolStat k="Avg win / loss" v={`${s.avgWin == null ? "—" : fmtUsd(s.avgWin, 0)} / ${s.avgLoss == null ? "—" : fmtUsd(s.avgLoss, 0)}`} sub="per closed trade" />
                <ToolStat k="Buy & hold" v={fmtSigned(m.buyHoldPct, 2, "%")} color={chgColor(m.buyHoldPct)} sub="same window, same symbol" />
              </div>
              <div style={{ marginTop: 14 }}>
                <EquityCurve curve={bt.data.curve} capital={m.capital} />
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--faint)", lineHeight: 1.5 }}>
                Fills modeled like Pine (entries at next bar's open, brackets live from entry) with the stop counted first when one bar
                spans both exits — conservative, so expect slightly worse numbers here than TradingView, never better.
              </div>
            </div>
          )}
        </Card>
      </div>

      {bt.data && bt.data.trades.length > 0 && (
        <Card icon={History} title="Trade log" sub={`${bt.data.trades.length} trades · newest first`}>
          <div className="algo-table-wrap">
            <table className="algo-table">
              <thead>
                <tr><th>#</th><th>Side</th><th>Entry</th><th>Exit</th><th>Qty</th><th>P/L</th><th>P/L %</th><th>Exit via</th></tr>
              </thead>
              <tbody>
                {[...bt.data.trades].reverse().map((t, i) => (
                  <tr key={`${t.entryT}-${i}`}>
                    <td>{bt.data.trades.length - i}</td>
                    <td><span className={`algo-side ${t.side}`}>{t.side.toUpperCase()}</span></td>
                    <td>{algoTime(t.entryT)} · <b>{fmtNum(t.entryPx, 2)}</b></td>
                    <td>{algoTime(t.exitT)} · <b>{fmtNum(t.exitPx, 2)}</b></td>
                    <td>{t.qty}</td>
                    <td style={{ color: chgColor(t.pnl) }}>{fmtSigned(t.pnl, 2)}</td>
                    <td style={{ color: chgColor(t.pnlPct) }}>{fmtSigned(t.pnlPct, 2, "%")}</td>
                    <td><span className="algo-reason">{ALGO_EXIT_LABEL[t.reason] || t.reason}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

/* ================================================================
   ROOT APP
   ================================================================ */

const IDLE = { status: "idle", data: null, error: null, at: null };

export default function Overwatch() {
  // Active tab — restored from storage so a refresh keeps the view you were on.
  const [tab, setTab] = useState(() => { try { return safeTab(localStorage.getItem(TAB_KEY)); } catch { return "pulse"; } });
  // Split view: the right-pane tab id (null = single-tab mode). Restored from storage.
  const [splitTab, setSplitTab] = useState(() => { try { return localStorage.getItem("overwatch:split") || null; } catch { return null; } });
  const [winW, setWinW] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  const [clock, setClock] = useState(nyClock());
  const [session, setSession] = useState(marketSession());

  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [instrument, setInstrument] = useState(DEFAULT_THESIS_INSTRUMENT);
  const [secondary, setSecondary] = usePersistentState("overwatch:secondary", ""); // optional paired instrument for relative-value context
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [lean, setLean] = useState("auto");
  const [risk, setRisk] = useState("balanced");
  const [notes, setNotes] = useState("");
  const [persona, setPersona] = usePersistentState("overwatch:thesis:persona", DEFAULT_PERSONA);
  const [deskTools, setDeskTools] = useState(DEFAULT_DESK_TOOLS);

  const [market, setMarket] = useState(IDLE);
  const [news, setNews] = useState(IDLE);
  const [points, setPoints] = useState(IDLE);
  const [thesis, setThesis] = useState(IDLE);
  const [archiveHistory, setArchiveHistory] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  // Theme defaults to dark, except a first-ever visit on a touch device — phone OR tablet/iPad (no
  // saved preference yet) — defaults to light for better readability outdoors / on the go. Touch is
  // detected by maxTouchPoints / pointer:coarse so it catches iPads at any orientation (they can be
  // 768–1366px wide), with a width fallback for small screens. Once anyone toggles the theme button,
  // that explicit choice is saved and always wins here, on any device, from then on.
  const [lightMode, setLightMode] = useState(() => {
    try {
      const saved = localStorage.getItem("overwatch:light");
      if (saved !== null) return saved === "1";
      if (typeof window === "undefined") return false;
      const touch = (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)
        || (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches);
      return touch || window.innerWidth <= 1024;
    } catch { return false; }
  });
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine !== false));

  useEffect(() => { try { localStorage.setItem("overwatch:light", lightMode ? "1" : "0"); } catch {} }, [lightMode]);

  useEffect(() => {
    const f = () => setWinW(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  useEffect(() => { try { splitTab ? localStorage.setItem("overwatch:split", splitTab) : localStorage.removeItem("overwatch:split"); } catch {} }, [splitTab]);
  useEffect(() => { try { localStorage.setItem(TAB_KEY, tab); } catch {} }, [tab]);

  // Split view is offered on desktop widths only; the right pane shows a second tab beside the main one.
  const splitEligible = winW >= 1024;
  const splitOn = splitEligible && !!splitTab;
  // Remember the last split layout so toggling split off then on restores the same right-pane tab
  // instead of jumping to a default.
  const [lastSplitTab, setLastSplitTab] = usePersistentState("overwatch:lastsplit", "charts");
  const toggleSplit = () => {
    if (splitTab) {
      setLastSplitTab(splitTab);
      setSplitTab(null);
    } else {
      const restore = lastSplitTab && lastSplitTab !== tab ? lastSplitTab : (tab === "charts" ? "pulse" : "charts");
      setSplitTab(restore);
    }
  };
  // Keep the memory current whenever the right pane changes while split is on.
  useEffect(() => { if (splitTab) setLastSplitTab(splitTab); }, [splitTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);
  const autoSyncStarted = useRef(false);
  const archiveSaveTimer = useRef(null);
  const storageOk = storageAvailable();

  // Auth + per-user cloud sync (Phase 2). Signed-out (or Clerk-disabled) → local storage only.
  const auth = useAuthSync();
  const cloudHydrated = useRef(false); // true once this session has loaded the account's settings
  const cloudSaveTimer = useRef(null);
  const prevSignedIn = useRef(false); // to detect a sign-out transition (Phase 4 cache clear)

  // Apply a persisted layout block (active tab, split pane, theme). Used only for the LOCAL settings
  // blob on first load — tab/splitTab/lightMode already restore instantly from their own local-storage
  // keys (TAB_KEY, "overwatch:split", "overwatch:light") read synchronously in useState above, so this
  // just keeps them in sync with the rest of that same local snapshot.
  const applyLayout = useCallback((layout) => {
    if (!layout || typeof layout !== "object") return;
    if (typeof layout.tab === "string") setTab(safeTab(layout.tab));
    if (layout.splitTab === null || layout.splitTab === undefined) { /* leave as-is if omitted */ }
    if (typeof layout.splitTab === "string" && LAYOUT_TAB_IDS.includes(layout.splitTab)) setSplitTab(layout.splitTab);
    if (layout.splitTab === null) setSplitTab(null);
    if (typeof layout.lightMode === "boolean") setLightMode(layout.lightMode);
  }, []);

  // Apply a settings blob (from the cloud) through the state setters. Deliberately does NOT touch
  // layout (tab/splitTab/lightMode): those are per-device UI state that already restores instantly
  // from local storage on every load. The cloud round trip is debounced and only starts saving after
  // its own hydrate completes, so on a refresh soon after a local-only change (e.g. just turning split
  // view on) the account's copy is still stale — applying it here was overwriting the correct, fresher
  // local state and made split view (and the active tab) revert on refresh. Everything else genuinely
  // is account data, so it stays synced.
  const applyLoadedSettings = useCallback((s) => {
    if (!s || typeof s !== "object") return;
    if (Array.isArray(s.watchlist) && s.watchlist.length) setWatchlist(reconcileWatchlist(s.watchlist));
    if (s.instrument) setInstrument(thesisInstrumentConfig(s.instrument).symbol);
    if (s.weights) setWeights(normalizeWeightsToBudget(s.weights));
    if (s.lean) setLean(s.lean);
    if (s.risk) setRisk(s.risk);
    if (s.deskTools) setDeskTools((d) => mergeSavedDeskTools(d, s.deskTools));
  }, []);

  /* clock */
  useEffect(() => {
    const id = setInterval(() => { setClock(nyClock()); setSession(marketSession()); }, 1000);
    return () => clearInterval(id);
  }, []);

  /* load persisted state */
  useEffect(() => {
    (async () => {
      const s = await loadStored(SETTINGS_KEY, null);
      if (s) {
        if (Array.isArray(s.watchlist) && s.watchlist.length) setWatchlist(reconcileWatchlist(s.watchlist));
        if (s.instrument) setInstrument(thesisInstrumentConfig(s.instrument).symbol);
        if (s.weights) setWeights(normalizeWeightsToBudget(s.weights));
        if (s.lean) setLean(s.lean);
        if (s.risk) setRisk(s.risk);
        if (s.deskTools) setDeskTools((d) => mergeSavedDeskTools(d, s.deskTools));
        applyLayout(s.layout);
      }
      // Load archive. When auth is enabled the library is per-user (hydrated by the sign-in effect
      // below) or local-only when signed out — so we never touch the shared global archive here.
      // When auth is disabled, keep the legacy shared archive (Upstash first, local fallback).
      let ah = null;
      if (!CLERK_ENABLED) {
        try {
          const kv = await callDesk("getarchive");
          if (Array.isArray(kv)) ah = kv;
        } catch {}
      }
      if (!Array.isArray(ah)) {
        ah = await loadStored(ARCHIVE_KEY, null);
      }
      if (Array.isArray(ah) && ah.length) {
        setArchiveHistory(ah);
      } else {
        const legacyThesis = (await loadStored(HISTORY_KEY, [])) || [];
        const entries = legacyThesis.map((t) => ({ ...t, _type: "thesis" })).slice(0, 60);
        if (entries.length) setArchiveHistory(entries);
      }
      setStorageReady(true);
    })();
  }, []);

  /* persist on change — always keep the local cache; the cloud is layered on top when signed in */
  useEffect(() => {
    if (storageReady) saveStored(SETTINGS_KEY, { watchlist, instrument, weights, lean, risk, deskTools, layout: { tab, splitTab, lightMode } });
  }, [storageReady, watchlist, instrument, weights, lean, risk, deskTools, tab, splitTab, lightMode]);

  /* on sign-in, hydrate settings from the account (source of truth); seed the account from this
     browser's settings the first time so nothing is lost migrating from local-only. */
  useEffect(() => {
    if (!storageReady || !auth.signedIn) { cloudHydrated.current = false; return; }
    let cancelled = false;
    (async () => {
      const [cloudSettings, cloudArchive] = await Promise.all([
        loadUserSettings(auth.getToken).catch(() => null),
        loadUserArchive(auth.getToken).catch(() => null),
      ]);
      if (cancelled) return;
      // Settings: account is source of truth; seed it from this browser the first time.
      if (cloudSettings) applyLoadedSettings(cloudSettings);
      else await saveUserSettings(auth.getToken, { watchlist, instrument, weights, lean, risk, deskTools, layout: { tab, splitTab, lightMode } }).catch(() => {});
      // Thesis library: same — adopt the account's library, or seed it with the current one.
      if (Array.isArray(cloudArchive)) setArchiveHistory(cloudArchive);
      else await saveUserArchive(auth.getToken, archiveHistory).catch(() => {});
      cloudHydrated.current = true;
    })();
    return () => { cancelled = true; };
    // Intentionally keyed on identity/readiness only — settings changes are handled by the saver below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageReady, auth.signedIn]);

  /* while signed in, debounce-save settings changes to the account (after the initial hydrate). */
  useEffect(() => {
    if (!storageReady || !auth.signedIn || !cloudHydrated.current) return;
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(() => {
      saveUserSettings(auth.getToken, { watchlist, instrument, weights, lean, risk, deskTools, layout: { tab, splitTab, lightMode } }).catch(() => {});
    }, 1200);
    return () => { if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current); };
  }, [storageReady, auth.signedIn, watchlist, instrument, weights, lean, risk, deskTools, tab, splitTab, lightMode]);
  useEffect(() => {
    if (!storageReady) return;
    saveStored(ARCHIVE_KEY, archiveHistory); // local cache always
    if (archiveSaveTimer.current) clearTimeout(archiveSaveTimer.current);
    archiveSaveTimer.current = setTimeout(() => {
      if (auth.signedIn) {
        // Per-user library — but not until the sign-in hydrate has run, so we never overwrite the
        // account with pre-hydration defaults.
        if (cloudHydrated.current) saveUserArchive(auth.getToken, archiveHistory).catch(() => {});
      } else if (!CLERK_ENABLED) {
        // Legacy shared archive, only when auth is disabled. (Signed-out with auth on = local only.)
        callDesk("savearchive", undefined, { archive: archiveHistory }).catch(() => {});
      }
    }, 1500);
  }, [storageReady, archiveHistory, auth.signedIn]);

  /* on sign-out, wipe synced data from memory so a shared browser doesn't expose the last account
     (Phase 4). The reset writes defaults to the local cache too; signing back in re-hydrates. */
  useEffect(() => {
    if (!CLERK_ENABLED || !auth.ready) return;
    if (prevSignedIn.current && !auth.signedIn) {
      cloudHydrated.current = false;
      setWatchlist(DEFAULT_WATCHLIST);
      setInstrument(DEFAULT_THESIS_INSTRUMENT);
      setWeights(DEFAULT_WEIGHTS);
      setLean("auto");
      setRisk("balanced");
      setDeskTools(DEFAULT_DESK_TOOLS);
      setArchiveHistory([]);
      setTab("pulse");
      setSplitTab(null);
    }
    prevSignedIn.current = auth.signedIn;
  }, [auth.ready, auth.signedIn]);

  const notify = useCallback((msg, kind = "ok") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  /* data fetchers */
  const runFetch = async (setter, operation, prompt, payload = {}) => {
    setter((s) => ({ ...s, status: "loading", error: null }));
    try {
      const data = await callDesk(operation, prompt, payload);
      setter({ status: "ready", data, error: null, at: { ts: Date.now(), label: stampNow() } });
      return data;
    } catch (e) {
      setter((s) => ({ ...s, status: "error", error: e.message }));
      return false;
    }
  };
  const refreshMarket = () => {
    // Append the Thesis Lab single-stock tickers so their live prices are available to the lab tools.
    const priceList = [...watchlist, ...THESIS_STOCK_TICKERS.filter((s) => !watchlist.some((w) => w.symbol === s.symbol))];
    return runFetch(setMarket, "market", pricesPrompt(priceList), { watchlist: priceList });
  };
  const refreshNews = () => runFetch(setNews, "news", newsPrompt());
  const refreshPoints = () => runFetch(setPoints, "points", pointsPrompt());

  const anyLoading = [market, news, points].some((m) => m.status === "loading");
  const anyData = !!(market.data || news.data || points.data);

  const syncAll = async ({ silent = false } = {}) => {
    if (!silent) notify("Syncing the desk — four live feeds in flight", "ok");
    const [marketData, newsData, pointsData] = await Promise.all([refreshMarket(), refreshNews(), refreshPoints()]);
    const r = [marketData, newsData, pointsData];
    if (!silent) {
      if (r.every(Boolean)) notify("Desk synced — all feeds live", "ok");
      else if (r.some(Boolean)) notify("Partial sync — retry the failed module from its tab", "err");
      else notify("Sync failed — hit sync again", "err");
    }
    return r.every(Boolean);
  };

  useEffect(() => {
    if (!storageReady || autoSyncStarted.current) return;
    autoSyncStarted.current = true;
    syncAll();
  }, [storageReady]);

  // Pre-warm the heavy TradingView embeds during idle time after first render, so opening the Charts
  // or Calendar tab later is near-instant instead of paying the full script download then. tv.js just
  // defines window.TradingView (no side effects), so we execute it early; the economic-calendar embed
  // script auto-runs and needs a container, so we only prefetch it into cache (rel=preload).
  useEffect(() => {
    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      loadTvScript().catch(() => {});
      if (!document.querySelector('link[data-tv-events]')) {
        const l = document.createElement("link");
        l.rel = "preload";
        l.as = "script";
        l.href = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        l.setAttribute("data-tv-events", "1");
        document.head.appendChild(l);
      }
    };
    const ric = window.requestIdleCallback;
    const id = ric ? ric(warm, { timeout: 4000 }) : setTimeout(warm, 2500);
    return () => { if (ric && window.cancelIdleCallback) window.cancelIdleCallback(id); else clearTimeout(id); };
  }, []);

  // Keep the latest live state in a ref so the auto-refresh loop below can read it without listing
  // every field as an effect dependency (which used to tear down and rebuild the interval + listeners
  // on every sync and every watchlist edit, and could fire an extra fetch when the watchlist changed).
  const refreshStateRef = useRef(null);
  refreshStateRef.current = { market, news, points, syncAll };

  useEffect(() => {
    if (!storageReady || tab !== "pulse") return;
    const maybeRefresh = () => {
      const { market: m, news: n, points: p, syncAll: run } = refreshStateRef.current;
      if (document.visibilityState !== "visible") return;
      if ([m, n, p].some((s) => s.status === "loading")) return;
      run({ silent: true });
    };
    const cur = refreshStateRef.current.market;
    const stale = !cur.at?.ts || Date.now() - cur.at.ts > 2 * 60 * 1000;
    if (stale) maybeRefresh();
    const id = setInterval(maybeRefresh, 2 * 60 * 1000);
    const handleActivity = () => maybeRefresh();
    window.addEventListener("focus", handleActivity);
    document.addEventListener("visibilitychange", handleActivity);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", handleActivity);
      document.removeEventListener("visibilitychange", handleActivity);
    };
    // Set up once per Pulse entry; latest state is read from the ref inside maybeRefresh.
  }, [storageReady, tab]);

  /* Outcome grading — once a thesis's session date has passed, grade its directional call against
     the instrument's current price (first sync of a later ET day). Deterministic, no API cost. */
  useEffect(() => {
    if (!storageReady || !market.data) return;
    const today = etDateKey();
    let changed = false;
    const graded = archiveHistory.map((e) => {
      if (e._type && e._type !== "thesis") return e;
      if (e._outcome || !(e._spotAtGen > 0)) return e;
      const key = e._dateKey || (e._ts ? etDateKey(new Date(e._ts)) : null);
      if (!key || key >= today) return e;
      const spot = deskLiveContext(market.data, points.data, e._instrument || e.instrument).spot;
      if (!(spot > 0)) return e;
      const changePct = ((spot - e._spotAtGen) / e._spotAtGen) * 100;
      // Directional grade: did price move the called way? ±0.2% is a flat push; a neutral call
      // is a hit when the move stayed inside ±0.35%.
      const result = e.bias === "neutral"
        ? (Math.abs(changePct) <= 0.35 ? "hit" : "miss")
        : Math.abs(changePct) <= 0.2 ? "flat"
          : (changePct > 0) === (e.bias === "bullish") ? "hit" : "miss";
      changed = true;
      return { ...e, _outcome: { gradedAt: Date.now(), refSpot: e._spotAtGen, evalSpot: spot, changePct, result } };
    });
    if (changed) setArchiveHistory(graded);
    // archiveHistory intentionally not a dep — this only reacts to fresh prices; grading writes back once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageReady, market.data, points.data]);

  /* Level alert — while a thesis is on the tape, watch its action level against the focus
     instrument's live price on every refresh; fire a banner + toast when price crosses it. */
  const [levelAlert, setLevelAlert] = useState(null);
  const levelWatch = useRef({ key: null, prevSpot: null, lastFired: 0 });
  useEffect(() => {
    const t = thesis.data;
    if (!market.data || !t) return;
    const level = parseFirstPrice(t.levels?.action);
    const sym = t._instrument || t.instrument;
    if (!level || !sym) return;
    const spot = deskLiveContext(market.data, points.data, sym).spot;
    if (!(spot > 0)) return;
    const key = `${t._id}:${level}`;
    const w = levelWatch.current;
    if (w.key !== key) { levelWatch.current = { key, prevSpot: spot, lastFired: 0 }; return; }
    const crossed = (w.prevSpot < level && spot >= level) || (w.prevSpot > level && spot <= level);
    w.prevSpot = spot;
    if (crossed && Date.now() - w.lastFired > 5 * 60 * 1000) {
      w.lastFired = Date.now();
      const msg = `${sym} crossed the action level ${fmtNum(level, 2)} — now ${fmtNum(spot, 2)}`;
      setLevelAlert({ msg, ts: Date.now() });
      notify(`⚡ ${msg}`, "ok");
    }
  }, [market.data, points.data, thesis.data, notify]);

  /* Morning diff — persist the last sync of each ET day; on the first sync of a later day, show
     "what changed since you left" on Market Pulse, then roll the snapshot forward. */
  const [morningDiff, setMorningDiff] = useState(null);
  const morningDiffChecked = useRef(false);
  useEffect(() => {
    if (!storageReady || !market.data) return;
    (async () => {
      const today = etDateKey();
      const snap = buildDaySnap(market.data);
      const prev = await loadStored(DAYSNAP_KEY, null);
      if (!morningDiffChecked.current && prev?.date && prev.date !== today) {
        morningDiffChecked.current = true;
        const lines = daySnapDiff(prev, snap);
        if (lines.length) setMorningDiff({ from: prev.label || prev.date, lines });
      }
      morningDiffChecked.current = true;
      saveStored(DAYSNAP_KEY, { date: today, ...snap });
    })();
  }, [storageReady, market.data]);

  /* Trade journal — attach (or clear) a logged trade on an archived thesis, mirrored into any
     live/viewing copy of the same entry. */
  const logTrade = (id, trade) => {
    setArchiveHistory((h) => h.map((e) => (e._id === id ? { ...e, _trade: trade || undefined } : e)));
    setThesis((s) => (s.data && s.data._id === id ? { ...s, data: { ...s.data, _trade: trade || undefined } } : s));
    setViewing((v) => (v && v._id === id ? { ...v, _trade: trade || undefined } : v));
    notify(trade ? "Trade logged to the library" : "Trade log removed", "ok");
  };

  const generateThesis = async () => {
    setViewing(null);
    setThesis((s) => ({ ...s, status: "loading", error: null }));
    try {
      const timing = buildTimingSnapshot({ market: market.data, news: news.data, points: points.data });
      const focusSpot = deskLiveContext(market.data, points.data, instrument).spot;
      // Single-stock focus has no index-style S/R in the feed — fetch real levels for the stock.
      let focusLevels = null;
      if (thesisInstrumentConfig(instrument).group === "stock") {
        try { focusLevels = await callDesk("stocklevels", "", { symbol: instrument }); } catch { focusLevels = null; }
      }
      // Optional paired instrument: pull its live spot + levels for a relative-value read.
      let pair = null;
      if (secondary && secondary !== instrument) {
        const secCfg = thesisInstrumentConfig(secondary);
        let secLevels = null;
        if (secCfg.group === "stock") {
          try { secLevels = await callDesk("stocklevels", "", { symbol: secondary }); } catch { secLevels = null; }
        }
        pair = {
          symbol: secCfg.symbol,
          name: secCfg.name,
          spot: deskLiveContext(market.data, points.data, secondary).spot,
          levels: secLevels || points.data?.[secCfg.pointsKey] || null,
        };
      }
      // If the currently-displayed thesis is for this same instrument, its own target/invalidation
      // levels let the fed options scenario be flagged as deliberately scoped to the desk's read,
      // rather than an arbitrary strike — carries through to both the AI prompt and the chip label.
      const priorThesis = thesis.data && thesis.data._instrument === instrument ? thesis.data : null;
      const priorThesisLevels = priorThesis
        ? { up: parseFirstPrice(priorThesis.levels?.upside), down: parseFirstPrice(priorThesis.levels?.downside) }
        : null;
      const deskContext = deskTools.feedToThesis
        ? buildDeskToolsContext({ deskTools, market: market.data, points: points.data, instrument, thesisLevels: priorThesisLevels })
        : null;
      // Jack's prior calls: recent Jacks Journal entries (cloud newsletter metadata) give the head
      // trader continuity — he references what the desk already published. Fail-soft: no journal,
      // no problem, the thesis still generates.
      let jackJournal = [];
      try {
        const r = await fetch("/api/archive?limit=8").then((x) => x.json());
        jackJournal = (r.data || []).map((it) => ({
          when: new Date(it.sentAt).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" }),
          type: it.type || "wrap",
          instrument: it.instrument || "",
          bias: it.bias || "",
          title: it.title || "",
        }));
      } catch { jackJournal = []; }
      const prompt = thesisPrompt({ market: market.data, news: news.data, points: points.data, timing, weights, lean, risk, notes, instrument, deskContext, focusSpot, focusLevels, pair, jackJournal, persona });
      const data = await callDesk("thesis", prompt, { market: market.data, news: news.data, points: points.data, timing, weights, lean, risk, notes, instrument, deskContext, focusLevels, secondary: pair ? pair.symbol : "", persona, personaName: (PERSONAS[persona] || PERSONAS[DEFAULT_PERSONA]).name });
      const entry = {
        ...data,
        instrument,
        secondary: pair ? pair.symbol : "",
        timestamp: data.timestamp || `${timing.generatedAtShort} · ${timing.session}`,
        timingNote: data.timingNote || timing.timingNote,
        _id: uid(),
        _date: dateShort(),
        _dateKey: etDateKey(),
        _spotAtGen: focusSpot || null,
        _time: timing.generatedAtShort || stampNow(),
        _ts: Date.now(),
        _generatedAt: timing.generatedAt,
        _quoteAsOf: timing.quoteAsOf,
        _timing: timing,
        _instrument: instrument,
        _weights: weights,
        _lean: lean,
        _risk: risk,
        _notes: notes,
        _persona: persona,
        _personaName: (PERSONAS[persona] || PERSONAS[DEFAULT_PERSONA]).name,
        _deskStructures: deskContext
          ? deskStructureLabels({ deskTools, market: market.data, points: points.data, instrument, thesisLevels: priorThesisLevels })
          : null,
        _tradeStructures: deskContext
          ? buildTradeStructures({
            deskTools, market: market.data, points: points.data, instrument,
            thesisLevels: { up: parseFirstPrice(data.levels?.upside), down: parseFirstPrice(data.levels?.downside) },
          })
          : null,
      };
      setThesis({ status: "ready", data: entry, error: null, at: { ts: Date.now(), label: stampNow() } });
      const newEntry = { ...entry, _type: "thesis" };
      const entrySig = (e) => JSON.stringify({ i: e._instrument, s: e.secondary || "", w: e._weights, l: e._lean, r: e._risk, n: (e._notes || "").trim() });
      // Rapid regenerations with identical inputs replace the previous thesis instead of flooding
      // the archive with near-duplicates; a genuine input change still creates a fresh entry.
      const top = archiveHistory[0];
      const willReplace = !!(top && top._type === "thesis" && entrySig(top) === entrySig(newEntry));
      setArchiveHistory((h) => (willReplace ? [newEntry, ...h.slice(1)] : [newEntry, ...h]).slice(0, 60));
      notify(willReplace ? "Thesis refreshed in the archive" : "Thesis locked + saved to the archive", "ok");
    } catch (e) {
      setThesis((s) => ({ ...s, status: "error", error: e.message }));
      notify("Synthesis failed — retry", "err");
    }
  };

  const addNote = (title) => {
    setNotes((n) => (n ? n + "\n" : "") + "• " + title);
    notify("Pinned to desk notes", "ok");
  };
  const deleteArchiveEntry = (id) => {
    setArchiveHistory((h) => h.filter((x) => x._id !== id));
    setViewing((v) => (v && v._id === id ? null : v));
    notify("Entry deleted from archive", "ok");
  };
  const clearHistory = () => {
    setArchiveHistory([]);
    setViewing(null);
    notify("Archive cleared", "ok");
  };

  // Master reset: every feature toggle, filter, watchlist and layout back to desk defaults. Wipes all
  // persisted UI keys (but keeps the thesis archive), pushes defaults to the account when signed in so
  // a re-hydrate can't restore old settings, then reloads so every persisted-state hook re-inits clean.
  const resetAll = useCallback(async () => {
    try {
      if (auth.signedIn) {
        await saveUserSettings(auth.getToken, {
          watchlist: DEFAULT_WATCHLIST,
          instrument: DEFAULT_THESIS_INSTRUMENT,
          weights: DEFAULT_WEIGHTS,
          lean: "auto",
          risk: "balanced",
          deskTools: DEFAULT_DESK_TOOLS,
          layout: { tab: "pulse", splitTab: null, lightMode: false },
        }).catch(() => {});
      }
      const drop = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("overwatch:") && k !== HISTORY_KEY) drop.push(k);
      }
      drop.forEach((k) => localStorage.removeItem(k));
    } catch { /* storage unavailable — the state resets below still apply before reload */ }
    window.location.reload();
  }, [auth.signedIn, auth.getToken]);
  const calendarGroupsForBadge = calendarEventGroups(points.data);
  const calendarBadge = calendarEventCount(calendarGroupsForBadge) || null;
  const thesisHistory = archiveHistory.filter((e) => e._type === "thesis" || !e._type);
  const archiveBadge = archiveHistory.length || null;
  // Symbols kept off the Pulse grid: anything toggled off in the watchlist (Mag 7 start off), plus
  // any single-stock focus that isn't on the visible board at all.
  const hiddenSymbols = useMemo(() => {
    const hidden = watchlistHiddenSet(watchlist);
    const visible = new Set(watchlist.filter((w) => !w.off).map((w) => w.symbol));
    THESIS_STOCK_SET.forEach((s) => { if (!visible.has(s)) hidden.add(s); });
    return hidden;
  }, [watchlist]);
  // Ordered to mirror the desk workflow: read continuity in the Library first, establish the regime on
  // Market Pulse, screen the News, confirm event risk on the Calendar, then build in the Thesis Lab.
  const TABS = [
    { id: "pulse", label: "Market Pulse", short: "Pulse", icon: Activity, badge: (market.data?.tickers || []).filter((t) => !hiddenSymbols.has(t.symbol)).length || null },
    { id: "archives", label: "Library", short: "Library", icon: History, badge: archiveBadge },
    { id: "news", label: "News Intel", short: "News", icon: Newspaper, badge: news.data?.headlines?.length },
    { id: "calendar", label: "Calendar", short: "Cal", icon: CalendarDays, badge: calendarBadge },
    { id: "thesis", label: "Thesis Lab", short: "Lab", icon: FlaskConical, badge: thesisHistory.length || null },
    { id: "charts", label: "Charts", short: "Charts", icon: CandlestickChart },
  ];

  // Render a tab's content by id. `nav` navigates the SAME pane this content lives in (setTab for the
  // main/left pane, setSplitTab for the right pane) so cross-tab jumps stay in the window you're in.
  const renderTab = (id, nav = setTab) => {
    switch (id) {
      case "pulse":
        return <PulseTab market={market} points={points.data} pointsState={points} news={news.data} vixHint={points.data?.vix?.structure} hiddenSymbols={hiddenSymbols} watchlist={watchlist} setWatchlist={setWatchlist} onRefresh={syncAll} onGoThesis={() => nav("thesis")} morningDiff={morningDiff} onDismissDiff={() => setMorningDiff(null)} />;
      case "news":
        return <NewsTab news={news} onRefresh={refreshNews} onAddNote={addNote} inSplit={splitOn} />;
      case "calendar":
        return <CalendarTab points={points} onRefresh={refreshPoints} inSplit={splitOn} lightMode={lightMode} />;
      case "thesis":
        return (
          <ThesisTab
            instrument={instrument} setInstrument={setInstrument}
            secondary={secondary} setSecondary={setSecondary}
            weights={weights} setWeights={setWeights}
            lean={lean} setLean={setLean}
            risk={risk} setRisk={setRisk}
            notes={notes} setNotes={setNotes}
            persona={persona} setPersona={setPersona}
            thesis={thesis} onGenerate={generateThesis} onLogTrade={logTrade}
            history={thesisHistory} viewing={viewing} setViewing={setViewing}
            onDeleteHist={deleteArchiveEntry} anyData={anyData}
            deskTools={deskTools} setDeskTools={setDeskTools}
            market={market.data} news={news.data} points={points.data}
            onGoLibrary={() => nav("archives")}
            notify={notify}
          />
        );
      case "charts":
        return <ChartsTab lightMode={lightMode} compact={splitOn} focusSymbol={THESIS_CHART_SYMBOL[instrument] || null} />;
      case "archives":
        return (
          <ArchiveTab
            archiveHistory={archiveHistory}
            viewing={viewing}
            setViewing={setViewing}
            onDeleteEntry={deleteArchiveEntry}
            onGoThesis={() => nav("thesis")}
            inSplit={splitOn}
            auth={auth}
          />
        );
      default:
        return null;
    }
  };

  // Compact tab picker that sits atop each split pane. In split view these per-pane bars are the
  // only navigation (the full-width top nav is hidden), so an optional right-aligned `extra` slot
  // carries the Exit-split control on the second pane.
  const paneTabs = (activeId, onPick, extra = null) => (
    <div className="split-pane-bar">
      {TABS.map((t) => (
        <button key={t.id} className={`split-pane-tab${activeId === t.id ? " on" : ""}`} onClick={() => onPick(t.id)} title={t.label}>
          <t.icon size={14} />
          <span>{t.short}</span>
        </button>
      ))}
      {extra && <div className="split-pane-bar-extra">{extra}</div>}
    </div>
  );

  return (
    <div className={`bd-root${lightMode ? " light" : ""}`}>

      {!online && (
        <div className="offline-banner"><WifiOff size={13} /> You're offline — data shown is the last successful sync.</div>
      )}
      {levelAlert && (
        <div className="level-alert-banner">
          <Zap size={13} />
          <span>{levelAlert.msg}</span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setLevelAlert(null)} title="Dismiss"><X size={13} /></button>
        </div>
      )}

      <div className="bd-topbar">
      <header className="bd-header">
        <div className="bd-logo">
          <div className="bd-mark" title="Overwatch">
            <svg viewBox="-50 -50 100 100" width="31" height="31" fill="none" style={{ stroke: "var(--brass)" }} strokeLinecap="round" strokeLinejoin="round" aria-label="Overwatch">
              <line x1="0" y1="-62" x2="0" y2="62" strokeWidth="2.5" opacity="0.4" />
              <line x1="-62" y1="0" x2="62" y2="0" strokeWidth="2.5" opacity="0.4" />
              <circle cx="0" cy="0" r="37" strokeWidth="5" />
              <circle cx="0" cy="0" r="30" strokeWidth="2.5" opacity="0.5" />
              <path d="M-22 14 L-13 6 L-6 -8 L2 5 L8 -1 L15 4 L22 14" strokeWidth="5" />
            </svg>
          </div>
          <div>
            <div className="bd-title">OVERWATCH <em>//</em> DAILY BIAS DESK</div>
            <div className="bd-sub">{dateShort()} · Overwatch Intelligence</div>
          </div>
          {/* Below 760px the avatar renders here, on the title's own row, right-aligned — so it sits
              directly above the settings button (which stays in the row below) instead of competing
              for space with the clock/session/sync/theme cluster and getting wrapped onto its own line. */}
          {winW <= 760 && CLERK_ENABLED && <span className="bd-logo-avatar"><AuthControl /></span>}
        </div>
        <div className="bd-hright">
          <span className="bd-clock">{clock}<span>ET</span></span>
          <span className={`bd-session bd-session-${session.tone}`}>
            <span className={`bd-dot ${session.tone === "live" ? "dot-live" : session.tone === "warn" ? "dot-warn" : "dot-off"}`} />
            {session.label}
          </span>
          <button className="btn btn-sync-icon" onClick={syncAll} disabled={anyLoading} title={anyLoading ? "Syncing…" : "Sync live data"} aria-label={anyLoading ? "Syncing…" : "Sync live data"}>
            {anyLoading ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
          </button>
          <button className="btn btn-ghost" onClick={() => setLightMode((m) => !m)} title={lightMode ? "Switch to dark mode" : "Switch to light mode"}>
            {lightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="btn btn-ghost" onClick={() => setSettingsOpen(true)} title="Desk settings"><Settings size={16} /></button>
          {winW > 760 && CLERK_ENABLED && <AuthControl />}
        </div>
      </header>

      {/* In split view the two per-pane bars below are the only navigation, so the full-width top
          nav is hidden to remove the duplicate row (it otherwise just mirrors the left pane). */}
      {!splitOn && (
        <nav className="bd-tabs">
          {TABS.map((t) => (
            <button key={t.id} className={`bd-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              <t.icon size={15} />
              {t.label}
              {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
            </button>
          ))}
          {splitEligible && (
            <button className="bd-tab split-toggle" onClick={toggleSplit} title="Split view — show two tabs side by side">
              <Columns2 size={15} /> <span className="split-label">Split view</span>
            </button>
          )}
        </nav>
      )}
      </div>

      <div className="bd-bottom-nav">
        <div className="bd-bottom-nav-inner">
          {TABS.map((t) => (
            <button key={t.id} className={`bd-bnav-btn${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
              {t.badge ? <span className="bd-bnav-dot" /> : null}
              <t.icon size={25} />
              {t.short}
            </button>
          ))}
        </div>
      </div>

      {splitOn ? (
        <main className="bd-main bd-main-split">
          <section className="split-pane">
            {paneTabs(tab, setTab)}
            <div className="split-pane-body">{renderTab(tab, setTab)}</div>
          </section>
          <section className="split-pane">
            {paneTabs(splitTab, setSplitTab, (
              <button className="split-pane-tab split-pane-exit" onClick={toggleSplit} title="Exit split view">
                <Columns2 size={14} /> <span>Exit split</span>
              </button>
            ))}
            <div className="split-pane-body">{renderTab(splitTab, setSplitTab)}</div>
          </section>
        </main>
      ) : (
        <main className="bd-main">{renderTab(tab, setTab)}</main>
      )}

      {/* Hidden in split view: the fixed-height split panes fill the viewport under the header, and a
          footer here would add page height, reintroducing the scroll that tucks the pane nav bars
          under the sticky header. */}
      {!splitOn && (
        <footer className="bd-foot">
          OVERWATCH DAILY BIAS DESK · DELAYED PUBLIC MARKET DATA (~15 MIN) + OPTIONAL AI SYNTHESIS — VERIFY LEVELS ON YOUR PLATFORM BEFORE TRADING · NOT FINANCIAL ADVICE
        </footer>
      )}

      <SettingsDrawer
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        watchlist={watchlist} setWatchlist={setWatchlist}
        onClearHistory={clearHistory} onResetAll={resetAll} storageOk={storageOk} notify={notify}
        auth={auth}
      />
      <Toasts items={toasts} />
    </div>
  );
}
