import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import deskHandler from "../api/desk.js";
import settingsHandler from "../api/user/settings.js";
import archiveHandler from "../api/user/archive.js";
import researchHandler from "../api/user/research.js";
import deleteArchiveHandler from "../api/archive/delete.js";
import { jsonBody, request, response } from "./helpers/http.js";

describe("desk API request boundaries", () => {
  beforeEach(() => {
    delete process.env.CLERK_SECRET_KEY;
    vi.stubGlobal("fetch", vi.fn(() => {
      throw new Error("A rejected request must not reach an upstream provider");
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects non-POST requests before doing any work", async () => {
    const res = response();
    await deskHandler(request({ method: "GET" }), res);

    expect(res.statusCode).toBe(405);
    expect(jsonBody(res)).toEqual({ error: "Method not allowed" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects unknown operations with a stable error code", async () => {
    const res = response();
    await deskHandler(request({ body: { operation: "not-a-real-operation", payload: {} } }), res);

    expect(res.statusCode).toBe(400);
    expect(jsonBody(res)).toMatchObject({ error: "Unknown desk operation", code: "unknown_operation" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["backtest", "algolive", "research", "thesis", "getarchive", "savearchive", "saveshared"])(
    "requires a signed-in user for %s",
    async (operation) => {
      const res = response();
      await deskHandler(request({ body: { operation, payload: {} } }), res);

      expect(res.statusCode).toBe(401);
      expect(res.getHeader("WWW-Authenticate")).toBe('Bearer realm="overwatch-desk"');
      expect(jsonBody(res)).toMatchObject({ code: "unauthorized" });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("enforces the public market watchlist cap before provider fan-out", async () => {
    const watchlist = Array.from({ length: 65 }, (_, index) => ({ symbol: `S${index}`, name: `Symbol ${index}` }));
    const res = response();
    await deskHandler(request({ body: { operation: "market", payload: { watchlist } } }), res);

    expect(res.statusCode).toBe(400);
    expect(jsonBody(res)).toMatchObject({ code: "symbol_limit" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid history ranges before provider access", async () => {
    const res = response();
    await deskHandler(request({
      body: { operation: "history", payload: { symbol: "SPY", period: "d", from: "2026-99-99" } },
    }), res);

    expect(res.statusCode).toBe(400);
    expect(jsonBody(res).error).toContain("valid YYYY-MM-DD");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("caps oversized prompt input", async () => {
    const res = response();
    await deskHandler(request({
      body: { operation: "news", prompt: "x".repeat(64_001), payload: {} },
    }), res);

    expect(res.statusCode).toBe(413);
    expect(jsonBody(res)).toMatchObject({ code: "payload_too_large" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("private storage boundaries", () => {
  beforeEach(() => {
    delete process.env.CLERK_SECRET_KEY;
    vi.stubGlobal("fetch", vi.fn(() => {
      throw new Error("An unauthenticated request must not reach storage");
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["settings", settingsHandler],
    ["archive", archiveHandler],
    ["research", researchHandler],
  ])("protects the per-user %s endpoint", async (_name, handler) => {
    const res = response();
    await handler(request({ method: "GET" }), res);

    expect(res.statusCode).toBe(401);
    expect(jsonBody(res)).toEqual({ error: "Unauthorized" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("protects destructive shared-archive writes", async () => {
    const res = response();
    await deleteArchiveHandler(request({ body: { id: "letter-1" } }), res);

    expect(res.statusCode).toBe(403);
    expect(jsonBody(res).error).toContain("Not authorized");
    expect(fetch).not.toHaveBeenCalled();
  });
});
