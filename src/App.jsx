import React, { useState, useEffect, useRef, useCallback } from "react";
import Activity from "lucide-react/dist/esm/icons/activity.mjs";
import Newspaper from "lucide-react/dist/esm/icons/newspaper.mjs";
import Crosshair from "lucide-react/dist/esm/icons/crosshair.mjs";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days.mjs";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical.mjs";
import Mail from "lucide-react/dist/esm/icons/mail.mjs";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.mjs";
import Settings from "lucide-react/dist/esm/icons/settings.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import Trash2 from "lucide-react/dist/esm/icons/trash-2.mjs";
import Copy from "lucide-react/dist/esm/icons/copy.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import Zap from "lucide-react/dist/esm/icons/zap.mjs";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up.mjs";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down.mjs";
import AlertTriangle from "lucide-react/dist/esm/icons/triangle-alert.mjs";
import Shield from "lucide-react/dist/esm/icons/shield.mjs";
import History from "lucide-react/dist/esm/icons/history.mjs";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.mjs";
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
import Maximize2 from "lucide-react/dist/esm/icons/maximize-2.mjs";
import Minimize2 from "lucide-react/dist/esm/icons/minimize-2.mjs";

/* ================================================================
   OVERWATCH // DAILY BIAS DESK
   Live market data + news via Claude API web search → daily bias
   thesis → editorial newsletter. Persistent across sessions.
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
];
const DEFAULT_SYMBOLS_SET = new Set(DEFAULT_WATCHLIST.map((item) => item.symbol));

const reconcileWatchlist = (items) => {
  if (!Array.isArray(items) || !items.length) return DEFAULT_WATCHLIST;
  const cleaned = items
    .filter((item) => item && item.symbol)
    .map((item) => ({ symbol: String(item.symbol).toUpperCase(), name: item.name || item.symbol }));
  // If saved list contains only default symbols (no custom additions), restore canonical order.
  const hasCustom = cleaned.some((item) => !DEFAULT_SYMBOLS_SET.has(item.symbol));
  if (!hasCustom) return DEFAULT_WATCHLIST;
  // Custom watchlist: append any missing required symbols at the end.
  const merged = [...cleaned];
  for (const item of DEFAULT_WATCHLIST) {
    if (!merged.some((existing) => existing.symbol === item.symbol) && merged.length < 21) {
      merged.push(item);
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

const DEFAULT_WEIGHTS = { technicals: 70, macro: 60, sentiment: 45, positioning: 50, eventRisk: 55 };
const DEFAULT_THESIS_INSTRUMENT = "SPX";
const THESIS_INSTRUMENTS = [
  { symbol: "SPX", label: "SPX", name: "S&P 500 Index", futures: "ES", pointsKey: "spx", focusLabel: "SPX / ES" },
  { symbol: "SPY", label: "SPY", name: "SPDR S&P 500 ETF", futures: "ES", pointsKey: "spy", focusLabel: "SPY / ES" },
  { symbol: "ES",  label: "ES",  name: "E-mini S&P 500 Futures", futures: "ES", pointsKey: "es", focusLabel: "ES" },
  { symbol: "NDX", label: "NDX", name: "Nasdaq 100 Index", futures: "NQ", pointsKey: "ndx", focusLabel: "NDX / NQ" },
  { symbol: "QQQ", label: "QQQ", name: "Invesco QQQ ETF", futures: "NQ", pointsKey: "qqq", focusLabel: "QQQ / NQ" },
  { symbol: "NQ",  label: "NQ",  name: "E-mini Nasdaq-100 Futures", futures: "NQ", pointsKey: "nq", focusLabel: "NQ" },
  { symbol: "DJI", label: "DJI", name: "Dow Jones Industrial Average", futures: "YM", pointsKey: "dji", focusLabel: "DJI / YM" },
  { symbol: "DIA", label: "DIA", name: "SPDR Dow Jones ETF", futures: "YM", pointsKey: "dia", focusLabel: "DIA / YM" },
  { symbol: "YM",  label: "YM",  name: "E-mini Dow Futures", futures: "YM", pointsKey: "ym", focusLabel: "YM" },
];
const thesisInstrumentConfig = (symbol = DEFAULT_THESIS_INSTRUMENT) =>
  THESIS_INSTRUMENTS.find((item) => item.symbol === symbol) || THESIS_INSTRUMENTS[0];

const C = {
  bull: "#3DD68C",
  bear: "#F2555A",
  brass: "#E8B45A",
  info: "#5AA7E8",
  muted: "#7E8CA0",
};

const SETTINGS_KEY = "overwatch:settings";
const HISTORY_KEY = "overwatch:history";
const NEWSLETTER_HISTORY_KEY = "overwatch:newsletter-history";
const ARCHIVE_KEY = "overwatch:archive";
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

const dateLine = () =>
  new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
  }) + " ET";

const dateShort = () =>
  new Date().toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" });

const calendarDateLabel = (dateIso) => {
  if (!dateIso) return "";
  const parts = String(dateIso).split("-");
  if (parts.length !== 3) return String(dateIso);
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return String(dateIso);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });
};

const stampNow = () =>
  new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) + " ET";

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
INTERNALS: put/call ${fmtNum(p.internals?.putCall)} (${p.internals?.putCallRead || ""}); breadth: ${p.internals?.breadth || ""}; trend: ${p.internals?.trend || ""}
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

const sessionPrompt = ({ market, news, points }) => `You are the strategist on Overwatch Intelligence's live desk. Write a concise AI market recap for the Session read card. Today is ${dateLine()}.

=== LIVE DESK DATA ===
${condenseMarket(market)}

${condenseNews(news)}

${condensePoints(points)}

Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"headline":"<6-10 word plain-English market read>","recap":"<60-85 words; plain English; translate desk data into what it means for a trader>","takeaways":["<3 short watch items, each 5-10 words>"],"risk":"<1 short sentence on what could upset the read>"}

Tone: calm, useful, and concrete. Use actual numbers from the data, but avoid jargon such as contango, backwardation, proxy, dispersion, or ETF internals unless you immediately translate it into plain English. Focus on what matters to an index trader right now.
If FOMC, a Fed decision, economic projections, or a Fed press conference appears in today's calendar, explicitly address it as a primary catalyst.`;

const thesisPrompt = ({ market, news, points, timing, weights, lean, risk, notes, instrument }) => {
  const focus = thesisInstrumentConfig(instrument);
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
Primary instrument focus: ${focus.symbol} (${focus.name}) with ${focus.futures} futures as the live execution proxy when relevant.
Trader notes: ${notes ? notes : "none"}.

Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"bias":"bullish|bearish|neutral","score":<integer -100 to 100>,"conviction":<integer 1-10>,"timestamp":"<generated time and ET session>","timingNote":"<one short timestamp/data-freshness note; mention stale cash-index risk when relevant>","headline":"<punchy 6-12 word thesis headline>","summary":"<4-5 sentence thesis grounded in the data, weights, and stance>","pillarRead":"<one sentence explaining which weighted pillars drove the call>","stanceRead":"<one sentence explaining how directional lean and risk appetite changed or constrained the call>","drivers":["<5-7 ranked key drivers, including top weighted pillars and stance impact>"],"bullCase":["<2-3 bullets>"],"bearCase":["<2-3 bullets>"],"levels":{"action":"<the single level that matters most today and why>","upside":"<upside targets>","downside":"<downside targets>"},"gamePlan":"<2-3 sentences: concrete SPX/ES/NQ/YM approach for this bias and risk appetite>","invalidation":"<the specific price or condition that kills this thesis>","standAside":"<conditions under which the best trade today is NO trade>"}

Be specific — use actual numbers from the data. The sign of score must match bias. Conviction should reflect how aligned the weighted pillars are.
Treat the pillar weights as a scoring model, not decoration: high-weight pillars must have more influence than low-weight pillars and the drivers must name the highest-weight/highest-impact inputs.
Treat the desk stance as a constraint: directional lean may tilt the score, but you must push back if the weighted data disagrees; risk appetite must alter conviction, sizing language, and stand-aside conditions.
Focus the levels, game plan, invalidation, and watchpoints on ${focus.symbol} first. You can reference the broader index complex, but the trade expression should be built for ${focus.focusLabel}.
The thesis must explicitly use the Internals regime: explain whether market breadth confirms or conflicts with price, what the trend state means in plain English, and whether the volatility structure supports risk-taking or argues for tighter risk.
When session is PRE-MARKET, AFTER-HOURS, or CLOSED, explicitly account for the possibility that SPX/NDX/DJI reflect the last regular close while ES/NQ/YM futures are live. Weight ${focus.futures} more heavily when it diverges from ${focus.symbol}, and say that in timingNote.`;
};

const newsletterPrompt = ({ market, news, points, thesis, timing, edition, weights, lean, risk, notes, instrument }) => {
  const focus = thesisInstrumentConfig(instrument);
  return `Write today's edition (No. ${edition}) of "OVERWATCH DAILY BIAS" — a sharp institutional morning note from Overwatch Intelligence. Date: ${dateLine()}.

=== TODAY'S DATA ===
${condenseMarket(market)}

${condenseNews(news)}

${condensePoints(points)}

=== TIMING CONTEXT ===
${condenseTiming(timing)}

=== TODAY'S THESIS ===
Bias: ${thesis.bias} (score ${thesis.score}, conviction ${thesis.conviction}/10)
Headline: ${thesis.headline}
Summary: ${thesis.summary}
Game plan: ${thesis.gamePlan}
Invalidation: ${thesis.invalidation}
Thesis timestamp: ${thesis.timestamp || thesis._generatedAt || timing?.generatedAt || "not supplied"}
Thesis timing note: ${thesis.timingNote || timing?.timingNote || "not supplied"}
Weighted pillar read: ${thesis.pillarRead || weightsLine(thesis.pillarWeights || weights)}
Desk stance read: ${thesis.stanceRead || stanceLine({ lean, risk, notes })}

=== CURRENT DESK CONFIGURATION ===
Pillar weights: ${weightsLine(weights)}
Desk stance: ${stanceLine({ lean, risk, notes })}
Primary instrument focus: ${focus.symbol} (${focus.name}) with ${focus.futures} futures as the execution proxy when relevant.

Respond with ONLY a raw JSON object — no markdown fences, no commentary. Exact schema:
{"headline":"<edition headline, 5-10 words>","dek":"<one-line subtitle>","timestamp":"<generated time and ET session>","timingNote":"<one short timestamp/data-freshness note; mention stale cash-index risk when relevant>","executiveSummary":"<55-75 words>","marketRecap":"<70-90 words on tape, rates, vol, sectors — with numbers>","marketOutlook":"<95-130 words explaining recent, current, and upcoming events plus brief market impact analysis>","stanceRead":"<one sentence explaining how the desk stance and risk appetite shaped the note>","pillarRead":"<one sentence explaining which weighted pillars mattered most>","thesisNarrative":"<95-120 words articulating the bias, key levels, weighted pillars, stance, and the plan>","watchToday":["<3-4 short bullets: catalysts and levels to watch>"],"riskRadar":"<35-55 words on what could break the call>","finalWord":"<one closing sentence with desk personality>"}

Tone: confident, concrete, zero fluff. Use actual numbers from the data.
The newsletter must carry the thesis weighting through: mention the most influential pillar weights and explain how the desk stance/risk appetite shaped the plan. Do not treat stance as a generic footer.
The newsletter must include a plain-English read of breadth, trend state, and volatility structure. Do not mention the Internals regime generically; translate it into what it means for an index trader today.
The Market Outlook section must separate the catalyst story into recent headlines/data, current same-day events, and upcoming events this week. For each, state why it matters to ${focus.symbol}, ${focus.futures}, rates, volatility, or breadth.
Keep the note centered on ${focus.focusLabel}. Cross-index context is useful, but the lead framing, key levels, and watch list should be written for ${focus.symbol}.
If session is PRE-MARKET, AFTER-HOURS, or CLOSED, the newsletter must note that cash index data may be stale versus live futures when relevant, especially if ${focus.futures} diverges from ${focus.symbol}.`;
};

/* ================================================================
   STYLES — graphite-navy desk terminal, brass signal accent
   ================================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,500&display=swap');

:root{
  --ink:#0B0F14; --panel:#121821; --panel2:#0E141C; --panel3:#161E2A;
  --line:#1E2935; --line2:#27374A;
  --text:#E8EDF2; --muted:#7E8CA0; --faint:#55637A;
  --brass:#E8B45A; --brass-dim:rgba(232,180,90,.14);
  --bull:#3DD68C; --bull-dim:rgba(61,214,140,.12);
  --bear:#F2555A; --bear-dim:rgba(242,85,90,.12);
  --info:#5AA7E8; --info-dim:rgba(90,167,232,.12);
  --paper:#F3EEE3; --paper2:#EAE3D3; --paper-ink:#1A1916; --paper-muted:#6A6357; --paper-line:#D8CFBC;
  --r:10px;
}
*{box-sizing:border-box;margin:0;padding:0}
.bd-root{
  min-height:100vh;background:var(--ink);color:var(--text);
  font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.5;
  background-image:radial-gradient(rgba(126,140,160,.05) 1px, transparent 1px);
  background-size:26px 26px;
}
.bd-root ::selection{background:rgba(232,180,90,.3)}
.mono{font-family:'JetBrains Mono',monospace}
.disp{font-family:'Space Grotesk',sans-serif}

/* scrollbars */
.bd-root ::-webkit-scrollbar{width:9px;height:9px}
.bd-root ::-webkit-scrollbar-track{background:var(--panel2)}
.bd-root ::-webkit-scrollbar-thumb{background:var(--line2);border-radius:5px}
.bd-root ::-webkit-scrollbar-thumb:hover{background:#33465e}

/* ---------- header ---------- */
.bd-header{
  display:flex;align-items:center;gap:18px;padding:14px 22px;
  border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,#10161F 0%,#0B0F14 100%);
  position:sticky;top:0;z-index:50;
}
.bd-logo{display:flex;align-items:center;gap:12px;min-width:0}
.bd-mark{
  width:38px;height:38px;border-radius:9px;flex:none;
  background:linear-gradient(135deg,#2A3648,#141B26);
  border:1px solid var(--line2);display:grid;place-items:center;
  font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:var(--brass);
  letter-spacing:.5px;box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
}
.bd-title{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;letter-spacing:.04em;white-space:nowrap}
.bd-title em{font-style:normal;color:var(--brass)}
.bd-sub{font-size:10.5px;color:var(--muted);letter-spacing:.18em;text-transform:uppercase;margin-top:1px}
.bd-hright{margin-left:auto;display:flex;align-items:center;gap:12px}
.bd-clock{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--text);letter-spacing:.04em}
.bd-clock span{color:var(--faint);font-size:10px;margin-left:5px}
.bd-session{
  display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;
  font-size:10.5px;letter-spacing:.14em;padding:6px 11px;border-radius:999px;
  border:1px solid var(--line2);background:var(--panel2);
}
.bd-dot{width:7px;height:7px;border-radius:50%}
.dot-live{background:var(--bull);box-shadow:0 0 0 0 rgba(61,214,140,.5);animation:pulse 2s infinite}
.dot-warn{background:var(--brass)}
.dot-off{background:var(--faint)}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(61,214,140,.45)}70%{box-shadow:0 0 0 7px rgba(61,214,140,0)}100%{box-shadow:0 0 0 0 rgba(61,214,140,0)}}

