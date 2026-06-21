const SYMBOLS = {
  SPX: "SP:SPX",
  DJI: "DJ:DJI",
  ES: "CME_MINI:ES1!",
  NQ: "CME_MINI:NQ1!",
  YM: "CBOT_MINI:YM1!",
  NDX: "NASDAQ:NDX",
  VIX: "CBOE:VIX",
  DXY: "TVC:DXY",
  US10Y: "TVC:US10Y",
  GC: "COMEX:GC1!",
  CL: "NYMEX:CL1!",
  BTC: "COINBASE:BTCUSD",
};

const SECTORS = [
  ["Technology", "AMEX:XLK"],
  ["Financials", "AMEX:XLF"],
  ["Health Care", "AMEX:XLV"],
  ["Energy", "AMEX:XLE"],
  ["Consumer Discretionary", "AMEX:XLY"],
  ["Consumer Staples", "AMEX:XLP"],
  ["Industrials", "AMEX:XLI"],
  ["Materials", "AMEX:XLB"],
  ["Utilities", "AMEX:XLU"],
  ["Real Estate", "AMEX:XLRE"],
  ["Communication Services", "AMEX:XLC"],
];

const FLOW_SYMBOLS = [
  ["SPY", "AMEX:SPY", "S&P 500 ETF"],
  ["QQQ", "NASDAQ:QQQ", "Nasdaq 100 ETF"],
  ["DIA", "AMEX:DIA", "Dow ETF"],
  ["IWM", "AMEX:IWM", "Russell 2000 ETF"],
  ["HYG", "AMEX:HYG", "High Yield Credit"],
  ["TLT", "NASDAQ:TLT", "Long Treasury Bond"],
  ["GLD", "AMEX:GLD", "Gold ETF"],
  ["UUP", "AMEX:UUP", "US Dollar ETF"],
  ["XLK", "AMEX:XLK", "Technology ETF"],
  ["XLF", "AMEX:XLF", "Financials ETF"],
  ["XLE", "AMEX:XLE", "Energy ETF"],
  ["XLU", "AMEX:XLU", "Utilities ETF"],
];

const SAMPLE_FEAR_GREED = {
  score: 39.3,
  rating: "fear",
  timestamp: "sample snapshot",
  previousClose: 39.3,
  previousWeek: 26.9,
  previousMonth: 63.0,
  previousYear: 57.4,
  source: "sample",
  components: {
    putCall: { score: 39.2, rating: "fear", value: 0.75 },
    junkBondDemand: { score: 8.8, rating: "extreme fear", value: 1.35 },
    safeHavenDemand: { score: 37.2, rating: "fear", value: 0.49 },
    marketMomentum: { score: 78.2, rating: "extreme greed", value: 7511.35 },
    stockBreadth: { score: 26, rating: "fear", value: 996.07 },
    volatility: { score: 50, rating: "neutral", value: 16.41 },
  },
};

const SAMPLE_POSITIONING = {
  source: "sample",
  summary: "Sample flow read: growth leadership is soft, defensives are bid, and credit is not confirming a clean risk-on impulse.",
  posture: "defensive",
  flows: [
    { symbol: "QQQ", label: "Nasdaq 100 ETF", changePct: -1.9, relativeVolume: 0.77, read: "Growth leadership is under pressure." },
    { symbol: "DIA", label: "Dow ETF", changePct: 0.58, relativeVolume: 0.82, read: "Value/industrial leadership is cushioning index damage." },
    { symbol: "HYG", label: "High Yield Credit", changePct: -0.01, relativeVolume: 0.74, read: "Credit is neutral to slightly defensive." },
    { symbol: "TLT", label: "Long Treasury Bond", changePct: 0.55, relativeVolume: 1.2, read: "Treasury demand is firm, consistent with defensive hedging." },
  ],
  signals: [
    { label: "Put/call pressure", value: "0.75", tone: "fear", note: "Options demand leans defensive." },
    { label: "Junk bond demand", value: "8.8", tone: "extreme fear", note: "Credit appetite is not confirming broad risk-on." },
    { label: "Safe-haven demand", value: "37.2", tone: "fear", note: "Haven bid remains a headwind for risk appetite." },
  ],
  notes: [
    "Watch QQQ vs DIA for whether growth weakness broadens into the Dow.",
    "Treat HYG/TLT divergence as the credit-vs-duration confirmation pair.",
  ],
};

const SAMPLE_NEWS = {
  mood: "The live wire is unavailable, so Overwatch is displaying a representative sample set.",
  sourceCount: 3,
  lastUpdated: "sample snapshot",
  brief: "Sample mode: rates, mega-cap leadership, and energy remain the desk's priority checks until live news returns.",
  watchlist: [
    "Rates and inflation expectations can reset index valuation quickly.",
    "Mega-cap breadth remains the key confirmation test for NDX and SPX.",
    "Energy strength can offset some growth weakness, but it does not repair breadth by itself.",
  ],
  catalysts: [
    { category: "macro", count: 1, maxImpact: 5, sentiment: "bearish" },
    { category: "technical", count: 1, maxImpact: 4, sentiment: "neutral" },
    { category: "flows", count: 1, maxImpact: 3, sentiment: "neutral" },
  ],
  headlines: [
    { title: "Index futures weigh inflation and rates into the open", source: "Overwatch sample", timeAgo: "sample", category: "macro", sentiment: "bearish", impact: 5, urgency: "high", tickers: ["SPX", "ES", "US10Y"], note: "Rates and inflation expectations can reset index valuation quickly." },
    { title: "Mega-cap leadership remains the key breadth test", source: "Overwatch sample", timeAgo: "sample", category: "technical", sentiment: "neutral", impact: 4, urgency: "medium", tickers: ["NDX", "NQ"], note: "Narrow leadership can support the index while masking weaker internals." },
    { title: "Energy strength offers a partial hedge to growth weakness", source: "Overwatch sample", timeAgo: "sample", category: "flows", sentiment: "neutral", impact: 3, urgency: "medium", tickers: ["CL", "SPX"], note: "Sector rotation matters more than the headline index move." },
  ],
};

const SAMPLE_MARKET = {
  asOf: "sample snapshot",
  summary: "Live quotes are temporarily unavailable, so Overwatch is showing its built-in sample tape.",
  tickers: [
    { symbol: "SPX", name: "S&P 500", price: 7316.33, change: -80.23, changePct: -1.08, dayOpen: 7356.445, dayLow: 7297.79, dayHigh: 7396.56 },
    { symbol: "DJI", name: "Dow Jones Industrial Average", price: 51999.68, change: 328.64, changePct: 0.64, dayOpen: 51835.36, dayLow: 51712.63, dayHigh: 52190.29 },
    { symbol: "ES", name: "E-mini S&P", price: 7341.25, change: -78.5, changePct: -1.06, dayOpen: 7380.5, dayLow: 7319.5, dayHigh: 7420.75 },
    { symbol: "NQ", name: "E-mini Nasdaq-100", price: 30463.25, change: 149.5, changePct: 0.49, dayOpen: 30388.5, dayLow: 30306.5, dayHigh: 30472.5 },
    { symbol: "YM", name: "E-mini Dow", price: 52527, change: 57, changePct: 0.11, dayOpen: 52498.5, dayLow: 52408, dayHigh: 52568 },
    { symbol: "NDX", name: "Nasdaq 100", price: 26402.18, change: -408.61, changePct: -1.52, dayOpen: 26606.485, dayLow: 26280.14, dayHigh: 26812.42 },
    { symbol: "VIX", name: "CBOE Volatility", price: 20.84, change: 2.11, changePct: 11.27, dayOpen: 19.785, dayLow: 18.8, dayHigh: 21.36 },
    { symbol: "DXY", name: "US Dollar Index", price: 101.7, change: 0.41, changePct: 0.4, dayOpen: 101.495, dayLow: 101.14, dayHigh: 101.92 },
    { symbol: "US10Y", name: "US 10-Year Yield", price: 4.528, change: 0.051, changePct: 1.14, dayOpen: 4.5225, dayLow: 4.513, dayHigh: 4.54 },
    { symbol: "GC", name: "Gold Futures", price: 3378.2, change: 24.6, changePct: 0.73, dayOpen: 3365.9, dayLow: 3348.6, dayHigh: 3392.4 },
    { symbol: "CL", name: "WTI Crude", price: 78.63, change: 0.74, changePct: 0.95, dayOpen: 78.26, dayLow: 77.42, dayHigh: 79.18 },
    { symbol: "BTC", name: "Bitcoin", price: 109422.16, change: -864.21, changePct: -0.78, dayOpen: 109854.265, dayLow: 108705.22, dayHigh: 111182.44 },
  ],
  sectors: [
    { name: "Technology", changePct: -1.86 },
    { name: "Financials", changePct: -0.74 },
    { name: "Health Care", changePct: 0.28 },
    { name: "Energy", changePct: 0.91 },
    { name: "Consumer Discretionary", changePct: -1.11 },
    { name: "Consumer Staples", changePct: 0.12 },
    { name: "Industrials", changePct: -0.38 },
    { name: "Materials", changePct: 0.21 },
    { name: "Utilities", changePct: 0.44 },
    { name: "Real Estate", changePct: -0.25 },
    { name: "Communication Services", changePct: -1.33 },
  ],
  fearGreed: SAMPLE_FEAR_GREED,
};

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));
const signed = (value, digits = 2, suffix = "") => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${round(n, digits)}${suffix}`;
};
let scanCache;
let newsCache;
let calendarCache;
let flowCache;

// Morning brief cache — persists in warm Lambda instances; optionally backed by Vercel KV
let _briefCache = null;

const storeBrief = async (data) => {
  _briefCache = { ...data, _storedAt: Date.now() };
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await fetch(`${process.env.KV_REST_API_URL}/set/overwatch:brief`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value: JSON.stringify(_briefCache), ex: 86400 }),
        signal: AbortSignal.timeout(5000),
      });
    } catch { /* KV optional */ }
  }
};

const getBrief = async () => {
  if (_briefCache && (Date.now() - _briefCache._storedAt) < 86_400_000) return _briefCache;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/overwatch:brief`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      });
      const { result } = await res.json();
      if (result) { _briefCache = JSON.parse(result); return _briefCache; }
    } catch { /* KV optional */ }
  }
  return null;
};

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

const timeAgo = (timestamp) => {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - timestamp));
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; OverwatchDesk/1.0)",
    },
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) throw new Error(`Market source returned ${response.status}`);
  return response.json();
};

