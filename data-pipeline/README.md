# Overview

This pipeline filters a full crime GeoJSON export down to the small set of fields
the heatmap app needs (`offense`, a computed `age`, the report `date`, and the
Point geometry). It is a TypeScript script run with [tsx](https://tsx.is/), and it
is parameterized so it works for any city's export, not just one.

Install dependencies once: `npm install`.

# Command

```bash
npm run transform -- <input.geojson> [options]
```

Options:

| Option             | Default       | Purpose                                          |
| ------------------ | ------------- | ------------------------------------------------ |
| `--out <file>`     | `data.json`   | Output path                                      |
| `--offense-field`  | `OFFENSE`     | Source property holding the crime type           |
| `--date-field`     | `REPORT_DAT`  | Source property holding the report date          |
| `--offenses "A,B"` | _(keep all)_  | Comma-separated offense types to keep            |

Dates may be ISO strings or epoch milliseconds; (0, 0) "null island" points are
dropped. Output is minified.

# Refreshing each city's data

The app loads one `data.<city>.json` per preset (see `app/src/presets.ts`). To
refresh a city, download its full export, run the transform, then copy the result
into `app/public/`.

**Washington, DC** — [Crime Incidents in 2024](https://catalog.data.gov/dataset/crime-incidents-in-2024):

```bash
npm run transform -- Crime_Incidents_in_2024.geojson \
  --out data.dc.json \
  --offenses "MOTOR VEHICLE THEFT,ROBBERY,ASSAULT W/DANGEROUS WEAPON,BURGLARY,HOMICIDE,SEX ABUSE"
cp data.dc.json ../app/public/data.dc.json
```

**Baltimore, MD** — [Part 1 Crime Data](https://data.baltimorecity.gov/datasets/part-1-crime-data)
(filter to 2024 before exporting):

```bash
npm run transform -- baltimore_part1_2024.geojson \
  --out data.baltimore.json --offense-field Description --date-field CrimeDateTime \
  --offenses "AUTO THEFT,ROBBERY,AGG. ASSAULT,BURGLARY,HOMICIDE,RAPE"
cp data.baltimore.json ../app/public/data.baltimore.json
```

To add a new city: produce its `data.<id>.json` the same way and append a preset
to `app/src/presets.ts` (display name, `dataPath`, map center/zoom, source).

Type-check the script with `npm run typecheck`.
