# Overwatch — Daily Bias Desk

## Project Overview
React + Vite trading intelligence dashboard. Fetches live market data, synthesizes a daily thesis, and generates a newsletter.

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

### Environment Variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude AI synthesis (optional — falls back to template) |

## Vercel Deployment

Pushes to `main` trigger automatic Vercel deployments via the GitHub integration.
Free tier limit: 100 deployments/day — upgrade to Pro if the limit is hit.

## Development

```bash
npm install
npm run dev       # Vite dev server
npm run build     # Production build
```
