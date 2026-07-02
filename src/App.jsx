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
import Calculator from "lucide-react/dist/esm/icons/calculator.mjs";
import Sigma from "lucide-react/dist/esm/icons/sigma.mjs";
import Scale from "lucide-react/dist/esm/icons/scale.mjs";
import Layers from "lucide-react/dist/esm/icons/layers.mjs";
import Columns2 from "lucide-react/dist/esm/icons/columns-2.mjs";
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
  { symbol: "HG", name: "Copper Futures" },
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
];
const WATCHLIST_CAP = 30;
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

const InstrumentSelect = ({ value, onChange, className = "bd-in", style, noneLabel }) => (
  <select className={className} style={style} value={value} onChange={(e) => onChange(e.target.value)}>
    {noneLabel && <option value="">{noneLabel}</option>}
    {INSTRUMENT_GROUPS.map((g) => (
      <optgroup key={g.group} label={g.label}>
        {THESIS_INSTRUMENTS.filter((it) => it.group === g.group).map((it) => (
          <option key={it.symbol} value={it.symbol}>{it.symbol} — {it.name}</option>
        ))}
      </optgroup>
    ))}
  </select>
);

// Toggle-style ticker picker with a search filter and a scrollable, grouped instrument list. Portaled
// to <body> so a card's overflow can't clip it; closes on outside click / Escape. `exclude` omits a
// symbol (e.g. the other leg) from the list.
const TickerPicker = ({ value, onChange, exclude, title = "Change the instrument being priced" }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const cur = thesisInstrumentConfig(value);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 240) });
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
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      clearTimeout(focusTimer);
    };
  }, [open]);
  const needle = q.trim().toLowerCase();
  const match = (it) => !needle || it.symbol.toLowerCase().includes(needle) || it.name.toLowerCase().includes(needle);
  const anyMatch = THESIS_INSTRUMENTS.some((it) => it.symbol !== exclude && match(it));
  return (
    <span className="tkr-picker">
      <button
        ref={btnRef}
        type="button"
        className="bd-in tkr-picker-btn"
        onClick={() => { setOpen((o) => !o); setQ(""); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title}
      >
        <span className="tkr-picker-sym">{cur.symbol}</span>
        <span className="tkr-picker-name">{cur.name}</span>
        <ChevronDown size={13} style={{ opacity: 0.7, marginLeft: "auto", flex: "none" }} />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} className="tkr-picker-menu" style={{ top: pos.top, left: pos.left, width: pos.width }} role="listbox" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            className="tkr-picker-search"
            placeholder="Filter tickers…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="tkr-picker-scroll">
            {INSTRUMENT_GROUPS.map((g) => {
              const items = THESIS_INSTRUMENTS.filter((it) => it.group === g.group && it.symbol !== exclude && match(it));
              if (!items.length) return null;
              return (
                <div className="tkr-picker-group" key={g.group}>
                  <div className="tkr-picker-glabel">{g.label}</div>
                  {items.map((it) => (
                    <button
                      key={it.symbol}
                      type="button"
                      role="option"
                      aria-selected={it.symbol === value}
                      className={`tkr-picker-item${it.symbol === value ? " on" : ""}`}
                      onClick={() => { onChange(it.symbol); setOpen(false); }}
                    >
                      <span className="tkr-picker-isym">{it.symbol}</span>
                      <span className="tkr-picker-iname">{it.name}</span>
                      {it.symbol === value && <Check size={13} style={{ marginLeft: "auto", flex: "none" }} />}
                    </button>
                  ))}
                </div>
              );
            })}
            {!anyMatch && <div className="tkr-picker-empty">No tickers match “{q}”.</div>}
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
};

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