const fetchScan = async () => {
  if (scanCache?.expires > Date.now()) return scanCache.data;

  const tickers = [...Object.values(SYMBOLS), ...SECTORS.map(([, symbol]) => symbol)];
  const promise = fetch("https://scanner.tradingview.com/global/scan", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; OverwatchDesk/1.0)",
    },
    body: JSON.stringify({
      symbols: { tickers, query: { types: [] } },
      columns: ["name", "description", "open", "close", "change", "change_abs", "high", "low"],
    }),
    signal: AbortSignal.timeout(9000),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Market scanner returned ${response.status}`);
    const payload = await response.json();
    return new Map((payload.data || []).map((row) => [
      row.s,
      {
        dayOpen: row.d?.[2],
        price: row.d?.[3],
        changePct: row.d?.[4],
        change: row.d?.[5],
        dayHigh: row.d?.[6],
        dayLow: row.d?.[7],
        previousClose: Number.isFinite(Number(row.d?.[3])) && Number.isFinite(Number(row.d?.[5])) ? Number(row.d[3]) - Number(row.d[5]) : null,
      },
    ]));
  });

  scanCache = { expires: Date.now() + 30_000, data: promise };
  try {
    return await promise;
  } catch (error) {
    scanCache = undefined;
    throw error;
  }
};

const parseFearGreed = (payload) => {
  const current = payload?.fear_and_greed;
  const score = Number(current?.score);
  if (!Number.isFinite(score)) throw new Error("No Fear & Greed score");
  const component = (key) => {
    const item = payload?.[key];
    const value = item?.data?.at?.(-1)?.y;
    return {
      score: Number.isFinite(Number(item?.score)) ? round(Number(item.score), 1) : null,
      rating: String(item?.rating || "neutral").toLowerCase(),
      value: Number.isFinite(Number(value)) ? round(Number(value), 2) : null,
    };
  };
  return {
    score: round(clamp(score, 0, 100), 1),
    rating: String(current?.rating || "neutral").toLowerCase(),
    timestamp: current?.timestamp || null,
    previousClose: Number.isFinite(Number(current?.previous_close)) ? round(Number(current.previous_close), 1) : null,
    previousWeek: Number.isFinite(Number(current?.previous_1_week)) ? round(Number(current.previous_1_week), 1) : null,
    previousMonth: Number.isFinite(Number(current?.previous_1_month)) ? round(Number(current.previous_1_month), 1) : null,
    previousYear: Number.isFinite(Number(current?.previous_1_year)) ? round(Number(current.previous_1_year), 1) : null,
    source: "CNN",
    components: {
      putCall: component("put_call_options"),
      junkBondDemand: component("junk_bond_demand"),
      safeHavenDemand: component("safe_haven_demand"),
      marketMomentum: component("market_momentum_sp500"),
      stockBreadth: component("stock_price_breadth"),
      volatility: component("market_volatility_vix"),
    },
  };
};

let fearGreedCache;
const fetchFearGreed = async () => {
  if (fearGreedCache?.expires > Date.now()) return fearGreedCache.data;

  const promise = fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
    headers: {
      Accept: "application/json,text/plain,*/*",
      Origin: "https://www.cnn.com",
      Referer: "https://www.cnn.com/markets/fear-and-greed",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(9000),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Fear & Greed source returned ${response.status}`);
    return parseFearGreed(await response.json());
  });

  fearGreedCache = { expires: Date.now() + 5 * 60_000, data: promise };
  try {
    return await promise;
  } catch (error) {
    fearGreedCache = undefined;
    throw error;
  }
};

const etParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  return { year: Number(get("year")), month: Number(get("month")), day: Number(get("day")) };
};

