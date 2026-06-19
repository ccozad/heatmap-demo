import fs from 'node:fs';
import path from 'node:path';

// ---- Source (raw DC crime export) shapes ----

interface PointGeometry {
    type: 'Point';
    // GeoJSON order: [longitude, latitude]
    coordinates: [number, number];
}

interface RawCrimeProperties {
    CCN: string;
    REPORT_DAT: string;
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
    properties: { CCN: string; age: number };
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

// Keep only Point-geometry motor vehicle thefts. The type predicate narrows
// geometry to PointGeometry for the map step below.
function isPointTheft(
    feature: RawCrimeFeature,
): feature is RawCrimeFeature & { geometry: PointGeometry } {
    return (
        !!feature.geometry &&
        feature.geometry.type === 'Point' &&
        feature.properties.OFFENSE === 'MOTOR VEHICLE THEFT'
    );
}

// Read in all of the file and parse it as JSON
const fileContent = fs.readFileSync(fileName, 'utf8');
const data = JSON.parse(fileContent) as RawFeatureCollection;
const transformedData: TransformedFeatureCollection = {
    type: 'FeatureCollection',
    features: data.features.filter(isPointTheft).map((feature) => ({
        type: 'Feature',
        // Extract just the CCN property and calculate the age
        properties: {
            CCN: feature.properties.CCN,
            // age is days since the date stored in REPORT_DAT, which has a
            // date format of 2024-06-13T16:01:39Z
            age: Math.floor(
                (Date.now() - new Date(feature.properties.REPORT_DAT).getTime()) /
                    (1000 * 60 * 60 * 24),
            ),
        },
        geometry: feature.geometry,
    })),
};

// Write the transformed data to a new file
fs.writeFileSync('data.json', JSON.stringify(transformedData, null, 2));
