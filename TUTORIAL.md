# Tutorial: how the heatmap demo works

This walks through the two pieces of the demo: the offline **data pipeline** that
prepares the dataset, and the **browser code** that renders the heatmap. For the
technologies used and how to run it, see the [README](README.md).

## Data pipeline

`data-pipeline/transform-data.ts` takes a full city crime GeoJSON export and
reduces it to the small set of fields the browser needs (`offense`, a computed
`age`, the report `date`, and the Point geometry). Trimming the file is the whole
point — it cuts browser load times. The script is parameterized (offense/date
field names and an offense filter are CLI options) so the same code works for
different cities; see [`data-pipeline/README.md`](data-pipeline/README.md) for the
exact commands.

The core of the transform filters to the offenses we want and reshapes each
feature:

```typescript
for (const feature of data.features) {
    if (!isPoint(feature.geometry)) continue;
    const offense = String(feature.properties[offenseField] ?? '');
    if (offenseFilter && !offenseFilter.has(offense)) continue;
    const reportedAt = new Date(feature.properties[dateField] as string | number);
    if (Number.isNaN(reportedAt.getTime())) continue;
    features.push({
        type: 'Feature',
        properties: {
            offense,
            // age is days since the incident was reported (intensity source)
            age: Math.floor((Date.now() - reportedAt.getTime()) / MS_PER_DAY),
            // report date, YYYY-MM-DD (status line range)
            date: reportedAt.toISOString().slice(0, 10),
        },
        geometry: feature.geometry,
    });
}
```

Each feature in the original DC export looks similar to (most properties omitted):

```json
{
    "type": "Feature",
    "properties": {
        "CCN": "24089883",
        "REPORT_DAT": "2024-06-13T16:01:39Z",
        "OFFENSE": "MOTOR VEHICLE THEFT",
        "LATITUDE": 38.9398002378,
        "LONGITUDE": -77.0625358005
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-77.062538105942409, 38.939808031652007]
    }
}
```

Each feature in the transformed output is just:

```json
{
    "type": "Feature",
    "properties": { "offense": "MOTOR VEHICLE THEFT", "age": 322, "date": "2024-07-30" },
    "geometry": {
        "type": "Point",
        "coordinates": [-76.97595710905172, 38.913029933944934]
    }
}
```

`age` is computed at transform time relative to "now", so it is baked into the
output file and only refreshes when you re-run the pipeline. Output is minified.

## Rendering the heatmap

The heatmap is rendered inside a static HTML page (`app/index.html`). Leaflet,
heatmap.js, and axios are loaded from public CDNs; the leaflet-heatmap plugin is
not on a public CDN, so it is vendored in `app/public/leaflet-heatmap.js`. (If you
plan to use heatmap.js in a commercial application, see
[Patrick Wied's site](https://www.patrick-wied.at/static/heatmapjs/) for the
licensing terms.)

Vite bundles `app/src/crime.ts`, which fetches the selected city's data file and
flattens each feature into `{ lat, lng, offense, age, date }` points. A heatmap
is different from a plain point plot because the added dimensions of **radius**
and **intensity** allow for greater visual detail. This demo offers two intensity
modes: **recency** maps each point's `age`, and **density** gives every incident
an equal value so overlapping points add up.

The map itself is created once, from an OpenStreetMap tile layer, centered on the
first preset:

```typescript
const map = new L.Map('map', {
    center: new L.LatLng(PRESETS[0].center.lat, PRESETS[0].center.lng),
    zoom: PRESETS[0].zoom,
    layers: [baseLayer],
});
```

heatmap.js fixes `radius` and `valueField` at construction, so the radius slider
and intensity toggle work by **rebuilding** the layer and re-supplying the data
plus the min/max that map values into the color range:

```typescript
heatmapLayer = new HeatmapOverlay<HeatmapPoint>({
    radius,
    useLocalExtrema: mode === 'count',
    valueField: 'value',
});
map.addLayer(heatmapLayer);
heatmapLayer.setData({ min, max, data });
```

Switching the **city** dropdown re-runs the same flow against a different
`data.<city>.json` (defined in `app/src/presets.ts`): it re-centers the map,
repopulates the crime-type filter, and updates the title and source link.