/* ---------- buttons ---------- */
.btn{
  display:inline-flex;align-items:center;gap:8px;cursor:pointer;border-radius:8px;
  font-family:'Inter',sans-serif;font-weight:600;font-size:13px;
  padding:9px 15px;border:1px solid var(--line2);background:var(--panel3);color:var(--text);
  transition:all .15s ease;white-space:nowrap;
}
.btn:hover{border-color:#3a4d66;background:#1B2533;transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none}
.btn-brass{background:linear-gradient(135deg,#E8B45A,#D49A3E);color:#1A1408;border-color:#B9852F}
.btn-brass:hover{background:linear-gradient(135deg,#F0BE66,#DCA449);border-color:#D49A3E}
.btn-ghost{background:transparent;border-color:transparent;color:var(--muted);padding:7px 10px}
.btn-ghost:hover{color:var(--text);background:var(--panel3);border-color:transparent;transform:none}
.btn-sm{padding:6px 11px;font-size:12px;border-radius:7px}
.btn-danger{color:var(--bear);border-color:rgba(242,85,90,.35)}
.btn-danger:hover{background:var(--bear-dim);border-color:var(--bear)}
.spin{animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ---------- workflow strip ---------- */
.bd-flow{display:flex;align-items:center;gap:0;padding:10px 22px;border-bottom:1px solid var(--line);background:var(--panel2);overflow-x:auto}
.flow-step{display:flex;align-items:center;gap:9px;padding:5px 12px;border-radius:8px;cursor:pointer;transition:background .15s;flex:none}
.flow-step:hover{background:var(--panel3)}
.flow-num{
  width:21px;height:21px;border-radius:50%;display:grid;place-items:center;flex:none;
  font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;
  border:1px solid var(--line2);color:var(--muted);
}
.flow-step.done .flow-num{background:var(--bull-dim);border-color:var(--bull);color:var(--bull)}
.flow-step.now .flow-num{background:var(--brass-dim);border-color:var(--brass);color:var(--brass)}
.flow-label{font-size:12px;color:var(--muted);font-weight:500}
.flow-step.done .flow-label,.flow-step.now .flow-label{color:var(--text)}
.flow-arrow{color:var(--faint);margin:0 4px;flex:none}

/* ---------- tabs (desktop) ---------- */
.bd-tabs{display:flex;gap:4px;padding:12px 22px 0;border-bottom:1px solid var(--line);overflow-x:auto}
.bd-tab{
  display:flex;align-items:center;gap:8px;padding:10px 16px 12px;cursor:pointer;
  color:var(--muted);font-weight:600;font-size:13px;border:none;background:none;
  border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .15s;white-space:nowrap;
  font-family:'Inter',sans-serif;
}
.bd-tab:hover{color:var(--text)}
.bd-tab.on{color:var(--brass);border-bottom-color:var(--brass)}
.tab-badge{
  font-family:'JetBrains Mono',monospace;font-size:10px;padding:1.5px 6px;border-radius:999px;
  background:var(--panel3);border:1px solid var(--line2);color:var(--muted);
}
.bd-tab.on .tab-badge{color:var(--brass);border-color:rgba(232,180,90,.4)}

/* ---------- bottom nav (mobile) ---------- */
.bd-bottom-nav{
  display:none;
  position:fixed;bottom:0;left:0;right:0;z-index:200;
  background:var(--panel);border-top:1px solid var(--line);
  padding-bottom:env(safe-area-inset-bottom,0px);
}
.bd-bottom-nav-inner{
  display:flex;
}
.bd-bnav-btn{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:4px;padding:11px 2px 10px;
  background:none;border:none;cursor:pointer;
  color:var(--muted);font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
  font-family:'Inter',sans-serif;transition:color .15s;position:relative;
}
.bd-bnav-btn.on{color:var(--brass)}
.bd-bnav-btn svg{flex-shrink:0}
.bd-bnav-dot{
  position:absolute;top:8px;right:calc(50% - 12px);
  width:6px;height:6px;border-radius:50%;
  background:var(--brass);
}

/* ---------- layout ---------- */
.bd-main{padding:20px 22px 30px;max-width:1480px;margin:0 auto}
.grid{display:grid;gap:14px}
.g-pulse{grid-template-columns:repeat(auto-fill,minmax(215px,1fr))}
.g-2{grid-template-columns:1.15fr .85fr}
.g-market-read{grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch}
.g-3{grid-template-columns:repeat(3,1fr)}
.g-data{grid-template-columns:1fr 1fr 1fr}
.g-thesis{grid-template-columns:340px 1fr}
.archives-grid{display:grid;gap:14px;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
@media(max-width:1100px){.g-2,.g-market-read,.g-data,.g-thesis,.archives-grid{grid-template-columns:1fr}}
@media(max-width:760px){
  .g-3{grid-template-columns:1fr}
  .bd-main{padding:14px 12px calc(85px + env(safe-area-inset-bottom,0px) + 10px)}
  .bd-header{padding:12px 14px;flex-wrap:wrap}
  .bd-hright{width:100%;justify-content:space-between;margin-left:0}
  .bd-tabs{display:none}
  .bd-bottom-nav{display:block}
}

/* ---------- cards ---------- */
.card{
  background:linear-gradient(180deg,rgba(255,255,255,.018),transparent 38%),var(--panel);
  border:1px solid var(--line);border-radius:var(--r);padding:16px;
}
.card-head{display:flex;align-items:center;gap:9px;margin-bottom:13px}
.card-title{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:13.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--text)}
.card-title small{display:block;font-family:'Inter',sans-serif;font-weight:400;font-size:11px;color:var(--muted);text-transform:none;letter-spacing:0;margin-top:1px}
.card-head .ic{color:var(--brass)}
.card-tools{margin-left:auto;display:flex;align-items:center;gap:7px}
.freshness{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--faint);letter-spacing:.05em}
.freshness.stale{color:var(--brass)}

/* ---------- ticker cards ---------- */
.tk{position:relative;overflow:hidden}
.tk-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.tk-body{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;margin-top:8px}
.tk-left{min-width:0}
.tk-sym{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;letter-spacing:.06em}
.tk-name{font-size:10.5px;color:var(--muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tk-price{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:23px;margin-top:9px;letter-spacing:-.01em}
.tk-chg{font-family:'JetBrains Mono',monospace;font-size:12px;margin-top:3px;display:flex;gap:9px}
.tk-candle{width:98px;display:grid;grid-template-columns:minmax(0,1fr) 14px;gap:7px;align-items:center;justify-self:end}
.candle-axis{display:flex;flex-direction:column;justify-content:space-between;height:72px;padding-right:1px;align-items:flex-end;font-family:'JetBrains Mono',monospace;line-height:1}
.candle-axis-line{display:flex;flex-direction:column;align-items:flex-end;gap:1px}
.candle-axis-tag{font-size:8px;letter-spacing:.14em;color:var(--faint)}
.candle-axis-num{font-size:8.5px;font-variant-numeric:tabular-nums;color:var(--brass)}
.candle-axis-line-lo .candle-axis-num{color:var(--muted)}
.candle-rail{position:relative;width:14px;justify-self:end}
.candle-wick{position:absolute;left:50%;width:1.5px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,.08));transform:translateX(-50%)}
.candle-body{position:absolute;left:50%;width:8px;border-radius:2px;transform:translateX(-50%)}
.candle-body.bull{background:linear-gradient(180deg,rgba(61,214,140,.96),rgba(61,214,140,.28));box-shadow:0 0 0 1px rgba(61,214,140,.14) inset, 0 0 10px rgba(61,214,140,.14)}
.candle-body.bear{background:linear-gradient(180deg,rgba(242,85,90,.96),rgba(242,85,90,.28));box-shadow:0 0 0 1px rgba(242,85,90,.14) inset, 0 0 10px rgba(242,85,90,.14)}
.candle-body.flat{background:linear-gradient(180deg,rgba(232,180,90,.96),rgba(232,180,90,.28));box-shadow:0 0 0 1px rgba(232,180,90,.14) inset, 0 0 10px rgba(232,180,90,.12)}
.tk-glow{position:absolute;top:0;left:0;right:0;height:2px}

/* ---------- session read ---------- */
.session-summary{font-size:14px;line-height:1.6;color:var(--text);font-weight:500}
.session-meta{margin-top:7px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--faint);letter-spacing:.04em}
.session-recap{
  margin-top:12px;padding:12px 13px;border-radius:9px;border:1px solid var(--line);
  background:linear-gradient(135deg,rgba(232,180,90,.06),rgba(90,167,232,.03)),var(--panel2);
}
.session-recap-head{display:flex;align-items:center;justify-content:space-between;gap:10px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;color:var(--brass)}
.session-recap-kicker{text-transform:uppercase}
.session-recap-state{color:var(--faint)}
.session-recap-title{margin-top:7px;font-size:13px;line-height:1.45;font-weight:700;color:var(--text)}
.session-recap-copy{margin-top:5px;font-size:12px;line-height:1.6;color:var(--muted)}
.session-recap-subhead{margin-top:10px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.session-recap-points{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.session-recap-pill{
  border:1px solid var(--line2);border-radius:999px;background:var(--panel3);padding:4px 8px;
  font-size:10.5px;line-height:1.35;color:var(--text);
}
.session-recap-risk{margin-top:8px;font-size:10.5px;line-height:1.5;color:var(--faint)}
.session-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}
.session-stat{border:1px solid var(--line);border-radius:8px;padding:9px 10px;background:linear-gradient(135deg,rgba(232,180,90,.05),rgba(90,167,232,.025)),var(--panel2)}
.session-stat-key{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.session-stat-val{margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.45;color:var(--text);font-weight:600}
.session-stat-note{margin-top:4px;font-size:11px;line-height:1.4;color:var(--muted)}
.session-note{margin-top:11px;padding-top:10px;border-top:1px dashed var(--line);font-size:12px;line-height:1.5;color:var(--muted)}
@media(max-width:760px){
  .session-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .session-recap-head{align-items:flex-start;flex-direction:column}
}
@media(max-width:430px){.session-grid{grid-template-columns:1fr}}

/* ---------- heatmap ---------- */
.hm{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:7px}
.hm-tile{border-radius:7px;padding:9px 10px;border:1px solid var(--line);transition:transform .12s}
.hm-tile:hover{transform:scale(1.04)}
.hm-name{font-size:10px;color:var(--text);opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
.hm-val{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;margin-top:3px}

/* ---------- news ---------- */
.news-card{
  border:1px solid var(--line);border-left-width:3px;border-radius:9px;background:var(--panel);
  padding:13px 15px;transition:border-color .15s,transform .12s;position:relative;
}
.news-card:hover{border-color:var(--line2);transform:translateX(2px)}
.news-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.chip{
  font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  padding:2.5px 8px;border-radius:999px;border:1px solid var(--line2);color:var(--muted);background:var(--panel2);
}
.chip.b-bull{color:var(--bull);border-color:rgba(61,214,140,.4);background:var(--bull-dim)}
.chip.b-bear{color:var(--bear);border-color:rgba(242,85,90,.4);background:var(--bear-dim)}
.chip.b-brass{color:var(--brass);border-color:rgba(232,180,90,.4);background:var(--brass-dim)}
.chip.b-info{color:var(--info);border-color:rgba(90,167,232,.4);background:var(--info-dim)}
.impact{display:flex;gap:2.5px;align-items:flex-end;height:13px}
.impact i{width:3.5px;border-radius:1px;background:var(--line2)}
.news-title{font-weight:600;font-size:13.5px;margin-top:8px;line-height:1.4}
.news-title a{color:inherit;text-decoration:none}
.news-title a:hover{color:var(--brass)}
.news-note{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.5}
.news-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--faint);margin-left:auto}
.news-add{position:absolute;right:10px;bottom:10px;opacity:0;transition:opacity .15s}
.news-card:hover .news-add{opacity:1}
.ticker-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px;padding-right:72px}
.ticker-tag{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--brass);border:1px solid rgba(232,180,90,.28);border-radius:999px;padding:2px 6px;background:rgba(232,180,90,.06)}
.intel-brief{border:1px solid var(--line);border-radius:10px;background:linear-gradient(135deg,rgba(232,180,90,.07),rgba(90,167,232,.035)),var(--panel);padding:14px 16px;margin-bottom:13px}
.intel-brief p{font-size:13px;color:var(--muted);line-height:1.6;margin-top:6px}
.cat-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--line)}
.cat-row:last-child{border-bottom:none}
.cat-meter{height:5px;border-radius:999px;background:var(--panel3);overflow:hidden;flex:1}
.cat-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--brass),var(--bull))}
.watch-list{display:flex;flex-direction:column;gap:9px}
.watch-item{font-size:12px;line-height:1.55;color:var(--muted);padding-left:14px;position:relative}
.watch-item::before{content:'';position:absolute;left:0;top:7px;width:6px;height:6px;border-radius:2px;background:var(--brass)}

/* ---------- filters ---------- */
.filter-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:13px}
.fchip{
  cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;
  padding:5px 12px;border-radius:999px;border:1px solid var(--line2);color:var(--muted);background:transparent;transition:all .13s;
}
.fchip:hover{color:var(--text);border-color:#3a4d66}
.fchip.on{color:var(--brass);border-color:var(--brass);background:var(--brass-dim)}

/* ---------- data points ---------- */
.metric{display:flex;flex-direction:column;gap:3px;padding:12px 14px;border:1px solid var(--line);border-radius:9px;background:var(--panel2)}
.metric-k{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.metric-v{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:19px}
.metric-note{font-size:11px;color:var(--muted);line-height:1.45}
.internals-regime{display:flex;flex-direction:column;gap:11px}
.internals-hero{
  display:flex;justify-content:space-between;gap:14px;align-items:flex-start;
  border:1px solid var(--line2);border-radius:11px;padding:14px 15px;
  background:radial-gradient(120% 130% at 0% 0%,rgba(232,180,90,.11),transparent 55%),linear-gradient(135deg,rgba(90,167,232,.04),transparent),var(--panel2);
}
.internals-kicker{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--brass)}
.internals-hero h3{font-family:'Space Grotesk',sans-serif;font-size:20px;line-height:1.15;margin-top:5px;text-transform:capitalize}
.internals-hero p{font-size:12.5px;line-height:1.58;color:var(--muted);margin-top:7px;max-width:650px}
.internals-scorecard{
  min-width:96px;border:1px solid var(--line);border-radius:9px;background:rgba(14,20,28,.72);
  padding:10px 11px;text-align:right;
}
.internals-scorecard span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.internals-scorecard b{display:block;font-family:'JetBrains Mono',monospace;font-size:25px;line-height:1.1;margin-top:5px}
.internals-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.internals-tile{border:1px solid var(--line);border-radius:9px;background:var(--panel2);padding:10px 11px}
.internals-tile span{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.internals-tile b{display:block;font-family:'JetBrains Mono',monospace;font-size:16px;text-transform:uppercase;margin-top:5px}
.internals-tile small{display:block;color:var(--muted);font-size:10.8px;line-height:1.35;margin-top:4px}
.internals-section{border:1px solid var(--line);border-radius:10px;background:rgba(14,20,28,.76);padding:12px}
.internals-section.compact{padding:10px 11px}
.internals-section-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:9px}
.internals-section-head b{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);white-space:nowrap}
.internals-section-head span{font-size:11.5px;color:var(--muted);line-height:1.45;text-align:right}
.breadth-meter{position:relative;height:10px;border-radius:999px;background:linear-gradient(90deg,rgba(242,85,90,.22),rgba(232,180,90,.2),rgba(61,214,140,.22));border:1px solid var(--line2);overflow:hidden}
.breadth-fill{position:absolute;left:0;top:0;bottom:0;border-radius:inherit;background:linear-gradient(90deg,rgba(232,180,90,.75),rgba(61,214,140,.88));box-shadow:0 0 14px rgba(61,214,140,.16)}
.breadth-mid{position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.32)}
.breadth-labels,.breadth-dist-labels{display:flex;justify-content:space-between;gap:8px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--faint);margin-top:6px}
.breadth-labels span:nth-child(2){color:var(--brass)}
.breadth-dist{margin-top:10px}
.breadth-dist-track{display:flex;height:9px;overflow:hidden;border-radius:999px;border:1px solid var(--line2);background:var(--panel3)}
.breadth-dist-track span{min-width:0;transition:width .3s ease}
.sector-chip-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(142px,1fr));gap:7px;margin-top:11px}
.sector-chip{display:flex;align-items:center;justify-content:space-between;gap:9px;border:1px solid var(--line);border-radius:8px;background:var(--panel3);padding:7px 9px}
.sector-chip span{font-size:11px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sector-chip b{font-family:'JetBrains Mono',monospace;font-size:10.5px;white-space:nowrap}
.internals-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.regime-rail-wrap{margin-top:8px}
.regime-rail{position:relative;height:8px;border-radius:999px;background:linear-gradient(90deg,var(--bear),#8b4d52 28%,#343f50 50%,#3f7a64 72%,var(--bull));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.regime-zero{position:absolute;left:50%;top:-4px;width:1px;height:16px;background:rgba(255,255,255,.32)}
.regime-caret{position:absolute;top:-5px;width:4px;height:18px;border-radius:999px;transform:translateX(-50%)}
.regime-rail-labels{display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.06em;color:var(--faint);margin-top:7px}
.regime-rail-labels b{font-size:11px}
.internals-components{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.internals-components span{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--text);border:1px solid var(--line);background:var(--panel3);border-radius:999px;padding:3px 7px}
.vol-map{margin-top:5px}
.vol-bands{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding-top:10px}
.vol-band{min-height:48px;border:1px solid var(--line);border-radius:7px;background:var(--panel3);padding:8px 7px;text-align:center}
.vol-band b{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--text)}
.vol-band small{display:block;font-family:'JetBrains Mono',monospace;font-size:8.5px;color:var(--faint);margin-top:4px}
.vol-calm{background:rgba(61,214,140,.09)}
.vol-normal{background:rgba(90,167,232,.08)}
.vol-elevated{background:rgba(232,180,90,.09)}
.vol-stress{background:rgba(242,85,90,.09)}
.vol-marker{position:absolute;top:2px;width:7px;height:58px;border-radius:999px;background:var(--text);box-shadow:0 0 12px rgba(255,255,255,.55);transform:translateX(-50%)}
.vol-map-read{font-size:11.5px;line-height:1.5;color:var(--muted);margin-top:8px}
.leader-list{display:flex;flex-direction:column;gap:6px}
.leader-list span{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11.5px;color:var(--text)}
.leader-list b{font-family:'JetBrains Mono',monospace;font-size:10.5px}
.internals-footer{display:grid;grid-template-columns:.85fr 1.15fr;gap:10px}
.internals-footer div{border:1px solid var(--line);border-radius:9px;background:linear-gradient(135deg,rgba(232,180,90,.045),rgba(90,167,232,.025)),var(--panel2);padding:10px 11px}
.internals-footer b{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--brass);margin-bottom:5px}
.internals-footer span{font-size:11.5px;line-height:1.5;color:var(--muted)}
@media(max-width:760px){
  .internals-hero{flex-direction:column}
  .internals-scorecard{text-align:left;width:100%}
  .internals-grid,.internals-two,.internals-footer{grid-template-columns:1fr}
  .internals-section-head{flex-direction:column;gap:4px}
  .internals-section-head span{text-align:left}
  .vol-bands{grid-template-columns:repeat(2,1fr)}
  .vol-marker{height:112px}
}
.cal-row{display:flex;align-items:center;gap:11px;padding:9px 4px;border-bottom:1px dashed var(--line)}
.cal-row:last-child{border-bottom:none}
.cal-time{font-family:'JetBrains Mono',monospace;font-size:11.5px;color:var(--brass);width:78px;flex:none}
.cal-ev{font-size:12.5px;flex:1}
.cal-imp{width:8px;height:8px;border-radius:50%;flex:none}
.cal-group{border:1px solid var(--line);border-radius:9px;background:var(--panel2);padding:10px 12px;margin-bottom:10px}
.cal-group:last-child{margin-bottom:0}
.cal-group-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.cal-group-title b{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--brass)}
.cal-group-title span{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--faint)}
.cal-meta{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--faint);margin-top:2px}
.cal-values{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--muted);margin-top:3px}
.cal-note{font-size:11px;color:var(--muted);line-height:1.45;margin-top:4px}
.calendar-hero{border:1px solid var(--line2);border-radius:12px;padding:18px 20px;background:linear-gradient(135deg,rgba(232,180,90,.08),rgba(90,167,232,.035)),var(--panel)}
.calendar-hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap}
.calendar-next{min-width:240px;flex:1}
.calendar-next h2{font-family:'Space Grotesk',sans-serif;font-size:20px;line-height:1.25;margin-top:8px}
.calendar-next p{font-size:12.5px;line-height:1.6;color:var(--muted);margin-top:6px}
.calendar-summary{display:grid;grid-template-columns:repeat(3,minmax(110px,1fr));gap:8px;min-width:320px}
.calendar-summary-tile{border:1px solid var(--line);border-radius:8px;background:rgba(14,20,28,.72);padding:10px 11px}
.calendar-summary-tile b{display:block;font-family:'JetBrains Mono',monospace;font-size:19px;color:var(--text)}
.calendar-summary-tile span{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.calendar-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;align-items:start}
@media(max-width:1100px){.calendar-grid{grid-template-columns:1fr}.calendar-summary{min-width:0;width:100%}}
.flow-summary{border:1px solid var(--line);border-radius:9px;padding:11px 13px;background:linear-gradient(135deg,rgba(232,180,90,.06),rgba(90,167,232,.035)),var(--panel2);font-size:12.5px;line-height:1.6;color:var(--text)}
.flow-row{display:grid;grid-template-columns:54px 1fr auto;gap:9px;align-items:start;padding:9px 0;border-bottom:1px dashed var(--line)}
.flow-row:last-child{border-bottom:none}
.flow-sym{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:11px;color:var(--brass)}
.flow-label{font-size:12px;color:var(--text);font-weight:600}
.flow-read{font-size:11px;color:var(--muted);line-height:1.45;margin-top:2px}
.flow-val{font-family:'JetBrains Mono',monospace;font-size:11px;text-align:right;white-space:nowrap}
.flow-signal{border:1px solid var(--line);border-radius:8px;background:var(--panel2);padding:9px 10px}
.flow-signal b{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
.flow-signal span{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700}
.flow-signal p{font-size:11px;color:var(--muted);line-height:1.45;margin-top:4px}

/* ---------- thesis lab ---------- */
.slider-row{margin-bottom:15px}
.slider-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.slider-name{font-size:12.5px;font-weight:600}
.slider-hint{font-size:10.5px;color:var(--faint);margin-left:7px}
.slider-val{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--brass);font-weight:600}
input[type=range].bd-range{
  -webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:3px;
  background:linear-gradient(90deg,var(--brass) var(--pct,50%),var(--panel3) var(--pct,50%));
  outline:none;cursor:pointer;
}
input[type=range].bd-range::-webkit-slider-thumb{
  -webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:#F0C879;
  border:2px solid #0B0F14;box-shadow:0 0 0 1.5px var(--brass),0 2px 7px rgba(0,0,0,.5);cursor:grab;
}
input[type=range].bd-range::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:#F0C879;border:2px solid #0B0F14;box-shadow:0 0 0 1.5px var(--brass);cursor:grab}
.seg{display:flex;border:1px solid var(--line2);border-radius:8px;overflow:hidden;background:var(--panel2)}
.seg button{
  flex:1;padding:8px 6px;border:none;background:none;color:var(--muted);font-weight:600;font-size:12px;
  cursor:pointer;font-family:'Inter',sans-serif;transition:all .13s;border-right:1px solid var(--line);
}
.seg button:last-child{border-right:none}
.seg button:hover{color:var(--text)}
.seg button.on{background:var(--brass-dim);color:var(--brass)}
.seg button.on.sg-bull{background:var(--bull-dim);color:var(--bull)}
.seg button.on.sg-bear{background:var(--bear-dim);color:var(--bear)}
.lab-field{margin-top:16px}
.lab-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-bottom:7px;display:block}
textarea.bd-ta{
  width:100%;min-height:84px;resize:vertical;background:var(--panel2);border:1px solid var(--line2);
  border-radius:8px;color:var(--text);font-family:'Inter',sans-serif;font-size:13px;padding:10px 12px;outline:none;line-height:1.5;
}
textarea.bd-ta:focus{border-color:var(--brass)}

