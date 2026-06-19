// Available city datasets. Each preset points at a transformed data file in
// public/ (produced by data-pipeline/transform-data.ts) and the map view to use
// for it. Add a city by shipping its data.<id>.json and appending an entry here.
export interface Preset {
    id: string;
    name: string;
    // Path served from public/, e.g. /data.dc.json
    dataPath: string;
    center: { lat: number; lng: number };
    zoom: number;
    // Optional crime type to select on load (must match an offense in the data).
    defaultOffense?: string;
    // Attribution for the underlying open-data source.
    source: { name: string; url: string };
}

export const PRESETS: Preset[] = [
    {
        id: 'dc',
        name: 'Washington, DC',
        dataPath: '/data.dc.json',
        center: { lat: 38.904722, lng: -77.016389 },
        zoom: 12,
        defaultOffense: 'MOTOR VEHICLE THEFT',
        source: {
            name: 'DC Crime Incidents in 2024',
            url: 'https://catalog.data.gov/dataset/crime-incidents-in-2024',
        },
    },
    {
        id: 'baltimore',
        name: 'Baltimore, MD',
        dataPath: '/data.baltimore.json',
        center: { lat: 39.2904, lng: -76.6122 },
        zoom: 12,
        defaultOffense: 'AUTO THEFT',
        source: {
            name: 'Baltimore Part 1 Crime Data',
            url: 'https://data.baltimorecity.gov/datasets/part-1-crime-data',
        },
    },
];
