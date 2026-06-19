// Shared dataset shapes for the browser app. The data file served at
// /data.json is the *transformed* output of data-pipeline/transform-data.ts.

export interface PointGeometry {
    type: 'Point';
    // GeoJSON order: [longitude, latitude]
    coordinates: [number, number];
}

export interface TransformedFeatureProperties {
    CCN: string;
    // Days since the incident was reported, computed at transform time.
    age: number;
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

// A single point handed to the heatmap.js layer. `age` is the intensity source
// (see valueField in crime.ts).
export interface HeatmapPoint {
    lat: number;
    lng: number;
    age: number;
}