const isoDate = (date = new Date()) => {
  const { year, month, day } = etParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const addIsoDays = (dateIso, days) => {
  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

const buildSampleCalendar = () => {
  const today = isoDate();
  const tomorrow = addIsoDays(today, 1);
  const day2 = addIsoDays(today, 2);
  const day3 = addIsoDays(today, 3);
  const day4 = addIsoDays(today, 4);
  const day5 = addIsoDays(today, 5);
  const day6 = addIsoDays(today, 6);
  const groups = {
    today: [
      { date: today, time: "8:30 AM ET", event: "Retail Sales MoM", importance: "high", period: "May", forecast: 0.5, previous: 0.5, actual: null, source: "Sample macro calendar", note: "Consumer demand can reset index-rate sensitivity." },
      { date: today, time: "2:00 PM ET", event: "FOMC Rate Decision", importance: "high", period: "June FOMC meeting", forecast: null, previous: null, actual: null, source: "Sample macro calendar", note: "Fed pricing is the primary volatility event." },
    ],
    tomorrow: [
      { date: tomorrow, time: "8:30 AM ET", event: "Initial Jobless Claims", importance: "medium", period: "Weekly", forecast: null, previous: null, actual: null, source: "Sample macro calendar", note: "Labor cooling or resilience feeds rates and index multiples." },
    ],
    upcoming: [
      { date: day2, time: "8:30 AM ET", event: "Consumer Price Index (CPI)", importance: "high", period: "Month over month", forecast: null, previous: null, actual: null, source: "Sample macro calendar", note: "Inflation can reprice rates and equity multiples in a hurry." },
      { date: day3, time: "2:00 PM ET", event: "FOMC Economic Projections", importance: "high", period: "Quarterly update", forecast: null, previous: null, actual: null, source: "Sample macro calendar", note: "Guidance on rates is often more important than the statement itself." },
      { date: day4, time: "10:00 AM ET", event: "ISM Services PMI", importance: "high", period: "Services survey", forecast: null, previous: null, actual: null, source: "Sample macro calendar", note: "Growth confirmation can support cyclical risk appetite." },
      { date: day5, time: "8:30 AM ET", event: "PCE Price Index", importance: "high", period: "Inflation gauge", forecast: null, previous: null, actual: null, source: "Sample macro calendar", note: "The Fed's preferred inflation signal can move yields and indices." },
      { date: day6, time: "11:00 AM ET", event: "Treasury Auction / Supply Check", importance: "high", period: "This week", forecast: null, previous: null, actual: null, source: "Sample macro calendar", note: "Supply pressure can matter for duration, volatility, and index multiples." },
    ],
  };
  return {
    source: "sample",
    asOf: "sample snapshot",
    groups,
    flat: [...groups.today, ...groups.tomorrow, ...groups.upcoming],
  };
};

const eventEtDate = (date) => isoDate(new Date(date));

const eventEtTime = (date) => new Date(date).toLocaleTimeString("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
}) + " ET";

const calendarImportance = (value, title = "") => {
  const text = title.toLowerCase();
  if (Number(value) >= 1 || /fomc|fed|powell|cpi|ppi|pce|payroll|jobs|unemployment|gdp|retail sales|ism|pmi|jobless claims|treasury auction/.test(text)) return "high";
  if (Number(value) >= 0 || /housing|consumer|confidence|durable|industrial|inventory|claims|auction/.test(text)) return "medium";
  return "low";
};

const majorCalendarEvent = (event) => event.importance === "high" || /fed|fomc|powell|cpi|ppi|pce|payroll|jobs|unemployment|gdp|retail sales|ism|pmi|jobless claims|treasury auction|consumer confidence/i.test(event.event || "");

const normalizeCalendarEvent = (item) => {
  const importance = calendarImportance(item.importance, item.title);
  const numericOrNull = (value) => value === null || value === undefined || value === "" ? null : Number.isFinite(Number(value)) ? Number(value) : null;
  const actual = numericOrNull(item.actual);
  const forecast = numericOrNull(item.forecast);
  const previous = numericOrNull(item.previous);
  return {
    time: eventEtTime(item.date),
    date: eventEtDate(item.date),
    event: item.title || item.indicator || "Economic event",
    importance,
    period: item.period || null,
    actual,
    forecast,
    previous,
    source: item.source || "TradingView economic calendar",
    note: item.comment ? String(item.comment).replace(/\s+/g, " ").trim().slice(0, 150) : "",
  };
};

const FOMC_2026 = {
  "2026-01-28": { period: "January FOMC meeting", projections: false },
  "2026-03-18": { period: "March FOMC meeting", projections: true },
  "2026-04-29": { period: "April FOMC meeting", projections: false },
  "2026-06-17": { period: "June FOMC meeting", projections: true },
  "2026-07-29": { period: "July FOMC meeting", projections: false },
  "2026-09-16": { period: "September FOMC meeting", projections: true },
  "2026-10-28": { period: "October FOMC meeting", projections: false },
  "2026-12-09": { period: "December FOMC meeting", projections: true },
};

const isFomcEvent = (event = {}) => /fomc|federal open market|rate decision|press conference|projection/i.test(event.event || "");

const fedFomcEventsForDate = (dateIso) => {
  const meeting = FOMC_2026[dateIso];
  if (!meeting) return [];
  const note = meeting.projections
    ? "Fed decision day with Summary of Economic Projections; can reset rates, yields, volatility and index direction."
    : "Fed decision day; the statement and press conference can reset rates, yields, volatility and index direction.";
  return [
    {
      date: dateIso,
      time: "2:00 PM ET",
      event: "FOMC Rate Decision / Statement",
      importance: "high",
      period: meeting.period,
      actual: null,
      forecast: null,
      previous: null,
      source: "Federal Reserve FOMC calendar",
      note,
    },
    ...(meeting.projections ? [{
      date: dateIso,
      time: "2:00 PM ET",
      event: "FOMC Economic Projections",
      importance: "high",
      period: meeting.period,
      actual: null,
      forecast: null,
      previous: null,
      source: "Federal Reserve FOMC calendar",
      note: "Quarterly projections are a direct input for rate expectations and index multiple risk.",
    }] : []),
    {
      date: dateIso,
      time: "2:30 PM ET",
      event: "FOMC Press Conference",
      importance: "high",
      period: meeting.period,
      actual: null,
      forecast: null,
      previous: null,
      source: "Federal Reserve FOMC calendar",
      note: "Chair Q&A can change how traders interpret the statement and projections.",
    },
  ];
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

const calendarSort = (a, b) => (
  String(a.date || "").localeCompare(String(b.date || "")) ||
  calendarMinutes(a.time) - calendarMinutes(b.time) ||
  String(a.event || "").localeCompare(String(b.event || ""))
);

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
  if (/cpi|pce|payroll|jobs|unemployment|gdp|retail sales|ism|pmi|jobless claims|philadelphia fed|consumer confidence/.test(text)) score -= 16;
  if (/treasury auction|tips auction|bill auction|fed balance sheet/.test(text)) score -= 7;
  if (/mortgage|natural gas|oil rig|projection -/.test(text)) score += 12;
  if (/Federal Reserve FOMC calendar/i.test(event.source || "")) score -= 5;
  return score + calendarMinutes(event.time) / 1000;
};

const mergeCalendarEvents = (events) => {
  const seen = new Set();
  return events.filter((event) => {
    const normalizedEvent = String(event.event || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const normalizedTime = String(event.time || "").replace(/\s+/g, " ").trim().toLowerCase();
    const key = `${event.date}|${normalizedTime}|${normalizedEvent}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const selectCalendarGroup = (events, limit) => {
  const byBucket = new Map();
  for (const event of mergeCalendarEvents(events).sort((a, b) => calendarPriority(a) - calendarPriority(b) || calendarSort(a, b))) {
    const bucket = calendarEventBucket(event);
    if (!byBucket.has(bucket)) byBucket.set(bucket, event);
  }
  return Array.from(byBucket.values())
    .sort((a, b) => calendarPriority(a) - calendarPriority(b) || calendarSort(a, b))
    .slice(0, limit)
    .sort(calendarSort);
};

const selectMajorUpcomingEvents = (events, limit) => {
  const merged = mergeCalendarEvents(events).sort((a, b) => calendarPriority(a) - calendarPriority(b) || calendarSort(a, b));
  const prioritized = [];
  const seen = new Set();
  const push = (event) => {
    const bucket = calendarEventBucket(event);
    if (seen.has(bucket)) return;
    seen.add(bucket);
    prioritized.push(event);
  };
  merged.filter(majorCalendarEvent).forEach(push);
  merged.filter((event) => !majorCalendarEvent(event)).forEach(push);
  return prioritized
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || calendarPriority(a) - calendarPriority(b) || calendarSort(a, b))
    .slice(0, limit);
};

const pickCalendarCatalyst = (events = []) => {
  const today = isoDate();
  const tomorrow = addIsoDays(today, 1);
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
    return score(a) - score(b) || calendarSort(a, b);
  })[0] || null;
};

const fetchEconomicCalendar = async () => {
  if (calendarCache?.expires > Date.now()) return calendarCache.data;
  const today = isoDate();
  const tomorrow = addIsoDays(today, 1);
  const weekEnd = addIsoDays(today, 7);
  const url = `https://economic-calendar.tradingview.com/events?from=${today}T00:00:00.000Z&to=${weekEnd}T23:59:59.999Z&countries=US`;

  const promise = fetch(url, {
    headers: {
      Accept: "application/json,text/plain,*/*",
      Origin: "https://www.tradingview.com",
      Referer: "https://www.tradingview.com/economic-calendar/",
      "User-Agent": "Mozilla/5.0 (compatible; OverwatchDesk/1.0)",
    },
    signal: AbortSignal.timeout(9000),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Economic calendar returned ${response.status}`);
    const payload = await response.json();
    const tradingViewEvents = (payload.result || [])
      .map(normalizeCalendarEvent)
      .filter((event) => event.date >= today && event.date <= weekEnd)
      .sort(calendarSort);
    const fedEvents = [];
    for (let day = today; day <= weekEnd; day = addIsoDays(day, 1)) {
      fedEvents.push(...fedFomcEventsForDate(day));
    }
    const events = mergeCalendarEvents([...fedEvents, ...tradingViewEvents]).sort(calendarSort);
    const todayEvents = selectCalendarGroup(events.filter((event) => event.date === today), 5);
    const tomorrowEvents = selectCalendarGroup(events.filter((event) => event.date === tomorrow), 5);
    const upcoming = selectMajorUpcomingEvents(events.filter((event) => event.date > tomorrow), 5);
    return {
      source: fedEvents.length ? "TradingView Economic Calendar + Federal Reserve FOMC calendar" : "TradingView Economic Calendar",
      asOf: new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) + " ET",
      range: { today, tomorrow, weekEnd },
      groups: { today: todayEvents, tomorrow: tomorrowEvents, upcoming },
      flat: [...todayEvents, ...tomorrowEvents, ...upcoming],
    };
  });

  calendarCache = { expires: Date.now() + 10 * 60_000, data: promise };
  try {
    return await promise;
  } catch (error) {
    calendarCache = undefined;
    throw error;
  }
};

const fetchFlowScan = async () => {
  if (flowCache?.expires > Date.now()) return flowCache.data;
  const tickers = FLOW_SYMBOLS.map(([, symbol]) => symbol);
  const promise = fetch("https://scanner.tradingview.com/global/scan", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; OverwatchDesk/1.0)",
    },
    body: JSON.stringify({
      symbols: { tickers, query: { types: [] } },
      columns: ["name", "description", "close", "change", "change_abs", "volume", "relative_volume_10d_calc"],
    }),
    signal: AbortSignal.timeout(9000),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Flow scanner returned ${response.status}`);
    const payload = await response.json();
    return new Map((payload.data || []).map((row) => [
      row.s,
      {
        name: row.d?.[0],
        description: row.d?.[1],
        price: row.d?.[2],
        changePct: row.d?.[3],
        change: row.d?.[4],
        volume: row.d?.[5],
        relativeVolume: row.d?.[6],
      },
    ]));
  });

  flowCache = { expires: Date.now() + 60_000, data: promise };
  try {
    return await promise;
  } catch (error) {
    flowCache = undefined;
    throw error;
  }
};

const quote = async (symbol) => {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d&includePrePost=true`;
  const payload = await fetchJson(url);
  const result = payload?.chart?.result?.[0];
  if (!result) throw new Error(`No quote for ${symbol}`);

  const meta = result.meta || {};
  const bars = result.indicators?.quote?.[0] || {};
  const validCloses = (bars.close || []).filter((value) => Number.isFinite(value));
  const validOpens = (bars.open || []).filter((value) => Number.isFinite(value));
  const price = Number.isFinite(meta.regularMarketPrice) ? meta.regularMarketPrice : validCloses.at(-1);
  const previous = Number.isFinite(meta.chartPreviousClose)
    ? meta.chartPreviousClose
    : validCloses.length > 1
      ? validCloses.at(-2)
      : price;
  const change = price - previous;
  const open = Number.isFinite(meta.regularMarketOpen)
    ? meta.regularMarketOpen
    : validOpens.at(-1);

  return {
    price,
    change,
    changePct: previous ? (change / previous) * 100 : 0,
    dayOpen: Number.isFinite(open) ? open : previous,
    dayLow: Number.isFinite(meta.regularMarketDayLow) ? meta.regularMarketDayLow : (bars.low || []).filter(Number.isFinite).at(-1),
    dayHigh: Number.isFinite(meta.regularMarketDayHigh) ? meta.regularMarketDayHigh : (bars.high || []).filter(Number.isFinite).at(-1),
    previousClose: previous,
    asOf: meta.regularMarketTime || Math.floor(Date.now() / 1000),
  };
};

const fetchMarket = async (watchlist = []) => {
  const requested = watchlist.length ? watchlist : SAMPLE_MARKET.tickers.map(({ symbol, name }) => ({ symbol, name }));
  const fearGreedPromise = fetchFearGreed().catch(() => SAMPLE_FEAR_GREED);
  let scan;
  try {
    scan = await fetchScan();
  } catch {
    return { ...SAMPLE_MARKET, fearGreed: await fearGreedPromise };
  }

  const tickerResults = await Promise.allSettled(
    requested.map(async (item) => {
      const scanSymbol = SYMBOLS[item.symbol];
      const result = scanSymbol && scan.get(scanSymbol)
        ? scan.get(scanSymbol)
        : await quote(item.symbol);
      const precision = item.symbol === "US10Y" ? 3 : 2;
      const dayOpen = Number.isFinite(Number(result.dayOpen))
        ? Number(result.dayOpen)
        : Number.isFinite(Number(result.previousClose))
          ? Number(result.previousClose)
          : null;
      return {
        symbol: item.symbol,
        name: item.name,
        price: round(result.price, precision),
        change: round(result.change, precision),
        changePct: round(result.changePct),
        dayOpen: dayOpen == null ? null : round(dayOpen, precision),
        dayLow: round(result.dayLow, precision),
        dayHigh: round(result.dayHigh, precision),
        previousClose: Number.isFinite(Number(result.previousClose)) ? round(result.previousClose, precision) : null,
      };
    }),
  );

  const tickers = tickerResults.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const sectors = SECTORS.flatMap(([name, symbol]) => {
    const result = scan.get(symbol);
    return result ? [{ name, changePct: round(result.changePct) }] : [];
  });
  if (!tickers.length) return SAMPLE_MARKET;

  const spx = tickers.find((item) => item.symbol === "SPX");
  const ndx = tickers.find((item) => item.symbol === "NDX");
  const vix = tickers.find((item) => item.symbol === "VIX");
  const tone = ((spx?.changePct || 0) + (ndx?.changePct || 0)) / 2;
  const toneLabel = tone > 0.45 ? "risk-on" : tone < -0.45 ? "defensive" : "mixed";
  const vixLabel = vix?.price > 25 ? "with elevated volatility" : vix?.price < 16 ? "with subdued volatility" : "with a normal volatility backdrop";
  const fearGreed = await fearGreedPromise;
  const asOf = new Date().toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  }) + " ET";

  return {
    asOf,
    summary: `The tape is ${toneLabel} ${vixLabel}; leadership is ${sectors[0]?.changePct >= 0 ? "selective rather than absent" : "under pressure across the board"}.`,
    tickers,
    sectors: sectors.length ? sectors : SAMPLE_MARKET.sectors,
    fearGreed,
  };
};

const textHas = (text, words) => words.some((word) => text.includes(word));

const classifyHeadline = (title) => {
  const text = title.toLowerCase();
  const negative = ["fall", "drop", "sell", "threat", "war", "inflation", "higher", "slump", "risk", "fear", "tariff", "down", "miss", "warning", "loss", "recession", "default", "attack"];
  const positive = ["rise", "rally", "gain", "surge", "cool", "cut", "record", "rebound", "up", "beat", "optimism", "soft landing", "eases", "deal"];
  const bearish = negative.some((word) => text.includes(word));
  const bullish = positive.some((word) => text.includes(word));
  const category = /fed|fomc|powell|rate|inflation|cpi|ppi|jobs|payroll|econom|treasury|yield/.test(text)
    ? "macro"
    : /earnings|revenue|profit|guidance/.test(text)
      ? "earnings"
      : /war|iran|china|russia|trump|tariff|geopolitical|sanction|attack/.test(text)
        ? "geopolitical"
        : /vix|volatility|options|put\/call|hedge/.test(text)
          ? "volatility"
          : /nasdaq|s&p|dow|stock|market|futures|technical/.test(text)
          ? "technical"
          : "flows";
  const impact = /fed|fomc|powell|inflation|cpi|ppi|jobs|payroll|war|iran|tariff|treasury|yield|vix/.test(text)
    ? 5
    : /earnings|nasdaq|s&p|dow|futures|nvidia|apple|microsoft|oil|crude|dollar/.test(text)
      ? 4
      : 3;
  return {
    category,
    sentiment: bearish && !bullish ? "bearish" : bullish && !bearish ? "bullish" : "neutral",
    impact,
  };
};

const headlineTickers = (title) => {
  const text = title.toLowerCase();
  const tags = [];
  if (/s&p|spx|es\b|stock market|futures/.test(text)) tags.push("SPX", "ES");
  if (/nasdaq|ndx|nq\b|tech|nvidia|apple|microsoft|meta|amazon|tesla|semiconductor|chip/.test(text)) tags.push("NDX", "NQ");
  if (/dow|dji|ym\b|industrial/.test(text)) tags.push("DJI", "YM");
  if (/vix|volatility|options|put\/call/.test(text)) tags.push("VIX");
  if (/treasury|yield|fed|rate|cpi|ppi|inflation|jobs|payroll/.test(text)) tags.push("US10Y");
  if (/oil|crude|energy|opec/.test(text)) tags.push("CL");
  if (/dollar|greenback|currency/.test(text)) tags.push("DXY");
  if (/gold|safe haven/.test(text)) tags.push("GC");
  if (/bitcoin|crypto/.test(text)) tags.push("BTC");
  return Array.from(new Set(tags)).slice(0, 5);
};

const headlineNote = ({ category, impact, sentiment, tickers }) => {
  const direction = sentiment === "bullish" ? "constructive" : sentiment === "bearish" ? "defensive" : "two-sided";
  const target = tickers.length ? tickers.join("/") : "index risk";
  if (impact >= 5) return `High-priority ${category} catalyst; treat as ${direction} for ${target} until price confirms otherwise.`;
  if (impact === 4) return `Important ${category} input for ${target}; watch whether it changes breadth, rates, or volatility.`;
  return `Secondary ${category} context; useful color, but price action still gets the final vote.`;
};

const catalystStack = (headlines) => {
  const grouped = new Map();
  for (const item of headlines) {
    const group = grouped.get(item.category) || { category: item.category, count: 0, maxImpact: 0, bull: 0, bear: 0 };
    group.count += 1;
    group.maxImpact = Math.max(group.maxImpact, item.impact || 0);
    if (item.sentiment === "bullish") group.bull += 1;
    if (item.sentiment === "bearish") group.bear += 1;
    grouped.set(item.category, group);
  }
  return Array.from(grouped.values())
    .map((group) => ({
      category: group.category,
      count: group.count,
      maxImpact: group.maxImpact,
      sentiment: group.bear > group.bull ? "bearish" : group.bull > group.bear ? "bullish" : "neutral",
    }))
    .sort((a, b) => b.maxImpact - a.maxImpact || b.count - a.count);
};

const fetchNews = async () => {
  if (newsCache?.expires > Date.now()) return newsCache.data;

  const promise = (async () => {
  try {
    const queries = [
      "^GSPC",
      "^NDX",
      "^DJI",
      "^VIX",
      "^TNX",
      "ES=F",
      "NQ=F",
      "YM=F",
      "Fed rates inflation CPI jobs Treasury",
      "stock market futures Nasdaq Dow S&P 500",
      "Nvidia Apple Microsoft earnings Nasdaq",
      "oil dollar gold market geopolitics tariffs",
    ];
    const payloads = await Promise.allSettled(
      queries.map((query) => fetchJson(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=0&newsCount=10`)),
    );
    const seen = new Set();
    const relevant = /market|stocks|s&p|spx|nasdaq|ndx|dow|dji|fed|inflation|cpi|ppi|rates|treasury|yield|futures|vix|volatility|iran|oil|crude|trump|tariff|economy|jobs|dollar|bitcoin|gold|nvidia|apple|microsoft|earnings|chips|semiconductor/i;
    const falsePositive = /tire inflation|roadside|jump start|jump-start|charging station|fast charging|power bank|portable charger|battery pack|electric vehicle charging/i;
    const sourceItems = payloads
      .flatMap((result) => result.status === "fulfilled" ? result.value.news || [] : [])
      .filter((item) => {
        const title = String(item.title || "").trim();
        const key = title.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
        if (!title || seen.has(key) || !relevant.test(title) || falsePositive.test(title)) return false;
        seen.add(key);
        return true;
      });
    const headlines = sourceItems.map((item) => {
      const read = classifyHeadline(item.title || "");
      const tickers = headlineTickers(item.title || "");
      const ageHours = item.providerPublishTime ? Math.max(0, (Date.now() / 1000 - item.providerPublishTime) / 3600) : 12;
      const urgency = read.impact >= 5 || ageHours < 2 ? "high" : read.impact >= 4 || ageHours < 8 ? "medium" : "low";
      return {
        title: item.title,
        source: item.publisher || "Market wire",
        timeAgo: timeAgo(item.providerPublishTime || Math.floor(Date.now() / 1000)),
        url: item.link || null,
        providerPublishTime: item.providerPublishTime || 0,
        urgency,
        tickers,
        ...read,
        note: headlineNote({ ...read, tickers }),
      };
    })
      .sort((a, b) => (b.impact - a.impact) || (b.providerPublishTime - a.providerPublishTime))
      .slice(0, 14)
      .map(({ providerPublishTime, ...item }, index) => ({ ...item, rank: index + 1 }));
    if (!headlines.length) throw new Error("No headlines");
    const bullish = headlines.filter((item) => item.sentiment === "bullish").length;
    const bearish = headlines.filter((item) => item.sentiment === "bearish").length;
    const highImpact = headlines.filter((item) => item.impact >= 5).length;
    const catalysts = catalystStack(headlines);
    const mood = bearish > bullish
      ? "Headline risk is leaning defensive, with catalysts favoring patience and tighter risk."
      : bullish > bearish
        ? "The wire is constructive, though price confirmation remains the final vote."
        : "The wire is balanced and likely to reward level-driven trading over narrative chasing.";
    const watchlist = headlines
      .filter((item) => item.impact >= 4)
      .slice(0, 5)
      .map((item) => `${item.tickers?.length ? `${item.tickers.join("/")} — ` : ""}${item.note}`);
    return {
      mood,
      sourceCount: sourceItems.length,
      lastUpdated: new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) + " ET",
      brief: `${headlines.length} filtered headlines across ${catalysts.length} catalyst buckets; ${highImpact} high-impact items currently lead the tape.`,
      watchlist,
      catalysts,
      headlines,
    };
  } catch {
    return SAMPLE_NEWS;
  }
  })();

  newsCache = { expires: Date.now() + 60_000, data: promise };
  try {
    return await promise;
  } catch (error) {
    newsCache = undefined;
    throw error;
  }
};