/* ---------- thesis output ---------- */
.th-hero{
  border:1px solid var(--line2);border-radius:12px;padding:22px;position:relative;overflow:hidden;
  background:radial-gradient(120% 150% at 50% -20%,rgba(232,180,90,.07),transparent 55%),var(--panel);
}
.th-bias{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:38px;letter-spacing:.02em;line-height:1}
.th-head{font-family:'Lora',serif;font-size:17px;font-style:italic;color:var(--text);margin-top:10px;opacity:.92}
.th-summary{font-size:13.5px;color:var(--muted);line-height:1.65;margin-top:11px}
.timing-note{border:1px solid rgba(232,180,90,.28);background:rgba(232,180,90,.07);border-radius:8px;padding:10px 12px;margin-top:13px;font-size:12px;line-height:1.55;color:#F0D5A0}
.timing-note b{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass);margin-bottom:4px}
.th-scorecard{border:1px solid var(--line);border-radius:10px;background:var(--panel2);padding:12px 13px;margin-top:13px;display:flex;flex-direction:column;gap:10px}
.th-scorecard-row{display:grid;grid-template-columns:115px 1fr;gap:10px;align-items:start}
.th-scorecard-row b{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass)}
.th-scorecard-row span{font-size:12px;line-height:1.55;color:var(--muted)}
.pillar-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:7px}
.pillar-chip{border:1px solid var(--line);border-radius:8px;background:var(--panel3);padding:8px 9px}
.pillar-chip b{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text);margin-bottom:4px}
.pillar-chip span{font-size:11px;color:var(--muted);line-height:1.45}
.spectrum{position:relative;height:30px;margin-top:20px}
.spectrum-track{
  position:absolute;top:12px;left:0;right:0;height:6px;border-radius:3px;
  background:linear-gradient(90deg,#F2555A 0%,#8a4a52 22%,#3A4456 50%,#3f7a64 78%,#3DD68C 100%);
  opacity:.85;
}
.spectrum-mid{position:absolute;top:7px;left:50%;width:1.5px;height:16px;background:var(--faint)}
.spectrum-caret{
  position:absolute;top:0;width:3.5px;height:30px;border-radius:2px;background:var(--text);
  box-shadow:0 0 11px rgba(255,255,255,.55);transform:translateX(-50%);transition:left .9s cubic-bezier(.22,1,.36,1);
}
.spectrum-lbl{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--faint);letter-spacing:.1em;margin-top:3px}
.pips{display:flex;gap:5px;align-items:center}
.pip{width:9px;height:9px;transform:rotate(45deg);border:1px solid var(--line2);background:var(--panel3);transition:all .3s}
.case-list{list-style:none;display:flex;flex-direction:column;gap:8px}
.case-list li{display:flex;gap:9px;font-size:12.5px;line-height:1.55;color:var(--text)}
.case-list li::before{content:'';width:6px;height:6px;border-radius:2px;margin-top:6px;flex:none}
.case-bull li::before{background:var(--bull)}
.case-bear li::before{background:var(--bear)}
.case-neutral li::before{background:var(--brass)}
.guard{border:1px solid;border-radius:9px;padding:12px 14px;font-size:12.5px;line-height:1.55}
.guard b{display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.13em;text-transform:uppercase;margin-bottom:6px}
.guard.g-red{border-color:rgba(242,85,90,.4);background:rgba(242,85,90,.06);color:#fbd2d3}
.guard.g-red b{color:var(--bear)}
.guard.g-amber{border-color:rgba(232,180,90,.4);background:rgba(232,180,90,.06);color:#f3e2c2}
.guard.g-amber b{color:var(--brass)}
.hist-row{
  display:flex;align-items:center;gap:10px;padding:10px 11px;border:1px solid var(--line);border-radius:8px;
  cursor:pointer;transition:border-color .14s,background .14s;background:var(--panel2);
}
.hist-row:hover{border-color:var(--line2);background:var(--panel3)}
.hist-row.viewing{border-color:var(--brass)}

/* ---------- newsletter paper ---------- */
.paper-wrap{display:flex;justify-content:center}
.paper{
  width:100%;max-width:760px;background:linear-gradient(180deg,var(--paper),var(--paper2));
  color:var(--paper-ink);border-radius:4px;padding:46px 52px 40px;
  font-family:'Lora',serif;box-shadow:0 24px 70px rgba(0,0,0,.55),0 3px 12px rgba(0,0,0,.4);
  position:relative;
}
@media(max-width:760px){.paper{padding:28px 22px}}
.paper::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#C99B47,#E8B45A,#C99B47);border-radius:4px 4px 0 0}
.np-mast{display:flex;align-items:baseline;justify-content:space-between;border-bottom:2.5px solid var(--paper-ink);padding-bottom:11px;flex-wrap:wrap;gap:6px}
.np-brand{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:25px;letter-spacing:.03em}
.np-brand span{color:#A87B2E}
.np-meta{font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--paper-muted);letter-spacing:.1em;text-transform:uppercase}
.np-biasbar{display:flex;align-items:center;gap:13px;padding:11px 0;border-bottom:1px solid var(--paper-line);flex-wrap:wrap}
.np-biasword{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13.5px;letter-spacing:.16em;text-transform:uppercase}
.np-h1{font-weight:700;font-size:29px;line-height:1.22;margin-top:20px;letter-spacing:-.01em}
.np-dek{font-style:italic;font-size:15.5px;color:var(--paper-muted);margin-top:7px}
.np-time-note{border:1px solid var(--paper-line);border-left:3px solid #A87B2E;border-radius:5px;background:rgba(168,123,46,.07);padding:10px 12px;margin-top:14px;font-family:'Inter',sans-serif;font-size:12.5px;line-height:1.55;color:var(--paper-muted)}
.np-time-note b{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#A87B2E;margin-right:6px}
.np-config{border:1px solid var(--paper-line);border-left:3px solid #A87B2E;border-radius:6px;background:rgba(168,123,46,.06);padding:11px 13px;margin-top:14px;font-family:'Inter',sans-serif;display:flex;flex-direction:column;gap:8px}
.np-config b{display:block;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:#A87B2E;margin-bottom:3px}
.np-config span{display:block;font-size:12.5px;line-height:1.55;color:var(--paper-muted)}
.np-sec{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#A87B2E;margin:26px 0 9px;display:flex;align-items:center;gap:10px}
.np-sec::after{content:'';flex:1;height:1px;background:var(--paper-line)}
.np-body{font-size:14.5px;line-height:1.78}
.np-lede{font-size:15.5px;line-height:1.8}
.np-lede::first-letter{font-size:46px;font-weight:700;float:left;line-height:.84;padding:5px 9px 0 0;color:#A87B2E}
.np-table{width:100%;border-collapse:collapse;font-family:'JetBrains Mono',monospace;font-size:11.5px;margin-top:5px}
.np-table th{text-align:left;font-weight:600;color:var(--paper-muted);border-bottom:1px solid var(--paper-ink);padding:5px 7px;font-size:10px;letter-spacing:.09em;text-transform:uppercase}
.np-table td{padding:6px 7px;border-bottom:1px solid var(--paper-line)}
.np-watch{list-style:none;margin-top:4px}
.np-watch li{padding:7px 0 7px 22px;position:relative;font-size:14px;line-height:1.6;border-bottom:1px dotted var(--paper-line)}
.np-watch li::before{content:'▸';position:absolute;left:2px;color:#A87B2E;font-family:'Space Grotesk',sans-serif}
.np-risk{border:1.5px solid #B8503F;border-radius:6px;background:rgba(184,80,63,.06);padding:13px 16px;font-size:13.5px;line-height:1.7;margin-top:5px}
.np-final{font-style:italic;font-size:15px;margin-top:24px;padding-top:15px;border-top:2.5px solid var(--paper-ink);line-height:1.7}
.np-foot{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--paper-muted);letter-spacing:.07em;margin-top:25px;text-transform:uppercase;line-height:1.8}

/* ---------- drawer / overlay ---------- */
.overlay{position:fixed;inset:0;background:rgba(5,8,12,.66);backdrop-filter:blur(2px);z-index:90}
.drawer{
  position:fixed;top:0;right:0;bottom:0;width:min(420px,94vw);background:var(--panel);z-index:100;
  border-left:1px solid var(--line2);padding:22px;overflow-y:auto;
  animation:slideIn .25s cubic-bezier(.22,1,.36,1);
}
@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
.wl-chip{display:inline-flex;align-items:center;gap:7px;padding:6px 8px 6px 12px;border:1px solid var(--line2);border-radius:8px;background:var(--panel2);margin:0 7px 7px 0}
.wl-x{cursor:pointer;color:var(--faint);display:grid;place-items:center;border-radius:5px;padding:2px}
.wl-x:hover{color:var(--bear);background:var(--bear-dim)}
input.bd-in{
  background:var(--panel2);border:1px solid var(--line2);border-radius:8px;color:var(--text);
  font-family:'Inter',sans-serif;font-size:13px;padding:9px 12px;outline:none;width:100%;
}
input.bd-in:focus{border-color:var(--brass)}
input.bd-in.mono-in{font-family:'JetBrains Mono',monospace;text-transform:uppercase}

/* ---------- states ---------- */
.skel{position:relative;overflow:hidden;background:var(--panel3);border-radius:7px}
.skel::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(232,180,90,.08),transparent);animation:shimmer 1.5s infinite}
@keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.empty{
  border:1px dashed var(--line2);border-radius:12px;padding:46px 22px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:13px;background:var(--panel2);
}
.empty h3{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600}
.empty p{color:var(--muted);font-size:13px;max-width:430px;line-height:1.6}
.err{border:1px solid rgba(242,85,90,.4);background:var(--bear-dim);border-radius:10px;padding:15px 17px;display:flex;align-items:center;gap:12px;font-size:13px}
.loading-line{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12.5px;font-family:'JetBrains Mono',monospace}

/* ---------- daily trade plan (inside newspaper) ---------- */
.tp-divider{display:flex;align-items:center;gap:12px;margin:30px 0 20px}
.tp-divider-line{flex:1;height:2px;background:var(--paper-ink)}
.tp-divider-label{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#A87B2E;white-space:nowrap}
.tp-checklist{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin-bottom:4px}
@media(max-width:640px){.tp-checklist{grid-template-columns:1fr}}
.tp-check-item{display:flex;align-items:flex-start;gap:7px;font-family:'Inter',sans-serif;font-size:12px;line-height:1.55;padding:4px 0;border-bottom:1px dotted var(--paper-line)}
.tp-check-item:last-child{border:none}
.tp-check-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#A87B2E;font-weight:700;flex:none;width:88px}
.tp-setups-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px}
@media(max-width:640px){.tp-setups-grid{grid-template-columns:1fr}}
.tp-setup-box{border-radius:6px;padding:10px 12px;font-size:12px;line-height:1.6}
.tp-setup-box.bull{background:rgba(30,122,79,.08);border:1px solid rgba(30,122,79,.3)}
.tp-setup-box.bear{background:rgba(184,80,63,.08);border:1px solid rgba(184,80,63,.3)}
.tp-setup-box h5{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 7px}
.tp-setup-box.bull h5{color:#1E7A4F}
.tp-setup-box.bear h5{color:#B8503F}
.tp-setup-row{display:flex;justify-content:space-between;border-bottom:1px dotted var(--paper-line);padding:2.5px 0}
.tp-setup-row:last-child{border:none}
.tp-setup-key{color:var(--paper-muted);font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.06em}
.tp-futures-table{width:100%;border-collapse:collapse;font-family:'JetBrains Mono',monospace;font-size:11px;margin-top:4px}
.tp-futures-table th{text-align:left;font-weight:600;color:var(--paper-muted);border-bottom:1px solid var(--paper-ink);padding:4px 6px;font-size:9.5px;letter-spacing:.09em;text-transform:uppercase}
.tp-futures-table td{padding:5px 6px;border-bottom:1px solid var(--paper-line);vertical-align:top}
.tp-internals-row{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:4px}
@media(max-width:640px){.tp-internals-row{grid-template-columns:1fr}}
.tp-internal-cell{border:1px solid var(--paper-line);border-radius:5px;padding:8px 10px}
.tp-internal-cell .label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#A87B2E;margin-bottom:4px}
.tp-internal-cell .val{font-size:12px;line-height:1.5}
.tp-confirm{border-left:3px solid #A87B2E;background:rgba(168,123,46,.07);border-radius:0 5px 5px 0;padding:9px 12px;font-family:'Inter',sans-serif;font-size:12px;line-height:1.6;margin-top:4px;color:var(--paper-muted)}

/* ---------- toasts ---------- */
.toasts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:9px;z-index:200}
.toast{
  display:flex;align-items:center;gap:10px;background:var(--panel3);border:1px solid var(--line2);
  border-radius:9px;padding:11px 15px;font-size:13px;box-shadow:0 10px 30px rgba(0,0,0,.5);
  animation:toastIn .25s cubic-bezier(.22,1,.36,1);max-width:340px;
}
@keyframes toastIn{from{transform:translateY(13px);opacity:0}to{transform:translateY(0);opacity:1}}
.toast.t-ok{border-color:rgba(61,214,140,.45)}
.toast.t-err{border-color:rgba(242,85,90,.45)}

.bd-foot{padding:15px 22px 22px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--faint);letter-spacing:.06em;line-height:1.8}

@media (max-width: 760px){
  .th-scorecard-row{grid-template-columns:1fr}
  .pillar-strip{grid-template-columns:1fr}
}

@media (prefers-reduced-motion: reduce){
  .bd-root *,.bd-root *::before,.bd-root *::after{animation-duration:.01ms !important;transition-duration:.01ms !important}
}

/* ========== CHARTS MOBILE SYMBOL STRIP ========== */
.chart-symbol-strip{
  display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;
  scrollbar-width:none;
}
.chart-symbol-strip::-webkit-scrollbar{display:none}
.chart-symbol-pill{
  flex-shrink:0;padding:6px 14px;border-radius:20px;
  background:var(--panel2);border:1px solid var(--line);
  color:var(--muted);font-size:12px;font-weight:600;letter-spacing:.04em;
  cursor:pointer;transition:all .15s;white-space:nowrap;
}
.chart-symbol-pill.on{
  background:var(--brass);border-color:var(--brass);color:#000;
}
.chart-symbol-pill.pinned:not(.on){
  border-color:var(--brass);color:var(--brass);
}

/* ========== COLLAPSIBLE HEADER ========== */
.collapsible-header{
  display:flex;align-items:center;gap:7px;
  width:100%;padding:11px 14px;
  background:none;border:none;border-bottom:1px solid var(--line);
  color:var(--text);font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
  cursor:pointer;text-align:left;
  transition:background .15s;
}
.collapsible-header:hover{background:rgba(255,255,255,.04)}
.collapsible-header .ic{opacity:.6;flex-shrink:0}

/* ========== CHART FULLSCREEN ========== */
.chart-fs-overlay{
  position:fixed;inset:0;z-index:9999;
  background:var(--ink);
  display:flex;flex-direction:column;
}
.chart-fs-header{
  display:flex;align-items:center;gap:10px;
  padding:10px 14px;border-bottom:1px solid var(--line);
  flex-shrink:0;
}
.chart-fs-title{
  font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  color:var(--text);flex:1;
}
.chart-fs-btn{
  background:none;border:none;cursor:pointer;
  color:var(--muted);padding:5px;border-radius:6px;
  display:flex;align-items:center;justify-content:center;
  transition:all .15s;
}
.chart-fs-btn:hover{background:rgba(255,255,255,.08);color:var(--text)}
.chart-fs-body{flex:1;overflow:hidden;position:relative;}
.chart-expand-btn{
  position:absolute;top:8px;right:8px;z-index:10;
  background:var(--panel2);border:1px solid var(--line);
  color:var(--muted);padding:5px;border-radius:6px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s;backdrop-filter:blur(4px);opacity:.85;
}
.chart-expand-btn:hover{opacity:1;color:var(--text);border-color:var(--brass)}

/* ========== LIGHT MODE ========== */
.bd-root.light{
  --ink:#F5F7FA; --panel:#FFFFFF; --panel2:#EFF2F7; --panel3:#E4E9F2;
  --line:#D2D9E6; --line2:#B8C4D4;
  --text:#0F1721; --muted:#506070; --faint:#8A96A8;
  --brass-dim:rgba(180,120,20,.14);
  --bull-dim:rgba(20,160,90,.12);
  --bear-dim:rgba(200,50,55,.12);
  --info-dim:rgba(50,130,210,.12);
  background-image:radial-gradient(rgba(0,30,60,.06) 1px, transparent 1px);
}
.bd-root.light .bd-header{
  background:linear-gradient(180deg,#FFFFFF 0%,#F5F7FA 100%);
}
.bd-root.light .bd-mark{
  background:linear-gradient(135deg,#DDE4EF,#C8D2E4);
}
.bd-root.light .bd-flow{background:var(--panel)}
.bd-root.light .card{
  background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.6) 38%),var(--panel);
}
.bd-root.light .internals-hero{
  background:radial-gradient(120% 130% at 0% 0%,rgba(232,180,90,.08),transparent 55%),linear-gradient(135deg,rgba(90,167,232,.04),transparent),var(--panel2);
}
.bd-root.light .calendar-summary-tile,
.bd-root.light .internals-scorecard{background:var(--panel3)}
.bd-root.light .internals-section{background:var(--panel2)}
.bd-root.light .th-hero{
  background:radial-gradient(120% 150% at 50% -20%,rgba(232,180,90,.06),transparent 55%),var(--panel);
}
.bd-root.light .spectrum-caret{background:var(--text);box-shadow:0 0 10px rgba(0,0,0,.35)}
.bd-root.light .vol-marker{background:var(--text);box-shadow:0 0 12px rgba(0,0,0,.25)}
.bd-root.light input[type=range].bd-range::-webkit-slider-thumb{border-color:#F5F7FA}
.bd-root.light input[type=range].bd-range::-moz-range-thumb{border-color:#F5F7FA}
.bd-root.light .overlay{background:rgba(80,100,130,.5)}
.bd-root.light .drawer{background:var(--panel);border-left-color:var(--line2)}
.bd-root.light .toast{background:var(--panel);box-shadow:0 10px 30px rgba(0,0,0,.15)}
.bd-root.light .btn{background:var(--panel3);border-color:var(--line2)}
.bd-root.light .btn:hover{background:var(--panel2);border-color:var(--line)}
.bd-root.light .btn-ghost{background:transparent;border-color:transparent}
.bd-root.light .btn-ghost:hover{background:var(--panel3);border-color:transparent}
.bd-root.light .bd-session{background:var(--panel2);border-color:var(--line2)}
.bd-root.light .skel{background:var(--panel3)}
.bd-root.light .skel::after{background:linear-gradient(90deg,transparent,rgba(180,140,60,.1),transparent)}
`;


/* ================================================================
   PRIMITIVES
   ================================================================ */

const Card = ({ icon: Ic, title, sub, tools, children, className = "", style }) => (
  <div className={`card ${className}`} style={style}>
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
  const stale = Date.now() - at.ts > 30 * 60 * 1000;
  return <span className={`freshness ${stale ? "stale" : ""}`}>{stale ? "STALE · " : ""}{at.label}</span>;
};

const RefreshBtn = ({ onClick, loading, label = "Refresh" }) => (
  <button className="btn btn-ghost btn-sm" onClick={onClick} disabled={loading} title={label}>
    <RefreshCw size={13} className={loading ? "spin" : ""} />
  </button>
);

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
            <text key={tick} x={tx} y={ty} fontSize="8.5" fill="#55637A" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
              {tick}
            </text>
          );
        })}
        <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: "110px 106px", transition: "transform 1s cubic-bezier(.22,1,.36,1)" }}>
          <line x1="110" y1="106" x2="38" y2="106" stroke="#E8EDF2" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="110" cy="106" r="5.5" fill="#E8EDF2" />
        <text x="110" y="88" textAnchor="middle" fontSize="24" fontWeight="700" fill={zone ? zone.c : "#7E8CA0"} fontFamily="JetBrains Mono, monospace">
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
            top: 4,
            width: 3,
            height: 24,
            borderRadius: 3,
            background: "#E8EDF2",
            boxShadow: `0 0 14px ${color}99`,
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
    <div className="pips" title={`Conviction ${n}/10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="pip" style={i < n ? { background: color, borderColor: color, boxShadow: `0 0 7px ${color}66` } : {}} />
      ))}
      <span className="mono" style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{n}/10</span>
    </div>
  );
};

const SectorHeatmap = ({ sectors }) => {
  const sorted = [...(sectors || [])].filter((s) => s && s.changePct != null).sort((a, b) => b.changePct - a.changePct);
  if (!sorted.length) return <div style={{ color: C.muted, fontSize: 12 }}>No sector data in last sync.</div>;
  const maxAbs = Math.max(0.4, ...sorted.map((s) => Math.abs(s.changePct)));
  return (
    <div className="hm">
      {sorted.map((s) => {
        const a = clamp(Math.abs(s.changePct) / maxAbs, 0.12, 1);
        const bg = s.changePct >= 0 ? `rgba(61,214,140,${0.07 + a * 0.3})` : `rgba(242,85,90,${0.07 + a * 0.3})`;
        const bc = s.changePct >= 0 ? `rgba(61,214,140,${0.25 + a * 0.45})` : `rgba(242,85,90,${0.25 + a * 0.45})`;
        return (
          <div key={s.name} className="hm-tile" style={{ background: bg, borderColor: bc }} title={`${s.name}: ${fmtSigned(s.changePct, 2, "%")}`}>
            <div className="hm-name">{s.name}</div>
            <div className="hm-val" style={{ color: chgColor(s.changePct) }}>{fmtSigned(s.changePct, 2, "%")}</div>
          </div>
        );
      })}
    </div>
  );
};

const DayCandle = ({ low, high, price, dayOpen, previousClose }) => {
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
          <span className="candle-axis-num">{fmtNum(high, 0)}</span>
        </span>
        <span className="candle-axis-line candle-axis-lo">
          <span className="candle-axis-tag">L</span>
          <span className="candle-axis-num">{fmtNum(low, 0)}</span>
        </span>
      </div>
      <div className="candle-rail" style={{ height: `${trackHeight}px` }}>
        <div className="candle-wick" style={{ top: `${railPad}px`, height: `${wickHeight}px` }} />
        <div className={`candle-body ${toneClass}`} style={{ top: `${bodyTop}px`, height: `${bodyHeight}px` }} />
      </div>
    </div>
  );
};

const buildSessionRead = ({ market, points, news, recap }) => {
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
    ? `${nextEventItem.event}${nextEventItem.time ? ` · ${nextEventItem.time}` : ""}`
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
  return {
    summary,
    cards,
    note,
    recapHeadline: recap?.headline || "",
    recapText: recap?.recap || "",
    recapTakeaways: Array.isArray(recap?.takeaways) ? recap.takeaways.filter(Boolean).slice(0, 3) : [],
    recapRisk: recap?.risk || "",
  };
};

const ETF_INSTRUMENTS = new Set(["SPY", "QQQ", "DIA"]);

const LevelsLadder = ({ spx, label = "SPX", decimals }) => {
  const dec = decimals != null ? decimals : (ETF_INSTRUMENTS.has(label) ? 2 : 0);
  if (!spx || spx.spot == null) return <div style={{ color: C.muted, fontSize: 12 }}>No {label} levels in last sync.</div>;
  const rows = [
    ...(spx.resistances || []).map((v, i) => ({ v, type: "res", label: `R${i + 1}` })),
    ...(spx.pivot != null ? [{ v: spx.pivot, type: "piv", label: "PIVOT" }] : []),
    ...(spx.supports || []).map((v, i) => ({ v, type: "sup", label: `S${i + 1}` })),
  ].filter((r) => typeof r.v === "number" && !isNaN(r.v));
  const all = [...rows.map((r) => r.v), spx.spot];
  const min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.1 || 10;
  const H = 252, W = 330;
  const y = (v) => 14 + ((max + pad - v) / (max - min + 2 * pad)) * (H - 28);
  const colorOf = (t) => (t === "res" ? C.bear : t === "sup" ? C.bull : C.brass);
  const spotRectW = dec > 0 ? 102 : 86;
  const spotCenterX = 80 + spotRectW / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <line x1="74" y1="8" x2="74" y2={H - 8} stroke="#1E2935" strokeWidth="1" />
      {rows.map((r, i) => (
        <g key={i}>
          <line x1="74" y1={y(r.v)} x2={W - 12} y2={y(r.v)} stroke={colorOf(r.type)} strokeWidth={r.type === "piv" ? 1.6 : 1.2} strokeDasharray={r.type === "piv" ? "" : "5 4"} opacity="0.75" />
          <text x="66" y={y(r.v) + 3.5} textAnchor="end" fontSize="10" fill={colorOf(r.type)} fontFamily="JetBrains Mono, monospace" fontWeight="600">
            {r.label}
          </text>
          <text x={W - 12} y={y(r.v) - 4} textAnchor="end" fontSize="10.5" fill={colorOf(r.type)} fontFamily="JetBrains Mono, monospace">
            {fmtNum(r.v, dec)}
          </text>
        </g>
      ))}
      <g>
        <line x1="74" y1={y(spx.spot)} x2={W - 12} y2={y(spx.spot)} stroke="#E8EDF2" strokeWidth="2" />
        <circle cx="74" cy={y(spx.spot)} r="4.5" fill="#E8EDF2">
          <animate attributeName="r" values="4;5.5;4" dur="2s" repeatCount="indefinite" />
        </circle>
        <rect x="80" y={y(spx.spot) - 19} rx="4" width={spotRectW} height="17" fill="#E8EDF2" />
        <text x={spotCenterX} y={y(spx.spot) - 6.5} textAnchor="middle" fontSize="10.5" fill="#0B0F14" fontWeight="700" fontFamily="JetBrains Mono, monospace">
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
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#1E2935" strokeWidth="16" />
          {(data.length ? data : [{ value: 1, c: "#1E2935" }]).map((d, i) => {
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

const FactorRadarChart = ({ weights }) => {
  const data = FACTORS.map((f) => ({ k: f.label.split(" ")[0], v: weights[f.key] }));
  const cx = 150;
  const cy = 100;
  const outer = 66;
  const point = (index, value = 100) => {
    const angle = (-90 + index * (360 / data.length)) * Math.PI / 180;
    const r = outer * (value / 100);
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };
  const polygon = (value) => data.map((_, i) => point(i, value).join(",")).join(" ");
  const valuePolygon = data.map((d, i) => point(i, d.v).join(",")).join(" ");
  return (
    <div style={{ width: "100%", height: 205 }}>
      <svg viewBox="0 0 300 205" style={{ width: "100%", height: "100%", display: "block" }}>
        {[25, 50, 75, 100].map((v) => (
          <polygon key={v} points={polygon(v)} fill="none" stroke="#243140" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const [x1, y1] = point(i, 0);
          const [x2, y2] = point(i, 100);
          const [lx, ly] = point(i, 128);
          return (
            <g key={d.k}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#243140" strokeWidth="1" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#7E8CA0" fontSize="10" fontFamily="JetBrains Mono, monospace">
                {d.k}
              </text>
            </g>
          );
        })}
        <polygon points={valuePolygon} fill="rgba(232,180,90,.24)" stroke="#E8B45A" strokeWidth="2" />
        {data.map((d, i) => {
          const [x, y] = point(i, d.v);
          return <circle key={d.k} cx={x} cy={y} r="3" fill="#E8B45A" />;
        })}
      </svg>
    </div>
  );
};

const LEVEL_MAP_GROUPS = [
  { keys: ["SPY", "SPX", "ES"], subs: { SPY: "S&P 500 ETF", SPX: "S&P 500 Index", ES: "E-mini S&P Futures" } },
  { keys: ["QQQ", "NDX", "NQ"], subs: { QQQ: "Nasdaq 100 ETF", NDX: "Nasdaq 100 Index", NQ: "E-mini Nasdaq Futures" } },
  { keys: ["DIA", "DJI", "YM"], subs: { DIA: "Dow Jones ETF", DJI: "Dow Jones Index", YM: "E-mini Dow Futures" } },
];

const LevelMapCard = ({ group, points }) => {
  const [active, setActive] = useState(group.keys[0]);
  const dataKey = active.toLowerCase();
  const data = points?.[dataKey];
  return (
    <Card icon={Crosshair} title={`${active} level map`} sub={group.subs[active]}>
      <div className="seg" style={{ marginBottom: 10 }}>
        {group.keys.map((k) => (
          <button key={k} className={active === k ? "on" : ""} onClick={() => setActive(k)}>{k}</button>
        ))}
      </div>
      <LevelsLadder spx={data} label={active} />
    </Card>
  );
};

/* ================================================================
   TAB — MARKET PULSE
   ================================================================ */

const PulseTab = ({ market, points, pointsState, news, recap, vixHint, onRefresh, onGoThesis }) => {
  const { status, data, error, at } = market;
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

  const tickers = data?.tickers || [];
  const orderedTickers = orderAssetCards(tickers);
  const vix = tickers.find((t) => t.symbol === "VIX");
  const recapBusy = recap?.status === "loading";
  const session = buildSessionRead({ market: data, points, news, recap: recap?.data });
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [tickersOpen, setTickersOpen] = useState(() => !isMobile);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card
        icon={Activity}
        title="Session read"
        sub="Plain-English market brief"
        tools={<><Freshness at={at} /><RefreshBtn onClick={onRefresh} loading={status === "loading" || recapBusy} label="Refresh full desk" /></>}
      >
        <div className="session-summary">{session.summary}</div>
        <div className="session-meta">{data?.asOf ? `quotes ${data.asOf}` : "quotes pending"} · auto-refresh every 2m while Pulse is open</div>
        {(session.recapText || recap?.status === "loading") && (
          <div className="session-recap">
            <div className="session-recap-head">
              <span className="session-recap-kicker">Market recap</span>
              {recap?.status === "loading" && !recap?.data
                ? <span className="session-recap-state">refreshing</span>
                : session.recapHeadline
                  ? <span className="session-recap-state">{session.recapHeadline}</span>
                  : null}
            </div>
            <div className="session-recap-copy">{session.recapText || "Building the recap…"}</div>
            {session.recapTakeaways.length > 0 && (
              <>
                <div className="session-recap-subhead">Watch next</div>
                <div className="session-recap-points">
                  {session.recapTakeaways.map((item, idx) => (
                    <span className="session-recap-pill" key={`${idx}-${item}`}>{item}</span>
                  ))}
                </div>
              </>
            )}
            {session.recapRisk && <div className="session-recap-risk">Keep in mind: {session.recapRisk}</div>}
          </div>
        )}
        <div className="session-grid">
          {session.cards.map((item) => (
            <div className="session-stat" key={item.key}>
              <div className="session-stat-key">{item.key}</div>
              <div className="session-stat-val">{item.value}</div>
              <div className="session-stat-note">{item.note}</div>
            </div>
          ))}
        </div>
        {session.note && !session.recapText && <div className="session-note">{session.note}</div>}
      </Card>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button
          className="collapsible-header"
          onClick={() => setTickersOpen((o) => !o)}
          aria-expanded={tickersOpen}
        >
          <Activity size={14} className="ic" />
          <span>Market snapshot</span>
          <small style={{ marginLeft: 6, fontWeight: 400, opacity: 0.6 }}>{orderedTickers.length} instruments</small>
          <span style={{ marginLeft: "auto" }}>
            {tickersOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>
        {tickersOpen && (
          <div className="grid g-pulse" style={{ padding: "0 12px 12px" }}>
            {orderedTickers.map((t) => (
              <div className="card tk" key={t.symbol} style={t._stale ? { opacity: 0.5 } : undefined}>
                <div className="tk-glow" style={{ background: `linear-gradient(90deg,transparent,${chgColor(t.changePct)},transparent)`, opacity: 0.55 }} />
                <div className="tk-top">
                  <span className="tk-sym">{t.symbol}</span>
                  {t._stale
                    ? <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: ".06em" }}>NO DATA</span>
                    : t.changePct != null && (t.changePct >= 0 ? <TrendingUp size={14} color={C.bull} /> : <TrendingDown size={14} color={C.bear} />)}
                </div>
                <div className="tk-body">
                  <div className="tk-left">
                    <div className="tk-name">{t.name}</div>
                    <div className="tk-price">{t._stale ? "—" : fmtNum(t.price, t.symbol === "US10Y" ? 3 : 2)}</div>
                    <div className="tk-chg">
                      <span style={{ color: chgColor(t.change) }}>{t._stale ? "—" : fmtSigned(t.change)}</span>
                      <span style={{ color: chgColor(t.changePct) }}>{t._stale ? "—" : fmtSigned(t.changePct, 2, "%")}</span>
                    </div>
                  </div>
                  {!t._stale && <DayCandle low={t.dayLow} high={t.dayHigh} price={t.price} dayOpen={t.dayOpen} previousClose={t.previousClose} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid g-data" style={{ alignItems: "start" }}>
        {LEVEL_MAP_GROUPS.map((g) => (
          <LevelMapCard key={g.keys[0]} group={g} points={points} />
        ))}
      </div>
      <div className="grid g-market-read">
        <Card icon={Activity} title="Sector tape" sub="Today's GICS sector performance, sorted">
          <SectorHeatmap sectors={data?.sectors} />
        </Card>
        <Card icon={Shield} title="Volatility regime" sub="VIX zone + structure">
          <VixGauge value={vix?.price ?? null} structure={vixHint} />
        </Card>
        <Card icon={Sparkles} title="Fear & Greed Index" sub="CNN market sentiment">
          <FearGreedGauge data={data?.fearGreed} />
        </Card>
      </div>
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

const NewsTab = ({ news, onRefresh, onAddNote }) => {
  const { status, data, error, at } = news;
  const [cat, setCat] = useState("all");
  const [tone, setTone] = useState("all");

  if (status === "idle")
    return (
      <EmptyState
        icon={Newspaper}
        title="No headlines pulled yet"
        body="Scan the last 18 hours of market-moving news — tagged by category, sentiment and SPX impact."
        action={<button className="btn btn-brass" onClick={onRefresh}><Newspaper size={15} /> Scan the wire</button>}
      />
    );
  if (status === "loading" && !data)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        <LoadingBlock lines={1} msg="Scanning the last 18 hours of headlines…" />
        {Array.from({ length: 5 }).map((_, i) => <div className="card" key={i}><LoadingBlock lines={2} /></div>)}
      </div>
    );
  if (status === "error" && !data) return <ErrBlock msg={error} onRetry={onRefresh} />;

  const heads = data?.headlines || [];
  const cats = ["all", ...Array.from(new Set(heads.map((h) => h.category).filter(Boolean)))];
  const shown = heads.filter((h) =>
    (cat === "all" || h.category === cat) &&
    (tone === "all" || h.sentiment === tone)
  );
  const catalysts = data?.catalysts || [];
  const maxCatImpact = Math.max(1, ...catalysts.map((c) => c.maxImpact || 0));

  return (
    <div className="grid g-2" style={{ alignItems: "start" }}>
      <div>
        <div className="intel-brief">
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="chip b-brass">WIRE BRIEF</span>
            <span className="mono" style={{ color: C.faint || C.muted, fontSize: 10 }}>{data?.lastUpdated || at?.label || "latest"}</span>
            <span className="mono" style={{ color: C.faint || C.muted, fontSize: 10, marginLeft: "auto" }}>{data?.sourceCount ? `${data.sourceCount} raw items screened` : `${heads.length} headlines`}</span>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.map((h, i) => (
            <div className="news-card" key={i} style={{ borderLeftColor: sentColor(h.sentiment) }}>
              <div className="news-top">
                {h.rank && <span className="chip b-info">#{h.rank}</span>}
                <span className={`chip ${CAT_TONE[h.category] || ""}`}>{h.category}</span>
                <span className="chip" style={{ color: sentColor(h.sentiment), borderColor: sentColor(h.sentiment) + "66" }}>{h.sentiment}</span>
                <ImpactBars n={h.impact} />
                <span className="news-meta">{h.source}{h.timeAgo ? ` · ${h.timeAgo}` : ""}</span>
              </div>
              <div className="news-title">
                {h.url ? <a href={h.url} target="_blank" rel="noreferrer">{h.title}</a> : h.title}
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
          {!shown.length && <div style={{ color: C.muted, fontSize: 13, padding: 16 }}>Nothing matches those filters.</div>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 86 }}>
        <Card icon={Sparkles} title="Wire sentiment" sub="Net tone across pulled headlines" tools={<><Freshness at={at} /><RefreshBtn onClick={onRefresh} loading={status === "loading"} /></>}>
          <SentimentDonut headlines={heads} />
          {data?.mood && (
            <div style={{ marginTop: 13, paddingTop: 13, borderTop: "1px dashed var(--line)", fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
              <span className="chip b-brass" style={{ marginRight: 8 }}>MOOD</span>{data.mood}
            </div>
          )}
        </Card>
        <Card icon={Crosshair} title="Catalyst stack" sub="Category weight + tone">
          {catalysts.length ? catalysts.map((c) => (
            <div className="cat-row" key={c.category}>
              <span className={`chip ${CAT_TONE[c.category] || ""}`} style={{ width: 92, textAlign: "center" }}>{c.category}</span>
              <div className="cat-meter" title={`Impact ${c.maxImpact}/5 · ${c.count} headline${c.count === 1 ? "" : "s"}`}>
                <div className="cat-fill" style={{ width: `${clamp(((c.maxImpact || 0) / maxCatImpact) * 100, 8, 100)}%`, background: sentColor(c.sentiment) }} />
              </div>
              <span className="mono" style={{ fontSize: 10, color: sentColor(c.sentiment), minWidth: 58, textAlign: "right" }}>{c.count} · {c.sentiment}</span>
            </div>
          )) : <div style={{ color: C.muted, fontSize: 12 }}>No catalyst stack in last sync.</div>}
        </Card>
        <Card icon={AlertTriangle} title="Desk watchlist" sub="What can move the next candle">
          {(data?.watchlist || []).length ? (
            <div className="watch-list">
              {(data.watchlist || []).slice(0, 5).map((item, i) => <div className="watch-item" key={i}>{item}</div>)}
            </div>
          ) : (
            <div style={{ color: C.muted, fontSize: 12 }}>No high-priority watch items in this sync.</div>
          )}
        </Card>
        <Card icon={FileText} title="How to read this" sub="Desk convention">
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            Impact bars score potential index movement — 4–5 bars can move SPX, NDX, or DJI more than half a percent. Tags show the most relevant instruments; hit <b style={{ color: "var(--text)" }}>note</b> to pin a headline into thesis inputs.
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ================================================================
   TAB — DATA POINTS
   ================================================================ */

const calendarEventGroups = (data) => {
  const groups = data?.calendarGroups || { today: data?.calendar || [], tomorrow: [], upcoming: [] };
  return {
    today: topCalendarEvents(groups.today || [], 5),
    tomorrow: topCalendarEvents(groups.tomorrow || [], 5),
    upcoming: topCalendarEvents(groups.upcoming || [], 5),
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

const CalendarGroup = ({ label, items = [], empty, mode = "time" }) => (
  <div className="cal-group">
    <div className="cal-group-title">
      <b>{label}</b>
      <span>{items.length} event{items.length === 1 ? "" : "s"}</span>
    </div>
    {items.length ? items.map((c, i) => (
      <div className="cal-row" key={`${label}-${i}`}>
        <span className="cal-time">{mode === "date" ? (calendarDateLabel(c.date) || c.time || "Date pending") : c.time}</span>
        <span className="cal-ev">
          {c.event}
          {(c.period || c.source) && <div className="cal-meta">{[c.period, c.source].filter(Boolean).join(" · ")}</div>}
        </span>
        <span className="cal-imp" style={{ background: calendarImpactColor(c.importance), boxShadow: c.importance === "high" ? `0 0 7px ${C.bear}99` : "none" }} title={c.importance} />
      </div>
    )) : (
      <div style={{ color: C.muted, fontSize: 12.5 }}>{empty}</div>
    )}
  </div>
);

const CalendarTab = ({ points, onRefresh }) => {
  const { status, data, error, at } = points;
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
        <Freshness at={at} />
        <RefreshBtn onClick={onRefresh} loading={status === "loading"} />
      </div>
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
      <div className="calendar-grid">
        <Card icon={CalendarDays} title="Today" sub={`${groups.today?.length || 0} event${groups.today?.length === 1 ? "" : "s"} on deck`}>
          <CalendarGroup label="Today" items={groups.today || []} empty="No U.S. releases found for today." />
        </Card>
        <Card icon={CalendarDays} title="Tomorrow" sub={`${groups.tomorrow?.length || 0} event${groups.tomorrow?.length === 1 ? "" : "s"} queued`}>
          <CalendarGroup label="Tomorrow" items={groups.tomorrow || []} empty="No U.S. releases found for tomorrow." />
        </Card>
        <Card icon={AlertTriangle} title="Major Upcoming" sub={`${groups.upcoming?.length || 0} major event${groups.upcoming?.length === 1 ? "" : "s"} this week${data?.calendarSource ? ` · ${data.calendarSource}` : ""}`}>
          <CalendarGroup label="Major Upcoming" items={groups.upcoming || []} empty="No additional major market releases found this week." mode="date" />
        </Card>
      </div>
      {!total && (
        <div style={{ color: C.muted, fontSize: 12.5, textAlign: "center" }}>
          No calendar events came back in the latest sync. The data service may be quiet or temporarily unavailable.
        </div>
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
    { key: "up", label: "Up", color: "rgba(61,214,140,.58)", value: distribution.up || 0 },
    { key: "flat", label: "Flat", color: C.brass, value: distribution.flat || 0 },
    { key: "down", label: "Down", color: "rgba(242,85,90,.58)", value: distribution.down || 0 },
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
          <span>Trend score</span>
          <b style={{ color: scoreTone(trend.score) }}>{fmtSigned(trend.score, 0)}</b>
        </div>
      </div>

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
        <RefreshBtn onClick={onRefresh} loading={status === "loading"} />
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
   TAB — THESIS LAB
   ================================================================ */

const ThesisTab = ({ instrument, setInstrument, weights, setWeights, lean, setLean, risk, setRisk, notes, setNotes, thesis, onGenerate, history, viewing, setViewing, onDeleteHist, anyData, onGoNewsletter }) => {
  const t = viewing || thesis.data;
  const biasColor = t?.bias === "bullish" ? C.bull : t?.bias === "bearish" ? C.bear : C.brass;
  const activeInstrument = thesisInstrumentConfig(instrument);

  return (
    <div className="grid g-thesis" style={{ alignItems: "start" }}>
      {/* controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card icon={FlaskConical} title="Pillar weights" sub="How much each input drives the call">
          {FACTORS.map((f) => (
            <div className="slider-row" key={f.key}>
              <div className="slider-head">
                <span className="slider-name">{f.label}<span className="slider-hint">{f.hint}</span></span>
                <span className="slider-val">{weights[f.key]}</span>
              </div>
              <input
                type="range" min="0" max="100" value={weights[f.key]} className="bd-range"
                style={{ "--pct": `${weights[f.key]}%` }}
                onChange={(e) => setWeights({ ...weights, [f.key]: Number(e.target.value) })}
              />
            </div>
          ))}
          <FactorRadarChart weights={weights} />
        </Card>
        <Card icon={NotebookPen} title="Instrument focus" sub="Choose which index the thesis and note are built for">
          <div className="seg">
            {THESIS_INSTRUMENTS.map((item) => (
              <button key={item.symbol} className={instrument === item.symbol ? "on" : ""} onClick={() => setInstrument(item.symbol)}>
                {item.symbol}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, color: C.muted }}>
            Primary build target: <span style={{ color: "var(--text)" }}>{activeInstrument.name}</span>
            {activeInstrument.futures !== activeInstrument.symbol && <> with {activeInstrument.futures} as the live execution proxy</>}.
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
          <div className="lab-field">
            <span className="lab-label">Risk appetite</span>
            <div className="seg">
              {["defensive", "balanced", "aggressive"].map((r) => (
                <button key={r} className={risk === r ? "on" : ""} onClick={() => setRisk(r)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="lab-field">
            <span className="lab-label">Desk notes — fed into the synthesis</span>
            <textarea className="bd-ta" placeholder="e.g. TD Sequential 9 printed on the daily. Respecting 2-hr max hold today." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn btn-brass" style={{ width: "100%", justifyContent: "center", marginTop: 15, padding: "12px" }} onClick={onGenerate} disabled={thesis.status === "loading" || !anyData} title={!anyData ? "Sync data first" : ""}>
            {thesis.status === "loading" ? <><RefreshCw size={15} className="spin" /> Synthesizing…</> : <><Sparkles size={15} /> Generate today's thesis</>}
          </button>
          {!anyData && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 9, textAlign: "center" }}>Sync at least one data module first — the desk won't call a bias blind.</div>}
        </Card>
      </div>

      {/* output */}
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
        {!t && thesis.status === "idle" && (
          <EmptyState
            icon={FlaskConical}
            title="No thesis on the tape yet"
            body="Set your pillar weights and stance on the left, then run the synthesis. The desk will weigh live prices, headlines and internals into one directional call — with invalidation and stand-aside conditions attached."
          />
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
                  <span className="chip" style={{ color: biasColor, borderColor: biasColor + "66" }}>SCORE {fmtSigned(t.score, 0)}</span>
                  <ConvictionPips n={t.conviction || 0} bias={t.bias} />
                </div>
              </div>
              <BiasSpectrum score={t.score} />
              <div className="th-summary">{t.summary}</div>
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
                      {(t.weightedPillars || []).map((pillar) => (
                        <div className="pillar-chip" key={pillar.key || pillar.label}>
                          <b>{pillar.label || pillar.key}</b>
                          <span>Score {fmtSigned(pillar.score, 0)} · Weight {pillar.weight}% · Impact {fmtSigned(pillar.contribution, 1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(t.drivers || []).length > 0 && (
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 14 }}>
                  {t.drivers.map((d, i) => <span className="chip b-brass" key={i} style={{ textTransform: "none", letterSpacing: 0, fontSize: 10.5 }}>{d}</span>)}
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
            <div className="grid g-2">
              <div className="guard g-red"><b><AlertTriangle size={12} /> Thesis invalidation</b>{t.invalidation}</div>
              <div className="guard g-amber"><b><Shield size={12} /> Stand-aside conditions</b>{t.standAside}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => downloadPDF(buildThesisPrintHTML(t), `overwatch-thesis-${t._date || t.instrument || "today"}.pdf`)} title="Download thesis as PDF">
                <FileText size={14} /> Download PDF
              </button>
              {!viewing && thesis.data && (
                <button className="btn" onClick={onGoNewsletter}>Publish the morning note <ArrowRight size={14} /></button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

/* ================================================================
   TAB — NEWSLETTER
   ================================================================ */

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

const PAPER_BIAS = { bullish: "#1E7A4F", bearish: "#B8503F", neutral: "#A87B2E" };

/* ================================================================
   DAILY TRADE PLAN SECTION — rendered inside the newsletter paper
   ================================================================ */

const TradePlanSection = ({ plan }) => {
  if (!plan) return null;
  const biasC = plan.bias === "bullish" ? "#1E7A4F" : plan.bias === "bearish" ? "#B8503F" : "#A87B2E";

  return (
    <>
      <div className="tp-divider">
        <div className="tp-divider-line" />
        <div className="tp-divider-label">Daily Trade Plan — {plan.etfLabel || "SPY"}</div>
        <div className="tp-divider-line" />
      </div>

      {/* Bias Meter */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: biasC }}>
          ■ Bias: {plan.biasLabel}
        </span>
        {plan.internals?.vixPrice && (
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: "var(--paper-muted)" }}>
            VIX {plan.internals.vixPrice} · {plan.internals.vixRead}
          </span>
        )}
      </div>

      {/* Macro Risk Note */}
      {plan.macroRisk && (
        <div style={{ border: "1.5px solid rgba(168,123,46,.35)", borderLeft: "3px solid #A87B2E", borderRadius: "0 5px 5px 0", background: "rgba(168,123,46,.07)", padding: "9px 13px", marginBottom: 16, fontSize: 12.5, lineHeight: 1.6, color: "var(--paper-muted)" }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "#A87B2E", fontWeight: 700 }}>■■ Macro Risk Note: </span>
          {plan.macroRisk}
        </div>
      )}

      {/* Pre-Market Checklist */}
      <div className="np-sec">Pre-Market Checklist</div>
      <div className="tp-checklist">
        {plan.checklist && Object.entries({
          "Overnight": plan.checklist.overnightConditions,
          "Key Levels": plan.checklist.keyLevels,
          "Events": plan.checklist.economicEvents,
          "Game Plan": plan.checklist.gamePlan,
          "Risk Mgmt": plan.checklist.riskManagement,
        }).filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="tp-check-item">
            <span className="tp-check-label">{k}</span>
            <span style={{ fontSize: 11.5, lineHeight: 1.55 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Key S/R */}
      {(plan.levels?.spyResistance?.length || plan.levels?.spySupport?.length) ? (
        <>
          <div className="np-sec">Key Support & Resistance — {plan.etfLabel || "SPY"}</div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
            {plan.levels.spyResistance?.length > 0 && (
              <div>
                <span style={{ color: "#B8503F", fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>Resistance: </span>
                {plan.levels.spyResistance.join(" · ")}
              </div>
            )}
            {plan.levels.spySupport?.length > 0 && (
              <div>
                <span style={{ color: "#1E7A4F", fontWeight: 700, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase" }}>Support: </span>
                {plan.levels.spySupport.join(" · ")}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Bullish / Bearish Setups */}
      <div className="np-sec">Trade Setups</div>
      <div className="tp-setups-grid">
        <div className="tp-setup-box bull">
          <h5>Bullish Setups</h5>
          {(plan.bullishSetups || []).map((s, i) => (
            <div key={i} style={{ marginBottom: i < plan.bullishSetups.length - 1 ? 8 : 0 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 10.5, color: "#1E7A4F", marginBottom: 3 }}>{i + 1}. {s.label}</div>
              <div className="tp-setup-row"><span className="tp-setup-key">Entry</span><span>{s.entry}</span></div>
              <div className="tp-setup-row"><span className="tp-setup-key">Target</span><span>{s.target}</span></div>
              <div className="tp-setup-row"><span className="tp-setup-key">Stop</span><span>{s.stop}</span></div>
              {s.options && <div className="tp-setup-row"><span className="tp-setup-key">Options</span><span style={{ fontSize: 10.5 }}>{s.options}</span></div>}
            </div>
          ))}
        </div>
        <div className="tp-setup-box bear">
          <h5>Bearish Setups</h5>
          {(plan.bearishSetups || []).map((s, i) => (
            <div key={i} style={{ marginBottom: i < plan.bearishSetups.length - 1 ? 8 : 0 }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 10.5, color: "#B8503F", marginBottom: 3 }}>{i + 1}. {s.label}</div>
              <div className="tp-setup-row"><span className="tp-setup-key">Entry</span><span>{s.entry}</span></div>
              <div className="tp-setup-row"><span className="tp-setup-key">Target</span><span>{s.target}</span></div>
              <div className="tp-setup-row"><span className="tp-setup-key">Stop</span><span>{s.stop}</span></div>
              {s.options && <div className="tp-setup-row"><span className="tp-setup-key">Options</span><span style={{ fontSize: 10.5 }}>{s.options}</span></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Macro Futures Bias */}
      <div className="np-sec">Macro Futures Bias</div>
      <table className="tp-futures-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Chg %</th>
            <th>Read</th>
          </tr>
        </thead>
        <tbody>
          {(plan.futuresBias || []).map((row) => (
            <tr key={row.symbol}>
              <td style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{row.symbol}</td>
              <td style={{ color: row.changePct == null ? C.muted : row.changePct >= 0 ? "#1E7A4F" : "#B8503F", fontWeight: 600 }}>
                {row.changePct != null ? (row.changePct >= 0 ? "+" : "") + row.changePct + "%" : "—"}
                {row.price != null ? ` (${row.price})` : ""}
              </td>
              <td style={{ color: "var(--paper-muted)", fontSize: 10.5 }}>{row.read}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Market Internals */}
      <div className="np-sec">Market Internals</div>
      <div className="tp-internals-row">
        <div className="tp-internal-cell">
          <div className="label">VIX Outlook</div>
          <div className="val">{plan.internals?.vixPrice ? `VIX ${plan.internals.vixPrice}` : "—"}<br /><span style={{ fontSize: 10.5, color: "var(--paper-muted)" }}>{plan.internals?.vixRead || "—"}</span></div>
        </div>
        <div className="tp-internal-cell">
          <div className="label">Top Gamma / Pivot</div>
          <div className="val" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{plan.internals?.gammaStrikes || "—"}</div>
        </div>
        <div className="tp-internal-cell">
          <div className="label">Pre-Market Gap Map</div>
          <div className="val" style={{ fontSize: 11 }}>
            <span style={{ color: "#1E7A4F", fontWeight: 600 }}>Leaders:</span> {plan.internals?.leaders || "—"}<br />
            <span style={{ color: "#B8503F", fontWeight: 600 }}>Laggards:</span> {plan.internals?.laggards || "—"}
          </div>
        </div>
      </div>

      {/* Economic Calendar */}
      {plan.calendarHighlights?.length > 0 && (
        <>
          <div className="np-sec">Economic Calendar Highlights</div>
          <ul className="np-watch">
            {plan.calendarHighlights.map((c, i) => (
              <li key={i}>
                <span className="mono" style={{ fontSize: 11, color: c.importance === "high" ? "#B8503F" : "#A87B2E", fontWeight: 600 }}>{c.time}</span>
                {" — "}{c.event}{" "}
                <span style={{ fontSize: 10, color: "var(--paper-muted)" }}>({c.importance})</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Confirmation Rule */}
      {plan.confirmationRule && (
        <>
          <div className="np-sec">Notes & Risk Management</div>
          <div className="tp-confirm">{plan.confirmationRule}</div>
        </>
      )}
    </>
  );
};

const buildMarkdown = ({ d, thesis, market, points, edition }) => {
  const lines = [];
  const stanceRead = d.stanceRead || thesis.stanceRead;
  const pillarRead = d.pillarRead || thesis.pillarRead;
  lines.push(`# OVERWATCH DAILY BIAS — No. ${edition}`);
  lines.push(`**${d._date || dateShort()}** · Bias: **${(thesis.bias || "").toUpperCase()}** · Score ${fmtSigned(thesis.score, 0)} · Conviction ${thesis.conviction}/10`);
  lines.push("");
  lines.push(`## ${d.headline}`);
  if (d.dek) lines.push(`*${d.dek}*`);
  if (d.timestamp || d._generatedAt) lines.push(`Generated: ${d.timestamp || d._generatedAt}`);
  if (d.timingNote) lines.push(`Timing note: ${d.timingNote}`);
  if (stanceRead || pillarRead) {
    lines.push("");
    lines.push(`## Desk stance & weights`);
    if (stanceRead) lines.push(`- **Desk stance:** ${stanceRead}`);
    if (pillarRead) lines.push(`- **Pillar model:** ${pillarRead}`);
  }
  lines.push("");
  lines.push(`**The lede.** ${d.executiveSummary}`);
  lines.push("");
  lines.push(`## Market recap`);
  lines.push(d.marketRecap || "");
  if (d.marketOutlook) {
    lines.push("");
    lines.push(`## Market outlook`);
    lines.push(d.marketOutlook);
  }
  const tks = (market?.tickers || []).slice(0, 6);
  if (tks.length) {
    lines.push("");
    lines.push("| Ticker | Last | Chg % |");
    lines.push("|---|---|---|");
    tks.forEach((t) => lines.push(`| ${t.symbol} | ${fmtNum(t.price)} | ${fmtSigned(t.changePct, 2, "%")} |`));
  }
  lines.push("");
  lines.push(`## The call`);
  lines.push(d.thesisNarrative || "");
  lines.push("");
  if (thesis.levels?.action) lines.push(`- **Action level:** ${thesis.levels.action}`);
  if (thesis.levels?.upside) lines.push(`- **Upside:** ${thesis.levels.upside}`);
  if (thesis.levels?.downside) lines.push(`- **Downside:** ${thesis.levels.downside}`);
  if (thesis.gamePlan) lines.push(`- **Game plan:** ${thesis.gamePlan}`);
  if (thesis.invalidation) lines.push(`- **Invalidation:** ${thesis.invalidation}`);
  lines.push("");
  lines.push(`## Watch today`);
  (d.watchToday || []).forEach((w) => lines.push(`- ${w}`));
  const calendarGroups = points?.calendarGroups || {};
  const calendarPool = [
    ...(calendarGroups.today || []),
    ...(calendarGroups.tomorrow || []),
    ...(calendarGroups.upcoming || []),
    ...(points?.calendar || []),
  ];
  const primaryCal = pickCalendarCatalyst(calendarPool);
  const seenCal = new Set();
  const cal = [primaryCal, ...calendarPool]
    .filter((c) => c && c.importance !== "low")
    .filter((c) => {
      const key = `${c.date || ""}|${c.time || ""}|${c.event || ""}`;
      if (seenCal.has(key)) return false;
      seenCal.add(key);
      return true;
    })
    .slice(0, 5);
  cal.forEach((c) => lines.push(`- ${c.time} — ${c.event} (${c.importance})`));
  lines.push("");
  lines.push(`## Risk radar`);
  lines.push(d.riskRadar || "");
  lines.push("");
  lines.push(`*${d.finalWord || ""}*`);
  lines.push("");
  lines.push(`— Overwatch Daily Bias Desk · live public market data + optional AI synthesis · verify before trading · not financial advice`);

  const tp = d.tradePlan;
  if (tp) {
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push(`## Daily Trade Plan — ${tp.etfLabel || "SPY"}`);
    lines.push(`**Bias:** ${tp.biasLabel} · VIX ${tp.internals?.vixPrice || "—"}`);
    if (tp.macroRisk) lines.push(`\n> **Macro Risk:** ${tp.macroRisk}`);
    lines.push("");
    lines.push("### Pre-Market Checklist");
    if (tp.checklist) {
      Object.entries({ "Overnight Conditions": tp.checklist.overnightConditions, "Key Levels": tp.checklist.keyLevels, "Economic Events": tp.checklist.economicEvents, "Game Plan": tp.checklist.gamePlan, "Risk Management": tp.checklist.riskManagement }).filter(([, v]) => v).forEach(([k, v]) => lines.push(`- **${k}:** ${v}`));
    }
    if (tp.levels?.spyResistance?.length || tp.levels?.spySupport?.length) {
      lines.push("");
      lines.push("### Key Support & Resistance — SPY");
      if (tp.levels.spyResistance?.length) lines.push(`- **Resistance:** ${tp.levels.spyResistance.join(", ")}`);
      if (tp.levels.spySupport?.length) lines.push(`- **Support:** ${tp.levels.spySupport.join(", ")}`);
    }
    if (tp.bullishSetups?.length) {
      lines.push("");
      lines.push("### Bullish Setups");
      tp.bullishSetups.forEach((s, i) => lines.push(`${i + 1}. **${s.label}** | Entry: ${s.entry} | Target: ${s.target} | Stop: ${s.stop}${s.options ? ` | ${s.options}` : ""}`));
    }
    if (tp.bearishSetups?.length) {
      lines.push("");
      lines.push("### Bearish Setups");
      tp.bearishSetups.forEach((s, i) => lines.push(`${i + 1}. **${s.label}** | Entry: ${s.entry} | Target: ${s.target} | Stop: ${s.stop}${s.options ? ` | ${s.options}` : ""}`));
    }
    if (tp.futuresBias?.length) {
      lines.push("");
      lines.push("### Macro Futures Bias");
      lines.push("| Symbol | Chg % | Read |");
      lines.push("|---|---|---|");
      tp.futuresBias.forEach((row) => lines.push(`| **${row.symbol}** | ${row.changePct != null ? (row.changePct >= 0 ? "+" : "") + row.changePct + "%" : "—"} | ${row.read} |`));
    }
    if (tp.calendarHighlights?.length) {
      lines.push("");
      lines.push("### Economic Calendar Highlights");
      tp.calendarHighlights.forEach((c) => lines.push(`- **${c.time}** — ${c.event} (${c.importance})`));
    }
    if (tp.confirmationRule) {
      lines.push("");
      lines.push(`> **Confirmation Rule:** ${tp.confirmationRule}`);
    }
  }

  return lines.join("\n");
};

const buildNewsletterPrintHTML = ({ d, thesis, market, points, edition }) => {
  const t = d._thesis || thesis;
  const biasColor = t?.bias === "bullish" ? "#22c55e" : t?.bias === "bearish" ? "#ef4444" : "#c9a84c";
  const tp = d.tradePlan;
  const cal = [
    ...(points?.calendarGroups?.today || []),
    ...(points?.calendarGroups?.tomorrow || []),
    ...(points?.calendarGroups?.upcoming || []),
    ...(points?.calendar || []),
  ].filter((c) => c && c.importance !== "low").slice(0, 5);

  const row = (label, val) => val ? `<tr><td class="lbl">${label}</td><td>${val}</td></tr>` : "";

  const setupRows = (setups) => (setups || []).map((s) =>
    `<tr><td><b>${s.label}</b></td><td>${s.entry}</td><td>${s.target}</td><td>${s.stop}</td><td>${s.options || "—"}</td></tr>`
  ).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Overwatch No. ${edition} — ${d._date || ""}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#111;background:#fff;padding:32px 48px;max-width:800px;margin:0 auto}
    h1{font-size:22px;letter-spacing:.04em;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;border-bottom:3px solid #111;padding-bottom:8px;margin-bottom:6px}
    .meta{font-size:11px;color:#555;margin-bottom:18px;font-family:Arial,sans-serif;letter-spacing:.02em}
    .bias{font-size:28px;font-weight:900;letter-spacing:.08em;color:${biasColor};font-family:'Helvetica Neue',Arial,sans-serif}
    h2{font-size:14px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;margin:18px 0 6px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #ddd;padding-bottom:3px}
    h3{font-size:12px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;margin:12px 0 5px;text-transform:uppercase;letter-spacing:.04em}
    p{margin-bottom:10px;line-height:1.65}
    ul{margin:6px 0 10px 18px;line-height:1.7}
    table{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11.5px}
    th{background:#f0f0f0;padding:5px 8px;text-align:left;font-family:Arial,sans-serif;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em}
    td{padding:4px 8px;border-bottom:1px solid #e8e8e8;vertical-align:top}
    td.lbl{width:140px;color:#555;font-family:Arial,sans-serif;font-size:11px;font-weight:600}
    .headline{font-size:18px;font-style:italic;margin:10px 0 4px;line-height:1.4}
    .dek{font-size:13px;color:#444;font-style:italic;margin-bottom:14px}
    .callout{background:#f8f8f8;border-left:3px solid #c9a84c;padding:10px 14px;margin:12px 0;font-size:12px;line-height:1.6}
    .bull{color:#16a34a}.bear{color:#dc2626}.brass{color:#c9a84c}
    .footer{margin-top:28px;padding-top:10px;border-top:1px solid #ccc;font-size:10px;color:#777;font-family:Arial,sans-serif}
    .guard{padding:8px 12px;margin:6px 0;border-left:3px solid #999;font-size:12px;background:#fafafa}
    .guard.red{border-color:#dc2626}.guard.amber{border-color:#d97706}
    .tp-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
    @media print{body{padding:20px 30px}h1{font-size:18px}.bias{font-size:22px}}
  </style></head><body>
    <h1>OVERWATCH DAILY BIAS — No. ${edition}</h1>
    <div class="meta">${d._date || ""} &nbsp;·&nbsp; Bias: <b style="color:${biasColor}">${(t?.bias || "").toUpperCase()}</b> &nbsp;·&nbsp; Score ${t?.score >= 0 ? "+" : ""}${t?.score ?? 0} &nbsp;·&nbsp; Conviction ${t?.conviction ?? "—"}/10 &nbsp;·&nbsp; ${d.timestamp || d._generatedAt || ""}</div>

    <div class="bias">${(t?.bias || "—").toUpperCase()}</div>
    <div class="headline">"${d.headline}"</div>
    ${d.dek ? `<div class="dek">${d.dek}</div>` : ""}

    ${d.executiveSummary ? `<div class="callout"><b>The lede.</b> ${d.executiveSummary}</div>` : ""}

    ${t?.stanceRead || t?.pillarRead ? `
    <h2>Desk stance</h2>
    <table><tbody>
      ${row("Desk stance", t.stanceRead)}
      ${row("Pillar model", t.pillarRead)}
    </tbody></table>` : ""}

    <h2>Market recap</h2>
    <p>${d.marketRecap || "—"}</p>
    ${d.marketOutlook ? `<h2>Market outlook</h2><p>${d.marketOutlook}</p>` : ""}

    ${(market?.tickers || []).length ? `
    <table><thead><tr><th>Ticker</th><th>Last</th><th>Chg %</th></tr></thead><tbody>
      ${(market.tickers || []).slice(0, 6).map((tk) =>
        `<tr><td><b>${tk.symbol}</b></td><td>${tk.price != null ? Number(tk.price).toLocaleString() : "—"}</td><td class="${Number(tk.changePct) >= 0 ? "bull" : "bear"}">${Number(tk.changePct) >= 0 ? "+" : ""}${Number(tk.changePct).toFixed(2)}%</td></tr>`
      ).join("")}
    </tbody></table>` : ""}

    <h2>The call</h2>
    <p>${d.thesisNarrative || "—"}</p>
    <table><tbody>
      ${row("Action level", t?.levels?.action)}
      ${row("Upside target", t?.levels?.upside)}
      ${row("Downside target", t?.levels?.downside)}
      ${row("Game plan", t?.gamePlan)}
      ${row("Invalidation", t?.invalidation)}
    </tbody></table>

    ${(d.watchToday || []).length ? `
    <h2>Watch today</h2>
    <ul>${(d.watchToday || []).map((w) => `<li>${w}</li>`).join("")}</ul>` : ""}

    ${cal.length ? `
    <h2>Economic calendar</h2>
    <table><thead><tr><th>Time</th><th>Event</th><th>Importance</th></tr></thead><tbody>
      ${cal.map((c) => `<tr><td>${c.time || "—"}</td><td>${c.event}</td><td>${c.importance}</td></tr>`).join("")}
    </tbody></table>` : ""}

    <h2>Risk radar</h2>
    <p>${d.riskRadar || "—"}</p>

    ${d.finalWord ? `<div class="callout"><i>${d.finalWord}</i></div>` : ""}

    ${t?.invalidation || t?.standAside ? `
    <div class="guard red"><b>Thesis invalidation:</b> ${t?.invalidation || "—"}</div>
    <div class="guard amber"><b>Stand-aside conditions:</b> ${t?.standAside || "—"}</div>` : ""}

    ${tp ? `
    <h2>Daily trade plan — SPY</h2>
    <p><b>Bias:</b> ${tp.biasLabel} &nbsp;·&nbsp; VIX ${tp.internals?.vixPrice || "—"}</p>
    ${tp.macroRisk ? `<div class="callout"><b>Macro risk:</b> ${tp.macroRisk}</div>` : ""}

    ${tp.checklist ? `
    <h3>Pre-market checklist</h3>
    <table><tbody>
      ${row("Overnight", tp.checklist.overnightConditions)}
      ${row("Key levels", tp.checklist.keyLevels)}
      ${row("Events", tp.checklist.economicEvents)}
      ${row("Game plan", tp.checklist.gamePlan)}
      ${row("Risk mgmt", tp.checklist.riskManagement)}
    </tbody></table>` : ""}

    ${tp.bullishSetups?.length ? `
    <h3>Bullish setups</h3>
    <table><thead><tr><th>Setup</th><th>Entry</th><th>Target</th><th>Stop</th><th>Options</th></tr></thead><tbody>
      ${setupRows(tp.bullishSetups)}
    </tbody></table>` : ""}

    ${tp.bearishSetups?.length ? `
    <h3>Bearish setups</h3>
    <table><thead><tr><th>Setup</th><th>Entry</th><th>Target</th><th>Stop</th><th>Options</th></tr></thead><tbody>
      ${setupRows(tp.bearishSetups)}
    </tbody></table>` : ""}

    ${tp.futuresBias?.length ? `
    <h3>Macro futures bias</h3>
    <table><thead><tr><th>Symbol</th><th>Chg %</th><th>Read</th></tr></thead><tbody>
      ${tp.futuresBias.map((r) => `<tr><td><b>${r.symbol}</b></td><td class="${r.changePct >= 0 ? "bull" : "bear"}">${r.changePct != null ? (r.changePct >= 0 ? "+" : "") + r.changePct + "%" : "—"}</td><td>${r.read}</td></tr>`).join("")}
    </tbody></table>` : ""}

    ${tp.confirmationRule ? `<div class="callout"><b>Confirmation rule:</b> ${tp.confirmationRule}</div>` : ""}
    ` : ""}

    <div class="footer">Overwatch Daily Bias Desk &nbsp;·&nbsp; Live public market data + optional AI synthesis &nbsp;·&nbsp; Verify before trading &nbsp;·&nbsp; Not financial advice</div>
  </body></html>`;
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

const NewsletterTab = ({
  nl,
  thesis,
  market,
  points,
  edition,
  newsletterHistory = [],
  viewingNewsletter,
  setViewingNewsletter,
  onDeleteNewsletter,
  onGenerate,
  onGoThesis,
  notify,
}) => {
  const [copied, setCopied] = useState(false);
  const currentThesis = thesis.data;
  const t = viewingNewsletter?._thesis || currentThesis;
  const d = viewingNewsletter || nl.data;
  const displayedEdition = d?._edition || edition;

  if (!currentThesis && !newsletterHistory.length)
    return (
      <EmptyState
        icon={Mail}
        title="Nothing to publish yet"
        body="The morning note is built from today's thesis. Run the synthesis in the Thesis Lab first, then come back to press print."
        action={<button className="btn btn-brass" onClick={onGoThesis}><FlaskConical size={15} /> Go to Thesis Lab</button>}
      />
    );

  const doCopy = async () => {
    if (!d || !t) return;
    const ok = await copyText(buildMarkdown({ d, thesis: t, market, points, edition: displayedEdition }));
    setCopied(ok);
    notify(ok ? "Newsletter copied as markdown" : "Copy failed — select the text manually", ok ? "ok" : "err");
    setTimeout(() => setCopied(false), 2000);
  };

  const doDownloadPDF = () => {
    if (!d || !t) return;
    const html = buildNewsletterPrintHTML({ d, thesis: t, market, points, edition: displayedEdition });
    downloadPDF(html, `overwatch-no${displayedEdition}-${d._date || "today"}.pdf`);
  };

  const biasC = PAPER_BIAS[t?.bias] || PAPER_BIAS.neutral;
  const pct = ((clamp(t?.score ?? 0, -100, 100) + 100) / 200) * 100;
  const calendarGroups = points?.calendarGroups || {};
  const calendarPool = [
    ...(calendarGroups.today || []),
    ...(calendarGroups.tomorrow || []),
    ...(calendarGroups.upcoming || []),
    ...(points?.calendar || []),
  ];
  const primaryCal = pickCalendarCatalyst(calendarPool);
  const seenCal = new Set();
  const cal = [primaryCal, ...calendarPool]
    .filter((c) => c && c.importance !== "low")
    .filter((c) => {
      const key = `${c.date || ""}|${c.time || ""}|${c.event || ""}`;
      if (seenCal.has(key)) return false;
      seenCal.add(key);
      return true;
    })
    .slice(0, 4);
  const newsletterStanceRead = d?.stanceRead || t?.stanceRead;
  const newsletterPillarRead = d?.pillarRead || t?.pillarRead;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 9, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-brass" onClick={onGenerate} disabled={nl.status === "loading" || !currentThesis} title={!currentThesis ? "Build today's thesis first" : ""}>
          {nl.status === "loading" ? <><RefreshCw size={14} className="spin" /> Writing the note…</> : nl.data ? <><RotateCcw size={14} /> Regenerate note</> : <><Mail size={14} /> Generate morning note</>}
        </button>
        {!currentThesis && (
          <button className="btn" onClick={onGoThesis}><FlaskConical size={14} /> Build today's thesis</button>
        )}
        {d && (
          <button className="btn" onClick={doCopy}>
            {copied ? <><Check size={14} color={C.bull} /> Copied</> : <><Copy size={14} /> Copy as markdown</>}
          </button>
        )}
        {d && t && (
          <button className="btn" onClick={doDownloadPDF} title="Download as PDF">
            <FileText size={14} /> Download PDF
          </button>
        )}
      </div>

      {viewingNewsletter && (
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 15px" }}>
          <History size={14} color={C.brass} />
          <span style={{ fontSize: 12.5, color: C.muted }}>Viewing archived newsletter — {archiveStamp(viewingNewsletter)} · No. {viewingNewsletter._edition || "—"}</span>
          <button className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={() => setViewingNewsletter(null)}>Back to latest</button>
        </div>
      )}

      {nl.status === "error" && <ErrBlock msg={nl.error} onRetry={onGenerate} />}
      {nl.status === "loading" && !d && (
        <div className="paper-wrap"><div className="paper"><LoadingBlock lines={6} msg="Setting type on today's edition…" /></div></div>
      )}

      {d && t && (
        <div className="paper-wrap">
          <div className="paper">
            <div className="np-mast">
              <div className="np-brand">OVERWATCH <span>DAILY BIAS</span></div>
              <div className="np-meta">{d._date || dateShort()} · No. {displayedEdition}{(d.timestamp || d._generatedAt) ? ` · ${d.timestamp || d._generatedAt}` : ""}</div>
            </div>
            <div className="np-biasbar">
              <span className="np-biasword" style={{ color: biasC }}>{(t.bias || "").toUpperCase()}</span>
              <div style={{ position: "relative", width: 132, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#B8503F,#D8CFBC 50%,#1E7A4F)" }}>
                <div style={{ position: "absolute", top: -3, bottom: -3, width: 3.5, borderRadius: 2, background: "#1A1916", left: `${pct}%`, transform: "translateX(-50%)" }} />
              </div>
              <span className="np-meta">SCORE {fmtSigned(t.score, 0)} · CONVICTION {t.conviction}/10</span>
            </div>

            <h1 className="np-h1">{d.headline}</h1>
            {d.dek && <div className="np-dek">{d.dek}</div>}
            {d.timingNote && <div className="np-time-note"><b>Timing note</b>{d.timingNote}</div>}
            {(newsletterStanceRead || newsletterPillarRead) && (
              <div className="np-config">
                {newsletterStanceRead && <div><b>Desk stance</b><span>{newsletterStanceRead}</span></div>}
                {newsletterPillarRead && <div><b>Pillar model</b><span>{newsletterPillarRead}</span></div>}
              </div>
            )}

            <div className="np-sec">The lede</div>
            <p className="np-body np-lede">{d.executiveSummary}</p>

            <div className="np-sec">Market recap</div>
            <p className="np-body">{d.marketRecap}</p>
            {(market?.tickers || []).length > 0 && (
              <table className="np-table">
                <thead><tr><th>Ticker</th><th>Last</th><th>Chg %</th></tr></thead>
                <tbody>
                  {(market.tickers || []).slice(0, 6).map((tk) => (
                    <tr key={tk.symbol}>
                      <td style={{ fontWeight: 700 }}>{tk.symbol}</td>
                      <td>{fmtNum(tk.price, tk.symbol === "US10Y" ? 3 : 2)}</td>
                      <td style={{ color: tk.changePct >= 0 ? "#1E7A4F" : "#B8503F", fontWeight: 600 }}>{fmtSigned(tk.changePct, 2, "%")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {d.marketOutlook && (
              <>
                <div className="np-sec">Market outlook</div>
                <p className="np-body">{d.marketOutlook}</p>
              </>
            )}

            <div className="np-sec">The call</div>
            <p className="np-body">{d.thesisNarrative}</p>
            <div style={{ border: "1px solid var(--paper-line)", borderRadius: 6, padding: "12px 16px", marginTop: 12, fontSize: 13.5, lineHeight: 1.75 }}>
              {t.levels?.action && <div><b style={{ color: "#A87B2E" }}>Action level —</b> {t.levels.action}</div>}
              {t.levels?.upside && <div><b style={{ color: "#1E7A4F" }}>Upside —</b> {t.levels.upside}</div>}
              {t.levels?.downside && <div><b style={{ color: "#B8503F" }}>Downside —</b> {t.levels.downside}</div>}
              {t.invalidation && <div><b>Invalidation —</b> {t.invalidation}</div>}
            </div>

            <div className="np-sec">Watch today</div>
            <ul className="np-watch">
              {(d.watchToday || []).map((w, i) => <li key={i}>{w}</li>)}
              {cal.map((c, i) => (
                <li key={`c${i}`}><span className="mono" style={{ fontSize: 11.5, color: "#A87B2E", fontWeight: 600 }}>{c.time}</span> — {c.event}</li>
              ))}
            </ul>

            <div className="np-sec">Risk radar</div>
            <div className="np-risk">{d.riskRadar}</div>

            <div className="np-final">{d.finalWord} <span style={{ fontStyle: "normal", fontFamily: "'Space Grotesk',sans-serif", fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em" }}>— THE OVERWATCH DESK</span></div>

            <TradePlanSection plan={d.tradePlan || (t ? d : null)?.tradePlan} />

            <div className="np-foot">Overwatch Daily Bias · internal desk note · generated {d.timestamp || d._generatedAt || d._date || stampNow()} · live public market data + optional AI synthesis · verify levels before trading · not financial advice</div>
          </div>
        </div>
      )}

      {!d && currentThesis && nl.status === "idle" && (
        <div className="paper-wrap">
          <div className="paper" style={{ textAlign: "center", padding: "56px 40px" }}>
            <div className="np-brand" style={{ fontSize: 30 }}>OVERWATCH <span>DAILY BIAS</span></div>
            <p style={{ fontFamily: "'Lora',serif", fontStyle: "italic", color: "var(--paper-muted)", marginTop: 14, fontSize: 15 }}>
              Today's thesis is locked: {(t.bias || "").toUpperCase()} — "{t.headline}". Press generate and the desk will set today's edition in print.
            </p>
          </div>
        </div>
      )}

      {!currentThesis && newsletterHistory.length > 0 && !d && (
        <EmptyState
          icon={Mail}
          title="No current thesis loaded"
          body="You can reopen archived newsletters from the Archives tab, or build a fresh thesis to publish a new edition."
          action={<button className="btn btn-brass" onClick={onGoThesis}><FlaskConical size={15} /> Go to Thesis Lab</button>}
        />
      )}

    </div>
  );
};

/* ================================================================
   TAB — ARCHIVES
   ================================================================ */

const ArchiveTab = ({
  archiveHistory,
  viewing,
  setViewing,
  viewingNewsletter,
  setViewingNewsletter,
  onDeleteEntry,
  onGoThesis,
  onGoNewsletter,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card icon={History} title="Daily archive" sub={archiveHistory.length ? `${archiveHistory.length} saved entr${archiveHistory.length === 1 ? "y" : "ies"} — thesis + newsletter together · synced across devices` : "No archived entries yet"}>
        {!archiveHistory.length && (
          <div style={{ color: C.muted, fontSize: 12.5 }}>Every thesis and newsletter lands here automatically. Newsletters include the attached thesis so you always have the full picture.</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto" }}>
          {archiveHistory.map((entry) => {
            const isNl = entry._type === "newsletter";
            const t = isNl ? entry._thesis : entry;
            const biasColor = t?.bias === "bullish" ? C.bull : t?.bias === "bearish" ? C.bear : C.brass;
            const isViewingThis = isNl ? viewingNewsletter?._id === entry._id : viewing?._id === entry._id;
            return (
              <div
                key={entry._id}
                className={`hist-row ${isViewingThis ? "viewing" : ""}`}
                onClick={() => {
                  if (isNl) { setViewingNewsletter(entry); onGoNewsletter?.(); }
                  else { setViewing(entry); onGoThesis?.(); }
                }}
              >
                <span className="mono" style={{ fontSize: 10.5, color: C.muted, width: 148, flex: "none", whiteSpace: "nowrap" }}>{archiveStamp(entry)}</span>
                {isNl
                  ? <span className="chip b-brass" style={{ flex: "none", fontSize: 10 }}>No. {entry._edition || "—"}</span>
                  : <span className="chip" style={{ flex: "none", fontSize: 10, color: C.muted, borderColor: "var(--border)" }}>Thesis</span>
                }
                <span className="chip" style={{ color: biasColor, borderColor: biasColor + "66", flex: "none", fontSize: 10 }}>{t?.bias || "—"}</span>
                <span className="chip" style={{ flex: "none", fontSize: 10 }}>{entry.instrument || t?.instrument || "SPX"}</span>
                <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: "var(--text)" }}>
                  {isNl ? (entry.headline || "Untitled edition") : (entry.headline || "—")}
                </span>
                {t?.score != null && <span className="mono" style={{ fontSize: 11, color: C.muted, flex: "none" }}>{fmtSigned(t.score, 0)}</span>}
                <button className="btn btn-ghost btn-sm" style={{ flex: "none" }} title="Download PDF" onClick={(e) => {
                  e.stopPropagation();
                  if (isNl) downloadPDF(buildNewsletterPrintHTML({ d: entry, thesis: entry._thesis, market: null, points: null, edition: entry._edition || "—" }), `overwatch-no${entry._edition || "0"}-${entry._date || "archived"}.pdf`);
                  else downloadPDF(buildThesisPrintHTML(entry), `overwatch-thesis-${entry._date || entry.instrument || "archived"}.pdf`);
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
      </Card>
    </div>
  );
};

/* ================================================================
   SETTINGS DRAWER + TOASTS
   ================================================================ */

const SettingsDrawer = ({ open, onClose, watchlist, setWatchlist, onClearHistory, storageOk, notify }) => {
  const [sym, setSym] = useState("");
  const [name, setName] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  if (!open) return null;

  const addTicker = () => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    if (watchlist.some((w) => w.symbol === s)) { notify(`${s} is already on the board`, "err"); return; }
    if (watchlist.length >= 12) { notify("Watchlist is capped at 12 — drop one first", "err"); return; }
    setWatchlist([...watchlist, { symbol: s, name: name.trim() || s }]);
    setSym(""); setName("");
    notify(`${s} added — resync prices to pull it in`, "ok");
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

        <span className="lab-label">Watchlist · {watchlist.length}/12</span>
        <div style={{ marginBottom: 10 }}>
          {watchlist.map((w) => (
            <span className="wl-chip" key={w.symbol}>
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
            ? "● Settings, thesis archive, and newsletter archive persist in this browser."
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
  { symbol: "CBOE:VIX",       label: "VIX" },
  { symbol: "TVC:DXY",        label: "DXY" },
  { symbol: "TVC:US10Y",      label: "US10Y" },
  { symbol: "COMEX:GC1!",     label: "Gold" },
  { symbol: "NYMEX:CL1!",     label: "Crude" },
  { symbol: "COINBASE:BTCUSD", label: "BTC" },
];

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

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
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
    return () => {
      cancelled = true;
      widgetRef.current = null;
    };
  }, [symbol, lightMode, interval]);

  const id = `${prefix}-${symbol.replace(/[^a-zA-Z0-9]/g, "-")}`;
  return <div ref={containerRef} id={id} style={{ height: "100%", width: "100%" }} />;
};

const ChartsTab = ({ lightMode }) => {
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
  const [selected, setSelected] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("overwatch:charts") || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return ["AMEX:SPY", "NASDAQ:QQQ", "AMEX:DIA", "AMEX:IWM"];
  });
  const [interval, setInterval] = useState("D");
  const [activeSymbol, setActiveSymbol] = useState(() => selected[0] || "AMEX:SPY");
  const [fsSymbol, setFsSymbol] = useState(null);

  useEffect(() => {
    try { localStorage.setItem("overwatch:charts", JSON.stringify(selected)); } catch {}
  }, [selected]);

  useEffect(() => {
    if (!selected.includes(activeSymbol)) setActiveSymbol(selected[0]);
  }, [selected, activeSymbol]);

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

  const cols = selected.length <= 2 ? 1 : 2;
  const chartH = selected.length <= 2 ? 520 : 420;

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
  const [tab, setTab] = useState("pulse");
  const [clock, setClock] = useState(nyClock());
  const [session, setSession] = useState(marketSession());

  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [instrument, setInstrument] = useState(DEFAULT_THESIS_INSTRUMENT);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [lean, setLean] = useState("auto");
  const [risk, setRisk] = useState("balanced");
  const [notes, setNotes] = useState("");

  const [market, setMarket] = useState(IDLE);
  const [news, setNews] = useState(IDLE);
  const [points, setPoints] = useState(IDLE);
  const [recap, setRecap] = useState(IDLE);
  const [thesis, setThesis] = useState(IDLE);
  const [nl, setNl] = useState(IDLE);

  const [archiveHistory, setArchiveHistory] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [viewingNewsletter, setViewingNewsletter] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [lightMode, setLightMode] = useState(() => { try { return localStorage.getItem("overwatch:light") === "1"; } catch { return false; } });

  useEffect(() => { try { localStorage.setItem("overwatch:light", lightMode ? "1" : "0"); } catch {} }, [lightMode]);
  const autoSyncStarted = useRef(false);
  const archiveSaveTimer = useRef(null);
  const storageOk = storageAvailable();

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
        if (s.weights) setWeights((w) => ({ ...w, ...s.weights }));
        if (s.lean) setLean(s.lean);
        if (s.risk) setRisk(s.risk);
      }
      // Load archive: Upstash first (cross-device), fall back to localStorage only when KV returns null
      let ah = null;
      let fromKV = false;
      try {
        ah = await callDesk("getarchive");
        fromKV = Array.isArray(ah);
      } catch {}
      if (!fromKV) {
        ah = await loadStored(ARCHIVE_KEY, null);
      }
      if (Array.isArray(ah) && ah.length) {
        setArchiveHistory(ah);
      } else {
        // Migration: merge old thesis history + newsletter history into one list
        const legacyThesis = (await loadStored(HISTORY_KEY, [])) || [];
        const legacyNl = (await loadStored(NEWSLETTER_HISTORY_KEY, [])) || [];
        const nlIds = new Set(legacyNl.map((n) => n._thesisId).filter(Boolean));
        const thesisOnly = legacyThesis.filter((t) => !nlIds.has(t._id)).map((t) => ({ ...t, _type: "thesis" }));
        const nlEntries = legacyNl.map((n) => ({ ...n, _type: "newsletter" }));
        const merged = [...thesisOnly, ...nlEntries].sort((a, b) => (b._ts || 0) - (a._ts || 0)).slice(0, 60);
        if (merged.length) setArchiveHistory(merged);
      }
      setStorageReady(true);
    })();
  }, []);

  /* persist on change */
  useEffect(() => {
    if (storageReady) saveStored(SETTINGS_KEY, { watchlist, instrument, weights, lean, risk });
  }, [storageReady, watchlist, instrument, weights, lean, risk]);
  useEffect(() => {
    if (!storageReady) return;
    saveStored(ARCHIVE_KEY, archiveHistory);
    if (archiveSaveTimer.current) clearTimeout(archiveSaveTimer.current);
    archiveSaveTimer.current = setTimeout(() => {
      callDesk("savearchive", undefined, { archive: archiveHistory }).catch(() => {});
    }, 1500);
  }, [storageReady, archiveHistory]);

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
  const refreshMarket = () => runFetch(setMarket, "market", pricesPrompt(watchlist), { watchlist });
  const refreshNews = () => runFetch(setNews, "news", newsPrompt());
  const refreshPoints = () => runFetch(setPoints, "points", pointsPrompt());
  const refreshRecap = (payload = {}) => runFetch(setRecap, "recap", sessionPrompt(payload), payload);

  const anyLoading = [market, news, points, recap].some((m) => m.status === "loading");
  const anyData = !!(market.data || news.data || points.data);

  const syncAll = async ({ silent = false } = {}) => {
    if (!silent) notify("Syncing the desk — four live feeds in flight", "ok");
    const [marketData, newsData, pointsData] = await Promise.all([refreshMarket(), refreshNews(), refreshPoints()]);
    const recapData = await refreshRecap({
      market: marketData || market.data,
      news: newsData || news.data,
      points: pointsData || points.data,
    });
    const r = [marketData, newsData, pointsData, recapData];
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

  useEffect(() => {
    if (!storageReady || tab !== "pulse") return;
    const maybeRefresh = () => {
      if (document.visibilityState !== "visible") return;
      if ([market, news, points, recap].some((m) => m.status === "loading")) return;
      syncAll({ silent: true });
    };
    const stale = !market.at?.ts || Date.now() - market.at.ts > 2 * 60 * 1000;
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
  }, [storageReady, tab, watchlist, market.at?.ts, market.status, news.status, points.status, recap.status]);

  const generateThesis = async () => {
    setViewing(null);
    setViewingNewsletter(null);
    setThesis((s) => ({ ...s, status: "loading", error: null }));
    try {
      const timing = buildTimingSnapshot({ market: market.data, news: news.data, points: points.data });
      const prompt = thesisPrompt({ market: market.data, news: news.data, points: points.data, timing, weights, lean, risk, notes, instrument });
      const data = await callDesk("thesis", prompt, { market: market.data, news: news.data, points: points.data, timing, weights, lean, risk, notes, instrument });
      const entry = {
        ...data,
        instrument,
        timestamp: data.timestamp || `${timing.generatedAtShort} · ${timing.session}`,
        timingNote: data.timingNote || timing.timingNote,
        _id: uid(),
        _date: dateShort(),
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
      };
      setThesis({ status: "ready", data: entry, error: null, at: { ts: Date.now(), label: stampNow() } });
      setArchiveHistory((h) => [{ ...entry, _type: "thesis" }, ...h].slice(0, 60));
      setNl(IDLE);
      notify("Thesis locked + saved to the archive", "ok");
    } catch (e) {
      setThesis((s) => ({ ...s, status: "error", error: e.message }));
      notify("Synthesis failed — retry", "err");
    }
  };

  const generateNewsletter = async () => {
    if (!thesis.data) return;
    setViewingNewsletter(null);
    setNl((s) => ({ ...s, status: "loading", error: null }));
    try {
      const edition = Math.max(1, archiveHistory.filter((e) => e._type === "newsletter").length + 1);
      const timing = buildTimingSnapshot({ market: market.data, news: news.data, points: points.data });
      const focusInstrument = thesis.data?.instrument || instrument;
      const prompt = newsletterPrompt({ market: market.data, news: news.data, points: points.data, thesis: thesis.data, timing, edition, weights, lean, risk, notes, instrument: focusInstrument });
      const data = await callDesk("newsletter", prompt, { market: market.data, news: news.data, points: points.data, thesis: thesis.data, timing, edition, weights, lean, risk, notes, instrument: focusInstrument });
      const entry = {
        ...data,
        instrument: focusInstrument,
        timestamp: data.timestamp || `${timing.generatedAtShort} · ${timing.session}`,
        timingNote: data.timingNote || thesis.data.timingNote || timing.timingNote,
        _id: uid(),
        _date: dateShort(),
        _time: timing.generatedAtShort || stampNow(),
        _ts: Date.now(),
        _edition: edition,
        _generatedAt: timing.generatedAt,
        _quoteAsOf: timing.quoteAsOf,
        _timing: timing,
        _instrument: focusInstrument,
        _thesisId: thesis.data?._id || null,
        _thesis: thesis.data,
        _weights: weights,
        _lean: lean,
        _risk: risk,
        _notes: notes,
      };
      const nlEntry = { ...entry, _type: "newsletter" };
      setNl({ status: "ready", data: nlEntry, error: null, at: { ts: Date.now(), label: stampNow() } });
      setArchiveHistory((h) => {
        // Replace the standalone thesis entry with this newsletter+thesis pair
        const withoutThesis = h.filter((x) => !(x._type === "thesis" && x._id === thesis.data?._id));
        return [nlEntry, ...withoutThesis].slice(0, 60);
      });
      notify("Morning note saved to the archive", "ok");
    } catch (e) {
      setNl((s) => ({ ...s, status: "error", error: e.message }));
      notify("The note didn't compile — regenerate", "err");
    }
  };

  const addNote = (title) => {
    setNotes((n) => (n ? n + "\n" : "") + "• " + title);
    notify("Pinned to desk notes", "ok");
  };
  const deleteArchiveEntry = (id) => {
    setArchiveHistory((h) => h.filter((x) => x._id !== id));
    setViewing((v) => (v && v._id === id ? null : v));
    setViewingNewsletter((v) => (v && v._id === id ? null : v));
    notify("Entry deleted from archive", "ok");
  };
  const clearHistory = () => {
    setArchiveHistory([]);
    setViewing(null);
    setViewingNewsletter(null);
    notify("Archive cleared", "ok");
  };
  const calendarGroupsForBadge = calendarEventGroups(points.data);
  const calendarBadge = calendarEventCount(calendarGroupsForBadge) || null;
  const nlHistory = archiveHistory.filter((e) => e._type === "newsletter");
  const thesisHistory = archiveHistory.filter((e) => e._type === "thesis" || !e._type);
  const newsletterBadge = nlHistory.length || null;
  const archiveBadge = archiveHistory.length || null;
  const TABS = [
    { id: "pulse", label: "Market Pulse", short: "Pulse", icon: Activity, badge: market.data?.tickers?.length },
    { id: "charts", label: "Charts", short: "Charts", icon: CandlestickChart },
    { id: "news", label: "News Intel", short: "News", icon: Newspaper, badge: news.data?.headlines?.length },
    { id: "calendar", label: "Calendar", short: "Cal", icon: CalendarDays, badge: calendarBadge },
    { id: "thesis", label: "Thesis Lab", short: "Thesis", icon: FlaskConical, badge: thesisHistory.length || null },
    { id: "newsletter", label: "Newsletter", short: "Brief", icon: Mail, badge: newsletterBadge },
    { id: "archives", label: "Archives", short: "Archive", icon: History, badge: archiveBadge },
  ];

  const steps = [
    { n: 1, label: "Sync live data", done: anyData, now: !anyData, go: () => setTab("pulse") },
    { n: 2, label: "Build the thesis", done: !!thesis.data, now: anyData && !thesis.data, go: () => setTab("thesis") },
    { n: 3, label: "Publish the note", done: !!nl.data || !!nlHistory.length, now: !!thesis.data && !nl.data, go: () => setTab("newsletter") },
  ];

  return (
    <div className={`bd-root${lightMode ? " light" : ""}`}>
      <style>{CSS}</style>

      <header className="bd-header">
        <div className="bd-logo">
          <div className="bd-mark">OW</div>
          <div>
            <div className="bd-title">OVERWATCH <em>//</em> DAILY BIAS DESK</div>
            <div className="bd-sub">{dateShort()} · Overwatch Intelligence</div>
          </div>
        </div>
        <div className="bd-hright">
          <span className="bd-clock">{clock}<span>ET</span></span>
          <span className="bd-session">
            <span className={`bd-dot ${session.tone === "live" ? "dot-live" : session.tone === "warn" ? "dot-warn" : "dot-off"}`} />
            {session.label}
          </span>
          <button className="btn btn-brass" onClick={syncAll} disabled={anyLoading}>
            {anyLoading ? <><RefreshCw size={14} className="spin" /> Syncing…</> : <><Zap size={14} /> Sync live data</>}
          </button>
          <button className="btn btn-ghost" onClick={() => setLightMode((m) => !m)} title={lightMode ? "Switch to dark mode" : "Switch to light mode"}>
            {lightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="btn btn-ghost" onClick={() => setSettingsOpen(true)} title="Desk settings"><Settings size={16} /></button>
        </div>
      </header>

      <div className="bd-flow">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className={`flow-step ${s.done ? "done" : ""} ${s.now ? "now" : ""}`} onClick={s.go}>
              <span className="flow-num">{s.done ? "✓" : s.n}</span>
              <span className="flow-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight size={13} className="flow-arrow" />}
          </React.Fragment>
        ))}
      </div>

      <nav className="bd-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`bd-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
            <t.icon size={15} />
            {t.label}
            {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
          </button>
        ))}
      </nav>

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

      <main className="bd-main">
        {tab === "pulse" && (
          <PulseTab market={market} points={points.data} pointsState={points} news={news.data} recap={recap} vixHint={points.data?.vix?.structure} onRefresh={syncAll} onGoThesis={() => setTab("thesis")} />
        )}
        {tab === "news" && <NewsTab news={news} onRefresh={refreshNews} onAddNote={addNote} />}
        {tab === "calendar" && <CalendarTab points={points} onRefresh={refreshPoints} />}
        {tab === "thesis" && (
          <ThesisTab
            instrument={instrument} setInstrument={setInstrument}
            weights={weights} setWeights={setWeights}
            lean={lean} setLean={setLean}
            risk={risk} setRisk={setRisk}
            notes={notes} setNotes={setNotes}
            thesis={thesis} onGenerate={generateThesis}
            history={thesisHistory} viewing={viewing} setViewing={setViewing}
            onDeleteHist={deleteArchiveEntry} anyData={anyData}
            onGoNewsletter={() => setTab("newsletter")}
          />
        )}
        {tab === "newsletter" && (
          <NewsletterTab
            nl={nl} thesis={thesis} market={market.data} points={points.data}
            edition={Math.max(1, nlHistory.length + 1)}
            newsletterHistory={nlHistory}
            viewingNewsletter={viewingNewsletter}
            setViewingNewsletter={setViewingNewsletter}
            onDeleteNewsletter={deleteArchiveEntry}
            onGenerate={generateNewsletter} onGoThesis={() => setTab("thesis")} notify={notify}
          />
        )}
        {tab === "charts" && <ChartsTab lightMode={lightMode} />}
        {tab === "archives" && (
          <ArchiveTab
            archiveHistory={archiveHistory}
            viewing={viewing}
            setViewing={setViewing}
            viewingNewsletter={viewingNewsletter}
            setViewingNewsletter={setViewingNewsletter}
            onDeleteEntry={deleteArchiveEntry}
            onGoThesis={() => setTab("thesis")}
            onGoNewsletter={() => setTab("newsletter")}
          />
        )}
      </main>

      <footer className="bd-foot">
        OVERWATCH DAILY BIAS DESK · LIVE PUBLIC MARKET DATA + OPTIONAL AI SYNTHESIS — VERIFY LEVELS ON YOUR PLATFORM BEFORE TRADING · NOT FINANCIAL ADVICE
      </footer>

      <SettingsDrawer
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        watchlist={watchlist} setWatchlist={setWatchlist}
        onClearHistory={clearHistory} storageOk={storageOk} notify={notify}
      />
      <Toasts items={toasts} />
    </div>
  );
}
