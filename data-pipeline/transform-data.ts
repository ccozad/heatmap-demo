import fs from 'node:fs';
import path from 'node:path';

// Offense types kept for the demo. A curated violent + vehicle-crime set: rich
// enough for the crime-type dropdown, small enough to keep data.json snappy.
// (Issue #4 makes this configurable from the CLI.)
const CURATED_OFFENSES = new Set([
    'MOTOR VEHICLE THEFT',
    'ROBBERY',
    'ASSAULT W/DANGEROUS WEAPON',
    'BURGLARY',
    'HOMICIDE',
    'SEX ABUSE',
]);

// ---- Source (raw DC crime export) shapes ----

interface PointGeometry {
    type: 'Point';
    // GeoJSON order: [longitude, latitude]
    coordinates: [number, number];
}

interface RawCrimeProperties {
    CCN: string;
    // ISO string (data.gov download) or epoch milliseconds (ArcGIS feed).
    REPORT_DAT: string | number;
    OFFENSE: string;
    [key: string]: unknown;
}

interface RawCrimeFeature {
    type: 'Feature';
    properties: RawCrimeProperties;
    geometry: PointGeometry | { type: string; coordinates: unknown } | null;
}

interface RawFeatureCollection {
    type: 'FeatureCollection';
    features: RawCrimeFeature[];
}

// ---- Transformed (browser-ready) shapes ----

interface TransformedFeature {
    type: 'Feature';
    properties: { offense: string; age: number; date: string };
    geometry: PointGeometry;
}

interface TransformedFeatureCollection {
    type: 'FeatureCollection';
    features: TransformedFeature[];
}

// The file name is the first argument
const fileName = process.argv[2];
if (!fileName) {
    console.error('Please provide a geojson file name as an argument.');
    process.exit(1);
} else if (!fs.existsSync(fileName)) {
    console.error(`File ${fileName} does not exist.`);
    process.exit(1);
} else if (path.extname(fileName) !== '.geojson') {
    console.error('The provided file is not a geojson file.');
    process.exit(1);
} else {
    console.log(`Processing file: ${fileName}`);
}

// Keep only Point-geometry incidents in the curated offense set. The type
// predicate narrows geometry to PointGeometry for the map step below.
function isCuratedPoint(
    feature: RawCrimeFeature,
): feature is RawCrimeFeature & { geometry: PointGeometry } {
    return (
        !!feature.geometry &&
        feature.geometry.type === 'Point' &&
        CURATED_OFFENSES.has(feature.properties.OFFENSE)
    );
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Read in all of the file and parse it as JSON
const fileContent = fs.readFileSync(fileName, 'utf8');
const data = JSON.parse(fileContent) as RawFeatureCollection;
const transformedData: TransformedFeatureCollection = {
    type: 'FeatureCollection',
    features: data.features.filter(isCuratedPoint).map((feature) => {
        const reportedAt = new Date(feature.properties.REPORT_DAT);
        return {
            type: 'Feature',
            properties: {
                offense: feature.properties.OFFENSE,
                // age is days since the incident was reported (intensity source)
                age: Math.floor((Date.now() - reportedAt.getTime()) / MS_PER_DAY),
                // date the incident was reported, YYYY-MM-DD (status line range)
                date: reportedAt.toISOString().slice(0, 10),
            },
            geometry: feature.geometry,
        };
    }),
};

// Write the transformed data (minified — it is generated, not hand-edited)
fs.writeFileSync('data.json', JSON.stringify(transformedData));
console.log(`Wrote ${transformedData.features.length} features to data.json`);