const indexLevels = (item) => {
  if (!item) return null;
  const price = Number(item.price);
  const high = Number(item.dayHigh);
  const low = Number(item.dayLow);
  if (![price, high, low].every(Number.isFinite)) return null;
  const range = Math.max(high - low, price * 0.0025);
  const pivot = (high + low + price) / 3;
  return {
    spot: round(price, 0),
    pivot: round(pivot, 0),
    changePct: round(item.changePct),
    dayLow: round(low, 0),
    dayHigh: round(high, 0),
    supports: [low, price - range * 0.65, price - range].map((value) => round(value, 0)).sort((a, b) => b - a),
    resistances: [high, Math.max(pivot, high + range * 0.35), high + range].map((value) => round(value, 0)).sort((a, b) => a - b),
  };
};

const avg = (values) => {
  const clean = values.filter((value) => Number.isFinite(Number(value))).map(Number);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
};

const buildInternals = ({ spx, ndx, dji, vix, sectors = [], fearGreed }) => {
  const sectorRows = sectors
    .filter((item) => item && Number.isFinite(Number(item.changePct)))
    .map((item) => ({ name: item.name, changePct: round(item.changePct) }))
    .sort((a, b) => b.changePct - a.changePct);
  const total = sectorRows.length || 11;
  const advancers = sectorRows.filter((item) => item.changePct > 0).length;
  const decliners = sectorRows.filter((item) => item.changePct < 0).length;
  const flat = Math.max(0, total - advancers - decliners);
  const pctPositive = total ? round((advancers / total) * 100, 0) : 0;
  const avgSectorChange = round(avg(sectorRows.map((item) => item.changePct)));
  const breadthScore = round(clamp((pctPositive - 50) * 1.65 + avgSectorChange * 24, -100, 100), 0);
  const breadthTone = pctPositive >= 70
    ? "broad participation"
    : pctPositive <= 35
      ? "narrow or defensive participation"
      : "mixed participation";
  const distribution = {
    strongUp: sectorRows.filter((item) => item.changePct >= 1).length,
    up: sectorRows.filter((item) => item.changePct > 0 && item.changePct < 1).length,
    flat,
    down: sectorRows.filter((item) => item.changePct < 0 && item.changePct > -1).length,
    strongDown: sectorRows.filter((item) => item.changePct <= -1).length,
  };

  const indexTone = round(avg([spx?.changePct, ndx?.changePct, dji?.changePct]));
  const vixPrice = Number(vix?.price);
  const vixAdjustment = Number.isFinite(vixPrice)
    ? vixPrice >= 30 ? -25 : vixPrice >= 25 ? -16 : vixPrice <= 16 ? 10 : 0
    : 0;
  const trendScore = round(clamp(indexTone * 38 + breadthScore * 0.45 + vixAdjustment, -100, 100), 0);
  const trend = trendScore >= 22 ? "uptrend" : trendScore <= -22 ? "downtrend" : "range";
  const trendRead = trend === "uptrend"
    ? `Trend is constructive: index direction is positive and ${breadthTone} is helping the move hold.`
    : trend === "downtrend"
      ? `Trend is defensive: index pressure and ${breadthTone} argue against chasing bounces without confirmation.`
      : `Trend is range-bound: index direction and breadth are not aligned enough to make a clean directional call.`;

  const structure = vixPrice < 19 ? "contango" : vixPrice < 27 ? "flat" : "backwardation";
  const volZone = !Number.isFinite(vixPrice)
    ? "unknown"
    : vixPrice < 16
      ? "calm"
      : vixPrice < 21
        ? "normal"
        : vixPrice < 27
          ? "elevated"
          : "stress";
  const volScore = Number.isFinite(vixPrice)
    ? round(clamp((vixPrice - 18) * 7 + (structure === "backwardation" ? 22 : structure === "contango" ? -12 : 6), -100, 100), 0)
    : 0;
  const volRead = structure === "backwardation"
    ? "Front-loaded volatility is warning that liquidity can stay unstable and failed breaks can travel fast."
    : structure === "contango"
      ? "Volatility is orderly enough for levels to matter, as long as breadth confirms the move."
      : "Volatility is balanced to elevated, so direction needs confirmation before adding risk.";

  const putCall = fearGreed?.components?.putCall?.value ?? null;
  const putCallRead = putCall == null
    ? "Public quote mode does not include the latest CBOE ratio."
    : Number(putCall) >= 1
      ? "Options demand is defensive; elevated put demand can amplify downside hedging."
      : Number(putCall) <= 0.65
        ? "Options demand is complacent; low put demand can leave the tape vulnerable to a vol reset."
        : "Options demand is balanced; not a dominant signal by itself.";

  return {
    putCall,
    putCallRead,
    breadth: sectorRows.length ? `${advancers}/${total} sector ETFs positive (${pctPositive}%); ${breadthTone}.` : "Sector ETF performance is used as the live breadth proxy.",
    trend,
    summary: `${trendRead} Breadth score ${breadthScore}; volatility score ${volScore}.`,
    breadthDetail: {
      advancers,
      decliners,
      flat,
      total,
      pctPositive,
      avgChange: avgSectorChange,
      score: breadthScore,
      tone: breadthTone,
      read: sectorRows.length
        ? `${advancers} of ${total} sectors are green. Average sector change is ${signed(avgSectorChange, 2, "%")}.`
        : "Breadth detail is unavailable in the current quote mode.",
      strongest: sectorRows.slice(0, 3),
      weakest: sectorRows.slice(-3).reverse(),
      distribution,
      sectors: sectorRows,
    },
    trendDetail: {
      state: trend,
      score: trendScore,
      indexTone,
      spxChange: Number.isFinite(Number(spx?.changePct)) ? round(spx.changePct) : null,
      ndxChange: Number.isFinite(Number(ndx?.changePct)) ? round(ndx.changePct) : null,
      djiChange: Number.isFinite(Number(dji?.changePct)) ? round(dji.changePct) : null,
      read: trendRead,
      components: [
        `Index tone ${signed(indexTone, 2, "%")}`,
        `Breadth score ${breadthScore}`,
        Number.isFinite(vixPrice) ? `VIX ${round(vixPrice, 1)} ${volZone}` : "VIX unavailable",
      ],
    },
    volDetail: {
      vix: Number.isFinite(vixPrice) ? round(vixPrice, 1) : null,
      structure,
      zone: volZone,
      score: volScore,
      read: volRead,
      bands: [
        { label: "Calm", min: 0, max: 16 },
        { label: "Normal", min: 16, max: 21 },
        { label: "Elevated", min: 21, max: 27 },
        { label: "Stress", min: 27, max: 40 },
      ],
    },
  };
};

const flowRead = (symbol, changePct, relativeVolume) => {
  const chg = Number(changePct) || 0;
  const rel = Number(relativeVolume) || 0;
  const participation = rel >= 1.15 ? "with active participation" : rel <= 0.75 ? "on light participation" : "with normal participation";
  if (symbol === "QQQ") return chg >= 0 ? `Growth leadership is bid ${participation}.` : `Growth leadership is under pressure ${participation}.`;
  if (symbol === "DIA") return chg >= 0 ? `Dow/value exposure is cushioning the tape ${participation}.` : `Dow/value exposure is not insulating risk ${participation}.`;
  if (symbol === "IWM") return chg >= 0 ? `Small caps are confirming risk appetite ${participation}.` : `Small caps are lagging, a breadth warning ${participation}.`;
  if (symbol === "HYG") return chg >= 0 ? `High-yield credit is confirming risk appetite ${participation}.` : `High-yield credit is not confirming a clean risk-on tape ${participation}.`;
  if (symbol === "TLT") return chg >= 0 ? `Duration demand is firm, usually a defensive/rates bid signal ${participation}.` : `Duration is selling off, usually a rates-pressure signal ${participation}.`;
  if (symbol === "GLD") return chg >= 0 ? `Gold is bid, suggesting hedge demand is present ${participation}.` : `Gold is softer, suggesting less haven urgency ${participation}.`;
  if (symbol === "UUP") return chg >= 0 ? `Dollar strength is a headwind for global risk ${participation}.` : `Dollar softness is easing one macro headwind ${participation}.`;
  return chg >= 0 ? `${symbol} is bid ${participation}.` : `${symbol} is offered ${participation}.`;
};

