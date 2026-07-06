# Cellar

A premium AI-powered wine cellar application scaffold.

## What is included

- Next.js app structure with TypeScript and Tailwind CSS
- A polished first-screen cellar dashboard
- AI bottle recognition using OpenAI high-detail image understanding
- Live bottle-profile research using OpenAI web search with source links
- AI sommelier recommendation panel
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

The standalone `preview.html` cannot securely call private recognition services. The Next app sends the original bottle image to OpenAI through `/api/recognize-wine`:

```bash
OPENAI_API_KEY=your_openai_key_here
OPENAI_WINE_MODEL=gpt-5.4
OPENAI_RESEARCH_MODEL=gpt-5.4
```

Opening a saved bottle's full details runs fresh web research. Cellar prioritizes official producer pages, CellarTracker, Vivino, Wine Spectator, Decanter, and Wine Advocate, while only displaying publicly available exact-vintage information.

Licensed sources such as Vivino, CellarTracker, Wine-Searcher, or critic databases should be connected through approved APIs or data agreements before showing their ratings or prices.
