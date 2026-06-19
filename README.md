# Heatmap Demo

An interactive heatmap of US city crime data overlaid on a map. Pick a city,
filter by crime type, and change how the heat is rendered — all in a static,
no-backend web app.

**Live demo: https://ccozad.github.io/heatmap-demo/**

![Heatmap example](/images/heatmap.png?raw=true "Heatmap example")

## What's in this demo

- **Datasets** — real 2024 open crime-incident data, curated to a violent +
  vehicle-crime set and reduced to just the fields the map needs:
  - Washington, DC — [Crime Incidents in 2024](https://catalog.data.gov/dataset/crime-incidents-in-2024) (~9,600 incidents)
  - Baltimore, MD — [Part 1 Crime Data](https://data.baltimorecity.gov/datasets/part-1-crime-data) (~18,000 incidents)
- **Visualization** — a [heatmap.js](https://www.patrick-wied.at/static/heatmapjs/)
  layer on a [Leaflet](https://leafletjs.com/) +
  [OpenStreetMap](https://www.openstreetmap.org/) map. The intensity is
  data-driven, not a plain point plot.
- **Interactive controls** — city preset, crime-type filter, a radius slider, and
  an intensity toggle (incident **recency** vs **density**), plus a color legend
  and a live status line (incident count, date range, current filter).
- **Built with** — TypeScript, [Vite](https://vite.dev/), Leaflet, heatmap.js
  (with the vendored leaflet-heatmap plugin), and axios. The data pipeline is a
  TypeScript script run with [tsx](https://tsx.is/). There is no runtime server —
  it deploys as static files to GitHub Pages.

## Run locally

The web app lives in [`app/`](app/) — a Vite static site:

```bash
cd app
npm install
npm run dev        # http://localhost:3000/
```

Other scripts: `npm run build` (static build → `app/dist/`), `npm run preview`,
`npm run lint`, `npm run format`. See [`app/README.md`](app/README.md) for details.

## Refreshing or adding data

The [`data-pipeline/`](data-pipeline/) folder turns a full city crime export into
the compact `data.<city>.json` the app loads. See
[`data-pipeline/README.md`](data-pipeline/README.md) for the per-city transform
commands and how to add a new city.

## How it's built

For a walkthrough of the data pipeline and the heatmap/Leaflet wiring, see
[TUTORIAL.md](TUTORIAL.md).
