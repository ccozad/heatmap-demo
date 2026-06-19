// Shared dataset shapes for the browser app. The data file served at
// /data.json is the *transformed* output of data-pipeline/transform-data.ts.

export interface PointGeometry {
    type: 'Point';
    // GeoJSON order: [longitude, latitude]
    coordinates: [number, number];
}

export interface TransformedFeatureProperties {
    // Offense type, e.g. "MOTOR VEHICLE THEFT" (drives the crime-type filter).
    offense: string;
    // Days since the incident was reported, computed at transform time.
    age: number;
    // Date the incident was reported, YYYY-MM-DD (drives the date-range status).
    date: string;
}

export interface TransformedFeature {
    type: 'Feature';
    properties: TransformedFeatureProperties;
    geometry: PointGeometry;
}

export interface TransformedFeatureCollection {
    type: 'FeatureCollection';
    features: TransformedFeature[];
}

// A crime incident flattened for the browser: map coordinates plus the fields
// the controls/status line read.
export interface CrimePoint {
    lat: number;
    lng: number;
    offense: string;
    age: number;
    date: string;
}

// A single point handed to the heatmap.js layer. `value` is the intensity
// source the layer reads via valueField (see crime.ts).
export interface HeatmapPoint {
    lat: number;
    lng: number;
    value: number;
}
