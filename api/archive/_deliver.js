// api/archive/_deliver.js
// Newsletter email delivery (audit roadmap "Later" — morning delivery).
// The desk's premarket (7:20 AM ET) and wrap (5:30 PM ET) letters already arrive here on
// schedule via POST /api/archive/ingest; this fans each one out to the desk's email list the
// moment it lands, so delivery rides the existing generation schedule instead of a new cron.
//
// Configuration (all optional — delivery is skipped, never fatal, when unset):
//   BREVO_API_KEY             Brevo transactional API key (xkeysib-…)
//   NEWSLETTER_DELIVERY_TO    Comma-separated recipient emails
//   NEWSLETTER_SENDER_EMAIL   Verified Brevo sender address
//   NEWSLETTER_SENDER_NAME    Display name (default "Overwatch Desk")

const DELIVERY_TIMEOUT_MS = 8_000;
const MAX_RECIPIENTS = 50;

const isEmail = (value) => typeof value === "string" && /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,24}$/.test(value);

export const deliveryConfig = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.NEWSLETTER_SENDER_EMAIL;
  const to = String(process.env.NEWSLETTER_DELIVERY_TO || "")
    .split(",")
    .map((value) => value.trim())
    .filter(isEmail)
    .slice(0, MAX_RECIPIENTS);
  if (!apiKey || !isEmail(sender) || !to.length) return null;
  return { apiKey, sender, senderName: process.env.NEWSLETTER_SENDER_NAME || "Overwatch Desk", to };
};

// Sends one archived letter to the configured list. Returns a small status object for the
// ingest response; throws nothing — a delivery failure must never fail the archive write.
export async function deliverNewsletter(record) {
  const config = deliveryConfig();
  if (!config) return { attempted: false, reason: "not_configured" };
  // The upstream automation already sent this letter as a Brevo campaign — don't double-send.
  if (record.brevoCampaignId != null && record.brevoCampaignId !== "") {
    return { attempted: false, reason: "already_sent_as_campaign" };
  }
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: config.sender, name: config.senderName },
        to: config.to.map((email) => ({ email })),
        subject: record.subject || record.title,
        htmlContent: record.html,
        tags: ["overwatch-archive", String(record.type || "newsletter").slice(0, 40)],
      }),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error("Newsletter delivery failed", response.status);
      return { attempted: true, sent: false, error: `Brevo returned HTTP ${response.status}` };
    }
    return { attempted: true, sent: true, recipients: config.to.length };
  } catch (error) {
    console.error("Newsletter delivery failed", error instanceof Error ? error.name : "UnknownError");
    return { attempted: true, sent: false, error: "Delivery request failed" };
  }
}
