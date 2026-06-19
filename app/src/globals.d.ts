// Ambient declarations for the libraries loaded as globals from the CDN /
// vendored <script> tags in index.html. Leaflet's shapes come from
// @types/leaflet; axios and the leaflet-heatmap plugin (HeatmapOverlay) are not
// on DefinitelyTyped, so we declare the small surface we actually use here.
//
// These are exposed as real ambient globals (not UMD namespaces) so the ESM
// modules in src/ can reference them without importing the libraries (which
// would make Vite bundle them instead of using the CDN <script> tags).

import type * as Leaflet from 'leaflet';

declare global {
    interface HeatmapOverlayConfig {
        radius?: number;
        maxOpacity?: number;
        minOpacity?: number;
        blur?: number;
        useLocalExtrema?: boolean;
        latField?: string;
        lngField?: string;
        valueField?: string;
    }

    interface HeatmapData<T> {
        min: number;
        max: number;
        data: T[];
    }

    class HeatmapOverlay<T = { lat: number; lng: number; value?: number }>
        extends Leaflet.Layer
    {
        constructor(config: HeatmapOverlayConfig);
        setData(data: HeatmapData<T>): void;
        addData(data: T | T[]): void;
    }

    interface AxiosResponse<T> {
        data: T;
    }

    interface AxiosStaticLike {
        get<T = unknown>(url: string): Promise<AxiosResponse<T>>;
    }

    const L: typeof Leaflet;
    const axios: AxiosStaticLike;
}

export {};
