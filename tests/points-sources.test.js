import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import deskHandler from "../api/desk.js";
import { jsonBody, request, response } from "./helpers/http.js";

// Yahoo daily chart for a 5-session window. chartPreviousClose is the close BEFORE the window,
// which must never be used as "yesterday".
const yahooChart = (closes, { chartPreviousClose } = {}) => ({
  chart: {
    result: [{
      meta: { regularMarketPrice: closes.at(-1), chartPreviousClose, regularMarketTime: 1_800_000_000 },
      indicators: { quote: [{ open: closes, high: closes.map((c) => c + 10), low: closes.map((c) => c - 10), close: closes }] },
    }],
  },
});

const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

// Scanner rows in the column order fetchScan/fetchFlowScan request.
const scanRow = (s, close, changePct) => ({ s, d: ["", "", close - 5, close, changePct, close * changePct / 100, close + 5, close - 10] });
const flowRow = (s, close, changePct) => ({ s, d: ["", "", close, changePct, close * changePct / 100, 1_000_000, 1.1] });

const SECTORS = ["XLK", "XLF", "XLV", "XLE", "XLY", "XLP", "XLI", "XLB", "XLU", "XLRE", "XLC"];

const routedFetch = () => vi.fn(async (url, init = {}) => {
  const u = String(url);
  if (u.includes("scanner.tradingview.com")) {
    const tickers = JSON.parse(init.body).symbols.tickers;
    const columns = JSON.parse(init.body).columns;
    if (columns.includes("relative_volume_10d_calc")) {
      return json({ data: tickers.map((t) => flowRow(t, 100, -0.5)) });
    }
    // The index scan comes back WITHOUT the CBOE and TVC index symbols.
    const missing = new Set(["CBOE:SPX", "CBOE:VIX", "TVC:DJI"]);
    return json({ data: tickers.filter((t) => !missing.has(t)).map((t) => scanRow(t, SECTORS.some((x) => t.endsWith(`:${x}`)) ? 50 : 700, -1)) });
  }
  if (u.includes("%5EGSPC") || u.includes("^GSPC")) return json(yahooChart([7300, 7250, 7200, 7158, 6910], { chartPreviousClose: 7561 }));
  if (u.includes("%5EVIX3M") || u.includes("%5EVIX6M")) return json(yahooChart([30, 31]));
  if (u.includes("%5EVIX") || u.includes("^VIX")) return json(yahooChart([20, 22, 25, 28.44, 35.89], { chartPreviousClose: 18 }));
  if (u.includes("%5EDJI") || u.includes("^DJI")) return json(yahooChart([50000, 49800, 49500, 49100, 48147], { chartPreviousClose: 52347 }));
  throw new Error(`unrouted ${u}`);
});

const runPoints = async () => {
  const res = response();
  await deskHandler(request({ body: { operation: "points", payload: {} } }), res);
  expect(res.statusCode).toBe(200);
  const body = jsonBody(res);
  return body.data || body;
};

describe("points op data sources", () => {
  beforeEach(() => {
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.FINNHUB_API_KEY;
    vi.stubGlobal("fetch", routedFetch());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("fills indexes the scanner omits from Yahoo instead of dropping to the sample tape", async () => {
    const data = await runPoints();
    const core = data._provenance.find((p) => p.component === "core indexes");
    expect(core.quality).toBe("live");
    expect(core.name).toContain("Yahoo Finance");
    expect(data.vix.spot).toBeCloseTo(35.89, 2);
    expect(data.positioning.source).not.toMatch(/sample/i);
  });

  it("measures the Yahoo day change against the prior session, not the start of the window", async () => {
    const res = response();
    await deskHandler(request({ body: { operation: "market", payload: { watchlist: [{ symbol: "SPX", name: "S&P 500 Index" }] } } }), res);
    const body = jsonBody(res);
    const spx = (body.data || body).tickers.find((t) => t.symbol === "SPX");
    // 6910 vs the prior session's 7158 is -3.46%; the old code compared to 7561 and showed -8.61%.
    expect(spx.previousClose).toBe(7158);
    expect(spx.changePct).toBeCloseTo(-3.46, 2);
  });

  it("keeps the ETF flow and calendar feeds live when the core indexes are unreadable", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url, init = {}) => {
      const u = String(url);
      if (u.includes("scanner.tradingview.com") && JSON.parse(init.body).columns.includes("relative_volume_10d_calc")) {
        return json({ data: JSON.parse(init.body).symbols.tickers.map((t) => flowRow(t, 100, 0.4)) });
      }
      throw new Error("upstream down");
    }));
    const data = await runPoints();
    const byComponent = Object.fromEntries(data._provenance.map((p) => [p.component, p.quality]));
    expect(byComponent["core indexes"]).toBe("sample");
    expect(byComponent.positioning).toBe("live");
    expect(data.positioning.source).not.toMatch(/sample/i);
  });
});
