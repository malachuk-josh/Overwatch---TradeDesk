import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import archiveDetailHandler from "../api/archive/[id].js";
import archiveIngestHandler from "../api/archive/ingest.js";
import archiveListHandler from "../api/archive/index.js";
import { escapeHtml, isSafeId } from "../api/archive/_shared.js";
import { jsonBody, request, response } from "./helpers/http.js";

const redisResponse = (result, status = 200) => new Response(JSON.stringify({ result }), {
  status,
  headers: { "Content-Type": "application/json" },
});

const pipelineResponse = (results, status = 200) => new Response(
  JSON.stringify(results.map((result) => ({ result }))),
  { status, headers: { "Content-Type": "application/json" } },
);

describe("archive input helpers", () => {
  it("accepts bounded storage ids and rejects traversal or markup", () => {
    expect(isSafeId("daily-note_2026.07-10")).toBe(true);
    expect(isSafeId("../private")).toBe(false);
    expect(isSafeId("<script>")).toBe(false);
    expect(isSafeId("x".repeat(129))).toBe(false);
  });

  it("escapes all HTML-significant characters in error pages", () => {
    expect(escapeHtml(`<img src=x onerror="bad()"> & 'quoted'`)).toBe(
      "&lt;img src=x onerror=&quot;bad()&quot;&gt; &amp; &#39;quoted&#39;",
    );
  });
});

describe("public archive reads", () => {
  beforeEach(() => {
    process.env.KV_REST_API_URL = "https://redis.example.test";
    process.env.KV_REST_API_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    vi.unstubAllGlobals();
  });

  it("sanitizes active newsletter content and sends a restrictive CSP", async () => {
    const stored = JSON.stringify({
      html: `<!doctype html><html><head><title>Desk letter</title></head><body>
        <script>alert(1)</script><iframe src="https://evil.test"></iframe>
        <a href="javascript:alert(2)" onclick="alert(3)">Open</a>
        <form action="https://evil.test"><button>Send</button></form><p>Safe analysis</p>
      </body></html>`,
    });
    let call = 0;
    vi.stubGlobal("fetch", vi.fn(async () => (call++ === 0 ? redisResponse(1) : redisResponse(stored))));
    const res = response();

    await archiveDetailHandler(request({ method: "GET", query: { id: "desk-letter-1" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("Safe analysis");
    expect(res.body).toContain('href="#"');
    expect(res.body).not.toMatch(/<script|<iframe|onclick=|javascript:|<form|<button/i);
    expect(res.body).toContain("@media (max-width:680px)");
    expect(res.getHeader("Content-Security-Policy")).toContain("script-src 'none'");
    expect(res.getHeader("Content-Security-Policy")).toContain("frame-ancestors 'self'");
    expect(res.getHeader("Content-Security-Policy")).toContain("img-src data:");
    expect(res.getHeader("Content-Security-Policy")).not.toContain("img-src data: https:");
    expect(res.getHeader("X-Content-Type-Options")).toBe("nosniff");
  });

  it("rejects unsafe detail ids without reading storage", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const res = response();

    await archiveDetailHandler(request({ method: "GET", query: { id: "../secret" } }), res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toContain("Invalid newsletter id");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns only allowlisted public metadata", async () => {
    const sentAt = new Date().toISOString();
    let call = 0;
    const fetchMock = vi.fn(async (url) => {
      if (call++ === 0) return redisResponse(1);
      if (String(url).endsWith("/pipeline")) {
        return pipelineResponse([JSON.stringify({
          id: "spoofed-id",
          type: "newsletter",
          title: "Desk brief",
          sentAt,
          summary: "Visible summary",
          html: "<p>private body</p>",
          internalPrompt: "private",
        })]);
      }
      return redisResponse(["desk-letter-1"]);
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = response();

    await archiveListHandler(request({ method: "GET", query: { limit: "10" } }), res);

    expect(res.statusCode).toBe(200);
    const [item] = jsonBody(res).data;
    expect(item).toMatchObject({
      id: "desk-letter-1",
      type: "newsletter",
      title: "Desk brief",
      summary: "Visible summary",
    });
    expect(item.url).toMatch(/\/api\/archive\/desk-letter-1$/);
    expect(item).not.toHaveProperty("html");
    expect(item).not.toHaveProperty("internalPrompt");
  });

  it("fails closed when archive storage is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("upstream down", { status: 503 })));
    const res = response();

    await archiveListHandler(request({ method: "GET" }), res);

    expect(res.statusCode).toBe(503);
    expect(jsonBody(res)).toEqual({ error: "Archive storage is temporarily unavailable" });
  });
});

describe("authenticated archive ingest", () => {
  beforeEach(() => {
    process.env.ARCHIVE_INGEST_SECRET = "ingest-secret";
    process.env.KV_REST_API_URL = "https://redis.example.test";
    process.env.KV_REST_API_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.ARCHIVE_INGEST_SECRET;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    vi.unstubAllGlobals();
  });

  it("rejects an invalid bearer token before parsing or storage", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const res = response();

    await archiveIngestHandler(request({ headers: { authorization: "Bearer wrong-secret" }, body: {} }), res);

    expect(res.statusCode).toBe(401);
    expect(res.getHeader("WWW-Authenticate")).toBe('Bearer realm="archive-ingest"');
    expect(fetch).not.toHaveBeenCalled();
  });

  it("validates, minimizes, and atomically writes accepted records", async () => {
    let call = 0;
    const fetchMock = vi.fn(async () => (call++ === 0 ? redisResponse(1) : redisResponse(1)));
    vi.stubGlobal("fetch", fetchMock);
    const sentAt = new Date().toISOString();
    const res = response();

    await archiveIngestHandler(request({
      headers: { authorization: "Bearer ingest-secret" },
      body: {
        id: "desk-letter-2",
        type: "newsletter",
        date: sentAt.slice(0, 10),
        title: "Daily bias",
        sentAt,
        html: "<p>Full letter</p>",
        summary: "Summary",
        arbitrarySecret: "must not persist",
      },
    }), res);

    expect(res.statusCode).toBe(200);
    expect(jsonBody(res)).toMatchObject({ ok: true, id: "desk-letter-2" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [, options] = fetchMock.mock.calls[1];
    const command = JSON.parse(options.body);
    expect(command[0]).toBe("EVAL");
    expect(command.slice(2, 6)).toEqual(["3", "newsletter:desk-letter-2", "newsletter:meta:desk-letter-2", "newsletters:index"]);

    const fullRecord = JSON.parse(command[6]);
    const metadata = JSON.parse(command[7]);
    expect(fullRecord.html).toBe("<p>Full letter</p>");
    expect(fullRecord).not.toHaveProperty("arbitrarySecret");
    expect(metadata).not.toHaveProperty("html");
    expect(metadata).not.toHaveProperty("arbitrarySecret");
  });

  it("rejects records outside the retention window before storage", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const sentAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1_000).toISOString();
    const res = response();

    await archiveIngestHandler(request({
      headers: { authorization: "Bearer ingest-secret" },
      body: {
        id: "expired-letter",
        type: "newsletter",
        date: sentAt.slice(0, 10),
        title: "Expired letter",
        sentAt,
        html: "<p>Expired</p>",
      },
    }), res);

    expect(res.statusCode).toBe(400);
    expect(jsonBody(res).error).toContain("outside the 30-day retention window");
    expect(fetch).not.toHaveBeenCalled();
  });
});
