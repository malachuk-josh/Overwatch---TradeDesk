import { afterEach, describe, expect, it } from "vitest";
import { algoParams, enforceDistributedQuota, qualityMeta, runResearch, thesisQualityIssues } from "../api/desk.js";

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe("desk data-quality contract", () => {
  it("does not label an old or undated wire live merely because it is nonempty", () => {
    const meta = qualityMeta("news", {
      newsQuality: "stale",
      providerAsOf: "2026-01-01T00:00:00.000Z",
      headlines: [{ title: "Old item", source: "Wire", providerPublishTime: 0, timeAgo: "time unknown" }],
    });

    expect(meta.quality).toBe("stale");
    expect(meta.asOf).toContain("ET");
    expect(meta.errors).toContain("No dated market headlines were published in the last 24 hours");
  });

  it("propagates sample component provenance through a partial points feed", () => {
    const meta = qualityMeta("points", {
      spx: { spot: 6000 },
      vix: { spot: 18 },
      _provenance: [
        { name: "Live indexes", component: "core indexes", quality: "live" },
        { name: "Sample sentiment", component: "fear and greed", quality: "sample" },
      ],
    });

    expect(meta.quality).toBe("partial");
    expect(meta.sources).toContainEqual({ name: "Sample sentiment", component: "fear and greed", quality: "sample" });
  });

  it("blocks stale feeds and sample subcomponents from thesis synthesis", () => {
    const live = { quality: "live", sources: [{ name: "provider", quality: "live" }] };
    const issues = thesisQualityIssues({
      market: { _meta: live },
      news: { _meta: { quality: "stale", sources: [] } },
      points: { _meta: { quality: "partial", sources: [{ name: "sample", component: "fear and greed", quality: "sample" }] } },
    });

    expect(issues).toEqual(["news is stale", "desk points contains sample fear and greed"]);
  });

  it("returns stable client/config errors at the operation boundary", async () => {
    expect(() => algoParams({ symbol: "<bad>" })).toThrow(expect.objectContaining({ status: 400, code: "invalid_symbol" }));
    await expect(runResearch({ instrument: "SPY", question: "" })).rejects.toMatchObject({ status: 400, code: "invalid_question" });
    await expect(runResearch({ instrument: "SPY", question: "What changed?" })).rejects.toMatchObject({ status: 503, code: "research_unavailable" });
  });

  it("fails paid-operation quotas closed when durable storage is unavailable", async () => {
    await expect(enforceDistributedQuota("user_123", "research")).rejects.toMatchObject({ status: 503, code: "quota_unavailable" });
  });
});