const buildPositioning = ({ flowScan, fearGreed, sectors = [] }) => {
  if (!flowScan) return SAMPLE_POSITIONING;
  const flows = FLOW_SYMBOLS.flatMap(([symbol, tvSymbol, label]) => {
    const item = flowScan.get(tvSymbol);
    return item ? [{
      symbol,
      label,
      price: round(item.price),
      changePct: round(item.changePct),
      change: round(item.change),
      volume: Number.isFinite(Number(item.volume)) ? Math.round(Number(item.volume)) : null,
      relativeVolume: Number.isFinite(Number(item.relativeVolume)) ? round(item.relativeVolume, 2) : null,
      read: flowRead(symbol, item.changePct, item.relativeVolume),
    }] : [];
  });

  const bySymbol = (symbol) => flows.find((item) => item.symbol === symbol);
  const qqq = bySymbol("QQQ");
  const spy = bySymbol("SPY");
  const dia = bySymbol("DIA");
  const iwm = bySymbol("IWM");
  const hyg = bySymbol("HYG");
  const tlt = bySymbol("TLT");
  const gld = bySymbol("GLD");
  const uup = bySymbol("UUP");

  const riskScore =
    (Number(spy?.changePct || 0) * 1.0) +
    (Number(qqq?.changePct || 0) * 0.9) +
    (Number(iwm?.changePct || 0) * 0.6) +
    (Number(hyg?.changePct || 0) * 0.8) -
    (Number(tlt?.changePct || 0) * 0.45) -
    (Number(gld?.changePct || 0) * 0.25) -
    (Number(uup?.changePct || 0) * 0.4);
  const posture = riskScore > 0.75 ? "risk-on" : riskScore < -0.75 ? "defensive" : "mixed";
  const growthVsDow = round((Number(qqq?.changePct || 0) - Number(dia?.changePct || 0)), 2);
  const creditVsDuration = round((Number(hyg?.changePct || 0) - Number(tlt?.changePct || 0)), 2);
  const positiveSectors = sectors.filter((item) => item.changePct > 0).length;
  const components = fearGreed?.components || {};
  const signal = (label, item, note) => ({
    label,
    value: item?.value == null ? (item?.score == null ? "—" : String(item.score)) : String(item.value),
    score: item?.score ?? null,
    tone: item?.rating || "neutral",
    note,
  });
  const signals = [
    signal("Put/call pressure", components.putCall, "Lower scores imply more defensive options demand."),
    signal("Junk bond demand", components.junkBondDemand, "Credit demand is a direct risk-appetite check."),
    signal("Safe-haven demand", components.safeHavenDemand, "Haven demand rising into equity weakness confirms stress."),
    signal("Market momentum", components.marketMomentum, "SPX momentum component helps separate pullbacks from trend breaks."),
    signal("Stock breadth", components.stockBreadth, "Breadth score tests whether index moves have real participation."),
  ];
  const notes = [
    `Growth vs Dow spread is ${growthVsDow >= 0 ? "+" : ""}${growthVsDow} pts; ${growthVsDow >= 0 ? "Nasdaq leadership is helping" : "Dow/value is outperforming growth"}.`,
    `Credit vs duration spread is ${creditVsDuration >= 0 ? "+" : ""}${creditVsDuration} pts; ${creditVsDuration >= 0 ? "credit is more constructive than bonds" : "bond demand is outpacing credit risk"}.`,
    `${positiveSectors}/${sectors.length || 11} sectors are positive; breadth ${positiveSectors >= 7 ? "leans supportive" : positiveSectors <= 4 ? "leans fragile" : "is mixed"}.`,
  ];

  return {
    source: "TradingView ETF proxies + CNN Fear & Greed components",
    summary: `Positioning proxy is ${posture}: ${qqq?.read || "growth tape mixed"} ${hyg?.read || ""}`,
    posture,
    score: round(riskScore, 2),
    flows,
    signals,
    notes,
  };
};

const fetchPoints = async () => {
  try {
    const calendarPromise = fetchEconomicCalendar().catch(() => buildSampleCalendar());
    const flowPromise = fetchFlowScan().catch(() => null);
    const fearGreedPromise = fetchFearGreed().catch(() => SAMPLE_FEAR_GREED);
    const scan = await fetchScan();
    const spx = scan.get(SYMBOLS.SPX);
    const ndx = scan.get(SYMBOLS.NDX);
    const dji = scan.get(SYMBOLS.DJI);
    const vix = scan.get(SYMBOLS.VIX);
    if (!spx || !vix) throw new Error("Missing index data");
    const sectors = SECTORS.flatMap(([name, symbol]) => {
      const result = scan.get(symbol);
      return result ? [{ name, changePct: round(result.changePct) }] : [];
    });
    const calendarData = await calendarPromise;
    const fearGreed = await fearGreedPromise;
    const internals = buildInternals({ spx, ndx, dji, vix, sectors, fearGreed });
    const positioning = buildPositioning({ flowScan: await flowPromise, fearGreed, sectors });
    return {
      spx: indexLevels(spx),
      ndx: indexLevels(ndx),
      dji: indexLevels(dji),
      vix: {
        spot: round(vix.price),
        structure: internals.volDetail.structure,
        note: internals.volDetail.structure === "contango"
          ? "The volatility curve is consistent with orderly risk pricing."
          : internals.volDetail.structure === "backwardation"
            ? "Front-loaded volatility points to immediate stress and unstable liquidity."
            : "Volatility is elevated enough to demand confirmation at key levels.",
      },
      internals,
      calendar: calendarData.flat,
      calendarGroups: calendarData.groups,
      calendarSource: calendarData.source,
      positioning,
    };
  } catch {
    const sample = (symbol) => SAMPLE_MARKET.tickers.find((item) => item.symbol === symbol);
    const spx = sample("SPX");
    const ndx = sample("NDX");
    const dji = sample("DJI");
    const vix = SAMPLE_MARKET.tickers.find((item) => item.symbol === "VIX") || SAMPLE_MARKET.tickers[6];
    const internals = buildInternals({ spx, ndx, dji, vix, sectors: SAMPLE_MARKET.sectors, fearGreed: SAMPLE_FEAR_GREED });
    const sampleCalendar = buildSampleCalendar();
    return {
      spx: indexLevels(spx) || { spot: spx.price, pivot: 7342, supports: [7298, 7260, 7215], resistances: [7397, 7440, 7485] },
      ndx: indexLevels(ndx) || { spot: 26402, pivot: 26498, supports: [26280, 26150, 26020], resistances: [26812, 26990, 27160] },
      dji: indexLevels(dji) || { spot: 52000, pivot: 51968, supports: [51713, 51540, 51370], resistances: [52190, 52360, 52530] },
      vix: { spot: vix.price, structure: internals.volDetail.structure, note: "Sample volatility state: elevated enough to keep intraday ranges wide." },
      internals,
      calendar: sampleCalendar.flat,
      calendarGroups: sampleCalendar.groups,
      calendarSource: sampleCalendar.source,
      positioning: SAMPLE_POSITIONING,
    };
  }
};

const cleanModelJson = (text) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
};

const callAnthropic = async (prompt) => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1600,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error(`Anthropic returned ${response.status}`);
  const payload = await response.json();
  const text = (payload.content || []).filter((item) => item.type === "text").map((item) => item.text).join("\n");
  return cleanModelJson(text);
};

const avgChangeForSymbols = (tickers, symbols) => {
  const values = symbols
    .map((symbol) => tickers.find((item) => item.symbol === symbol)?.changePct)
    .filter((value) => Number.isFinite(Number(value)))
    .map(Number);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
};

const FACTOR_LABELS = {
  technicals: "Technicals",
  macro: "Macro/News",
  sentiment: "Sentiment",
  positioning: "Positioning/Flows",
  eventRisk: "Event Risk",
};

const DEFAULT_FACTOR_WEIGHTS = { technicals: 70, macro: 60, sentiment: 45, positioning: 50, eventRisk: 55 };

const normalizeWeights = (weights = {}) => Object.fromEntries(
  Object.keys(DEFAULT_FACTOR_WEIGHTS).map((key) => [
    key,
    clamp(Number.isFinite(Number(weights[key])) ? Number(weights[key]) : DEFAULT_FACTOR_WEIGHTS[key], 0, 100),
  ]),
);

const summarizeWeights = (weights = {}) => Object.entries(normalizeWeights(weights))
  .sort((a, b) => b[1] - a[1])
  .map(([key, value]) => `${FACTOR_LABELS[key]} ${value}`)
  .join(", ");

const calendarRiskScore = (points = {}) => {
  const groups = points?.calendarGroups || {};
  const events = [...(groups.today || []), ...(groups.tomorrow || []), ...(groups.upcoming || [])];
  const high = events.filter((event) => event.importance === "high").length;
  const fomc = events.some(isFomcEvent) ? 1 : 0;
  return clamp(high * 5 + fomc * 14, 0, 45);
};

const positioningScore = (points = {}) => {
  const pos = points?.positioning;
  if (pos && typeof pos === "object" && Number.isFinite(Number(pos.score))) {
    return round(clamp(Number(pos.score) * 24, -100, 100), 0);
  }
  if (pos?.posture === "risk-on") return 35;
  if (pos?.posture === "defensive") return -35;
  return 0;
};

const buildWeightedPillars = (factorValues, weights) => {
  const normalized = normalizeWeights(weights);
  const totalWeight = Object.keys(factorValues).reduce((sum, key) => sum + Number(normalized[key] ?? 0), 0) || 1;
  const rows = Object.keys(factorValues).map((key) => {
    const score = round(clamp(Number(factorValues[key] || 0), -100, 100), 0);
    const weight = Number(normalized[key] ?? 0);
    return {
      key,
      label: FACTOR_LABELS[key] || key,
      score,
      weight,
      contribution: round((score * weight) / totalWeight, 1),
    };
  });
  return {
    weights: normalized,
    rows,
    baseScore: round(rows.reduce((sum, row) => sum + row.contribution, 0), 1),
  };
};

const applyDeskStance = (baseScore, lean = "auto", risk = "balanced") => {
  const cleanLean = ["auto", "bull", "bear", "neutral"].includes(lean) ? lean : "auto";
  const cleanRisk = ["defensive", "balanced", "aggressive"].includes(risk) ? risk : "balanced";
  const leanAdjustment = cleanLean === "bull"
    ? 10
    : cleanLean === "bear"
      ? -10
      : cleanLean === "neutral"
        ? -baseScore * 0.35
        : 0;
  const riskMultiplier = cleanRisk === "aggressive" ? 1.12 : cleanRisk === "defensive" ? 0.82 : 1;
  return {
    lean: cleanLean,
    risk: cleanRisk,
    leanAdjustment: round(leanAdjustment, 1),
    riskMultiplier,
    adjustedScore: round(clamp((baseScore + leanAdjustment) * riskMultiplier, -100, 100), 0),
  };
};

const stanceRead = ({ lean, risk, baseScore, finalScore }) => {
  const dataDirection = baseScore >= 12 ? "bullish" : baseScore <= -12 ? "bearish" : "neutral";
  const finalDirection = finalScore >= 12 ? "bullish" : finalScore <= -12 ? "bearish" : "neutral";
  const leanDirection = lean === "bull" ? "bullish" : lean === "bear" ? "bearish" : lean;
  const leanLabel = lean === "bull" ? "bullish" : lean === "bear" ? "bearish" : lean;
  const leanText = lean === "auto"
    ? "Desk lean is set to auto, so the call is driven by the weighted data."
    : leanDirection === dataDirection
      ? `Desk lean is ${leanLabel}, which agrees with the weighted data.`
      : `Desk lean is ${leanLabel}, but the weighted data is ${dataDirection}; the output keeps that conflict visible.`;
  const riskText = risk === "defensive"
    ? "Defensive risk appetite dampens the final score and raises the bar for conviction."
    : risk === "aggressive"
      ? "Aggressive risk appetite allows more follow-through if the weighted pillars align."
      : "Balanced risk appetite leaves the weighted score unchanged.";
  return `${leanText} ${riskText} Final stance is ${finalDirection}.`;
};

