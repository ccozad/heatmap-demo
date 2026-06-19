# Overview

This pipeline filters a full crime GeoJSON export down to the small set of fields
the heatmap app needs (`CCN`, a computed `age`, and the Point geometry). It is a
TypeScript script run with [tsx](https://tsx.is/).

# Usage

1. Install dependencies once: `npm install`
2. Visit https://catalog.data.gov/dataset/crime-incidents-in-2024 and download the
   geojson file into this `data-pipeline` folder.
3. Generate the filtered file (defaults to motor vehicle theft):

   ```bash
   npm run transform Crime_Incidents_in_2024.geojson
   ```

   This writes `data.json` in the current directory. Copy it to `app/public/data.json`
   so the app serves it.

Type-check the script with `npm run typecheck`.
