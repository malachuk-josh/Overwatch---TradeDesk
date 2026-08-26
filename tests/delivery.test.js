import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import archiveIngestHandler from "../api/archive/ingest.js";
import { deliverNewsletter, deliveryConfig } from "../api/archive/_deliver.js";
import { jsonBody, request, response } from "./helpers/http.js";

const redisResponse = (result, status = 200) => new Response(JSON.stringify({ result }), {
  status,
  headers: { "Content-Type": "application/json" },
});

const brevoResponse = (status = 201) => new Response(JSON.stringify({ messageId: "msg-1" }), {
  status,
  headers: { "Content-Type": "application/json" },
});

const configureDelivery = () => {
  process.env.BREVO_API_KEY = "xkeysib-test";
  process.env.NEWSLETTER_SENDER_EMAIL = "desk@example.test";
  process.env.NEWSLETTER_DELIVERY_TO = "reader-one@example.test, reader-two@example.test";
};

const clearDelivery = () => {
  delete process.env.BREVO_API_KEY;
  delete process.env.NEWSLETTER_SENDER_EMAIL;
  delete process.env.NEWSLETTER_SENDER_NAME;
  delete process.env.NEWSLETTER_DELIVERY_TO;
};

describe("newsletter delivery configuration", () => {
  afterEach(clearDelivery);

  it("is disabled until every required setting is present", () => {
    expect(deliveryConfig()).toBeNull();
    process.env.BREVO_API_KEY = "xkeysib-test";
    expect(deliveryConfig()).toBeNull();
    process.env.NEWSLETTER_SENDER_EMAIL = "desk@example.test";
    expect(deliveryConfig()).toBeNull();
    process.env.NEWSLETTER_DELIVERY_TO = "reader@example.test";
    expect(deliveryConfig()).toMatchObject({ sender: "desk@example.test", to: ["reader@example.test"] });
  });

  it("drops malformed recipients instead of sending to them", () => {
    configureDelivery();
    process.env.NEWSLETTER_DELIVERY_TO = "good@example.test, not-an-email, second@example.test,";
    expect(deliveryConfig().to).toEqual(["good@example.test", "second@example.test"]);
  });
});

describe("deliverNewsletter", () => {
  afterEach(() => {
    clearDelivery();
    vi.unstubAllGlobals();
  });

  it("skips quietly when delivery is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverNewsletter({ title: "Premarket", html: "<p>x</p>" });

    expect(result).toEqual({ attempted: false, reason: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not double-send letters already shipped as a Brevo campaign", async () => {
    configureDelivery();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverNewsletter({ title: "Wrap", html: "<p>x</p>", brevoCampaignId: 42 });

    expect(result).toEqual({ attempted: false, reason: "already_sent_as_campaign" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the letter to every configured recipient via Brevo", async () => {
    configureDelivery();
    process.env.NEWSLETTER_SENDER_NAME = "Overwatch Test Desk";
    const fetchMock = vi.fn(async () => brevoResponse());
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverNewsletter({
      type: "premarket",
      title: "Daily bias — premarket",
      subject: "Premarket: fade the gap",
      html: "<p>Full letter</p>",
    });

    expect(result).toEqual({ attempted: true, sent: true, recipients: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(options.headers["api-key"]).toBe("xkeysib-test");
    const payload = JSON.parse(options.body);
    expect(payload.sender).toEqual({ email: "desk@example.test", name: "Overwatch Test Desk" });
    expect(payload.to).toEqual([{ email: "reader-one@example.test" }, { email: "reader-two@example.test" }]);
    expect(payload.subject).toBe("Premarket: fade the gap");
    expect(payload.htmlContent).toBe("<p>Full letter</p>");
    expect(payload.tags).toContain("premarket");
  });

  it("reports a failed send without throwing", async () => {
    configureDelivery();
    vi.stubGlobal("fetch", vi.fn(async () => brevoResponse(401)));

    const result = await deliverNewsletter({ title: "Wrap", html: "<p>x</p>" });

    expect(result).toMatchObject({ attempted: true, sent: false });
    expect(result.error).toContain("401");
  });

  it("treats a network error as a failed send, not a crash", async () => {
    configureDelivery();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));

    const result = await deliverNewsletter({ title: "Wrap", html: "<p>x</p>" });

    expect(result).toMatchObject({ attempted: true, sent: false, error: "Delivery request failed" });
  });
});

describe("ingest-triggered delivery", () => {
  beforeEach(() => {
    process.env.ARCHIVE_INGEST_SECRET = "ingest-secret";
    process.env.KV_REST_API_URL = "https://redis.example.test";
    process.env.KV_REST_API_TOKEN = "test-token";
    configureDelivery();
  });

  afterEach(() => {
    delete process.env.ARCHIVE_INGEST_SECRET;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    clearDelivery();
    vi.unstubAllGlobals();
  });

  const letterBody = (extra = {}) => {
    const sentAt = new Date().toISOString();
    return {
      id: "premarket-today",
      type: "premarket",
      date: sentAt.slice(0, 10),
      title: "Premarket brief",
      sentAt,
      html: "<p>Letter</p>",
      ...extra,
    };
  };

  it("emails an archived letter the moment ingest stores it", async () => {
    const fetchMock = vi.fn(async (url) => (String(url).includes("api.brevo.com") ? brevoResponse() : redisResponse(1)));
    vi.stubGlobal("fetch", fetchMock);
    const res = response();

    await archiveIngestHandler(request({ headers: { authorization: "Bearer ingest-secret" }, body: letterBody() }), res);

    expect(res.statusCode).toBe(200);
    expect(jsonBody(res)).toMatchObject({ ok: true, delivery: { attempted: true, sent: true, recipients: 2 } });
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("api.brevo.com"))).toBe(true);
  });

  it("still archives successfully when the email send fails", async () => {
    const fetchMock = vi.fn(async (url) => (String(url).includes("api.brevo.com") ? brevoResponse(503) : redisResponse(1)));
    vi.stubGlobal("fetch", fetchMock);
    const res = response();

    await archiveIngestHandler(request({ headers: { authorization: "Bearer ingest-secret" }, body: letterBody() }), res);

    expect(res.statusCode).toBe(200);
    expect(jsonBody(res)).toMatchObject({ ok: true, delivery: { attempted: true, sent: false } });
  });

  it("honors a deliver:false opt-out without contacting Brevo", async () => {
    const fetchMock = vi.fn(async () => redisResponse(1));
    vi.stubGlobal("fetch", fetchMock);
    const res = response();

    await archiveIngestHandler(request({ headers: { authorization: "Bearer ingest-secret" }, body: letterBody({ deliver: false }) }), res);

    expect(res.statusCode).toBe(200);
    expect(jsonBody(res)).toMatchObject({ ok: true, delivery: { attempted: false, reason: "opted_out" } });
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("api.brevo.com"))).toBe(false);
  });
});
