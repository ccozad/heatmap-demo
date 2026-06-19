// Leaflet (L), the heatmap.js Leaflet plugin (HeatmapOverlay) and axios are
// loaded as globals from the CDN/vendored <script> tags in index.html
// (typed in globals.d.ts, declared for ESLint in eslint.config.js).

import type { HeatmapPoint, TransformedFeatureCollection } from './types';

axios
    .get<TransformedFeatureCollection>('/data.json')
    .then((response) => {
        const fullData = response.data;
        const points: HeatmapPoint[] = fullData.features
            .filter(
                (feature) =>
                    feature.geometry && feature.geometry.type === 'Point',
            )
            .map((feature) => ({
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
                age: feature.properties.age,
            }));

        // Create the base Leaflet layer (the map itself)
        const baseLayer = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution:
                    'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            },
        );

        // Configure and create the heatmap.js layer
        const cfg = {
            radius: 4,
            useLocalExtrema: true,
            valueField: 'age',
        };

        const heatmapLayer = new HeatmapOverlay<HeatmapPoint>(cfg);

        // Determine min/max for the heatmap.js plugin
        const min = Math.min(...points.map((point) => point.age));
        const max = Math.max(...points.map((point) => point.age));

        // Create the overall Leaflet map using the two layers we created
        new L.Map('map', {
            center: new L.LatLng(38.904722, -77.016389),
            zoom: 12,
            layers: [baseLayer, heatmapLayer],
        });

        // Add data to the heatmap.js layer
        heatmapLayer.setData({
            min,
            max,
            data: points,
        });
    })
    .catch((error) => {
        console.error(error);
    });
