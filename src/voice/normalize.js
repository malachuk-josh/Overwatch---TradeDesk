// Rewrites a sentence so a voice says it the way a trader does: "5,850" -> "fifty-eight fifty",
// "+1.25%" -> "up one point two five percent", "SPX" -> "S P X", "25bps" -> "twenty-five basis
// points". Runs in the browser just before each sentence is spoken. The desk leads are also told to
// write for the ear; this is the safety net for what still comes through in screen form.

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function numberWords(n) {
  if (!Number.isFinite(n) || n < 0) return String(n);
  n = Math.floor(n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${numberWords(n % 100)}` : ""}`;
  if (n < 1_000_000) return `${numberWords(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${numberWords(n % 1000)}` : ""}`;
  if (n < 1_000_000_000) return `${numberWords(Math.floor(n / 1_000_000))} million${n % 1_000_000 ? ` ${numberWords(n % 1_000_000)}` : ""}`;
  return String(n);
}

const pair = (lo) => (lo < 10 ? `oh ${ONES[lo]}` : numberWords(lo));

/** An index level the way the desk says it: 5,850 "fifty-eight fifty", 21,450 "twenty-one four fifty". */
export function levelWords(n) {
  if (n >= 1000 && n < 10000) {
    if (n % 1000 === 0) return `${numberWords(n / 1000)} thousand`;
    const hi = Math.floor(n / 100);
    const lo = n % 100;
    return lo === 0 ? `${numberWords(hi)} hundred` : `${numberWords(hi)} ${pair(lo)}`;
  }
  if (n >= 10000 && n < 100000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    if (rest === 0) return `${numberWords(th)} thousand`;
    const h = Math.floor(rest / 100);
    const lo = rest % 100;
    if (h === 0) return `${numberWords(th)} thousand ${numberWords(lo)}`;
    return lo === 0 ? `${numberWords(th)} ${ONES[h]} hundred` : `${numberWords(th)} ${ONES[h]} ${pair(lo)}`;
  }
  return numberWords(n);
}

const digits = (s) => [...s].map((d) => ONES[+d]).join(" ");
const decimal = (whole, frac) => `${numberWords(+whole)}${frac ? ` point ${digits(frac)}` : ""}`;

// Said as a name, or spelled out where a voice would otherwise try to pronounce letters as a word.
const SAY_AS = {
  NVDA: "Nvidia", AAPL: "Apple", MSFT: "Microsoft", AMZN: "Amazon", GOOGL: "Alphabet", GOOG: "Alphabet",
  META: "Meta", TSLA: "Tesla", AVGO: "Broadcom", QQQ: "the Q's", IWM: "I W M", FOMC: "F O M C",
  CPI: "C P I", PCE: "P C E", ETF: "E T F", ETFs: "E T Fs", ES: "E S", ATH: "all-time high",
  ATM: "at the money", OTM: "out of the money", ITM: "in the money", DTE: "D T E", "0DTE": "zero D T E",
  YTD: "year to date", YoY: "year over year", MoM: "month over month", QoQ: "quarter over quarter",
  ET: "Eastern", EPS: "E P S", IPO: "I P O", PE: "P E",
};
const sayAsPattern = new RegExp(`\\b(${Object.keys(SAY_AS).sort((a, b) => b.length - a.length).join("|")})\\b`, "g");

function clock(_m, h, min, ampm) {
  const minutes = min === "00" ? (ampm ? "" : " o'clock") : +min < 10 ? ` oh ${ONES[+min]}` : ` ${numberWords(+min)}`;
  return `${numberWords(+h)}${minutes}${ampm ? ` ${ampm[0].toUpperCase()} M` : ""}`;
}

const SCALE = { K: "thousand", M: "million", B: "billion", T: "trillion" };

export function normalizeForSpeech(text) {
  return String(text || "")
    .replace(/\*\*|__|`|^#+\s*|^\s*[-*•]\s+/gm, "")
    .replace(/https?:\/\/\S+/g, "the link on your screen")
    .replace(/\s*(?:→|->)\s*/g, " to ")
    .replace(/~\s*(?=\d)/g, "about ")
    .replace(/\bvs\.?(?=\s)/gi, "versus")
    // Money before plain numbers: "$2.5B", "$1,200", "$40".
    .replace(/\$(\d+(?:\.\d+)?)\s*([KMBT])\b/g, (_m, n, s) => `${n.includes(".") ? decimal(...n.split(".")) : numberWords(+n)} ${SCALE[s]} dollars`)
    .replace(/\$(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/g, (_m, w, c) => {
      const dollars = +w.replace(/,/g, "");
      const words = `${dollars >= 1000 && dollars < 10000 && dollars % 100 === 0 && dollars % 1000 ? levelWords(dollars) : numberWords(dollars)} dollar${dollars === 1 ? "" : "s"}`;
      return c && +c > 0 ? `${words} and ${numberWords(+c)} cents` : words;
    })
    // Percent moves, with the sign said as a direction.
    .replace(/(^|[\s(])([+\-−])?(\d+)(?:\.(\d+))?\s?%/g, (_m, pre, sign, w, f) => `${pre}${sign === "+" ? "up " : sign ? "down " : ""}${decimal(w, f)} percent`)
    .replace(/(\d+(?:\.\d+)?)\s?bps?\b/gi, (_m, n) => `${n.includes(".") ? decimal(...n.split(".")) : numberWords(+n)} basis point${n === "1" ? "" : "s"}`)
    // The space belongs to the am/pm: without one, "9:30 ET" keeps its space and "9:30 amid" isn't "am".
    .replace(/\b(\d{1,2}):(\d{2})(?:\s*(am|pm|a\.m\.|p\.m\.)(?![a-z]))?/gi, clock)
    // Millions first, or the level rule below would read the "1,250" inside "1,250,000".
    .replace(/\b(\d{1,3}(?:,\d{3}){2,})\b/g, (m) => numberWords(+m.replace(/,/g, "")))
    // Index levels and other comma'd numbers: 5,850 / 21,450.75.
    .replace(/\b(\d{1,2},\d{3})(?:\.(\d+))?\b/g, (_m, w, f) => `${levelWords(+w.replace(/,/g, ""))}${f ? ` point ${digits(f)}` : ""}`)
    .replace(sayAsPattern, (m) => SAY_AS[m])
    // All-consonant tickers can't be said as words: spell them (SPX, NDX, DXY, TLT, NQ).
    .replace(/\b[B-DF-HJ-NP-TV-Z]{2,5}\b/g, (m) => m.split("").join(" "))
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
