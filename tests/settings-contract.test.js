import { describe, expect, it } from "vitest";
import { pickSettings } from "../api/user/settings.js";

describe("cloud settings contract", () => {
  it("preserves the UI lean and watchlist visibility contract", () => {
    const settings = pickSettings({
      watchlist: [
        { symbol: "SPY", name: "S&P ETF", off: true, ignored: "drop me" },
        { symbol: "QQQ", name: "Nasdaq ETF", off: false },
      ],
      lean: "bull",
      risk: "balanced",
      deskTools: {},
    });

    expect(settings.lean).toBe("bull");
    expect(settings.watchlist).toEqual([
      { symbol: "SPY", name: "S&P ETF", off: true },
      { symbol: "QQQ", name: "Nasdaq ETF" },
    ]);
  });

  it("maps legacy lean aliases and bounds desk-tool storage to known fields", () => {
    const settings = pickSettings({
      lean: "bearish",
      deskTools: {
        feedToThesis: true,
        injected: { arbitrary: "payload" },
        env: { spot: "123.45", secret: "drop me" },
        options: { type: "put", strike: "120", feed: true, extra: "drop me" },
      },
    });

    expect(settings.lean).toBe("bear");
    expect(settings.deskTools.feedToThesis).toBe(true);
    expect(settings.deskTools.env.spot).toBe("123.45");
    expect(settings.deskTools.env).not.toHaveProperty("secret");
    expect(settings.deskTools.options).toEqual({ strike: "120", type: "put", marketPrice: "", feed: true });
    expect(settings.deskTools).not.toHaveProperty("injected");
  });
});
