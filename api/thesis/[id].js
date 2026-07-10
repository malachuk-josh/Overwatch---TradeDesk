import {
  errorPage,
  consumeRateLimit,
  escapeHtml,
  isSafeId,
  queryValue,
  redisCommand,
  setHtmlSecurityHeaders,
} from "../archive/_shared.js";

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const rawText = (value, max = 4_000) => {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).slice(0, max);
};

const safeList = (value, maxItems = 10, maxLength = 1_200) =>
  (Array.isArray(value) ? value : [])
    .slice(0, maxItems)
    .map((item) => rawText(item, maxLength))
    .filter(Boolean);

const listMarkup = (items, className = "") => items.length
  ? `<ul${className ? ` class="${className}"` : ""}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
  : "";

function renderStructuredThesis(thesis, createdAt) {
  const bias = rawText(thesis.bias, 80).toLowerCase();
  const biasClass = bias.includes("bull") ? "bull" : bias.includes("bear") ? "bear" : "neutral";
  const instrument = rawText(thesis.instrument || thesis._instrument, 32) || "SPX";
  const thesisDate = rawText(thesis._date || thesis.date, 40);
  const storedDate = createdAt !== null && createdAt !== undefined ? new Date(Number(createdAt)) : null;
  const storedTimestamp = storedDate && Number.isFinite(storedDate.getTime()) ? storedDate.toISOString() : "";
  const timestamp = rawText(thesis.timestamp || thesis._generatedAt, 100) || storedTimestamp;
  const score = rawText(thesis.score, 24);
  const conviction = rawText(thesis.conviction, 24);
  const headline = rawText(thesis.headline, 600);
  const summary = rawText(thesis.summary, 8_000);
  const deskRead = rawText(thesis.deskRead || thesis.jackRead, 8_000);
  const persona = rawText(thesis._personaName, 80) || "Jack";
  const pairRead = rawText(thesis.pairRead, 4_000);
  const timingNote = rawText(thesis.timingNote, 2_000);
  const secondary = rawText(thesis.secondary, 32);
  const structures = safeList(thesis._deskStructures, 12, 300);
  const drivers = safeList(thesis.drivers, 12, 1_000);
  const bullCase = safeList(thesis.bullCase, 12, 2_000);
  const bearCase = safeList(thesis.bearCase, 12, 2_000);
  const levels = isPlainObject(thesis.levels) ? thesis.levels : {};
  const action = rawText(levels.action, 2_000);
  const upside = rawText(levels.upside, 2_000);
  const downside = rawText(levels.downside, 2_000);
  const gamePlan = rawText(thesis.gamePlan, 6_000);
  const invalidation = rawText(thesis.invalidation, 4_000);
  const standAside = rawText(thesis.standAside, 4_000);
  const hasLevels = action || upside || downside || gamePlan;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Overwatch Thesis — ${escapeHtml(thesisDate || instrument)}</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b0e13;color:#e8e5de;font:15px/1.65 Georgia,'Times New Roman',serif}main{width:min(860px,100%);margin:auto;padding:40px 28px 56px}.brand{font:700 12px/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.16em;color:#c9a84c;text-transform:uppercase;border-bottom:1px solid #2b2f36;padding-bottom:14px}.meta{margin:12px 0 26px;color:#99958d;font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}.bias{font:900 clamp(32px,7vw,54px)/1 system-ui,-apple-system,sans-serif;letter-spacing:.08em;text-transform:uppercase}.bias.bull{color:#35c978}.bias.bear{color:#ef6464}.bias.neutral{color:#c9a84c}h1{font-size:clamp(20px,4vw,30px);font-style:italic;line-height:1.35;margin:14px 0 18px;color:#f4f1e9}h2{font:700 12px/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#c9a84c;margin:30px 0 10px;padding-bottom:8px;border-bottom:1px solid #2b2f36}p{white-space:pre-wrap}.summary{font-size:17px;color:#d8d4cb}.callout{border-left:3px solid #c9a84c;background:#141820;padding:14px 16px;margin:18px 0;white-space:pre-wrap}.callout b{display:block;font:700 11px system-ui,-apple-system,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#c9a84c;margin-bottom:5px}.chips{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0}.chip{border:1px solid #3a3f47;border-radius:999px;padding:4px 9px;color:#bcb7ad;font:11px ui-monospace,SFMono-Regular,Menlo,monospace}ul{padding-left:22px;margin:8px 0}li{margin:7px 0}.cases{display:grid;grid-template-columns:1fr 1fr;gap:18px}.case{background:#11151b;border:1px solid #282d35;border-radius:8px;padding:0 18px 12px}.case.bullbox h2{color:#35c978}.case.bearbox h2{color:#ef6464}.levels{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #2b2f36;border-radius:8px;overflow:hidden}.level{padding:14px;border-right:1px solid #2b2f36;white-space:pre-wrap}.level:last-child{border-right:0}.level b{display:block;color:#99958d;font:700 10px system-ui,-apple-system,sans-serif;letter-spacing:.09em;text-transform:uppercase;margin-bottom:5px}.guard{border-left:3px solid #ef6464;background:#171419;padding:13px 15px;margin:10px 0;white-space:pre-wrap}.guard.amber{border-color:#d89f45;background:#181711}.footer{border-top:1px solid #2b2f36;margin-top:34px;padding-top:14px;color:#77736d;font:11px/1.6 system-ui,-apple-system,sans-serif}@media(max-width:650px){main{padding:26px 18px 42px}.cases,.levels{grid-template-columns:1fr}.level{border-right:0;border-bottom:1px solid #2b2f36}.level:last-child{border-bottom:0}}
</style></head><body><main>
<div class="brand">Overwatch Daily Thesis</div>
<div class="meta">${escapeHtml([thesisDate, `Instrument: ${instrument}`, score ? `Score: ${score}` : "", `Conviction: ${conviction ? conviction + (conviction.includes("/") ? "" : "/10") : "—"}`, timestamp].filter(Boolean).join(" · "))}</div>
<div class="bias ${biasClass}">${escapeHtml(bias || "neutral")}</div>
${headline ? `<h1>“${escapeHtml(headline)}”</h1>` : ""}
${summary ? `<p class="summary">${escapeHtml(summary)}</p>` : ""}
${deskRead ? `<div class="callout"><b>${escapeHtml(persona)}’s read</b>${escapeHtml(deskRead)}</div>` : ""}
${pairRead ? `<div class="callout"><b>Pair read${secondary ? ` · ${escapeHtml(instrument)} vs ${escapeHtml(secondary)}` : ""}</b>${escapeHtml(pairRead)}</div>` : ""}
${timingNote ? `<div class="callout"><b>Timing context</b>${escapeHtml(timingNote)}</div>` : ""}
${structures.length ? `<div class="chips">${structures.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>` : ""}
${drivers.length ? `<h2>Key drivers</h2>${listMarkup(drivers)}` : ""}
${bullCase.length || bearCase.length ? `<div class="cases">${bullCase.length ? `<section class="case bullbox"><h2>Bull case</h2>${listMarkup(bullCase)}</section>` : ""}${bearCase.length ? `<section class="case bearbox"><h2>Bear case</h2>${listMarkup(bearCase)}</section>` : ""}</div>` : ""}
${hasLevels ? `<h2>Levels that matter</h2><div class="levels">${action ? `<div class="level"><b>Action level</b>${escapeHtml(action)}</div>` : ""}${upside ? `<div class="level"><b>Upside</b>${escapeHtml(upside)}</div>` : ""}${downside ? `<div class="level"><b>Downside</b>${escapeHtml(downside)}</div>` : ""}</div>${gamePlan ? `<div class="callout"><b>Game plan</b>${escapeHtml(gamePlan)}</div>` : ""}` : ""}
${invalidation ? `<div class="guard"><b>Thesis invalidation:</b> ${escapeHtml(invalidation)}</div>` : ""}
${standAside ? `<div class="guard amber"><b>Stand-aside conditions:</b> ${escapeHtml(standAside)}</div>` : ""}
<div class="footer">Overwatch Daily Bias Desk · Verify levels independently · Not financial advice</div>
</main></body></html>`;
}

