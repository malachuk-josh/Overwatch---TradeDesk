# Overwatch — Daily Bias Desk

## Project Overview
React + Vite trading intelligence dashboard. Fetches live market data, synthesizes a daily thesis, and generates a newsletter.

## Architecture

```
/src/App.jsx              React frontend (all UI components)
/api/desk.js              Vercel serverless API handler
/api/archive/ingest.js    POST — authenticated newsletter ingest
/api/archive/index.js     GET  — list archived newsletters (metadata)
/api/archive/[id].js      GET  — serve stored HTML as standalone page
/api/voice.js             Voice desk: talk to the desk leads (op-routed; see below)
/src/personas.js          The five desk leads — shared by the app and api/voice.js
/src/DeskTalk.jsx         Voice desk drawer (lazy-loaded) + /src/voice/ audio engine
```

Vercel's Hobby plan allows 12 serverless functions per project. Every non-underscored `.js`
file under `api/` counts, so new server work goes into an existing function or an op-routed one
like `api/voice.js`; helpers and tests in `api/` must start with `_`.

### Voice desk (`/api/voice?op=`)

Ported from the Barnabas voice harness: speech-to-text in the browser, one streamed chat turn per
utterance (NDJSON), sentence-by-sentence text-to-speech in each lead's own voice. The server owns
every prompt — the client names a lead by id and never sends prompt text. All ops require a
signed-in Clerk session and are rate-limited.

| Op | Method | Purpose |
|----|--------|---------|
| `status` | GET | What's configured (no keys or voice ids) |
| `chat` | POST | One turn with a desk lead, streamed as NDJSON |
| `tts` | POST | One sentence in the lead's ElevenLabs voice (MP3) |
| `stt-token` | GET | 60-second Deepgram token + vocabulary boosts |
| `filler` | GET | A short "Mm." in the lead's voice, cached in Redis |

### API Operations

| Operation | Direction | Purpose |
|-----------|-----------|---------|
| `market` | fetch | Live prices, sectors, Fear & Greed |
| `news` | fetch | Headlines, catalysts |
| `points` | fetch | Internals, calendar, positioning |
| `recap` | fetch | Session summary |
| `thesis` | fetch | Daily bias call |
| `newsletter` | fetch | Morning note (includes trade plan) |
| `backtest` | fetch | Strategy Lab: replay the VIX Range scalper over Yahoo intraday bars |
| `algolive` | fetch/write | Strategy Lab: evaluate live setup on the latest bar + Redis forward-test journal |
| `getarchive` | fetch | Load archive from Upstash Redis |
| `savearchive` | write | Persist archive to Upstash Redis |

### Environment Variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude AI synthesis (optional — falls back to template) |
| `KV_REST_API_URL` | Upstash Redis REST URL for archive persistence |
| `KV_REST_API_TOKEN` | Upstash Redis REST token for archive persistence |
| `UPSTASH_REDIS_REST_URL` | Alias for KV_REST_API_URL |
| `UPSTASH_REDIS_REST_TOKEN` | Alias for KV_REST_API_TOKEN |
| `ARCHIVE_INGEST_SECRET` | Bearer token for POST /api/archive/ingest |
| `BREVO_API_KEY` | Brevo transactional key — emails each ingested letter (optional) |
| `NEWSLETTER_SENDER_EMAIL` | Verified Brevo sender for newsletter delivery |
| `NEWSLETTER_SENDER_NAME` | Sender display name (default "Overwatch Desk") |
| `NEWSLETTER_DELIVERY_TO` | Comma-separated recipient emails for delivery |
| `ANTHROPIC_VOICE_MODEL` | Voice desk model (default `claude-sonnet-5-5`; falls back to Haiku 4.5 if rejected) |
| `ELEVENLABS_API_KEY` | Desk lead voices (optional — the browser's own voice is used without it) |
| `ELEVENLABS_VOICE_JACK` | Jack's ElevenLabs voice id |
| `ELEVENLABS_VOICE_JESSE` | Ghost of Jesse's voice id |
| `ELEVENLABS_VOICE_MIKE` | Cousin Mike's voice id |
| `ELEVENLABS_VOICE_PAUL` | Coach Paul's voice id |
| `ELEVENLABS_VOICE_LOU` | Professor Lou's voice id |
| `ELEVENLABS_VOICE_ID` | Shared fallback voice for any lead without their own |
| `ELEVENLABS_MODEL` | ElevenLabs model (default `eleven_v4_turbo`) |
| `DEEPGRAM_API_KEY` | Hands-free listening (optional — push-to-talk browser recognition without it) |

## Vercel Deployment

Pushes to `main` trigger automatic Vercel deployments via the GitHub integration.
Free tier limit: 100 deployments/day — upgrade to Pro if the limit is hit.

## Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # Production build
```
