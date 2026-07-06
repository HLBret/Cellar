# Cellar

A premium AI-powered wine cellar application scaffold.

## What is included

- Next.js app structure with TypeScript and Tailwind CSS
- A polished first-screen cellar dashboard
- AI bottle recognition flow with local preview fallback and an OpenAI Vision-ready backend endpoint
- AI sommelier recommendation panel
- Vintage intelligence and comparison UI
- Collection dashboard metrics
- Regional map preview
- Mobile-first responsive styling
- `preview.html` for immediate local viewing without a dev server

## Running the Next app

Install dependencies in an environment with Node.js, then run:

```bash
npm install
npm run dev
```

This workspace did not expose Node.js during scaffolding, so `preview.html` is included as a standalone preview.

## AI wine recognition

The standalone `preview.html` uses a local fallback so it can work from a file on your Mac. The deployed Next app can use OpenAI Vision through `/api/recognize-wine` once these environment variables are set:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_WINE_MODEL=gpt-5.5
```

Licensed sources such as Vivino, CellarTracker, Wine-Searcher, or critic databases should be connected through approved APIs or data agreements before showing their ratings or prices.