const currentSessionLabel = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value || "";
  const weekday = get("weekday");
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  if (["Sat", "Sun"].includes(weekday)) return "CLOSED";
  if (mins >= 240 && mins < 570) return "PRE-MARKET";
  if (mins >= 570 && mins < 960) return "MARKET OPEN";
  if (mins >= 960 && mins < 1200) return "AFTER-HOURS";
  return "CLOSED";
};

const timingContext = (timing = {}, market = {}) => {
  const session = timing.session || currentSessionLabel();
  const generatedAt = timing.generatedAt || `${new Date().toLocaleString("en-US", { timeZone: "America/New_York", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })} ET`;
  const staleCashRisk = timing.staleCashRisk ?? session !== "MARKET OPEN";
  const note = timing.timingNote || (staleCashRisk
    ? `${session}: generated ${generatedAt}. Cash indexes may reflect the last regular close while ES/NQ/YM futures continue trading.`
    : `${session}: generated ${generatedAt}. Cash indexes and futures should both be treated as live, with quote timestamp ${market.asOf || "unavailable"}.`);
  return {
    ...timing,
    session,
    generatedAt,
    generatedAtShort: timing.generatedAtShort || new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) + " ET",
    staleCashRisk,
    timingNote: note,
  };
};

const marketImpactForEvent = (event = {}) => {
  const text = String(event.event || "").toLowerCase();
  if (/fomc|fed|rate decision|press conference|projection/.test(text)) return "Fed communication can reprice yields, volatility, and equity multiples quickly.";
  if (/cpi|pce|ppi|inflation/.test(text)) return "Inflation surprises can reset rate expectations and pressure index valuation.";
  if (/payroll|jobs|jobless|unemployment|claims/.test(text)) return "Labor data can swing soft-landing expectations and Treasury yields.";
  if (/retail sales|consumer confidence/.test(text)) return "Consumer data affects growth expectations and discretionary leadership.";
  if (/gdp|ism|pmi|philadelphia fed|richmond fed|manufacturing|services/.test(text)) return "Growth data helps confirm whether cyclicals and risk appetite deserve trust.";
  if (/auction|treasury|tips|bill/.test(text)) return "Treasury supply can move yields and tighten or loosen financial conditions.";
  if (/balance sheet/.test(text)) return "Liquidity data can shape the market's read on financial conditions.";
  return event.note || "This is a secondary input unless it changes yields, volatility, or breadth.";
};

const buildMarketOutlook = ({ news, points, timing }) => {
  const timingRead = timingContext(timing);
  const recent = (news?.headlines || [])
    .filter((item) => item && item.title)
    .sort((a, b) => (b.impact || 0) - (a.impact || 0))
    .slice(0, 2)
    .map((item) => `${item.title}: ${item.note || "watch whether the headline changes index breadth, rates, or volatility."}`);
  const groups = points?.calendarGroups || {};
  const current = [...(groups.today || [])]
    .sort((a, b) => calendarPriority(a) - calendarPriority(b) || calendarSort(a, b))
    .slice(0, 2)
    .map((event) => `${event.time ? `${event.time} ` : ""}${event.event}: ${marketImpactForEvent(event)}`);
  const upcoming = [...(groups.tomorrow || []), ...(groups.upcoming || [])]
    .sort((a, b) => calendarPriority(a) - calendarPriority(b) || calendarSort(a, b))
    .slice(0, 2)
    .map((event) => `${event.date ? `${event.date} ` : ""}${event.time ? `${event.time} ` : ""}${event.event}: ${marketImpactForEvent(event)}`);
  const recentLine = recent.length ? `Recent: ${recent.join(" ")}` : "Recent: the latest headline stack is not fully resolved.";
  const currentLine = current.length ? `Current: ${current.join(" ")}` : "Current: no major same-day catalyst is queued in the latest calendar pull.";
  const upcomingLine = upcoming.length ? `Upcoming: ${upcoming.join(" ")}` : "Upcoming: no major weekly event is queued in the latest calendar pull.";
  const timingLine = timingRead.staleCashRisk ? ` Because this was generated during ${timingRead.session}, validate futures against stale cash-index levels before reacting to catalysts.` : "";
  return `${recentLine} ${currentLine} ${upcomingLine}${timingLine}`;
};

const THESIS_INSTRUMENTS = {
  SPX: { symbol: "SPX", name: "S&P 500", futures: "ES", pointsKey: "spx" },
  NDX: { symbol: "NDX", name: "Nasdaq 100", futures: "NQ", pointsKey: "ndx" },
  DJI: { symbol: "DJI", name: "Dow Jones Industrial Average", futures: "YM", pointsKey: "dji" },
};

const getThesisInstrument = (instrument = "SPX") => THESIS_INSTRUMENTS[instrument] || THESIS_INSTRUMENTS.SPX;

const makeThesis = ({ market, news, points, timing, weights = {}, lean = "auto", risk = "balanced", notes = "", instrument = "SPX" }) => {
  const focus = getThesisInstrument(instrument);
  const tickers = market?.tickers || [];
  const indexChanges = ["SPX", "DJI", "ES", "NQ", "YM", "NDX"].map((symbol) => tickers.find((item) => item.symbol === symbol)?.changePct).filter(Number.isFinite);
  const cashTape = avgChangeForSymbols(tickers, ["SPX", "NDX", "DJI"]);
  const futuresTape = avgChangeForSymbols(tickers, ["ES", "NQ", "YM"]);
  const timingRead = timingContext(timing, market);
  const tape = timingRead.staleCashRisk && Number.isFinite(futuresTape)
    ? round((futuresTape * 0.7) + ((Number.isFinite(cashTape) ? cashTape : futuresTape) * 0.3), 2)
    : indexChanges.length
      ? indexChanges.reduce((sum, value) => sum + value, 0) / indexChanges.length
      : 0;
  const headlines = news?.headlines || [];
  const newsScore = headlines.length
    ? (headlines.filter((item) => item.sentiment === "bullish").length - headlines.filter((item) => item.sentiment === "bearish").length) / headlines.length * 100
    : 0;
  const trendScore = Number.isFinite(Number(points?.internals?.trendDetail?.score))
    ? Number(points.internals.trendDetail.score)
    : points?.internals?.trend === "uptrend" ? 55 : points?.internals?.trend === "downtrend" ? -55 : 0;
  const breadthScore = Number.isFinite(Number(points?.internals?.breadthDetail?.score))
    ? Number(points.internals.breadthDetail.score)
    : 0;
  const vixScore = (points?.vix?.spot || 20) > 28 ? -65 : (points?.vix?.spot || 20) < 16 ? 35 : -10;
  const volScore = Number.isFinite(Number(points?.internals?.volDetail?.score))
    ? -Number(points.internals.volDetail.score)
    : vixScore;
  const eventPenalty = calendarRiskScore(points);
  const posScore = positioningScore(points);
  const factorValues = {
    technicals: clamp(tape * 34 + trendScore * 0.58 + breadthScore * 0.5, -100, 100),
    macro: clamp(newsScore * 0.8 - eventPenalty * 0.35, -100, 100),
    sentiment: clamp(newsScore * 0.55 + tape * 16 + breadthScore * 0.22, -100, 100),
    positioning: posScore,
    eventRisk: clamp(volScore - eventPenalty, -100, 100),
  };
  const weighted = buildWeightedPillars(factorValues, weights);
  const stance = applyDeskStance(weighted.baseScore, lean, risk);
  const score = stance.adjustedScore;
  const bias = score >= 12 ? "bullish" : score <= -12 ? "bearish" : "neutral";
  const alignedPillars = weighted.rows.filter((row) => Math.sign(row.score || 0) === Math.sign(score || 0)).length;
  const alignmentBoost = alignedPillars >= 4 ? 1 : alignedPillars <= 2 ? -1 : 0;
  const riskConviction = stance.risk === "aggressive" ? 1 : stance.risk === "defensive" ? -1 : 0;
  const conviction = clamp(Math.round(Math.abs(score) / 12) + 3 + alignmentBoost + riskConviction - (eventPenalty >= 25 ? 1 : 0), 3, stance.risk === "defensive" ? 8 : 10);
  const focusPoints = points?.[focus.pointsKey] || {};
  const pivot = focusPoints.pivot || focusPoints.spot;
  const topContributors = [...weighted.rows].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 3);
  const pillarRead = `Top weighted pillars: ${topContributors.map((row) => `${row.label} ${row.score >= 0 ? "+" : ""}${row.score} at ${row.weight}% weight`).join("; ")}.`;
  const stanceSummary = stanceRead({ ...stance, baseScore: weighted.baseScore, finalScore: score });
  const headline = bias === "bullish"
    ? "Buyers hold the pivot, but breadth must confirm"
    : bias === "bearish"
      ? "Defensive tape keeps rallies on a short leash"
      : "Mixed signals make the pivot the whole trade";
  const action = pivot
    ? `${round(pivot, 0)} is the decision point: acceptance ${bias === "bearish" ? "below" : "above"} it confirms the primary scenario.`
    : "Use the opening range as the decision point and wait for acceptance.";
  const upside = (focusPoints.resistances || []).length ? (focusPoints.resistances || []).join(" / ") : "First resistance, then the prior session high.";
  const downside = (focusPoints.supports || []).length ? (focusPoints.supports || []).join(" / ") : "First support, then the prior session low.";
  const leanPhrase = stance.lean === "auto" ? "auto stance" : `${stance.lean} directional lean`;

  return {
    instrument: focus.symbol,
    bias,
    score,
    conviction,
    timestamp: `${timingRead.generatedAtShort} · ${timingRead.session}`,
    timingNote: timingRead.timingNote,
    headline,
    summary: `The ${timingRead.staleCashRisk ? "futures-adjusted" : "index"} tape is averaging ${round(tape)}% while the headline balance scores ${Math.round(newsScore)}. ${points?.internals?.trendDetail?.read || `The live trend read is ${points?.internals?.trend || "range"}.`} ${pillarRead} ${stanceSummary} That combination produces a ${bias} call with ${conviction}/10 conviction for ${focus.symbol}${notes ? ", with the desk note treated as a secondary constraint" : ""}.`,
    pillarRead,
    stanceRead: stanceSummary,
    pillarWeights: weighted.weights,
    pillarScores: Object.fromEntries(weighted.rows.map((row) => [row.key, row.score])),
    weightedPillars: weighted.rows,
    stance: {
      ...stance,
      baseScore: weighted.baseScore,
      finalScore: score,
    },
    drivers: [
      `Weighted base score ${weighted.baseScore >= 0 ? "+" : ""}${weighted.baseScore}`,
      `Desk stance ${stance.lean} / ${stance.risk} (${stance.leanAdjustment >= 0 ? "+" : ""}${stance.leanAdjustment} lean adj, ${stance.riskMultiplier}x risk)`,
      `Pillar weights: ${summarizeWeights(weighted.weights)}`,
      `Instrument focus ${focus.symbol} / ${focus.futures}`,
      `${timingRead.staleCashRisk ? "Futures-adjusted tape" : "Index tape"} ${tape >= 0 ? "+" : ""}${round(tape)}%`,
      Number.isFinite(futuresTape) && Number.isFinite(cashTape) ? `Futures ${signed(futuresTape, 2, "%")} vs cash ${signed(cashTape, 2, "%")}` : null,
      points?.internals?.breadthDetail ? `Breadth ${points.internals.breadthDetail.advancers}/${points.internals.breadthDetail.total} sectors (${points.internals.breadthDetail.tone})` : null,
      points?.internals?.trendDetail ? `Trend score ${points.internals.trendDetail.score}` : null,
      `Headline balance ${Math.round(newsScore)}`,
      `Positioning score ${posScore}`,
      eventPenalty ? `Event risk penalty ${eventPenalty}` : null,
      points?.internals?.volDetail ? `VIX ${points.internals.volDetail.vix} · ${points.internals.volDetail.zone} · ${points.internals.volDetail.structure}` : `VIX ${round(points?.vix?.spot || 0)} · ${points?.vix?.structure || "mixed"}`,
      `${risk} risk posture`,
    ].filter(Boolean),
    bullCase: [
      `${focus.symbol} accepts above ${round(pivot || focusPoints.spot || 0, 0)} and breadth improves beyond ${points?.internals?.breadthDetail?.pctPositive ?? 50}% participation.`,
      "Nasdaq leadership broadens instead of relying on a narrow group.",
      "Volatility fades while sector participation turns more constructive.",
    ],
    bearCase: [
      `${focus.symbol} rejects ${round(pivot || focusPoints.spot || 0, 0)} and loses first support.`,
      "VIX expands while breadth rolls over and growth/cyclicals weaken together.",
      "High-impact headlines keep rates or geopolitical risk bid.",
    ],
    levels: { action, upside, downside },
    gamePlan: bias === "neutral"
      ? `Trade ${focus.symbol} smaller around the pivot and demand an opening-range break with breadth confirmation. The ${stance.risk} risk setting argues for ${stance.risk === "aggressive" ? "faster add-ons only after confirmation" : stance.risk === "defensive" ? "smaller size and cleaner invalidation" : "normal size after confirmation"}.`
      : `Favor ${bias === "bullish" ? "long" : "short"} ${focus.symbol} / ${focus.futures} setups only after price confirms at the action level. Scale risk to ${risk}; the ${leanPhrase} is already reflected in the final score, so do not double-count it by chasing an extended first move.`,
    invalidation: bias === "bullish"
      ? `A sustained break below ${focusPoints.supports?.[0] || "first support"} with rising VIX invalidates the long thesis.`
      : bias === "bearish"
        ? `A sustained reclaim above ${focusPoints.resistances?.[0] || "first resistance"} with improving breadth invalidates the short thesis.`
        : "Two-sided acceptance away from the pivot with broad sector confirmation ends the neutral thesis.",
    standAside: "Stand aside during headline-driven gaps, conflicting breadth, or repeated failed breaks around the action level.",
  };
};

