# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A minimal demo that renders a heatmap overlaid on a Leaflet map, using 2024 Washington DC motor vehicle theft crime data as the dataset. TypeScript (ESM), built and served with Vite. No tests yet.

## Commands

Run the demo (from `/app`):
```bash
cd app && npm install
npm run dev        # Vite dev server with hot reload at http://localhost:3000/
npm run typecheck  # tsc --noEmit (tsconfig.json app + tsconfig.node.json config)
npm run build      # typecheck, then production static build → app/dist/
npm run preview    # serve the built dist/ to verify a production build
npm run lint       # ESLint (flat config, typescript-eslint)
npm run format     # Prettier (.prettierrc)
```

Data pipeline (from `/data-pipeline`, separate package): `npm install`, then `npm run transform -- <file.geojson> [--out <f>] [--offense-field <n>] [--date-field <n>] [--offenses "A,B"]` (runs the TS script via `tsx`); `npm run typecheck` to type-check. See `data-pipeline/README.md` for the per-city refresh commands.

Regenerate the data file (from `/data-pipeline`):
```bash
# Download the geojson from https://catalog.data.gov/dataset/crime-incidents-in-2024 into data-pipeline/ first
node transform-data.js Crime_Incidents_in_2024.geojson   # writes data.json in the cwd
```
The script's output `data.json` must be copied to `app/public/data.json` to be served — it is not written there automatically.

## Architecture

Two independent pieces with a hand-carried data handoff between them:

1. **`data-pipeline/transform-data.ts`** — An offline, one-shot TypeScript script (run via `tsx`), parameterized by CLI flags (`--out`, `--offense-field`, `--date-field`, `--offenses`) so it works for any city's export. Reads a full crime geojson, keeps Point features (optionally filtered to an offense set), and reduces each to `offense`, a computed `age` (days since the report date), and `date` (YYYY-MM-DD), plus `geometry`. Output is minified; dates may be ISO strings or epoch ms; (0,0) points are dropped. `age` is computed at transform time relative to `Date.now()`, so it is baked into the output and only refreshes when the pipeline is re-run.

2. **`app/`** — A Vite static site in TypeScript. `app/index.html` is the Vite entry (markup for the control panel, legend, status line, and loading/error overlay); `app/src/crime.ts` is the bundled ESM module; `app/src/presets.ts` is the city registry; `app/src/types.ts` holds the dataset interfaces; `app/src/style.css` (imported from `crime.ts`) holds the responsive layout; `app/public/` holds assets served at the web root (one `data.<city>.json` per preset, the vendored `leaflet-heatmap.js`). Build output lands in `app/dist/`.
   - `index.html` loads Leaflet, axios, and heatmap.js from CDNs (pinned, with SRI hashes); `leaflet-heatmap.js` (the Leaflet plugin) is vendored locally because it isn't on a public CDN. These arrive as globals (`L`, `axios`, `HeatmapOverlay`) — typed as ambient globals in `app/src/globals.d.ts` (and declared for ESLint in `eslint.config.js`) so the ESM module can reference them without importing/bundling the libraries.
   - `crime.ts` is the entry point: creates the `L.Map` + base layer once, then `loadPreset()` fetches the selected city's `data.<city>.json`, re-centers the map, repopulates the crime-type dropdown, and updates the title/source; `render()` (re)builds the `HeatmapOverlay` on every control change. Add a city by shipping its `data.<id>.json` and appending to `PRESETS` in `presets.ts`.

### Heatmap intensity model

The heatmap reads each point's `value` (set via `valueField: 'value'`) against the min/max passed to `setData` to pick a color. Two intensity modes (the Intensity dropdown): **age** maps `value = age` against the age min/max (older = hotter); **count** sets every `value = 1` with `useLocalExtrema`, so overlapping incidents add up into density. Because heatmap.js fixes `radius`/`valueField` at construction, the radius slider and intensity toggle work by **rebuilding** the layer in `render()`, not mutating it. The map is hard-centered on DC (`38.904722, -77.016389`, zoom 12) in `crime.ts` — change those constants if pointing at different data.

## Conventions / gotchas

- No test tooling exists yet; "verifying" means `npm run build`/`npm run preview` and loading the page in a browser. TypeScript (`npm run typecheck`), ESLint + Prettier are wired (`npm run lint` / `npm run format`).
- `data-pipeline/transform-data.ts` writes `data.json` to the current directory; it must be copied to `app/public/data.json` to be served. Keep them in sync manually.
- The leaflet-heatmap plugin (heatmap.js by Patrick Wied) has commercial-use terms — see https://www.patrick-wied.at/static/heatmapjs/ before reusing in a commercial product.
