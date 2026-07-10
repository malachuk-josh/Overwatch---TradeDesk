import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RevisionConflictError, storedRevision, writeVersionedJson } from "../api/_userStore.js";

const redisResponse = (result) => new Response(JSON.stringify({ result }), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});

describe("versioned cloud records", () => {
  beforeEach(() => {
    process.env.KV_REST_API_URL = "https://redis.example.test";
    process.env.KV_REST_API_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    vi.unstubAllGlobals();
  });

  it("represents a missing-record conflict without inventing a revision", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => redisResponse(["CONFLICT", "__MISSING__"])));

    try {
      await writeVersionedJson(
        "user:123:research",
        { briefs: [] },
        { enforce: true, baseRevision: "revision-1" },
      );
      throw new Error("Expected a revision conflict");
    } catch (error) {
      expect(error).toBeInstanceOf(RevisionConflictError);
      expect(error.currentRevision).toBeNull();
    }
  });

  it("rejects malformed revisions before reaching storage", async () => {
    vi.stubGlobal("fetch", vi.fn());

    await expect(writeVersionedJson(
      "user:123:settings",
      { instrument: "SPY" },
      { enforce: true, baseRevision: { invalid: true } },
    )).rejects.toThrow("Invalid baseRevision");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("preserves legacy revision semantics for old records", () => {
    expect(storedRevision(null, null)).toBeNull();
    expect(storedRevision('{"instrument":"SPY"}', { instrument: "SPY" })).toBe("legacy");
    expect(storedRevision('{"revision":"r3"}', { revision: "r3" })).toBe("r3");
  });
});