const makeTradePlan = ({ market, news, points, thesis }) => {
  if (!thesis || !market) return null;
  const bySymbol = (sym) => (market?.tickers || []).find((t) => t.symbol === sym);
  const es = bySymbol("ES");
  const nq = bySymbol("NQ");
  const ym = bySymbol("YM");
  const dxy = bySymbol("DXY");
  const us10y = bySymbol("US10Y");
  const cl = bySymbol("CL");
  const vix = bySymbol("VIX");

  const focus = thesis.instrument || "SPX";
  const focusLevels = points?.[focus.toLowerCase()] || points?.spx || {};
  const supports = (focusLevels.supports || []).filter((v) => Number.isFinite(Number(v)));
  const resistances = (focusLevels.resistances || []).filter((v) => Number.isFinite(Number(v)));
  const pivot = focusLevels.pivot;

  const toSpy = (v) => (Number.isFinite(Number(v)) ? round(Number(v) / 10, 1) : null);
  const r1 = resistances[0] != null ? Number(resistances[0]) : null;
  const r2 = resistances[1] != null ? Number(resistances[1]) : null;
  const s1 = supports[0] != null ? Number(supports[0]) : null;
  const s2 = supports[1] != null ? Number(supports[1]) : null;
  const piv = pivot != null ? Number(pivot) : null;
  const spy = { r1: toSpy(r1), r2: toSpy(r2), s1: toSpy(s1), s2: toSpy(s2), piv: toSpy(piv) };

  const bias = thesis.bias || "neutral";
  const score = Number(thesis.score || 0);
  const biasLabel = bias === "bullish" ? (Math.abs(score) > 50 ? "Bullish" : "Neutral-to-Bullish") : bias === "bearish" ? (Math.abs(score) > 50 ? "Bearish" : "Neutral-to-Bearish") : "Neutral";

  const calAll = [...(points?.calendarGroups?.today || []), ...(points?.calendarGroups?.tomorrow || [])];
  const highImpact = calAll.filter((e) => e?.importance === "high").slice(0, 2);
  const macroRisk = highImpact.length
    ? `${highImpact.map((e) => `${e.event}${e.time ? ` at ${e.time}` : ""}`).join("; ")} — manage size around event risk.`
    : news?.mood || "No major scheduled catalysts — price action may be technically driven.";

  const bullishSetups = [];
  if (spy.s1 && spy.r1) bullishSetups.push({ label: "Bounce Play", entry: `${spy.s1}${spy.s2 ? `–${spy.s2}` : ""}`, target: `${spy.r1}${spy.r2 ? ` → ${spy.r2}` : ""}`, stop: `< ${round(spy.s1 - 1.5, 1)}`, options: `${Math.round(spy.s1)}C or ${Math.round(spy.s1)}C/${Math.round(spy.r1)}C spread` });
  if (spy.r1) bullishSetups.push({ label: "Breakout", entry: `> ${spy.r1}`, target: spy.r2 ? `${spy.r2} → ${round(spy.r2 + 2, 1)}` : `${round(spy.r1 + 3, 1)}`, stop: `~ ${round(spy.r1 - 2, 1)}`, options: spy.r1 ? `${Math.round(spy.r1)}C or ${Math.round(spy.r1)}C/${Math.round(spy.r1 + 3)}C spread` : null });
  if (!bullishSetups.length) bullishSetups.push({ label: "Long Entry", entry: thesis.levels?.action || "Opening-range acceptance", target: thesis.levels?.upside || "Next resistance", stop: "Below action level", options: null });

  const bearishSetups = [];
  if (spy.r1 && spy.s1) bearishSetups.push({ label: "Resistance Fade", entry: `~ ${spy.r1}${spy.r2 ? `/${spy.r2}` : ""}`, target: `${spy.s1}${spy.s2 ? ` → ${spy.s2}` : ""}`, stop: `> ${round(spy.r1 + 2, 1)}`, options: `${Math.round(spy.r1)}P or ${Math.round(spy.r1)}P/${Math.round(spy.s1)}P spread` });
  if (spy.s1) bearishSetups.push({ label: "Breakdown", entry: `< ${spy.s1}`, target: spy.s2 ? `${spy.s2} → ${round(spy.s2 - 2, 1)}` : `${round(spy.s1 - 4, 1)}`, stop: `> ${round(spy.s1 + 2, 1)}`, options: spy.s1 ? `${Math.round(spy.s1)}P or ${Math.round(spy.s1 - 4)}P spread` : null });
  if (!bearishSetups.length) bearishSetups.push({ label: "Short Entry", entry: thesis.levels?.action || "Opening-range rejection", target: thesis.levels?.downside || "Next support", stop: "Above action level", options: null });

  const futuresBias = [
    { symbol: "ES", label: "E-mini S&P", changePct: es ? round(es.changePct, 2) : null, read: es ? (Number(es.changePct) >= 0.3 ? "Constructive" : Number(es.changePct) <= -0.3 ? "Weak — lower highs" : "Flat") : "—" },
    { symbol: "NQ", label: "E-mini Nasdaq", changePct: nq ? round(nq.changePct, 2) : null, read: nq ? (Number(nq.changePct) >= 0.3 ? "Growth leading" : Number(nq.changePct) <= -0.3 ? "Under mega-cap pressure" : "Flat") : "—" },
    { symbol: "YM", label: "E-mini Dow", changePct: ym ? round(ym.changePct, 2) : null, read: ym ? (Number(ym.changePct) >= 0.3 ? "Value leading" : Number(ym.changePct) <= -0.3 ? "Value weak" : "Flat") : "—" },
    { symbol: "DXY", label: "US Dollar", changePct: dxy ? round(dxy.changePct, 2) : null, read: dxy ? (Number(dxy.changePct) >= 0.2 ? "Strong — risk-off pressure" : Number(dxy.changePct) <= -0.2 ? "Weak — risk-on tailwind" : "Flat — neutral") : "—" },
    { symbol: "US10Y", label: "10-Year Yield", changePct: us10y ? round(us10y.changePct, 2) : null, price: us10y ? round(us10y.price, 3) : null, read: us10y ? (Number(us10y.changePct) >= 0.5 ? "Sticky highs — equity headwind" : Number(us10y.changePct) <= -0.5 ? "Falling — supportive" : "Stable — neutral") : "—" },
    { symbol: "CL", label: "WTI Crude", changePct: cl ? round(cl.changePct, 2) : null, read: cl ? (Number(cl.changePct) >= 0.8 ? "Bid — risk-on signal" : Number(cl.changePct) <= -0.8 ? "Weak — demand fears" : "Flat — neutral") : "—" },
  ];

  const vixPrice = vix?.price || points?.vix?.spot;
  const vixZone = points?.internals?.volDetail?.zone || "";
  const vixStr = points?.vix?.structure || "";
  const vixRead = [vixZone ? `${vixZone.charAt(0).toUpperCase()}${vixZone.slice(1)}` : null, vixStr || null, Number(vixPrice) > 25 ? "risk-off bias" : Number(vixPrice) > 18 ? "watchful" : "calm"].filter(Boolean).join(" · ");

  const sortedSectors = [...(market?.sectors || [])].filter((s) => Number.isFinite(Number(s.changePct))).sort((a, b) => Number(b.changePct) - Number(a.changePct));
  const leaders = sortedSectors.slice(0, 2).map((s) => s.name).join(", ") || "N/A";
  const laggards = sortedSectors.slice(-2).map((s) => s.name).join(", ") || "N/A";
  const gammaStrikes = [spy.piv, spy.r1].filter((v) => v != null).join(", ") || "N/A";

  const calHighlights = [...(points?.calendarGroups?.today || []), ...(points?.calendarGroups?.tomorrow || []), ...(points?.calendarGroups?.upcoming || [])].filter((e) => e?.importance !== "low").slice(0, 4);

  return {
    biasLabel,
    bias,
    score,
    macroRisk,
    levels: {
      resistance: resistances.slice(0, 3).map((v) => round(v, 0)),
      support: supports.slice(0, 3).map((v) => round(v, 0)),
      pivot: piv ? round(piv, 0) : null,
      spyResistance: [spy.r1, spy.r2].filter(Boolean),
      spySupport: [spy.s1, spy.s2].filter(Boolean),
      spyPivot: spy.piv,
    },
    bullishSetups,
    bearishSetups,
    futuresBias,
    internals: { vixPrice: Number.isFinite(Number(vixPrice)) ? round(vixPrice, 1) : null, vixRead, gammaStrikes, leaders, laggards },
    calendarHighlights: calHighlights,
    confirmationRule: "Valid moves require a 5m close beyond the key level with above-average volume. No confirmation → fakeout risk. Respect stops.",
    checklist: {
      overnightConditions: es ? (Number(es.changePct) >= 0.3 ? `Gap up — ES futures +${round(es.changePct, 2)}%` : Number(es.changePct) <= -0.3 ? `Gap down — ES futures ${round(es.changePct, 2)}%` : `Flat — ES futures ${round(es.changePct, 2)}%`) : "Pending pre-market data",
      keyLevels: [spy.piv ? `SPY pivot ~${spy.piv}` : null, spy.r1 ? `Resistance: ${[spy.r1, spy.r2].filter(Boolean).join(" / ")}` : null, spy.s1 ? `Support: ${[spy.s1, spy.s2].filter(Boolean).join(" / ")}` : null].filter(Boolean).join(" | "),
      economicEvents: calHighlights.length ? calHighlights.map((e) => `${e.event}${e.time ? ` @ ${e.time}` : ""}`).join("; ") : "No major scheduled events",
      gamePlan: thesis.gamePlan || "Wait for opening-range confirmation before sizing into directional trades",
      riskManagement: `Max daily loss: define before open. ${thesis.standAside || "Stand aside during headline gaps and failed breaks."}`,
    },
  };
};

