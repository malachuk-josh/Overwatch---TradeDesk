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
```

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

## Vercel Deployment

Pushes to `main` trigger automatic Vercel deployments via the GitHub integration.
Free tier limit: 100 deployments/day — upgrade to Pro if the limit is hit.

## Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # Production build
```
