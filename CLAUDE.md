# Overwatch — Daily Bias Desk

## Project Overview
React + Vite trading intelligence dashboard. Fetches live market data, synthesizes a daily thesis, generates a newsletter, and now displays a pre-market brief from the 5 AM daily research routine.

## Daily Research Routine Integration

The **5 AM EDT Claude routine** (Routines → "Daily market research") should POST its findings to the deployed desk API at the end of each run.

### Routine Output Format

At the end of the routine, POST to `https://<YOUR_VERCEL_DOMAIN>/api/desk`:

```json
{
  "operation": "brief",
  "payload": {
    "secret": "<BRIEF_SECRET env var value>",
    "date": "2026-06-21",
    "runAt": "5:04 AM EDT",
    "marketOverview": "Pre-market snapshot text — indices, futures, macro read.",
    "overnightNews": [
      "Fed's Williams signals 2 cuts expected in 2026",
      "CPI print due at 8:30 AM ET — consensus 0.2% MoM"
    ],
    "calendar": [
      { "time": "8:30 AM ET", "event": "CPI (MoM)", "importance": "high" },
      { "time": "2:00 PM ET", "event": "Fed Minutes", "importance": "high" }
    ],
    "keyLevels": "SPY pivot ~585 | Resistance: 590 / 595 | Support: 580 / 575",
    "setups": "Bullish: bounce at 580-582 target 590 SL <578. Bearish: breakdown <580 target 575 SL >582.",
    "risks": ["CPI surprise could gap indices 1-2%", "Fed minutes at 2 PM"],
    "summary": "Overall pre-market lean: neutral-to-cautious. Wait for CPI clarity before positioning."
  }
}
```

### Routine Instruction Addition

Add this step at the end of the routine instructions:

> After completing research, POST the structured findings to the TradeDesk API endpoint so they appear in the newsletter feed's Morning Brief card.

### Environment Variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude AI synthesis (optional — falls back to template) |
| `BRIEF_SECRET` | Auth token for routine → desk API calls (optional but recommended) |
| `KV_REST_API_URL` | Vercel KV endpoint for persistent brief storage (optional) |
| `KV_REST_API_TOKEN` | Vercel KV auth token (optional) |

**Without KV**: the brief is cached in memory (warm Lambda instances only — works fine on the same day the routine runs).

**With KV**: brief persists across cold starts for 24h. Set up via Vercel Dashboard → Storage → KV.

## Architecture

```
/src/App.jsx       React frontend (all UI components)
/api/desk.js       Vercel serverless API handler
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
| `brief` | POST | Routine pushes daily research |
| `getbrief` | fetch | App retrieves stored brief |

## Vercel Deployment

Pushes to `main` trigger automatic Vercel deployments via the GitHub integration.
Free tier limit: 100 deployments/day — upgrade to Pro if the limit is hit.

## Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # Production build
```