const thesisPrompt =({ market, news, points, timing, weights, lean, risk, notes, instrument, deskContext, focusSpot, focusLevels, pair }) => {
  const focus = thesisInstrumentConfig(instrument);
  const isStock = focus.group === "stock";
  const stockLevelsLine = focusLevels
    ? `${focus.symbol} live levels (use these exact numbers for the action level and targets): spot ${fmtNum(focusLevels.spot, 2)}, pivot ${fmtNum(focusLevels.pivot, 2)}, supports ${(focusLevels.supports || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"}, resistances ${(focusLevels.resistances || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"} (as of ${focusLevels.asOf || "now"}).`
    : "";
  const pairBlock = pair ? `
=== PAIRED INSTRUMENT (relative-value context) ===
The trader is weighing ${focus.symbol} alongside ${pair.symbol} (${pair.name})${pair.spot ? `, trading near ${fmtNum(pair.spot, 2)}` : ""}.${pair.levels ? ` ${pair.symbol} levels: pivot ${fmtNum(pair.levels.pivot, 2)}, supports ${(pair.levels.supports || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"}, resistances ${(pair.levels.resistances || []).map((x) => fmtNum(x, 2)).join(" / ") || "n/a"}.` : ""}
In "pairRead", give a concise relative-value read: how ${focus.symbol} is likely to perform RELATIVE to ${pair.symbol} today (e.g. favour long ${focus.symbol} / short ${pair.symbol} or the reverse), the correlation or divergence to watch, and the key level on each leg. Keep the headline bias, score and levels focused on ${focus.symbol}; the pair read is an additional relative-value angle, not the primary call.
` : "";
  return `You are the head strategist at Overwatch Intelligence's index desk. Build today's daily bias thesis for trading ${focus.focusLabel}. Today is ${dateLine()}.

=== LIVE DESK DATA ===
${condenseMarket(market)}

${condenseNews(news)}

${condensePoints(points)}

=== TIMING CONTEXT ===
${condenseTiming(timing)}

=== DESK CONFIGURATION ===
Pillar weights (0-100, higher = more influence on the call): Technicals ${weights.technicals}, Macro/News ${weights.macro}, Sentiment ${weights.sentiment}, Positioning/Flows ${weights.positioning}, Event Risk ${weights.eventRisk}.
Directional lean: ${lean === "auto" ? "none — derive direction purely from the data" : `trader is leaning ${lean} — stress-test that lean against the data and push back if it is not justified`}.
Risk appetite: ${risk}.
Primary instrument focus: ${focus.symbol} (${focus.name})${focusSpot ? `, currently trading near ${fmtNum(focusSpot, 2)}` : ""} with ${focus.futures} futures as the ${isStock ? "index hedge" : "live execution"} proxy when relevant.
${isStock ? `IMPORTANT — ${focus.symbol} is a SINGLE STOCK. The support/resistance/pivot numbers in the data above (SPX / NDX / DJI) are INDEX levels, NOT ${focus.symbol}'s — use the index internals only as macro proxy context and say so. ${stockLevelsLine ? `${stockLevelsLine} Build the action level, upside and downside targets, game plan, invalidation and watch list from THESE ${focus.symbol} numbers — give specific prices, not vague descriptions.` : `Build the levels around ${focus.symbol}'s OWN price${focusSpot ? ` (live near ${fmtNum(focusSpot, 2)})` : ""} and your knowledge of its recent range, with specific prices.`} NEVER quote an index level as if it were ${focus.symbol}'s level.` : ""}
Trader notes: ${notes ? notes : "none"}.
${deskContext ? `
=== DESK HEDGE & OPTIONS STRUCTURES (trader is actively considering these) ===
${deskContext}
Weave these into the game plan with SPECIFICS: state whether each structure fits today's bias, conviction, and risk appetite; give concrete entry, profit-taking and stop/exit guidance for the priced option or hedge (reference the actual strike, premium and the thesis's own upside/downside levels); and flag any mismatch (e.g. paying for downside puts into a high-conviction bullish call).
` : ""}${pairBlock}
Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"bias":"bullish|bearish|neutral","score":<integer -100 to 100>,"conviction":<integer 1-10>,"timestamp":"<generated time and ET session>","timingNote":"<one short timestamp/data-freshness note; mention stale cash-index risk when relevant>","headline":"<punchy 6-12 word thesis headline>","summary":"<4-5 sentence thesis grounded in the data, weights, and stance>","pillarRead":"<one sentence explaining which weighted pillars drove the call>","stanceRead":"<one sentence explaining how directional lean and risk appetite changed or constrained the call>","pairRead":${pair ? `"<relative-value read: ${focus.symbol} vs ${pair.symbol}, the lean (which leg long/short), correlation/divergence to watch, and the key level on each leg>"` : '""'},"drivers":["<5-7 ranked key drivers, including top weighted pillars and stance impact>"],"bullCase":["<2-3 bullets>"],"bearCase":["<2-3 bullets>"],"levels":{"action":"<the single level that matters most today and why>","upside":"<upside targets>","downside":"<downside targets>"},"gamePlan":"<2-3 sentences: concrete approach for ${focus.symbol} (and ${focus.futures} where relevant) given this bias and risk appetite>","invalidation":"<the specific price or condition that kills this thesis>","standAside":"<conditions under which the best trade today is NO trade>"}

Be specific — use actual numbers from the data. The sign of score must match bias. Conviction should reflect how aligned the weighted pillars are.
Treat the pillar weights as a scoring model, not decoration: high-weight pillars must have more influence than low-weight pillars and the drivers must name the highest-weight/highest-impact inputs.
Treat the desk stance as a constraint: directional lean may tilt the score, but you must push back if the weighted data disagrees; risk appetite must alter conviction, sizing language, and stand-aside conditions.
Focus the levels, game plan, invalidation, and watchpoints on ${focus.symbol} first. You can reference the broader index complex, but the trade expression should be built for ${focus.focusLabel}.
The thesis must explicitly use the Internals regime: explain whether market breadth confirms or conflicts with price, what the trend state means in plain English, and whether the volatility structure supports risk-taking or argues for tighter risk.
When session is PRE-MARKET, AFTER-HOURS, or CLOSED, explicitly account for the possibility that SPX/NDX/DJI reflect the last regular close while ES/NQ/YM futures are live. Weight ${focus.futures} more heavily when it diverges from ${focus.symbol}, and say that in timingNote.`;
};

/* ================================================================
   STYLES — graphite-navy desk terminal, brass signal accent
   ================================================================ */

/* ================================================================
   PRIMITIVES
   ================================================================ */

const Card = ({ icon: Ic, title, sub, tools, children, className = "", style, onClick }) => (
  <div className={`card ${className}`} style={style} onClick={onClick}>
    {(title || tools) && (
      <div className="card-head">
        {Ic && <Ic size={15} className="ic" />}
        <div className="card-title">
          {title}
          {sub && <small>{sub}</small>}
        </div>
        <div className="card-tools">{tools}</div>
      </div>
    )}
    {children}
  </div>
);

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

// Dark-yellow "as of" pill: shows the effective quote time (~15 min behind the last sync, since the
// free feed is delayed) with a staleness tier. Shared by the global header and the Session read card.
const AsOfLabel = ({ ts, prefix = "prices as of", compact = false }) => {
  if (!ts) return null;
  const ageMin = Math.floor((Date.now() - ts) / 60000);
  const tier = ageMin >= 30 ? "stale" : ageMin >= 10 ? "aging" : "";
  const quoteLabel = new Date(ts - 15 * 60 * 1000)
    .toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });
  // Compact form ("~15 min delay") is used where space is tight (Market snapshot header); the full
  // form shows the effective quote time. The tooltip carries the specifics either way.
  return (
    <span className={`bd-asof ${tier}`} title={`Quotes are on a ~15-minute delay from a free public feed — not real-time. Displayed price time ≈ ${quoteLabel} ET; desk last synced ${ageMin}m ago.`}>
      {tier === "stale" ? "STALE · " : ""}{compact ? "~15 min delay" : `${prefix} ${quoteLabel} ET`}
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

const SectorHeatmap = ({ sectors }) => {
  const [sortMode, setSortMode] = useState("perf");
  const base = [...(sectors || [])].filter((s) => s && s.changePct != null);
  if (!base.length) return <div style={{ color: C.muted, fontSize: 12 }}>No sector data in last sync.</div>;
  const sorted = base.sort((a, b) =>
    sortMode === "name" ? String(a.name).localeCompare(String(b.name))
      : sortMode === "abs" ? Math.abs(b.changePct) - Math.abs(a.changePct)
        : b.changePct - a.changePct
  );
  const maxAbs = Math.max(0.4, ...sorted.map((s) => Math.abs(s.changePct)));
  return (
    <>
    <div className="seg" style={{ maxWidth: 300, marginBottom: 11, fontSize: 11 }}>
      {[["perf", "% change"], ["abs", "magnitude"], ["name", "name"]].map(([m, lbl]) => (
        <button key={m} className={sortMode === m ? "on" : ""} onClick={() => setSortMode(m)}>{lbl}</button>
      ))}
    </div>
    <div className="hm">
      {sorted.map((s) => {
        const a = clamp(Math.abs(s.changePct) / maxAbs, 0.12, 1);
        const bg = s.changePct >= 0 ? `rgba(34,197,94,${0.07 + a * 0.3})` : `rgba(239,68,68,${0.07 + a * 0.3})`;
        const bc = s.changePct >= 0 ? `rgba(34,197,94,${0.25 + a * 0.45})` : `rgba(239,68,68,${0.25 + a * 0.45})`;
        return (
          <div key={s.name} className="hm-tile" style={{ background: bg, borderColor: bc }} title={`${s.name}: ${fmtSigned(s.changePct, 2, "%")}`}>
            <div className="hm-name">{s.name}</div>
            <div className="hm-val" style={{ color: chgColor(s.changePct) }}>{fmtSigned(s.changePct, 2, "%")}</div>
          </div>
        );
      })}
    </div>
    </>
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
const FactorRadarChart = ({ weights, onChange }) => {
  const data = FACTORS.map((f) => ({ key: f.key, k: f.label.split(" ")[0], v: Number(weights[f.key]) || 0 }));
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
              <text x={lx} y={ly - 5} textAnchor="middle" dominantBaseline="middle" fill="#94A3B8" fontSize="10.5" fontFamily="JetBrains Mono, monospace">{d.k}</text>
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

// Five mini daily candlesticks for the level-map header (today's partial candle is the last one).
const CandleStrip = ({ candles, decimals = 2, live = false }) => {
  if (!candles?.length) return null;
  const W = 90, H = 72, n = candles.length, pad = 5;
  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const y = (v) => pad + ((max - v) / (max - min || 1)) * (H - 2 * pad);
  const bw = 12, gap = (W - n * bw) / n;
  return (
    <svg width={W} height={H} className="lm-candles" aria-label={`Last ${n} daily candles`}>
      {candles.map((c, i) => {
        const x = gap / 2 + i * (bw + gap) + bw / 2;
        const up = c.c >= c.o;
        const col = up ? C.bull : C.bear;
        const top = y(Math.max(c.o, c.c)), bot = y(Math.min(c.o, c.c));
        const dateLabel = new Date(c.t * 1000).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
        return (
          <g key={c.t}>
            <title>{`${dateLabel} — O ${fmtNum(c.o, decimals)} H ${fmtNum(c.h, decimals)} L ${fmtNum(c.l, decimals)} C ${fmtNum(c.c, decimals)}`}</title>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.4" />
            <rect x={x - bw / 2} y={top} width={bw} height={Math.max(bot - top, 2)} fill={col} rx="1.5" opacity={i === n - 1 && live ? 1 : 0.82} />
          </g>
        );
      })}
    </svg>
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

const LevelMapCard = ({ defaultSymbol, points, tickers }) => {
  const [active, setActive] = useState(defaultSymbol);
  const [period, setPeriod] = useState("d"); // d = daily (session), w = weekly (week-to-date)
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
        </span>
      }
    >
      <div className="lm-map-wrap">
        <LevelsLadder spx={spxData} label={active} decimals={lmDecimals(active, tickers)} ohlc={ohlc} />
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
const SNAP_FUTURES_SET = new Set(["ES", "NQ", "YM", "RTY"]);
const SNAP_ETF_SET = new Set(["SPY", "QQQ", "DIA", "IWM", "SMH", "HYG"]);
const SNAP_FILTER_OPTIONS = [
  { key: "all", label: "All markets", short: "Markets" },
  { key: "live", label: "Live now", short: "Live" },
  { key: "futures", label: "Futures", short: "Futures" },
  { key: "etfs", label: "ETFs", short: "ETFs" },
  { key: "mag7", label: "Mag 7", short: "Mag 7" },
];
const SNAP_FILTER_TEST = {
  live: (t) => symbolMarketOpen(t.symbol),
  futures: (t) => SNAP_FUTURES_SET.has(t.symbol),
  etfs: (t) => SNAP_ETF_SET.has(t.symbol),
  mag7: (t) => THESIS_STOCK_SET.has(t.symbol),
};

// "Markets" dropdown that replaces the old Live-markets toggle in the snapshot header.
const SnapMarketFilter = ({ value, onChange, anyMarketOpen }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const current = SNAP_FILTER_OPTIONS.find((o) => o.key === value) || SNAP_FILTER_OPTIONS[0];
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
        className={`fchip snap-filter-btn${value !== "all" ? " on" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Filter the snapshot by market group"
      >
        {value === "live" && <span className={`snap-live-dot${anyMarketOpen ? " on" : ""}`} />}
        {current.short}
        <ChevronDown size={12} style={{ opacity: 0.7 }} />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} className="snap-filter-menu" style={{ top: pos.top, right: pos.right }} role="listbox" onClick={(e) => e.stopPropagation()}>
          {SNAP_FILTER_OPTIONS.map((o) => (
            <button
              key={o.key}
              role="option"
              aria-selected={o.key === value}
              className={`snap-filter-item${o.key === value ? " on" : ""}`}
              onClick={() => { onChange(o.key); setOpen(false); }}
            >
              {o.key === "live" && <span className={`snap-live-dot${anyMarketOpen ? " on" : ""}`} />}
              <span>{o.label}</span>
              {o.key === value && <Check size={13} style={{ marginLeft: "auto" }} />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </span>
  );
};

const PulseTab = ({ market, points, pointsState, news, vixHint, hiddenSymbols, onRefresh, onGoThesis, morningDiff = null, onDismissDiff }) => {
  const { status, data, error, at } = market;
  // Section-collapse state. These hooks must run before any early return so the hook order stays
  // stable across the idle/loading/error → ready transitions (Rules of Hooks).
  const [tickersOpen, setTickersOpen] = useState(false); // Market snapshot — collapsed by default
  const [marketFilter, setMarketFilter] = useState("all"); // snapshot "Markets" dropdown (expanded only)
  const [levelsOpen, setLevelsOpen] = useState(true);    // Level maps — open by default (core read)

  // Hidden watchlist symbols (e.g. the Mag 7, off by default) plus any Thesis-Lab-only single stock
  // are fetched for pricing but kept off the Pulse grid until toggled on in Settings. Memoized so the
  // filter/sort and the session synthesis only recompute when their inputs actually change.
  const hideSet = hiddenSymbols || THESIS_STOCK_SET;
  const tickers = useMemo(() => (data?.tickers || []).filter((t) => !hideSet.has(t.symbol)), [data, hideSet]);
  const orderedTickers = useMemo(() => orderAssetCards(tickers), [tickers]);
  // Level maps can target the full fetched universe (incl. the Mag 7 that are hidden from the grid),
  // grouped in the picker by type.
  const levelTickers = useMemo(() => orderAssetCards(data?.tickers || []), [data]);
  // Any instrument in the watchlist currently trading? Drives the live pulse on the snapshot icon.
  const anyMarketOpen = useMemo(() => orderedTickers.some((t) => symbolMarketOpen(t.symbol)), [orderedTickers]);
  const session = useMemo(() => buildSessionRead({ market: data, points, news }), [data, points, news]);

  // The snapshot grid after the "Markets" filter. Mag 7 pulls from the full fetched set so it can be
  // seen even though those tickers are hidden from the default board; other filters stay on the board.
  const displayTickers = useMemo(() => {
    if (marketFilter === "mag7") return orderAssetCards((data?.tickers || []).filter((t) => THESIS_STOCK_SET.has(t.symbol)));
    const test = SNAP_FILTER_TEST[marketFilter];
    return test ? orderedTickers.filter(test) : orderedTickers;
  }, [marketFilter, orderedTickers, data]);

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
            {tickersOpen && marketFilter !== "all" ? `${displayTickers.length} of ${orderedTickers.length}` : `${orderedTickers.length} instruments`}
          </small>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {tickersOpen && at?.ts && (
              <span className="snap-asof" onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center" }}>
                <AsOfLabel ts={at.ts} compact />
              </span>
            )}
            {tickersOpen && (
              <SnapMarketFilter value={marketFilter} onChange={setMarketFilter} anyMarketOpen={anyMarketOpen} />
            )}
            {tickersOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
        {tickersOpen && (() => {
          return (
          <div style={{ padding: "12px 12px 12px" }}>
            {displayTickers.length ? (
            <div className="grid g-pulse">
            {displayTickers.map((t) => (
              <div className="card tk" key={t.symbol} style={t._stale ? { opacity: 0.5 } : undefined}>
                <div className="tk-glow" style={{ background: `linear-gradient(90deg,transparent,${chgColor(t.changePct)},transparent)`, opacity: 0.55 }} />
                <div className="tk-top">
                  <span className="tk-sym">{t.symbol}</span>
                  {t._stale
                    ? <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: ".06em" }}>NO DATA</span>
                    : t.changePct != null && (() => {
                        const up = t.changePct >= 0;
                        const col = up ? C.bull : C.bear;
                        const live = symbolMarketOpen(t.symbol);
                        const DirIcon = up ? TrendingUp : TrendingDown;
                        return (
                          <span
                            className={`tk-dir${live ? " tk-dir-live" : ""}`}
                            style={live ? { "--dir-glow": col } : undefined}
                            title={live ? "Market open — trading now" : undefined}
                          >
                            <DirIcon size={14} color={col} />
                          </span>
                        );
                      })()}
                </div>
                <div className="tk-body">
                  <div className="tk-left">
                    <div className="tk-name" title={t.name}>{t.name}</div>
                    <div className="tk-price">{t._stale ? "—" : fmtNum(t.price, t.symbol === "US10Y" ? 3 : 2)}</div>
                    <div className="tk-chg">
                      <span style={{ color: chgColor(t.change) }}>{t._stale ? "—" : fmtSigned(t.change)}</span>
                      <span style={{ color: chgColor(t.changePct) }}>{t._stale ? "—" : fmtSigned(t.changePct, 2, "%")}</span>
                    </div>
                  </div>
                  {!t._stale && <DayCandle low={t.dayLow} high={t.dayHigh} price={t.price} dayOpen={t.dayOpen} previousClose={t.previousClose} decimals={t.symbol === "US10Y" ? 3 : (t.symbol === "DXY" || Math.abs(Number(t.price)) < 100) ? 2 : 0} />}
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
            <div className="grid g-data pulse-levels-desktop" style={{ alignItems: "start" }}>
              {LEVEL_MAP_DEFAULTS.map((sym) => (
                <LevelMapCard key={sym} defaultSymbol={sym} points={points} tickers={levelTickers} />
              ))}
            </div>
            <div className="pulse-levels-mobile">
              <LevelMapCard defaultSymbol="SPY" points={points} tickers={levelTickers} />
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
      <Card icon={Activity} title="Sector tape" sub="Today's GICS sector performance, sorted">
        <SectorHeatmap sectors={data?.sectors} />
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

const NewsTab = ({ news, onRefresh, onAddNote, inSplit = false }) => {
  const { status, data, error, at } = news;
  const [cat, setCat] = useState("all");
  const [tone, setTone] = useState("all");
  const [sortBy, setSortBy] = useState("time"); // time | impact
  const [sortDir, setSortDir] = useState("desc"); // desc (newest / highest first) | asc

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
        <div className="filter-row">
          {cats.map((c) => (
            <button key={c} className={`fchip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
          <span style={{ flex: 1 }} />
          {["all", "bullish", "bearish", "neutral"].map((t) => (
            <button key={t} className={`fchip ${tone === t ? "on" : ""}`} onClick={() => setTone(t)} style={tone === t && t !== "all" ? { color: sentColor(t), borderColor: sentColor(t) } : {}}>{t}</button>
          ))}
        </div>
        <div className="filter-row" style={{ marginTop: -3 }}>
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
const TradingViewCalendarWidget = () => {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
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
      colorTheme: "dark",
      // Keep transparency off: the Events widget falls back to a light surface and ignores
      // colorTheme:"dark" when isTransparent is true, so force it to paint its own dark background.
      isTransparent: false,
      locale: "en",
      countryFilter: "us",
      importanceFilter: "1",
      width: "100%",
      height: "100%",
    });
    container.appendChild(script);
    return () => { container.innerHTML = ""; };
  }, []);
  return <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }} />;
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

const CalendarTab = ({ points, onRefresh, inSplit = false }) => {
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
      <div className="cal-reader-body"><TradingViewCalendarWidget /></div>
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
            <div className="cal-embed-card-body"><TradingViewCalendarWidget /></div>
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

const BreadthDistribution = ({ distribution = {}, total = 11 }) => {
  const segments = [
    { key: "strongUp", label: "Strong up", color: C.bull, value: distribution.strongUp || 0 },
    { key: "up", label: "Up", color: "rgba(34,197,94,.58)", value: distribution.up || 0 },
    { key: "flat", label: "Flat", color: C.brass, value: distribution.flat || 0 },
    { key: "down", label: "Down", color: "rgba(239,68,68,.58)", value: distribution.down || 0 },
    { key: "strongDown", label: "Strong down", color: C.bear, value: distribution.strongDown || 0 },
  ];
  return (
    <div className="breadth-dist" aria-label="Sector breadth distribution">
      <div className="breadth-dist-track">
        {segments.map((segment) => (
          <span
            key={segment.key}
            title={`${segment.label}: ${segment.value}`}
            style={{ width: `${Math.max(0, (segment.value / Math.max(total, 1)) * 100)}%`, background: segment.color }}
          />
        ))}
      </div>
      <div className="breadth-dist-labels">
        <span>Strong down</span>
        <span>Flat</span>
        <span>Strong up</span>
      </div>
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
  const max = Math.max(...bands.map((band) => band.max || 40), 40);
  const marker = Number.isFinite(vix) ? clamp((vix / max) * 100, 0, 100) : null;
  return (
    <div className="vol-map">
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

      <div className="internals-section">
        <div className="internals-section-head">
          <b>Market breadth</b>
          <span>{breadth.read || internals.breadth || "Sector breadth is still loading."}</span>
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
        <BreadthDistribution distribution={breadth.distribution} total={total} />
        {!!sectors.length && (
          <div className="sector-chip-grid">
            {sectors.map((sector) => (
              <span className="sector-chip" key={sector.name}>
                <span>{sector.name}</span>
                <b style={{ color: chgColor(sector.changePct) }}>{fmtSigned(sector.changePct, 2, "%")}</b>
              </span>
            ))}
          </div>
        )}
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

// Generic two-leg vertical spread (same type, long one strike, short another).
// Handles debit/credit and bull/bear from the strike ordering; values in $ (×100×contracts).
const evalVertical = ({ type, kLong, kShort, premLong, premShort, contracts = 1 }) => {
  const pay = (K, S) => (type === "put" ? Math.max(K - S, 0) : Math.max(S - K, 0));
  const net = premLong - premShort; // >0 = net debit paid
  const lo = Math.min(kLong, kShort), hi = Math.max(kLong, kShort);
  const plAt = (S) => pay(kLong, S) - pay(kShort, S) - net;
  const pls = [0, lo, hi, hi * 2 + 1000].map(plAt);
  const maxP = Math.max(...pls), maxL = Math.min(...pls);
  let be = null, prev = plAt(lo);
  const steps = 2000;
  for (let i = 1; i <= steps; i++) {
    const S = lo + ((hi - lo) * i) / steps;
    const cur = plAt(S);
    if ((prev <= 0 && cur >= 0) || (prev >= 0 && cur <= 0)) { be = S; break; }
    prev = cur;
  }
  return {
    net,
    isDebit: net > 0,
    width: hi - lo,
    maxProfit: maxP * 100 * contracts,
    maxLoss: maxL * 100 * contracts,
    breakeven: be,
    rr: maxL !== 0 ? maxP / Math.abs(maxL) : null,
  };
};

// Calendar / diagonal: long far-dated, short near-dated. Value estimated at the near expiry
// assuming spot is unchanged, using the far leg's remaining time value.
const evalCalendar = ({ type, kNear, kFar, premNear, premFar, contracts = 1, S, sigma, r, q, nearDays, farDays }) => {
  const net = premFar - premNear; // net debit paid
  const remT = Math.max(farDays - nearDays, 0) / 365;
  const farRemain = blackScholes({ S, K: kFar, T: remT, r, q, sigma, type }).price;
  const nearIntrinsic = type === "put" ? Math.max(kNear - S, 0) : Math.max(S - kNear, 0);
  const valAtNear = farRemain - nearIntrinsic;
  return {
    net,
    debit: net * 100 * contracts,
    valueAtNearExpiry: valAtNear * 100 * contracts,
    estPnl: (valAtNear - net) * 100 * contracts,
  };
};

// Pairs / ratio hedge between two correlated instruments.
const evalPairs = ({ priceLong, priceShort, betaLong, betaShort, notional }) => {
  if (!(priceLong > 0) || !(priceShort > 0) || !(betaShort > 0)) return null;
  const ratio = (priceLong * betaLong) / (priceShort * betaShort); // short units per 1 long unit
  const unitsLong = notional / priceLong;
  const shortNotional = notional * (betaLong / betaShort); // beta-neutral
  const unitsShort = shortNotional / priceShort;
  return { ratio, unitsLong, unitsShort, longNotional: notional, shortNotional };
};

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
  hedge: {
    beta: { on: true, portfolioValue: "100000", beta: "1.00", mode: "futures", putOtmPct: "5" },
    vertical: { on: false, type: "call", longStrike: "", shortStrike: "", contracts: "1" },
    calendar: { on: false, type: "call", strike: "", farStrike: "", nearDays: "7", farDays: "37", contracts: "1" },
    pairs: { on: false, longSym: "QQQ", shortSym: "SPY", betaLong: "1.20", betaShort: "1.00", notional: "100000" },
  },
};

// Deep-merge a saved deskTools blob (from local storage or the cloud) onto the defaults, keeping
// only known sub-objects and validating the pairs symbols against the current instrument table.
const mergeSavedDeskTools = (base, saved) => {
  if (!saved || typeof saved !== "object") return base;
  const savedPairs = saved.hedge?.pairs || {};
  const validSym = (sym, fallback) => THESIS_INSTRUMENTS.some((it) => it.symbol === sym) ? sym : fallback;
  return {
    ...base,
    ...saved,
    env: { ...base.env, ...(saved.env || {}) },
    options: { ...base.options, ...(saved.options || {}) },
    env2: { ...base.env2, ...(saved.env2 || {}) },
    options2: { ...base.options2, ...(saved.options2 || {}) },
    hedge: {
      beta: { ...base.hedge.beta, ...(saved.hedge?.beta || {}) },
      vertical: { ...base.hedge.vertical, ...(saved.hedge?.vertical || {}) },
      calendar: { ...base.hedge.calendar, ...(saved.hedge?.calendar || {}) },
      pairs: {
        ...base.hedge.pairs,
        ...savedPairs,
        longSym: validSym(savedPairs.longSym, base.hedge.pairs.longSym),
        shortSym: validSym(savedPairs.shortSym, base.hedge.pairs.shortSym),
      },
    },
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

// Builds a compact human-readable summary of the enabled desk tools for the AI synthesis.
const buildDeskToolsContext = ({ deskTools, market, points, instrument }) => {
  const live = deskLiveContext(market, points, instrument);
  const { S, sigma, r, q, days, T } = resolveEnv(deskTools.env, live);
  const lines = [];
  // Spot-dependent context (options scenario + option/futures hedges) only when a focus spot is available.
  if (S > 0) {
    lines.push(
      `Pricing environment: ${live.cfg.symbol} spot ${fmtNum(S, 2)}, IV ${fmtNum(sigma * 100, 1)}%, ${days}d to expiry, rate ${fmtNum(r * 100, 2)}%, dividend ${fmtNum(q * 100, 2)}%.`
    );
    if (deskTools.options.feed) {
      const oStrike = numOr(deskTools.options.strike, roundStrike(S));
      const obs = blackScholes({ S, K: oStrike, T, r, q, sigma, type: deskTools.options.type });
      lines.push(
        `Options scenario: ${deskTools.options.type.toUpperCase()} ${fmtNum(oStrike, 0)} theo ${fmtNum(obs.price, 2)} (Δ ${fmtNum(obs.delta, 2)}, Γ ${fmtNum(obs.gamma, 4)}, Θ ${fmtNum(obs.theta, 2)}/day, vega ${fmtNum(obs.vega, 2)}/pt).`
      );
    }
  }

  const h = deskTools.hedge;
  if (h.beta.on && S > 0) {
    const pv = numOr(h.beta.portfolioValue, 0);
    const beta = numOr(h.beta.beta, 1);
    const notional = pv * beta;
    if (h.beta.mode === "puts") {
      const k = roundStrike(S * (1 - numOr(h.beta.putOtmPct, 5) / 100));
      const pb = blackScholes({ S, K: k, T, r, q, sigma, type: "put" });
      const contracts = pb.delta !== 0 ? notional / (S * 100 * Math.abs(pb.delta)) : 0;
      lines.push(
        `Beta-weighted hedge: ${fmtUsd(pv)} book at beta ${fmtNum(beta, 2)} → buy ~${fmtNum(contracts, 1)} ${live.cfg.symbol} ${fmtNum(k, 0)} puts (cost ≈ ${fmtUsd(pb.price * 100 * contracts)}) to neutralize ${fmtUsd(notional)} of delta.`
      );
    } else {
      const futPrice = live.priceOf(live.futSym) ?? live.spot;
      const contracts = futPrice > 0 ? notional / (futPrice * live.futMult) : 0;
      lines.push(
        `Beta-weighted hedge: ${fmtUsd(pv)} book at beta ${fmtNum(beta, 2)} → short ~${fmtNum(contracts, 2)} ${live.futSym} futures (×${live.futMult}) to offset ${fmtUsd(notional)} of exposure.`
      );
    }
  }
  if (h.vertical.on && S > 0) {
    const kL = numOr(h.vertical.longStrike, roundStrike(S));
    const kS = numOr(h.vertical.shortStrike, roundStrike(S * (h.vertical.type === "call" ? 1.02 : 0.98)));
    const premL = blackScholes({ S, K: kL, T, r, q, sigma, type: h.vertical.type }).price;
    const premS = blackScholes({ S, K: kS, T, r, q, sigma, type: h.vertical.type }).price;
    const v = evalVertical({ type: h.vertical.type, kLong: kL, kShort: kS, premLong: premL, premShort: premS, contracts: numOr(h.vertical.contracts, 1) });
    lines.push(
      `Vertical spread: ${h.vertical.type} ${fmtNum(kL, 0)}/${fmtNum(kS, 0)} (${v.isDebit ? "debit" : "credit"}) — max profit ${fmtUsd(v.maxProfit)}, max loss ${fmtUsd(v.maxLoss)}, BE ${fmtNum(v.breakeven, 0)}, R/R ${fmtNum(v.rr, 2)}.`
    );
  }
  if (h.calendar.on && S > 0) {
    const kNear = numOr(h.calendar.strike, roundStrike(S));
    const kFar = numOr(h.calendar.farStrike, kNear);
    const nearDays = numOr(h.calendar.nearDays, 7);
    const farDays = numOr(h.calendar.farDays, 37);
    const premNear = blackScholes({ S, K: kNear, T: nearDays / 365, r, q, sigma, type: h.calendar.type }).price;
    const premFar = blackScholes({ S, K: kFar, T: farDays / 365, r, q, sigma, type: h.calendar.type }).price;
    const c = evalCalendar({ type: h.calendar.type, kNear, kFar, premNear, premFar, contracts: numOr(h.calendar.contracts, 1), S, sigma, r, q, nearDays, farDays });
    lines.push(
      `${kNear === kFar ? "Calendar" : "Diagonal"} spread: ${h.calendar.type} ${fmtNum(kNear, 0)}${kNear === kFar ? "" : "/" + fmtNum(kFar, 0)} ${nearDays}d vs ${farDays}d — net debit ${fmtUsd(c.debit)}, est P/L at near expiry (spot flat) ${fmtUsd(c.estPnl)}.`
    );
  }
  if (h.pairs.on) {
    const priceLong = live.priceOf(h.pairs.longSym);
    const priceShort = live.priceOf(h.pairs.shortSym);
    const p = evalPairs({ priceLong, priceShort, betaLong: numOr(h.pairs.betaLong, 1), betaShort: numOr(h.pairs.betaShort, 1), notional: numOr(h.pairs.notional, 0) });
    if (p) {
      lines.push(
        `Pairs/ratio: long ${h.pairs.longSym} vs short ${h.pairs.shortSym} — hedge ratio ${fmtNum(p.ratio, 3)} (short units per long), beta-neutral short notional ${fmtUsd(p.shortNotional)}.`
      );
    }
  }
  return lines.join("\n");
};

// Short chip labels for the structures fed into a thesis — rendered back in the output as confirmation.
const deskStructureLabels = ({ deskTools, market, points, instrument }) => {
  const live = deskLiveContext(market, points, instrument);
  const { S, days } = resolveEnv(deskTools.env, live);
  const out = [];
  const o = deskTools.options;
  const h = deskTools.hedge;
  if (S > 0) {
    if (o.feed) out.push(`Options: ${o.type} ${fmtNum(numOr(o.strike, roundStrike(S)), 0)} · ${days}d`);
    if (h.beta.on) out.push(`Beta hedge · ${h.beta.mode === "puts" ? `${live.cfg.symbol} puts` : `${live.futSym} futures`}`);
    if (h.vertical.on) {
      const kL = numOr(h.vertical.longStrike, roundStrike(S));
      const kS = numOr(h.vertical.shortStrike, roundStrike(S * (h.vertical.type === "call" ? 1.02 : 0.98)));
      out.push(`${h.vertical.type} vertical ${fmtNum(kL, 0)}/${fmtNum(kS, 0)}`);
    }
    if (h.calendar.on) {
      const kN = numOr(h.calendar.strike, roundStrike(S));
      const kF = numOr(h.calendar.farStrike, kN);
      out.push(`${h.calendar.type} ${kN === kF ? "calendar" : "diagonal"} ${fmtNum(kN, 0)} · ${numOr(h.calendar.nearDays, 7)}d/${numOr(h.calendar.farDays, 37)}d`);
    }
  }
  if (h.pairs.on) out.push(`Pairs ${h.pairs.longSym}/${h.pairs.shortSym}`);
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
  const h = deskTools.hedge;
  if (h.vertical.on && S > 0) {
    const kL = numOr(h.vertical.longStrike, roundStrike(S));
    const kS = numOr(h.vertical.shortStrike, roundStrike(S * (h.vertical.type === "call" ? 1.02 : 0.98)));
    const premL = blackScholes({ S, K: kL, T, r, q, sigma, type: h.vertical.type }).price;
    const premS = blackScholes({ S, K: kS, T, r, q, sigma, type: h.vertical.type }).price;
    const v = evalVertical({ type: h.vertical.type, kLong: kL, kShort: kS, premLong: premL, premShort: premS, contracts: numOr(h.vertical.contracts, 1) });
    out.push({ kind: "vertical", type: h.vertical.type, kLong: kL, kShort: kS, isDebit: v.isDebit, maxProfit: v.maxProfit, maxLoss: v.maxLoss, breakeven: v.breakeven, rr: v.rr });
  }
  if (h.calendar.on && S > 0) {
    const kNear = numOr(h.calendar.strike, roundStrike(S));
    const kFar = numOr(h.calendar.farStrike, kNear);
    const nearDays = numOr(h.calendar.nearDays, 7);
    const farDays = numOr(h.calendar.farDays, 37);
    const premNear = blackScholes({ S, K: kNear, T: nearDays / 365, r, q, sigma, type: h.calendar.type }).price;
    const premFar = blackScholes({ S, K: kFar, T: farDays / 365, r, q, sigma, type: h.calendar.type }).price;
    const c = evalCalendar({ type: h.calendar.type, kNear, kFar, premNear, premFar, contracts: numOr(h.calendar.contracts, 1), S, sigma, r, q, nearDays, farDays });
    out.push({ kind: "calendar", diagonal: kNear !== kFar, type: h.calendar.type, kNear, kFar, nearDays, farDays, debit: c.debit, estPnl: c.estPnl });
  }
  if (h.beta.on && S > 0) {
    const pv = numOr(h.beta.portfolioValue, 0);
    const beta = numOr(h.beta.beta, 1);
    const notional = pv * beta;
    if (h.beta.mode === "puts") {
      const k = roundStrike(S * (1 - numOr(h.beta.putOtmPct, 5) / 100));
      const pb = blackScholes({ S, K: k, T, r, q, sigma, type: "put" });
      const contracts = pb.delta !== 0 ? notional / (S * 100 * Math.abs(pb.delta)) : 0;
      out.push({ kind: "beta", mode: "puts", symbol: live.cfg.symbol, strike: k, contracts, cost: pb.price * 100 * contracts, notional });
    } else {
      const futPrice = live.priceOf(live.futSym) ?? live.spot;
      const contracts = futPrice > 0 ? notional / (futPrice * live.futMult) : 0;
      out.push({ kind: "beta", mode: "futures", futSym: live.futSym, futMult: live.futMult, contracts, notional });
    }
  }
  if (h.pairs.on) {
    const p = evalPairs({ priceLong: live.priceOf(h.pairs.longSym), priceShort: live.priceOf(h.pairs.shortSym), betaLong: numOr(h.pairs.betaLong, 1), betaShort: numOr(h.pairs.betaShort, 1), notional: numOr(h.pairs.notional, 0) });
    if (p) out.push({ kind: "pairs", longSym: h.pairs.longSym, shortSym: h.pairs.shortSym, ratio: p.ratio, shortNotional: p.shortNotional });
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
          if (s.kind === "vertical") {
            return (
              <div className="tstruct" key={i}>
                <div className="tstruct-head"><span className="tstruct-title">{s.type.toUpperCase()} vertical {fmtNum(s.kLong, 0)}/{fmtNum(s.kShort, 0)} · {s.isDebit ? "debit" : "credit"}</span></div>
                <div className="tstruct-stats">
                  <div className="tstruct-stat"><span>Max profit</span><b style={{ color: C.bull }}>{fmtUsd(s.maxProfit, 0)}</b></div>
                  <div className="tstruct-stat"><span>Max loss</span><b style={{ color: C.bear }}>{fmtUsd(s.maxLoss, 0)}</b></div>
                  <div className="tstruct-stat"><span>Breakeven</span><b>{s.breakeven != null ? fmtNum(s.breakeven, 0) : "—"}</b></div>
                  <div className="tstruct-stat"><span>Risk / reward</span><b>{s.rr != null ? fmtNum(s.rr, 2) : "—"}</b></div>
                </div>
              </div>
            );
          }
          if (s.kind === "calendar") {
            return (
              <div className="tstruct" key={i}>
                <div className="tstruct-head"><span className="tstruct-title">{s.type.toUpperCase()} {s.diagonal ? "diagonal" : "calendar"} {fmtNum(s.kNear, 0)}{s.diagonal ? `/${fmtNum(s.kFar, 0)}` : ""} · {s.nearDays}d/{s.farDays}d</span></div>
                <div className="tstruct-stats">
                  <div className="tstruct-stat"><span>Net debit</span><b>{fmtUsd(s.debit, 0)}</b></div>
                  <div className="tstruct-stat"><span>Est. P/L</span><b style={{ color: s.estPnl >= 0 ? C.bull : C.bear }}>{fmtUsd(s.estPnl, 0)}</b><small>near expiry, spot flat</small></div>
                </div>
              </div>
            );
          }
          if (s.kind === "beta") {
            return (
              <div className="tstruct" key={i}>
                <div className="tstruct-head"><span className="tstruct-title">Beta hedge · {s.mode === "puts" ? `${s.symbol} puts` : `${s.futSym} futures`}</span></div>
                <div className="tstruct-stats">
                  {s.mode === "puts" ? (
                    <>
                      <div className="tstruct-stat"><span>Buy</span><b>~{fmtNum(s.contracts, 1)}</b><small>{fmtNum(s.strike, 0)} puts</small></div>
                      <div className="tstruct-stat"><span>Cost</span><b>{fmtUsd(s.cost, 0)}</b></div>
                      <div className="tstruct-stat"><span>Covers</span><b>{fmtUsd(s.notional, 0)}</b><small>of delta</small></div>
                    </>
                  ) : (
                    <>
                      <div className="tstruct-stat"><span>Short</span><b>~{fmtNum(s.contracts, 2)}</b><small>{s.futSym} (×{s.futMult})</small></div>
                      <div className="tstruct-stat"><span>Offsets</span><b>{fmtUsd(s.notional, 0)}</b><small>exposure</small></div>
                    </>
                  )}
                </div>
              </div>
            );
          }
          if (s.kind === "pairs") {
            return (
              <div className="tstruct" key={i}>
                <div className="tstruct-head"><span className="tstruct-title">Pairs · long {s.longSym} / short {s.shortSym}</span></div>
                <div className="tstruct-stats">
                  <div className="tstruct-stat"><span>Hedge ratio</span><b>{fmtNum(s.ratio, 3)}</b><small>short per long</small></div>
                  <div className="tstruct-stat"><span>Short notional</span><b>{fmtUsd(s.shortNotional, 0)}</b></div>
                </div>
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

const StructToggle = ({ on, onToggle, icon: Ic, label, sub }) => (
  <button
    onClick={() => onToggle(!on)}
    className="card"
    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", cursor: "pointer", textAlign: "left", borderColor: on ? "var(--brass)" : undefined, width: "100%", background: "var(--panel2)" }}
  >
    <span style={{ width: 36, height: 21, borderRadius: 21, background: on ? C.brass : "var(--line2)", position: "relative", flex: "none", transition: ".2s" }}>
      <span style={{ position: "absolute", top: 2.5, left: on ? 17 : 2.5, width: 16, height: 16, borderRadius: "50%", background: "#0c0f14", transition: ".2s" }} />
    </span>
    {Ic && <Ic size={15} color={on ? C.brass : C.muted} style={{ flex: "none" }} />}
    <span style={{ minWidth: 0 }}>
      <b style={{ fontSize: 13 }}>{label}</b>
      <div style={{ fontSize: 11.5, color: C.muted }}>{sub}</div>
    </span>
  </button>
);

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
          : "Master switch — when on, the next thesis run factors in the hedge structures and options scenario you've enabled below."}
      </div>
    </div>
  </div>
);

/* ---------- Options pricing calculator ---------- */

const OptionsCalculator = ({ env, setEnv, opt, setOpt, onReset, live, feedOn = false, heading = null, showFeed = true, symbol = null, onPickTicker = null, pickExclude = null }) => {
  const { S, sigma, r, q, days, T } = resolveEnv(env, live);
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
            <TickerPicker value={symbol} onChange={onPickTicker} exclude={pickExclude} />
          </div>
        )}
        <div className="seg" style={{ marginBottom: 14 }}>
          {["call", "put"].map((ty) => (
            <button key={ty} className={opt.type === ty ? "on" : ""} onClick={() => setOpt("type", ty)}>{ty.toUpperCase()}</button>
          ))}
        </div>
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

/* ---------- Hedge & spread builder ---------- */

const HedgeBuilder = ({ env, setEnv, hedge, setHedge, live }) => {
  const { S, sigma, r, q, days, T } = resolveEnv(env, live);
  const b = hedge.beta, v = hedge.vertical, cal = hedge.calendar, pr = hedge.pairs;

  // Beta-weighted hedge
  const pv = numOr(b.portfolioValue, 0);
  const beta = numOr(b.beta, 1);
  const notional = pv * beta;
  // A futures contract is priced at the index level (e.g. ES ≈ 10× SPY), so size off the
  // futures' own price — not the focus instrument's spot. Falls back to spot if unavailable.
  const futPrice = live.priceOf(live.futSym) ?? live.spot;
  const futContracts = futPrice > 0 ? notional / (futPrice * live.futMult) : 0;
  // Micro contracts are 1/10 the notional of the full-size future (e.g. MES ×5 vs ES ×50),
  // so a book too small for a whole ES contract can still hedge cleanly with micros.
  const microMult = live.futMult / 10;
  const microSym = `M${live.futSym}`;
  const microContracts = futPrice > 0 ? notional / (futPrice * microMult) : 0;
  const fullContractNotional = futPrice * live.futMult;
  const putStrike = roundStrike(S * (1 - numOr(b.putOtmPct, 5) / 100));
  const putBs = blackScholes({ S, K: putStrike, T, r, q, sigma, type: "put" });
  const putContracts = S > 0 && putBs.delta !== 0 ? notional / (S * 100 * Math.abs(putBs.delta)) : 0;
  const putCost = putBs.price * 100 * putContracts;
  const spyPrice = live.priceOf("SPY");
  const spyShares = spyPrice > 0 ? notional / spyPrice : 0;

  // Vertical
  const vL = numOr(v.longStrike, roundStrike(S));
  const vShort = numOr(v.shortStrike, roundStrike(S * (v.type === "call" ? 1.02 : 0.98)));
  const vPremL = blackScholes({ S, K: vL, T, r, q, sigma, type: v.type }).price;
  const vPremS = blackScholes({ S, K: vShort, T, r, q, sigma, type: v.type }).price;
  const vres = evalVertical({ type: v.type, kLong: vL, kShort: vShort, premLong: vPremL, premShort: vPremS, contracts: numOr(v.contracts, 1) });

  // Calendar / diagonal
  const cNear = numOr(cal.strike, roundStrike(S));
  const cFar = numOr(cal.farStrike, cNear);
  const cNearDays = numOr(cal.nearDays, 7);
  const cFarDays = numOr(cal.farDays, 37);
  const cPremNear = blackScholes({ S, K: cNear, T: cNearDays / 365, r, q, sigma, type: cal.type }).price;
  const cPremFar = blackScholes({ S, K: cFar, T: cFarDays / 365, r, q, sigma, type: cal.type }).price;
  const cres = evalCalendar({ type: cal.type, kNear: cNear, kFar: cFar, premNear: cPremNear, premFar: cPremFar, contracts: numOr(cal.contracts, 1), S, sigma, r, q, nearDays: cNearDays, farDays: cFarDays });

  // Pairs
  const prLongP = live.priceOf(pr.longSym);
  const prShortP = live.priceOf(pr.shortSym);
  const pres = evalPairs({ priceLong: prLongP, priceShort: prShortP, betaLong: numOr(pr.betaLong, 1), betaShort: numOr(pr.betaShort, 1), notional: numOr(pr.notional, 0) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px" }}>
        <Crosshair size={13} color={C.brass} />
        <span style={{ fontSize: 12, color: C.muted }}>
          Structures priced against <b style={{ color: "var(--text)" }}>{live.cfg?.label}</b> @ {fmtNum(live.spot ?? 0, 2)} · {live.futSym} futures proxy
        </span>
      </div>
      {/* Beta-weighted hedge */}
      <StructToggle on={b.on} onToggle={(on) => setHedge("beta", "on", on)} icon={Shield} label="Beta-weighted portfolio hedge" sub="Neutralize directional exposure with futures or protective puts" />
      {b.on && (
        <Card>
          <div className="grid g-3" style={{ gap: 10 }}>
            <NumField label="Book value" suffix="$" value={b.portfolioValue} onChange={(val) => setHedge("beta", "portfolioValue", val)} />
            <NumField label="Portfolio beta" value={b.beta} placeholder="1.00" onChange={(val) => setHedge("beta", "beta", val)} />
            <div className="lab-field" style={{ marginTop: 0 }}>
              <span className="lab-label">Hedge vehicle</span>
              <div className="seg">
                {[["futures", `${live.futSym} fut`], ["puts", `${live.cfg.symbol} puts`]].map(([m, lbl]) => (
                  <button key={m} className={b.mode === m ? "on" : ""} onClick={() => setHedge("beta", "mode", m)}>{lbl}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>Exposure to neutralize: <b style={{ color: "var(--text)" }}>{fmtUsd(notional)}</b> (book × beta).</div>
          {b.mode === "futures" ? (
            <>
              <div className="grid g-3" style={{ gap: 10, marginTop: 12 }}>
                <ToolStat k={`Short ${live.futSym}`} v={fmtNum(futContracts, 2)} color={C.brass} sub={futPrice > 0 ? `×${live.futMult} @ ${fmtNum(futPrice, 2)}` : `contracts (×${live.futMult})`} />
                <ToolStat k="Rounded" v={fmtNum(Math.round(futContracts), 0)} sub="whole contracts" />
                <ToolStat k="SPY-share equiv" v={fmtNum(spyShares, 0)} sub={spyPrice > 0 ? `shares @ ${fmtNum(spyPrice, 2)}` : "SPY not synced"} />
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: C.muted }}>Shorting {live.futSym} neutralizes directional delta both ways — it caps downside but also gives up the upside on the hedged exposure. No premium outlay, but margin and roll risk apply.</div>
              {Math.round(futContracts) === 0 && notional > 0 && futPrice > 0 && (
                <div className="hedge-warn">
                  <b>Book too small for one full {live.futSym} contract</b> (≈{fmtUsd(fullContractNotional, 0)} notional each), so a whole-size futures hedge rounds to 0 and leaves you effectively unhedged. Use micro futures instead — <b style={{ color: "var(--text)" }}>~{fmtNum(microContracts, 1)} {microSym}</b> (×{microMult}), round to {fmtNum(Math.round(microContracts), 0)} — or hedge with {live.cfg.symbol} puts or the {fmtNum(spyShares, 0)}-share SPY equivalent above.
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ marginTop: 12, maxWidth: 200 }}>
                <NumField label="Put OTM %" hint={`strike ≈ ${fmtNum(putStrike, 0)}`} suffix="%" value={b.putOtmPct} placeholder="5" onChange={(val) => setHedge("beta", "putOtmPct", val)} />
              </div>
              <div className="grid g-3" style={{ gap: 10, marginTop: 12 }}>
                <ToolStat k="Buy puts" v={fmtNum(putContracts, 1)} color={C.brass} sub={`${live.cfg.symbol} ${fmtNum(putStrike, 0)}P`} />
                <ToolStat k="Put delta" v={fmtNum(putBs.delta, 3)} sub={`@ ${fmtNum(putBs.price, 2)}`} />
                <ToolStat k="Hedge cost" v={fmtUsd(putCost)} color={C.bear} sub={notional > 0 ? `${fmtNum((putCost / notional) * 100, 2)}% of book` : "—"} />
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: C.muted }}>Protective puts cap downside below {fmtNum(putStrike, 0)} while keeping full upside — the cost is the {fmtUsd(putCost, 0)} premium drag if the hedge expires worthless.</div>
            </>
          )}
        </Card>
      )}

      {/* Vertical spread */}
      <StructToggle on={v.on} onToggle={(on) => setHedge("vertical", "on", on)} icon={Layers} label="Vertical spread" sub="Debit or credit call/put spread — risk, reward & breakeven" />
      {v.on && (
        <Card>
          <div className="seg" style={{ marginBottom: 12, maxWidth: 220 }}>
            {["call", "put"].map((ty) => (
              <button key={ty} className={v.type === ty ? "on" : ""} onClick={() => setHedge("vertical", "type", ty)}>{ty.toUpperCase()}</button>
            ))}
          </div>
          <div className="grid g-3" style={{ gap: 10 }}>
            <NumField label="Long strike" hint={`prem $${fmtNum(vPremL, 2)}`} value={v.longStrike} placeholder={fmtNum(roundStrike(S), 0)} onChange={(val) => setHedge("vertical", "longStrike", val)} />
            <NumField label="Short strike" hint={`prem $${fmtNum(vPremS, 2)}`} value={v.shortStrike} placeholder={fmtNum(roundStrike(S * (v.type === "call" ? 1.02 : 0.98)), 0)} onChange={(val) => setHedge("vertical", "shortStrike", val)} />
            <NumField label="Contracts" value={v.contracts} placeholder="1" onChange={(val) => setHedge("vertical", "contracts", val)} />
          </div>
          <div className="grid g-3" style={{ gap: 10, marginTop: 12 }}>
            <ToolStat k={vres.isDebit ? "Net debit" : "Net credit"} v={fmtUsd(Math.abs(vres.net) * 100 * numOr(v.contracts, 1), 0)} color={C.brass} sub={`${fmtNum(Math.abs(vres.net), 2)} / spread · ${fmtNum(vres.width, 0)} wide`} />
            <ToolStat k="Breakeven" v={fmtNum(vres.breakeven, 2)} sub="at expiry" />
            <ToolStat k="Max profit" v={fmtUsd(vres.maxProfit, 0)} color={C.bull} sub="at expiry" />
            <ToolStat k="Max loss" v={fmtUsd(vres.maxLoss, 0)} color={C.bear} sub={vres.rr != null ? `R/R ${fmtNum(vres.rr, 2)}` : ""} />
          </div>
          <PayoffChart
            title="Profit / loss at expiry"
            payoff={(price) => (
              (v.type === "put" ? Math.max(vL - price, 0) : Math.max(price - vL, 0))
              - (v.type === "put" ? Math.max(vShort - price, 0) : Math.max(price - vShort, 0))
              - vres.net
            ) * 100 * numOr(v.contracts, 1)}
            lo={Math.min(vL, vShort) - (vres.width || S * 0.04) * 0.9}
            hi={Math.max(vL, vShort) + (vres.width || S * 0.04) * 0.9}
            spot={S}
            markers={[{ x: vres.breakeven, label: "BE", color: C.brass }]}
          />
          <div style={{ marginTop: 8, fontSize: 11.5, color: C.muted }}>
            Legs auto-priced from the shared environment (IV {fmtNum(sigma * 100, 1)}%, {days}d). A {v.type} {vres.isDebit ? "debit" : "credit"} spread risks {fmtUsd(Math.abs(vres.maxLoss), 0)} to make {fmtUsd(Math.abs(vres.maxProfit), 0)} — adjust strikes to reshape the curve.
          </div>
        </Card>
      )}

      {/* Calendar / diagonal */}
      <StructToggle on={cal.on} onToggle={(on) => setHedge("calendar", "on", on)} icon={CalendarDays} label="Calendar / diagonal spread" sub="Sell near-dated, buy far-dated — same or different strike" />
      {cal.on && (
        <Card>
          <div className="seg" style={{ marginBottom: 12, maxWidth: 220 }}>
            {["call", "put"].map((ty) => (
              <button key={ty} className={cal.type === ty ? "on" : ""} onClick={() => setHedge("calendar", "type", ty)}>{ty.toUpperCase()}</button>
            ))}
          </div>
          <div className="grid g-3" style={{ gap: 10 }}>
            <NumField label="Near strike (short)" hint={`prem $${fmtNum(cPremNear, 2)}`} value={cal.strike} placeholder={fmtNum(roundStrike(S), 0)} onChange={(val) => setHedge("calendar", "strike", val)} />
            <NumField label="Far strike (long)" hint={`prem $${fmtNum(cPremFar, 2)} · = near for calendar`} value={cal.farStrike} placeholder={fmtNum(cNear, 0)} onChange={(val) => setHedge("calendar", "farStrike", val)} />
            <NumField label="Contracts" value={cal.contracts} placeholder="1" onChange={(val) => setHedge("calendar", "contracts", val)} />
            <NumField label="Near days" value={cal.nearDays} placeholder="7" onChange={(val) => setHedge("calendar", "nearDays", val)} />
            <NumField label="Far days" value={cal.farDays} placeholder="37" onChange={(val) => setHedge("calendar", "farDays", val)} />
          </div>
          <div className="grid g-3" style={{ gap: 10, marginTop: 12 }}>
            <ToolStat k="Net debit" v={fmtUsd(cres.debit, 0)} color={C.brass} sub={`${cNear === cFar ? "calendar" : "diagonal"} · ${cNearDays}d vs ${cFarDays}d`} />
            <ToolStat k="Value @ near exp" v={fmtUsd(cres.valueAtNearExpiry, 0)} sub="if spot unchanged" />
            <ToolStat k="Est. P/L" v={fmtUsd(cres.estPnl, 0)} color={cres.estPnl >= 0 ? C.bull : C.bear} sub="spot flat at near exp" />
          </div>
          <PayoffChart
            title={`P/L at near expiry (${cNearDays}d) across spot`}
            payoff={(price) => {
              const farVal = blackScholes({ S: price, K: cFar, T: Math.max(cFarDays - cNearDays, 0) / 365, r, q, sigma, type: cal.type }).price;
              const nearIntrinsic = cal.type === "put" ? Math.max(cNear - price, 0) : Math.max(price - cNear, 0);
              return (farVal - nearIntrinsic - cres.net) * 100 * numOr(cal.contracts, 1);
            }}
            lo={cNear * 0.9}
            hi={cNear * 1.1}
            spot={S}
            markers={[{ x: cNear, label: "K", color: C.brass }]}
          />
          <div style={{ marginTop: 8, fontSize: 11.5, color: C.muted }}>Calendars profit most when spot finishes near the strike at the near expiry with the far leg holding time value. The curve assumes IV holds at {fmtNum(sigma * 100, 1)}%.</div>
        </Card>
      )}

      {/* Pairs / ratio */}
      <StructToggle on={pr.on} onToggle={(on) => setHedge("pairs", "on", on)} icon={Scale} label="Pairs / ratio hedge" sub="Long one instrument vs short a correlated one at a beta-neutral ratio" />
      {pr.on && (
        <Card>
          <div className="grid g-2" style={{ gap: 10 }}>
            <div className="lab-field" style={{ marginTop: 0 }}>
              <span className="lab-label">Long {prLongP ? `· ${fmtNum(prLongP, 2)}` : ""}</span>
              <InstrumentSelect value={pr.longSym} onChange={(val) => setHedge("pairs", "longSym", val)} />
            </div>
            <div className="lab-field" style={{ marginTop: 0 }}>
              <span className="lab-label">Short {prShortP ? `· ${fmtNum(prShortP, 2)}` : ""}</span>
              <InstrumentSelect value={pr.shortSym} onChange={(val) => setHedge("pairs", "shortSym", val)} />
            </div>
          </div>
          <div className="grid g-3" style={{ gap: 10, marginTop: 10 }}>
            <NumField label="Long beta" value={pr.betaLong} placeholder="1.20" onChange={(val) => setHedge("pairs", "betaLong", val)} />
            <NumField label="Short beta" value={pr.betaShort} placeholder="1.00" onChange={(val) => setHedge("pairs", "betaShort", val)} />
            <NumField label="Long notional" suffix="$" value={pr.notional} onChange={(val) => setHedge("pairs", "notional", val)} />
          </div>
          {pres ? (
            <>
              <div className="grid g-3" style={{ gap: 10, marginTop: 12 }}>
                <ToolStat k="Hedge ratio" v={fmtNum(pres.ratio, 3)} color={C.brass} sub={`short ${pr.shortSym} per long ${pr.longSym}`} />
                <ToolStat k={`Long ${pr.longSym}`} v={fmtNum(pres.unitsLong, 1)} sub={`units · ${fmtUsd(pres.longNotional, 0)}`} />
                <ToolStat k={`Short ${pr.shortSym}`} v={fmtNum(pres.unitsShort, 1)} sub={`units · ${fmtUsd(pres.shortNotional, 0)} (β-neutral)`} />
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: C.muted }}>A beta-neutral pair isolates relative performance — you profit if {pr.longSym} outperforms {pr.shortSym}, regardless of which way the broad market moves.</div>
            </>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12.5, color: C.muted }}>Sync the Market Pulse so both legs have a live price, or pick instruments that are loaded.</div>
          )}
        </Card>
      )}
    </div>
  );
};

/* ================================================================
   TAB — THESIS LAB
   ================================================================ */

const ThesisTab = ({ instrument, setInstrument, secondary, setSecondary, weights, setWeights, lean, setLean, risk, setRisk, notes, setNotes, thesis, onGenerate, onLogTrade, history, viewing, setViewing, onDeleteHist, anyData, deskTools, setDeskTools, market, points }) => {
  const t = viewing || thesis.data;
  const biasColor = t?.bias === "bullish" ? C.bull : t?.bias === "bearish" ? C.bear : C.brass;
  // "Inputs changed — regenerate": compare the live controls against the inputs the displayed
  // thesis was actually generated from, so a stale output after tweaking a control is signalled.
  const inputSig = (o) => JSON.stringify({
    instrument: o.instrument, secondary: o.secondary || "",
    weights: o.weights, lean: o.lean, risk: o.risk, notes: (o.notes || "").trim(),
  });
  const currentSig = inputSig({ instrument, secondary, weights, lean, risk, notes });
  const thesisSig = thesis.data
    ? inputSig({ instrument: thesis.data._instrument, secondary: thesis.data.secondary, weights: thesis.data._weights, lean: thesis.data._lean, risk: thesis.data._risk, notes: thesis.data._notes })
    : null;
  const inputsDirty = !viewing && thesis.status === "ready" && !!thesis.data && currentSig !== thesisSig;
  const activeInstrument = thesisInstrumentConfig(instrument);
  const [toolView, setToolView] = useState("synthesis");
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
  const setHedge = (s, k, val) => setDeskTools((d) => ({ ...d, hedge: { ...d.hedge, [s]: { ...d.hedge[s], [k]: val } } }));
  const setFeed = (on) => setDeskTools((d) => ({ ...d, feedToThesis: on }));
  const activeHedges = Object.values(deskTools.hedge).filter((x) => x.on).length;
  const feedParts = [
    deskTools.options.feed ? "options scenario" : null,
    activeHedges ? `${activeHedges} hedge structure${activeHedges === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  const feedSummary = feedParts.length ? feedParts.join(" + ") : "nothing yet — toggle a hedge or the options scenario";
  const weightSum = Math.round(FACTORS.reduce((s, f) => s + (Number(weights[f.key]) || 0), 0));
  // Once a thesis is on the tape (or one is loading / errored), split into controls-left + output-right.
  // Before that, the controls ride consolidated across the top instead of leaving a big empty pane.
  const showSplit = !!t || thesis.status === "loading" || thesis.status === "error";

  if (toolView !== "synthesis") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="seg" style={{ maxWidth: 560 }}>
          <button className={toolView === "synthesis" ? "on" : ""} onClick={() => setToolView("synthesis")}>Synthesis</button>
          <button className={toolView === "options" ? "on" : ""} onClick={() => setToolView("options")}>Options Calc</button>
          <button className={toolView === "hedge" ? "on" : ""} onClick={() => setToolView("hedge")}>Hedge &amp; Spreads</button>
        </div>
        <FeedToggle on={deskTools.feedToThesis} onToggle={setFeed} summary={feedSummary} />
        {toolView === "options" && (
          hasSecondary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <OptionsCalculator env={deskTools.env} setEnv={setEnv} opt={deskTools.options} setOpt={setOpt} onReset={resetOptionsCalc} live={live} feedOn={deskTools.feedToThesis} heading={`Primary · ${live.cfg?.label || activeInstrument.name}`} symbol={instrument} onPickTicker={setInstrument} pickExclude={secondary} />
              <OptionsCalculator env={deskTools.env2} setEnv={setEnv2} opt={deskTools.options2} setOpt={setOpt2} onReset={resetOptionsCalc2} live={live2} heading={`Secondary · ${live2.cfg?.label || secondary}`} showFeed={false} symbol={secondary} onPickTicker={setSecondary} pickExclude={instrument} />
            </div>
          ) : (
            <OptionsCalculator env={deskTools.env} setEnv={setEnv} opt={deskTools.options} setOpt={setOpt} onReset={resetOptionsCalc} live={live} feedOn={deskTools.feedToThesis} symbol={instrument} onPickTicker={setInstrument} />
          )
        )}
        {toolView === "hedge" && <HedgeBuilder env={deskTools.env} setEnv={setEnv} hedge={deskTools.hedge} setHedge={setHedge} live={live} />}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="seg" style={{ maxWidth: 560 }}>
        <button className={toolView === "synthesis" ? "on" : ""} onClick={() => setToolView("synthesis")}>Synthesis</button>
        <button className={toolView === "options" ? "on" : ""} onClick={() => setToolView("options")}>Options Calc</button>
        <button className={toolView === "hedge" ? "on" : ""} onClick={() => setToolView("hedge")}>Hedge &amp; Spreads</button>
      </div>
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
          <FactorRadarChart weights={weights} onChange={setWeights} />
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
            <button className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={() => setViewing(null)}>Back to latest</button>
          </div>
        )}
        {thesis.status === "error" && !t && <ErrBlock msg={thesis.error} onRetry={onGenerate} />}
        {thesis.status === "loading" && !t && (
          <div className="th-hero"><LoadingBlock lines={4} msg="Weighing pillars, stress-testing the lean, writing the call…" /></div>
        )}
        {t && (
          <>
            <div className="th-hero">
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
              {(t.stanceRead || t.pillarRead || (t.weightedPillars || []).length > 0) && (
                <div className="th-scorecard">
                  {t.stanceRead && (
                    <div className="th-scorecard-row">
                      <b>Desk stance</b>
                      <span>{t.stanceRead}</span>
                    </div>
                  )}
                  {t.pillarRead && (
                    <div className="th-scorecard-row">
                      <b>Pillar model</b>
                      <span>{t.pillarRead}</span>
                    </div>
                  )}
                  {(t.weightedPillars || []).length > 0 && (
                    <div className="pillar-strip">
                      {(t.weightedPillars || []).map((pillar) => {
                        const tip = pillar.key === "positioning"
                          ? `Why ${fmtSigned(pillar.score, 0)}? Positioning posture is ${points?.positioning?.posture || "—"} (flow score ${points?.positioning?.score ?? "—"}), derived from ETF risk flows, credit-vs-duration spread, and the Fear & Greed components (put/call, junk-bond demand, safe-haven demand).`
                          : `${pillar.label}: raw pillar score ${fmtSigned(pillar.score, 0)}, weighted at ${pillar.weight}% → ${fmtSigned(pillar.contribution, 1)} impact on the base score.`;
                        return (
                          <div className="pillar-chip" key={pillar.key || pillar.label} title={tip}>
                            <b>{pillar.label || pillar.key}</b>
                            <span>Score {fmtSigned(pillar.score, 0)} · Weight {pillar.weight}% · Impact {fmtSigned(pillar.contribution, 1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

    ${(t._deskStructures || []).length ? `<div class="callout"><b>Structures fed into this call:</b> ${t._deskStructures.join(" &nbsp;·&nbsp; ")}</div>` : ""}

    ${t.stanceRead || t.pillarRead ? `
    <h2>Desk stance</h2>
    <table><tbody>
      ${t.stanceRead ? `<tr><td class="lbl">Desk stance</td><td>${t.stanceRead}</td></tr>` : ""}
      ${t.pillarRead ? `<tr><td class="lbl">Pillar model</td><td>${t.pillarRead}</td></tr>` : ""}
    </tbody></table>` : ""}

    ${(t.weightedPillars || []).length ? `
    <h2>Pillar breakdown</h2>
    <table><thead><tr><th>Pillar</th><th>Score</th><th>Weight</th><th>Impact</th></tr></thead><tbody>
      ${(t.weightedPillars || []).map((p) => `<tr><td>${p.label || p.key}</td><td>${p.score >= 0 ? "+" : ""}${p.score}</td><td>${p.weight}%</td><td>${p.contribution >= 0 ? "+" : ""}${p.contribution?.toFixed(1)}</td></tr>`).join("")}
    </tbody></table>` : ""}

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
    >
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

const CloudNewsletterList = ({ inSplit = false }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState(null);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);
  const collapsedCount = useIsDesktop() ? 5 : 3;

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
  const query = q.trim().toLowerCase();
  const filtered = !query ? items : items.filter((item) =>
    [item.type, item.bias, item.instrument, item.title, rowDate(item.sentAt)].filter(Boolean).join(" ").toLowerCase().includes(query));
  const effectiveExpanded = expanded || !!query;
  const shown = effectiveExpanded ? filtered : filtered.slice(0, collapsedCount);

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
      <input className="bd-in" style={{ marginBottom: 8 }} placeholder="Search newsletters — title, ticker, bias or date…" value={q} onChange={(e) => setQ(e.target.value)} />
      {!filtered.length && <div style={{ color: C.muted, fontSize: 12.5 }}>No newsletters match “{q}”.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: effectiveExpanded ? 320 : "none", overflowY: effectiveExpanded ? "auto" : "visible" }}>
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
          </div>
        ))}
      </div>
      {!query && filtered.length > collapsedCount && (
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
const ThesisScoreboard = ({ history }) => {
  const graded = history.filter((e) => (!e._type || e._type === "thesis") && e._outcome);
  const trades = history.filter((e) => e._trade && Number.isFinite(e._trade.pnl));
  if (!graded.length && !trades.length) return null;
  const hitRate = (list) => {
    const h = list.filter((e) => e._outcome.result === "hit").length;
    const m = list.filter((e) => e._outcome.result === "miss").length;
    return h + m ? Math.round((h / (h + m)) * 100) : null;
  };
  const overall = hitRate(graded);
  const byBias = ["bullish", "bearish", "neutral"]
    .map((b) => ({ key: b, list: graded.filter((e) => e.bias === b) }))
    .filter((g) => g.list.length);
  const convBand = (c) => (c >= 8 ? "8–10" : c >= 5 ? "5–7" : "1–4");
  const byConv = ["8–10", "5–7", "1–4"]
    .map((band) => ({ key: `conviction ${band}`, list: graded.filter((e) => Number.isFinite(Number(e.conviction)) && convBand(Number(e.conviction)) === band) }))
    .filter((g) => g.list.length);
  const byInst = Object.values(graded.reduce((acc, e) => {
    const sym = e._instrument || e.instrument || "—";
    (acc[sym] ||= { key: sym, list: [] }).list.push(e);
    return acc;
  }, {})).sort((a, b) => b.list.length - a.list.length).slice(0, 4);
  const totalPnl = trades.reduce((s, e) => s + e._trade.pnl, 0);
  const wins = trades.filter((e) => e._trade.pnl > 0).length;
  const rateColor = (r) => (r == null ? C.muted : r >= 55 ? C.bull : r <= 45 ? C.bear : C.brass);
  const Row = ({ group }) => {
    const r = hitRate(group.list);
    return (
      <div className="sb-row">
        <span className="sb-row-k">{group.key}</span>
        <span className="sb-row-n">{group.list.length} call{group.list.length === 1 ? "" : "s"}</span>
        <span className="sb-row-v" style={{ color: rateColor(r) }}>{r == null ? "all flat" : `${r}%`}</span>
      </div>
    );
  };
  return (
    <Card icon={Crosshair} title="Desk scoreboard" sub="Graded calls and logged trades — the feedback loop">
      <div className="sb-tiles">
        <div className="sb-tile">
          <span>Calls graded</span>
          <b>{graded.length}</b>
        </div>
        <div className="sb-tile">
          <span>Hit rate</span>
          <b style={{ color: rateColor(overall) }}>{overall == null ? "—" : `${overall}%`}</b>
          <small>flat pushes excluded</small>
        </div>
        <div className="sb-tile">
          <span>Trades logged</span>
          <b>{trades.length}</b>
          {trades.length > 0 && <small>{wins} win{wins === 1 ? "" : "s"}</small>}
        </div>
        <div className="sb-tile">
          <span>Trade P/L</span>
          <b style={{ color: trades.length ? (totalPnl >= 0 ? C.bull : C.bear) : C.muted }}>
            {trades.length ? `${totalPnl >= 0 ? "+" : "−"}${fmtUsd(Math.abs(totalPnl), 0)}` : "—"}
          </b>
        </div>
      </div>
      {(byBias.length > 0 || byConv.length > 0 || byInst.length > 0) && (
        <div className="sb-breakdown">
          {byBias.length > 0 && <div className="sb-col"><div className="sb-col-h">By bias</div>{byBias.map((g) => <Row group={g} key={g.key} />)}</div>}
          {byConv.length > 0 && <div className="sb-col"><div className="sb-col-h">By conviction</div>{byConv.map((g) => <Row group={g} key={g.key} />)}</div>}
          {byInst.length > 0 && <div className="sb-col"><div className="sb-col-h">By instrument</div>{byInst.map((g) => <Row group={g} key={g.key} />)}</div>}
        </div>
      )}
    </Card>
  );
};

const ArchiveTab = ({
  archiveHistory,
  viewing,
  setViewing,
  onDeleteEntry,
  onGoThesis,
  inSplit = false,
}) => {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [journalOpen, setJournalOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const collapsedCount = useIsDesktop() ? 5 : 3;
  const query = q.trim().toLowerCase();
  const filteredHistory = !query ? archiveHistory : archiveHistory.filter((entry) => {
    const t = entry._type === "newsletter" ? entry._thesis : entry;
    return [entry.instrument, t?.instrument, t?.bias, entry.headline, t?.headline, entry._date, archiveStamp(entry)]
      .filter(Boolean).join(" ").toLowerCase().includes(query);
  });
  const effectiveExpanded = expanded || !!query;
  const shownHistory = effectiveExpanded ? filteredHistory : filteredHistory.slice(0, collapsedCount);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card
        icon={Mail}
        title="Jacks Journal"
        sub="Market wraps delivered by the Overwatch automation — stored in the cloud"
        tools={<button className="btn btn-ghost btn-sm" onClick={() => setJournalOpen((o) => !o)} title={journalOpen ? "Collapse" : "Expand"}>{journalOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>}
      >
        {journalOpen && <CloudNewsletterList inSplit={inSplit} />}
      </Card>
      <ThesisScoreboard history={archiveHistory} />
      <Card
        icon={History}
        title="Thesis Library"
        sub={archiveHistory.length ? `${archiveHistory.length} saved entr${archiveHistory.length === 1 ? "y" : "ies"} — thesis archive · synced across devices` : "No archived entries yet"}
        tools={<button className="btn btn-ghost btn-sm" onClick={() => setLibraryOpen((o) => !o)} title={libraryOpen ? "Collapse" : "Expand"}>{libraryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>}
      >
        {libraryOpen && (<>
        {!archiveHistory.length && (
          <div style={{ color: C.muted, fontSize: 12.5 }}>Every thesis lands here automatically.</div>
        )}
        {archiveHistory.length > 0 && (
          <input className="bd-in" style={{ marginBottom: 8 }} placeholder="Search saved theses — ticker, bias, headline or date…" value={q} onChange={(e) => setQ(e.target.value)} />
        )}
        {archiveHistory.length > 0 && !filteredHistory.length && (
          <div style={{ color: C.muted, fontSize: 12.5 }}>No saved theses match “{q}”.</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: effectiveExpanded ? 320 : "none", overflowY: effectiveExpanded ? "auto" : "visible" }}>
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
        {!query && filteredHistory.length > collapsedCount && (
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

const SettingsDrawer = ({ open, onClose, watchlist, setWatchlist, onClearHistory, storageOk, notify, auth }) => {
  const [sym, setSym] = useState("");
  const [name, setName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  if (!open) return null;

  const addTicker = () => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    if (watchlist.some((w) => w.symbol === s)) { notify(`${s} is already on the board`, "err"); return; }
    if (watchlist.length >= WATCHLIST_CAP) { notify(`Watchlist is capped at ${WATCHLIST_CAP} — drop one first`, "err"); return; }
    setWatchlist([...watchlist, { symbol: s, name: name.trim() || s }]);
    setSym(""); setName("");
    notify(`${s} added — resync prices to pull it in`, "ok");
  };

  // Flip a symbol's visibility on the Pulse grid without dropping it from the board.
  const toggleTicker = (symbol) => setWatchlist(watchlist.map((x) => {
    if (x.symbol !== symbol) return x;
    if (x.off) { const { off, ...rest } = x; return rest; }
    return { ...x, off: true };
  }));

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

        <span className="lab-label">Watchlist · {watchlist.length}/{WATCHLIST_CAP}</span>
        <div style={{ fontSize: 10.5, color: C.faint || C.muted, margin: "-4px 0 8px" }}>Tap the eye to show/hide a ticker card on Market Pulse. Hidden names still price for the Thesis Lab.</div>
        <div style={{ marginBottom: 10 }}>
          {watchlist.map((w) => (
            <span className={`wl-chip${w.off ? " wl-chip-off" : ""}`} key={w.symbol}>
              <span
                className="wl-eye"
                onClick={() => toggleTicker(w.symbol)}
                title={w.off ? "Hidden — show card on Market Pulse" : "Shown — hide card on Market Pulse"}
              >{w.off ? <EyeOff size={12} /> : <Eye size={12} />}</span>
              <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{w.symbol}</span>
              <span style={{ fontSize: 11, color: C.muted, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</span>
              <span className="wl-x" onClick={() => setWatchlist(watchlist.filter((x) => x.symbol !== w.symbol))} title="Remove"><X size={12} /></span>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="bd-in mono-in" style={{ width: 96, flex: "none" }} placeholder="SYM" value={sym} onChange={(e) => setSym(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTicker()} />
          <input className="bd-in" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTicker()} />
          <button className="btn btn-sm" style={{ flex: "none" }} onClick={addTicker}><Plus size={14} /></button>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => { setWatchlist(DEFAULT_WATCHLIST); notify("Watchlist restored to desk defaults", "ok"); }}>
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
  const [layout, setLayout] = useState("auto"); // auto | 1 | 2 columns
  const [activeSymbol, setActiveSymbol] = useState(() => selected[0] || "AMEX:SPY");
  const [fsSymbol, setFsSymbol] = useState(null);

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

  // In a split pane, stack charts in a single column so several stay readable at half width.
  const cols = compact ? 1 : layout === "1" ? 1 : layout === "2" ? 2 : (selected.length <= 2 ? 1 : 2);
  const chartH = compact ? 360 : cols === 1 ? 520 : 420;

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
            <div key={`${activeSymbol}-${interval}`} style={{ height: 420, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 12, position: "relative" }}>
              <TradingViewChart symbol={activeSymbol} lightMode={lightMode} interval={interval} />
              <button className="chart-expand-btn" onClick={() => setFsSymbol(activeSymbol)} title="Fullscreen">
                <Maximize2 size={14} />
              </button>
            </div>
            <div className="chart-symbol-strip">
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
            {!compact && (
              <div className="seg" title="Chart columns">
                {[["auto", "Auto"], ["1", "1"], ["2", "2"]].map(([m, lbl]) => (
                  <button key={m} className={layout === m ? "on" : ""} onClick={() => setLayout(m)}>{lbl}</button>
                ))}
              </div>
            )}
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
  const [secondary, setSecondary] = useState(""); // optional paired instrument for relative-value context
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [lean, setLean] = useState("auto");
  const [risk, setRisk] = useState("balanced");
  const [notes, setNotes] = useState("");
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
  const [lightMode, setLightMode] = useState(() => { try { return localStorage.getItem("overwatch:light") === "1"; } catch { return false; } });
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
  const toggleSplit = () => setSplitTab((s) => (s ? null : (tab === "charts" ? "pulse" : "charts")));

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

  // Apply a persisted layout block (active tab, split pane, theme) — profile-synced so a refresh or
  // a different device restores the view you left, in split or regular mode.
  const applyLayout = useCallback((layout) => {
    if (!layout || typeof layout !== "object") return;
    if (typeof layout.tab === "string") setTab(safeTab(layout.tab));
    if (layout.splitTab === null || layout.splitTab === undefined) { /* leave as-is if omitted */ }
    if (typeof layout.splitTab === "string" && LAYOUT_TAB_IDS.includes(layout.splitTab)) setSplitTab(layout.splitTab);
    if (layout.splitTab === null) setSplitTab(null);
    if (typeof layout.lightMode === "boolean") setLightMode(layout.lightMode);
  }, []);

  // Apply a settings blob (from local storage or the cloud) through the state setters.
  const applyLoadedSettings = useCallback((s) => {
    if (!s || typeof s !== "object") return;
    if (Array.isArray(s.watchlist) && s.watchlist.length) setWatchlist(reconcileWatchlist(s.watchlist));
    if (s.instrument) setInstrument(thesisInstrumentConfig(s.instrument).symbol);
    if (s.weights) setWeights(normalizeWeightsToBudget(s.weights));
    if (s.lean) setLean(s.lean);
    if (s.risk) setRisk(s.risk);
    if (s.deskTools) setDeskTools((d) => mergeSavedDeskTools(d, s.deskTools));
    applyLayout(s.layout);
  }, [applyLayout]);

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
      const deskContext = deskTools.feedToThesis
        ? buildDeskToolsContext({ deskTools, market: market.data, points: points.data, instrument })
        : null;
      const prompt = thesisPrompt({ market: market.data, news: news.data, points: points.data, timing, weights, lean, risk, notes, instrument, deskContext, focusSpot, focusLevels, pair });
      const data = await callDesk("thesis", prompt, { market: market.data, news: news.data, points: points.data, timing, weights, lean, risk, notes, instrument, deskContext, focusLevels, secondary: pair ? pair.symbol : "" });
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
        _deskStructures: deskContext
          ? deskStructureLabels({ deskTools, market: market.data, points: points.data, instrument })
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
    { id: "archives", label: "Library", short: "Library", icon: History, badge: archiveBadge },
    { id: "pulse", label: "Market Pulse", short: "Pulse", icon: Activity, badge: (market.data?.tickers || []).filter((t) => !hiddenSymbols.has(t.symbol)).length || null },
    { id: "news", label: "News Intel", short: "News", icon: Newspaper, badge: news.data?.headlines?.length },
    { id: "calendar", label: "Calendar", short: "Cal", icon: CalendarDays, badge: calendarBadge },
    { id: "thesis", label: "Thesis Lab", short: "Lab", icon: FlaskConical, badge: thesisHistory.length || null },
    { id: "charts", label: "Charts", short: "Charts", icon: CandlestickChart },
  ];

  // Render a tab's content by id so it can be placed in either the single view or a split pane.
  const renderTab = (id) => {
    switch (id) {
      case "pulse":
        return <PulseTab market={market} points={points.data} pointsState={points} news={news.data} vixHint={points.data?.vix?.structure} hiddenSymbols={hiddenSymbols} onRefresh={syncAll} onGoThesis={() => setTab("thesis")} morningDiff={morningDiff} onDismissDiff={() => setMorningDiff(null)} />;
      case "news":
        return <NewsTab news={news} onRefresh={refreshNews} onAddNote={addNote} inSplit={splitOn} />;
      case "calendar":
        return <CalendarTab points={points} onRefresh={refreshPoints} inSplit={splitOn} />;
      case "thesis":
        return (
          <ThesisTab
            instrument={instrument} setInstrument={setInstrument}
            secondary={secondary} setSecondary={setSecondary}
            weights={weights} setWeights={setWeights}
            lean={lean} setLean={setLean}
            risk={risk} setRisk={setRisk}
            notes={notes} setNotes={setNotes}
            thesis={thesis} onGenerate={generateThesis} onLogTrade={logTrade}
            history={thesisHistory} viewing={viewing} setViewing={setViewing}
            onDeleteHist={deleteArchiveEntry} anyData={anyData}
            deskTools={deskTools} setDeskTools={setDeskTools}
            market={market.data} points={points.data}
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
            onGoThesis={() => setTab("thesis")}
            inSplit={splitOn}
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
        </div>
        <div className="bd-hright">
          <span className="bd-clock">{clock}<span>ET</span></span>
          <AsOfLabel ts={market.at?.ts} />
          <span className={`bd-session bd-session-${session.tone}`}>
            <span className={`bd-dot ${session.tone === "live" ? "dot-live" : session.tone === "warn" ? "dot-warn" : "dot-off"}`} />
            {session.label}
          </span>
          <button className="btn btn-brass" onClick={syncAll} disabled={anyLoading}>
            {anyLoading ? <><RefreshCw size={14} className="spin" /> <span className="sync-label">Syncing…</span></> : <><Zap size={14} /> <span className="sync-label">Sync</span></>}
          </button>
          <button className="btn btn-ghost" onClick={() => setLightMode((m) => !m)} title={lightMode ? "Switch to dark mode" : "Switch to light mode"}>
            {lightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="btn btn-ghost" onClick={() => setSettingsOpen(true)} title="Desk settings"><Settings size={16} /></button>
          {CLERK_ENABLED && <AuthControl />}
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
            <div className="split-pane-body">{renderTab(tab)}</div>
          </section>
          <section className="split-pane">
            {paneTabs(splitTab, setSplitTab, (
              <button className="split-pane-tab split-pane-exit" onClick={toggleSplit} title="Exit split view">
                <Columns2 size={14} /> <span>Exit split</span>
              </button>
            ))}
            <div className="split-pane-body">{renderTab(splitTab)}</div>
          </section>
        </main>
      ) : (
        <main className="bd-main">{renderTab(tab)}</main>
      )}

      <footer className="bd-foot">
        OVERWATCH DAILY BIAS DESK · DELAYED PUBLIC MARKET DATA (~15 MIN) + OPTIONAL AI SYNTHESIS — VERIFY LEVELS ON YOUR PLATFORM BEFORE TRADING · NOT FINANCIAL ADVICE
      </footer>

      <SettingsDrawer
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        watchlist={watchlist} setWatchlist={setWatchlist}
        onClearHistory={clearHistory} storageOk={storageOk} notify={notify}
        auth={auth}
      />
      <Toasts items={toasts} />
    </div>
  );
}