const makeNewsletter = ({ market, news, points, thesis, timing, edition = 1, weights = {}, lean = thesis?.stance?.lean || "auto", risk = thesis?.stance?.risk || "balanced", instrument = thesis?.instrument || "SPX" }) => {
  const focus = getThesisInstrument(instrument);
  const spx = market?.tickers?.find((item) => item.symbol === "SPX");
  const ndx = market?.tickers?.find((item) => item.symbol === "NDX");
  const dji = market?.tickers?.find((item) => item.symbol === "DJI");
  const vix = market?.tickers?.find((item) => item.symbol === "VIX");
  const focusTicker = market?.tickers?.find((item) => item.symbol === focus.symbol);
  const timingRead = timingContext(timing, market);
  const timingSentence = timingRead.staleCashRisk
    ? `Because this was generated during ${timingRead.session}, cash index prints may lag live ${focus.futures} futures.`
    : `This note was generated during ${timingRead.session}, with quote timing still checked against the live feed.`;
  const actionLevel = thesis.levels?.action || "the opening range";
  const actionNumber = String(actionLevel).match(/^[\d,.]+/)?.[0];
  const actionReference = actionNumber ? `the ${actionNumber} decision level` : actionLevel;
  const breadthLine = points?.internals?.breadthDetail
    ? `${points.internals.breadthDetail.advancers}/${points.internals.breadthDetail.total} sectors are positive, with ${points.internals.breadthDetail.tone}.`
    : "Breadth is not fully resolved in the current data pull.";
  const volLine = points?.internals?.volDetail?.read || `VIX is near ${vix?.price ?? points?.vix?.spot ?? "its latest range"} with a ${points?.vix?.structure || "mixed"} volatility read.`;
  const normalizedWeights = thesis?.pillarWeights || normalizeWeights(weights);
  const pillarRead = thesis?.pillarRead || `Pillar weights used in the call: ${summarizeWeights(normalizedWeights)}.`;
  const stanceSummary = thesis?.stanceRead || stanceRead({
    lean,
    risk,
    baseScore: Number(thesis?.stance?.baseScore ?? thesis?.score ?? 0),
    finalScore: Number(thesis?.score ?? 0),
  });
  return {
    instrument: focus.symbol,
    headline: thesis.headline,
    dek: `${thesis.bias.toUpperCase()} · score ${thesis.score >= 0 ? "+" : ""}${thesis.score} · conviction ${thesis.conviction}/10 · ${lean}/${risk}`,
    timestamp: `${timingRead.generatedAtShort} · ${timingRead.session}`,
    timingNote: timingRead.timingNote,
    stanceRead: stanceSummary,
    pillarRead,
    pillarWeights: normalizedWeights,
    executiveSummary: `Overwatch enters edition ${edition} with a ${thesis.bias} bias in ${focus.symbol}. The call is anchored to the action level and weighted by the desk configuration: ${pillarRead} ${stanceSummary} ${timingSentence}`,
    marketRecap: `${focus.symbol} is ${focusTicker ? `${focusTicker.changePct >= 0 ? "up" : "down"} ${Math.abs(focusTicker.changePct).toFixed(2)}% near ${focusTicker.price}` : "awaiting a fresh quote"}, while SPX / NDX / DJI read ${[spx, ndx, dji].filter(Boolean).map((item) => `${item.symbol} ${signed(item.changePct, 2, "%")}`).join(", ") || "mixed"}. ${breadthLine} ${volLine} ${timingSentence}`,
    marketOutlook: buildMarketOutlook({ news, points, timing }),
    thesisNarrative: `${thesis.summary} The desk will treat ${actionReference} as the primary trigger, but breadth and volatility must confirm the move. The ${lean}/${risk} stance and pillar weights are already embedded in the score, so the note should not double-count the trader preference. ${thesis.gamePlan} The call is invalidated when ${String(thesis.invalidation || "price breaks the opposite side of the setup").replace(/^./, (char) => char.toLowerCase())}`,
    watchToday: [
      `${focus.symbol}: ${thesis.levels?.action || "Opening-range acceptance"}`,
      `VIX behavior near ${points?.vix?.spot ?? "the latest print"}`,
      points?.internals?.breadthDetail ? `Breadth confirmation: ${points.internals.breadthDetail.advancers}/${points.internals.breadthDetail.total} sectors positive` : "Sector breadth and Nasdaq leadership",
      points?.internals?.volDetail ? `Vol regime: ${points.internals.volDetail.zone} / ${points.internals.volDetail.structure}` : null,
      thesis.standAside,
    ].filter(Boolean),
    riskRadar: `${thesis.invalidation} ${timingRead.staleCashRisk ? "Do not over-trust stale cash-index levels until regular-market liquidity confirms futures." : "Headline gaps and fast volatility expansion can make otherwise clean levels unreliable."} Size should fall before discipline does.`,
    finalWord: "Let price confirm the story before the desk commits capital.",
    tradePlan: makeTradePlan({ market, news, points, thesis }),
  };
};

const makeSessionRecap = ({ market, news, points }) => {
  const tickers = market?.tickers || [];
  const bySymbol = (symbol) => tickers.find((item) => item.symbol === symbol);
  const spx = bySymbol("SPX");
  const ndx = bySymbol("NDX");
  const dji = bySymbol("DJI");
  const vix = bySymbol("VIX");
  const indexMoves = [spx, ndx, dji].filter(Boolean);
  const avgMove = indexMoves.length
    ? indexMoves.reduce((sum, item) => sum + (Number(item.changePct) || 0), 0) / indexMoves.length
    : 0;
  const tone = avgMove > 0.35 ? "constructive" : avgMove < -0.35 ? "cautious" : "mixed";
  const sectors = [...(market?.sectors || [])]
    .filter((s) => s && Number.isFinite(Number(s.changePct)))
    .sort((a, b) => b.changePct - a.changePct);
  const greenCount = sectors.filter((s) => s.changePct > 0).length;
  const totalCount = sectors.length || 11;
  const breadth = sectors.length
    ? `${greenCount}/${totalCount} major sectors are higher`
    : String(points?.internals?.breadth || "Breadth is still loading").replace(/[.\s]+$/, "");
  const breadthLine = sectors.length
    ? greenCount >= 7
      ? "Market participation is broad enough to support the move."
      : greenCount <= 3
        ? "Participation is thin, so any bounce needs confirmation."
        : "Sector participation is mixed."
    : breadth;
  const structure = points?.vix?.structure || (Number(vix?.price) > 25 ? "backwardation" : Number(vix?.price) < 16 ? "contango" : "flat");
  const vixPrice = Number(vix?.price);
  const volLine = Number.isFinite(vixPrice)
    ? vixPrice >= 25
      ? `Volatility is elevated at VIX ${round(vixPrice, 1)}, so intraday swings can stay sharp.`
      : vixPrice <= 16
        ? `Volatility is calm at VIX ${round(vixPrice, 1)}.`
        : `Volatility is manageable at VIX ${round(vixPrice, 1)}.`
    : "Volatility is still loading.";
  const calendarGroups = points?.calendarGroups || {};
  const calendarPool = [
    ...(calendarGroups.today || []),
    ...(calendarGroups.tomorrow || []),
    ...(calendarGroups.upcoming || []),
    ...(Array.isArray(points?.calendar) ? points.calendar : []),
  ];
  const catalystItem = pickCalendarCatalyst(calendarPool);
  const catalyst = catalystItem
    ? `${catalystItem.event}${catalystItem.time ? ` at ${catalystItem.time}` : ""}`
    : "no major catalyst on deck";
  const newsLine = news?.mood || "";
  const posture = typeof points?.positioning === "string" ? null : points?.positioning?.posture;
  const flowLine = posture === "risk-on"
    ? "Flows are leaning supportive."
    : posture === "defensive"
      ? "Flows are leaning cautious."
      : posture === "mixed"
        ? "Flows are not giving a clean signal yet."
        : "";
  const indexLine = [spx, ndx, dji].filter(Boolean).map((item) => `${item.symbol} ${signed(item.changePct, 2, "%")}`).join(", ");
  const recap = `${tone[0].toUpperCase()}${tone.slice(1)} market read: ${indexLine || "major indexes are still loading"}. ${volLine} ${breadthLine} ${flowLine ? `${flowLine} ` : ""}${newsLine ? `${newsLine} ` : ""}Next event to watch: ${catalyst}.`;
  const headline = tone === "constructive"
    ? "Buyers have the edge for now"
    : tone === "cautious"
      ? "Caution stays in control"
      : "Mixed market, wait for proof";
  return {
    headline,
    recap,
    takeaways: [
      spx && ndx && dji ? `Indexes: ${indexLine}` : "Indexes still need confirmation",
      Number.isFinite(vixPrice) ? `Volatility: VIX ${round(vixPrice, 1)} (${structure === "backwardation" ? "elevated stress" : structure === "contango" ? "no panic signal" : "balanced"})` : "Volatility still loading",
      `Next: ${catalyst}`,
    ],
    risk: catalystItem
      ? `${catalystItem.event} can change the tone quickly if it surprises.`
      : "A fresh headline or volatility expansion can still flip the read quickly.",
  };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const { operation, prompt, payload = {} } = req.body || {};

  try {
    let data;
    if (operation === "market") data = await fetchMarket(payload.watchlist);
    else if (operation === "news") data = await fetchNews();
    else if (operation === "points") data = await fetchPoints();
    else if (operation === "recap") {
      try {
        data = await callAnthropic(prompt);
      } catch {
        data = null;
      }
      data ||= makeSessionRecap(payload);
    }
    else if (operation === "thesis") {
      const fallback = makeThesis(payload);
      try {
        data = await callAnthropic(prompt);
      } catch {
        data = null;
      }
      data = data
        ? {
          ...fallback,
          ...data,
          pillarRead: data.pillarRead || fallback.pillarRead,
          stanceRead: data.stanceRead || fallback.stanceRead,
          pillarWeights: data.pillarWeights || fallback.pillarWeights,
          pillarScores: data.pillarScores || fallback.pillarScores,
          weightedPillars: data.weightedPillars || fallback.weightedPillars,
          stance: data.stance || { ...fallback.stance, finalScore: data.score ?? fallback.stance.finalScore },
        }
        : fallback;
    } else if (operation === "newsletter") {
      const fallback = makeNewsletter(payload);
      try {
        data = await callAnthropic(prompt);
      } catch {
        data = null;
      }
      data = data
        ? {
          ...fallback,
          ...data,
          marketOutlook: data.marketOutlook || fallback.marketOutlook,
          stanceRead: data.stanceRead || fallback.stanceRead,
          pillarRead: data.pillarRead || fallback.pillarRead,
          pillarWeights: data.pillarWeights || fallback.pillarWeights,
          tradePlan: fallback.tradePlan,
        }
        : fallback;
    } else if (operation === "brief") {
      const secret = process.env.BRIEF_SECRET;
      if (secret && payload.secret !== secret) return json(res, 401, { error: "Unauthorized" });
      const briefData = payload.brief || payload;
      await storeBrief({ ...briefData, _receivedAt: new Date().toISOString() });
      data = { ok: true, stored: true };
    } else if (operation === "getbrief") {
      data = await getBrief();
    } else {
      return json(res, 400, { error: "Unknown desk operation" });
    }

    return json(res, 200, { data });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Desk request failed" });
  }
}
