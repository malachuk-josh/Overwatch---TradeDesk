import { consumeRateLimit, errorPage, isSafeId, queryValue, redisCommand, setHtmlSecurityHeaders } from "./_shared.js";

// Newsletter bodies are written by an authenticated automation, but older records are still HTML on
// the app's origin. Remove active/embedded content as defense in depth; the response CSP separately
// blocks every script, network request and cross-origin embed that slips through.
function sanitizeNewsletterHtml(html) {
  let clean = String(html).slice(0, 1_000_000);
  clean = clean.replace(/<(script|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  clean = clean.replace(/<(script|iframe|object|embed|svg|math)\b[^>]*\/?\s*>/gi, "");
  clean = clean.replace(/<(?:base|meta|link)\b[^>]*\/?\s*>/gi, "");
  clean = clean.replace(/<\/?(?:form|button|input|textarea|select|option)\b[^>]*>/gi, "");
  clean = clean.replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  clean = clean.replace(/\s+(?:srcdoc|formaction|action)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  clean = clean.replace(/\s+(href|src|xlink:href)\s*=\s*(["'])\s*(?:javascript|vbscript|data\s*:\s*text\/html)[\s\S]*?\2/gi, ' $1="#"');
  clean = clean.replace(/\s+(href|src|xlink:href)\s*=\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>]*/gi, ' $1="#"');
  return clean;
}

// Keep archived letters readable on mobile without letting wide tables expand the whole document.
function makeResponsive(html) {
  const inject = `<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
@media (max-width:680px){
  html,body{max-width:100%!important;overflow-x:hidden!important}
  table{display:block!important;width:100%;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
  img,video,pre{max-width:100%!important;height:auto}
}
</style>`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (match) => match + inject);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (match) => `${match}<head>${inject}</head>`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">${inject}</head><body>${html}</body></html>`;
}

export default async function handler(req, res) {
  setHtmlSecurityHeaders(res, {
    embeddable: true,
    // Archived email images commonly contain tracking pixels. Data URIs remain readable; remote
    // image requests are blocked so opening a letter does not disclose viewer IP/time to senders.
    images: false,
    cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=300",
  });

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    return res.end(errorPage("Method not allowed"));
  }

  const id = queryValue(req.query?.id);
  if (!isSafeId(id)) {
    res.statusCode = 400;
    return res.end(errorPage("Invalid newsletter id"));
  }

  try {
    if (!(await consumeRateLimit(req, res, { scope: "archive-detail", limit: 120 }))) {
      res.statusCode = 429;
      return res.end(errorPage("Too many requests", "Please retry in a minute."));
    }
    const raw = await redisCommand(["GET", `newsletter:${id}`]);
    if (typeof raw !== "string" || raw.length === 0) {
      res.statusCode = 404;
      return res.end(errorPage("Newsletter not found", "This archive entry does not exist or has expired."));
    }

    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      res.statusCode = 502;
      return res.end(errorPage("Newsletter unavailable", "The stored archive entry is invalid."));
    }
    if (!record || typeof record !== "object" || typeof record.html !== "string" || !record.html.trim()) {
      res.statusCode = 404;
      return res.end(errorPage("Newsletter has no content"));
    }

    res.statusCode = 200;
    return res.end(makeResponsive(sanitizeNewsletterHtml(record.html)));
  } catch (error) {
    console.error("Archive detail read failed", error instanceof Error ? error.name : "UnknownError");
    res.statusCode = 503;
    return res.end(errorPage("Newsletter temporarily unavailable", "Please try again in a moment."));
  }
}