const decodeEntities = (value) => value
  .replace(/&#(\d+);/g, (_, code) => {
    const point = Number(code);
    return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
  })
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => {
    const point = Number.parseInt(code, 16);
    return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
  })
  .replaceAll("&nbsp;", " ")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&amp;", "&");

function legacyHtmlToText(html) {
  return decodeEntities(String(html).slice(0, 1_000_000)
    .replace(/<(script|style|noscript|template|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|section|article|header|footer|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, ""))
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 200_000);
}

function renderLegacyThesis(html) {
  const content = legacyHtmlToText(html) || "Legacy thesis content is unavailable.";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Overwatch legacy thesis</title><style>
:root{color-scheme:dark}body{margin:0;background:#0b0e13;color:#ddd8ce;font:14px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace}main{width:min(860px,100%);margin:auto;padding:34px 22px}.notice{border-left:3px solid #c9a84c;background:#151920;padding:12px 15px;margin-bottom:22px;color:#aaa59b;font-family:system-ui,-apple-system,sans-serif}.notice b{color:#c9a84c}pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0}
</style></head><body><main><div class="notice"><b>Legacy shared thesis</b> — displayed as non-interactive text for security.</div><pre>${escapeHtml(content)}</pre></main></body></html>`;
}

export default async function handler(req, res) {
  setHtmlSecurityHeaders(res, { cacheControl: "no-store" });
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    return res.end(errorPage("Method not allowed"));
  }
  const id = queryValue(req.query?.id);
  if (!isSafeId(id)) {
    res.statusCode = 400;
    return res.end(errorPage("Invalid thesis id"));
  }

  try {
    if (!(await consumeRateLimit(req, res, { scope: "shared-thesis", limit: 120 }))) {
      res.statusCode = 429;
      return res.end(errorPage("Too many requests", "Please retry in a minute."));
    }
    const raw = await redisCommand(["GET", `thesis:${id}`]);
    if (typeof raw !== "string" || !raw) {
      res.statusCode = 404;
      return res.end(errorPage("Thesis not found", "This shared thesis does not exist or has expired."));
    }

    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      res.statusCode = 502;
      return res.end(errorPage("Thesis unavailable", "The stored share is invalid."));
    }
    if (!isPlainObject(record)) {
      res.statusCode = 502;
      return res.end(errorPage("Thesis unavailable", "The stored share is invalid."));
    }

    if (record.version === 2 || record.thesis !== undefined) {
      if (record.version !== 2 || !isPlainObject(record.thesis)) {
        res.statusCode = 502;
        return res.end(errorPage("Thesis unavailable", "The stored share has an unsupported format."));
      }
      res.statusCode = 200;
      return res.end(renderStructuredThesis(record.thesis, record.createdAt));
    }

    // Legacy records stored arbitrary HTML. Never return it as markup: extract readable text, escape it,
    // and serve a static wrapper under a script-free CSP.
    if (typeof record.html === "string" && record.html.trim()) {
      res.statusCode = 200;
      return res.end(renderLegacyThesis(record.html));
    }

    res.statusCode = 404;
    return res.end(errorPage("Thesis has no content"));
  } catch (error) {
    console.error("Shared thesis read failed", error instanceof Error ? error.name : "UnknownError");
    res.statusCode = 503;
    return res.end(errorPage("Thesis temporarily unavailable", "Please try again in a moment."));
  }
}
