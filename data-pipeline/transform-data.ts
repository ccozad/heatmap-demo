import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

// Reduce a full crime GeoJSON export down to the fields the heatmap app needs:
// { offense, age, date } + Point geometry. Source field names differ per city,
// so the offense/date property names (and the offense filter) are CLI options.
//
// Usage:
//   npm run transform -- <input.geojson> [options]
//
// Options:
//   --out <file>            output path (default: data.json)
//   --offense-field <name>  source property for the crime type (default: OFFENSE)
//   --date-field <name>     source property for the report date (default: REPORT_DAT)
//   --offenses "A,B,C"      keep only these offense types (default: keep all)
//
// Examples:
//   npm run transform -- Crime_Incidents_in_2024.geojson \
//     --out data.dc.json \
//     --offenses "MOTOR VEHICLE THEFT,ROBBERY,ASSAULT W/DANGEROUS WEAPON,BURGLARY,HOMICIDE,SEX ABUSE"
//   npm run transform -- baltimore_part1_2024.geojson \
//     --out data.baltimore.json --offense-field Description --date-field CrimeDateTime \
//     --offenses "AUTO THEFT,ROBBERY,AGG. ASSAULT,BURGLARY,HOMICIDE,RAPE"

interface PointGeometry {
    type: 'Point';
    // GeoJSON order: [longitude, latitude]
    coordinates: [number, number];
}

interface RawFeature {
    type: 'Feature';
    properties: Record<string, unknown>;
    geometry: { type: string; coordinates: unknown } | null;
}

interface RawFeatureCollection {
    type: 'FeatureCollection';
    features: RawFeature[];
}

interface TransformedFeature {
    type: 'Feature';
    properties: { offense: string; age: number; date: string };
    geometry: PointGeometry;
}

interface TransformedFeatureCollection {
    type: 'FeatureCollection';
    features: TransformedFeature[];
}

const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
        out: { type: 'string', default: 'data.json' },
        'offense-field': { type: 'string', default: 'OFFENSE' },
        'date-field': { type: 'string', default: 'REPORT_DAT' },
        offenses: { type: 'string' },
    },
});

const fileName = positionals[0];
const outPath = values.out;
const offenseField = values['offense-field'];
const dateField = values['date-field'];
const offenseFilter = values.offenses
    ? new Set(values.offenses.split(',').map((o) => o.trim()))
    : null;

if (!fileName) {
    console.error('Please provide a geojson file name as an argument.');
    process.exit(1);
} else if (!fs.existsSync(fileName)) {
    console.error(`File ${fileName} does not exist.`);
    process.exit(1);
} else if (path.extname(fileName) !== '.geojson') {
    console.error('The provided file is not a geojson file.');
    process.exit(1);
}
console.log(`Processing file: ${fileName}`);

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function isPoint(geometry: RawFeature['geometry']): geometry is PointGeometry {
    if (!geometry || geometry.type !== 'Point') {
        return false;
    }
    const coords = geometry.coordinates;
    return (
        Array.isArray(coords) &&
        coords.length === 2 &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number' &&
        // Drop the (0, 0) null-island placeholders some feeds emit.
        (coords[0] !== 0 || coords[1] !== 0)
    );
}

const fileContent = fs.readFileSync(fileName, 'utf8');
const data = JSON.parse(fileContent) as RawFeatureCollection;

const features: TransformedFeature[] = [];
for (const feature of data.features) {
    if (!isPoint(feature.geometry)) {
        continue;
    }
    const offense = String(feature.properties[offenseField] ?? '');
    if (offenseFilter && !offenseFilter.has(offense)) {
        continue;
    }
    const reportedAt = new Date(feature.properties[dateField] as string | number);
    if (Number.isNaN(reportedAt.getTime())) {
        continue;
    }
    features.push({
        type: 'Feature',
        properties: {
            offense,
            // age is days since the incident was reported (intensity source)
            age: Math.floor((Date.now() - reportedAt.getTime()) / MS_PER_DAY),
            // date the incident was reported, YYYY-MM-DD (status line range)
            date: reportedAt.toISOString().slice(0, 10),
        },
        geometry: feature.geometry,
    });
}

const transformedData: TransformedFeatureCollection = {
    type: 'FeatureCollection',
    features,
};

// Write the transformed data (minified — it is generated, not hand-edited)
fs.writeFileSync(outPath, JSON.stringify(transformedData));
console.log(`Wrote ${features.length} features to ${outPath}`);
