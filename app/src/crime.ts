// Leaflet (L), the heatmap.js Leaflet plugin (HeatmapOverlay) and axios are
// loaded as globals from the CDN/vendored <script> tags in index.html
// (typed in globals.d.ts, declared for ESLint in eslint.config.js).

import './style.css';
import { PRESETS, type Preset } from './presets';
import type {
    CrimePoint,
    HeatmapPoint,
    TransformedFeatureCollection,
} from './types';

type IntensityMode = 'age' | 'count';

const ALL = 'ALL';

// ---- DOM helpers ----

function el<T extends HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) {
        throw new Error(`Missing required element #${id}`);
    }
    return node as T;
}

const titleEl = el<HTMLHeadingElement>('title');
const sourceLink = el<HTMLAnchorElement>('source-link');
const presetSelect = el<HTMLSelectElement>('preset');
const offenseSelect = el<HTMLSelectElement>('offense');
const radiusInput = el<HTMLInputElement>('radius');
const radiusValue = el<HTMLSpanElement>('radius-value');
const intensitySelect = el<HTMLSelectElement>('intensity');
const statusEl = el<HTMLParagraphElement>('status');
const overlay = el<HTMLDivElement>('overlay');
const overlayMessage = el<HTMLSpanElement>('overlay-message');
const legendLow = el<HTMLSpanElement>('legend-low');
const legendHigh = el<HTMLSpanElement>('legend-high');

function showOverlay(message: string, isError = false): void {
    overlayMessage.textContent = message;
    overlay.classList.toggle('error', isError);
    overlay.hidden = false;
}

function hideOverlay(): void {
    overlay.hidden = true;
}

// ---- Formatting ----

function titleCase(offense: string): string {
    return offense.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
}

const dateFormat = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

function dateRange(points: CrimePoint[]): string {
    if (points.length === 0) {
        return '—';
    }
    let min = points[0].date;
    let max = points[0].date;
    for (const point of points) {
        if (point.date < min) min = point.date;
        if (point.date > max) max = point.date;
    }
    return `${dateFormat.format(parseDate(min))} – ${dateFormat.format(parseDate(max))}`;
}

function ageBounds(points: CrimePoint[]): { min: number; max: number } {
    if (points.length === 0) {
        return { min: 0, max: 1 };
    }
    let min = points[0].age;
    let max = points[0].age;
    for (const point of points) {
        if (point.age < min) min = point.age;
        if (point.age > max) max = point.age;
    }
    // Guard against a flat range (single date) producing a zero-width scale.
    return { min, max: max === min ? min + 1 : max };
}

// ---- Map + heatmap ----

const baseLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution:
            'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },
);

const map = new L.Map('map', {
    center: new L.LatLng(PRESETS[0].center.lat, PRESETS[0].center.lng),
    zoom: PRESETS[0].zoom,
    layers: [baseLayer],
});

// heatmap.js sets radius/valueField at construction, so changing the radius or
// intensity mode means rebuilding the layer rather than mutating it in place.
let heatmapLayer: HeatmapOverlay<HeatmapPoint> | null = null;

let allPoints: CrimePoint[] = [];

function currentFilter(): CrimePoint[] {
    const offense = offenseSelect.value;
    return offense === ALL
        ? allPoints
        : allPoints.filter((point) => point.offense === offense);
}

function render(): void {
    const points = currentFilter();
    const radius = Number(radiusInput.value);
    const mode = intensitySelect.value as IntensityMode;
    radiusValue.textContent = String(radius);

    let data: HeatmapPoint[];
    let min: number;
    let max: number;
    if (mode === 'age') {
        data = points.map((point) => ({
            lat: point.lat,
            lng: point.lng,
            value: point.age,
        }));
        ({ min, max } = ageBounds(points));
        legendLow.textContent = 'Recent';
        legendHigh.textContent = 'Older';
    } else {
        // Density: every incident contributes equally; overlapping points add up.
        data = points.map((point) => ({
            lat: point.lat,
            lng: point.lng,
            value: 1,
        }));
        min = 0;
        max = 1;
        legendLow.textContent = 'Sparse';
        legendHigh.textContent = 'Dense';
    }

    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
    }
    heatmapLayer = new HeatmapOverlay<HeatmapPoint>({
        radius,
        useLocalExtrema: mode === 'count',
        valueField: 'value',
    });
    map.addLayer(heatmapLayer);
    heatmapLayer.setData({ min, max, data });

    const offenseLabel =
        offenseSelect.value === ALL
            ? 'All crime types'
            : titleCase(offenseSelect.value);
    statusEl.textContent =
        points.length === 0
            ? `No incidents · ${offenseLabel}`
            : `${points.length.toLocaleString()} incidents · ${dateRange(points)} · ${offenseLabel}`;
}

function populateOffenses(points: CrimePoint[], selected?: string): void {
    const offenses = Array.from(
        new Set(points.map((point) => point.offense)),
    ).sort();

    offenseSelect.replaceChildren();
    const addOption = (value: string, label: string): void => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        offenseSelect.append(option);
    };
    addOption(ALL, 'All crime types');
    for (const offense of offenses) {
        addOption(offense, titleCase(offense));
    }
    offenseSelect.value =
        selected && offenses.includes(selected) ? selected : ALL;
}

function populatePresets(): void {
    presetSelect.replaceChildren();
    for (const preset of PRESETS) {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        presetSelect.append(option);
    }
}

function bindEvents(): void {
    presetSelect.addEventListener('change', () => {
        const preset = PRESETS.find((p) => p.id === presetSelect.value);
        if (preset) {
            void loadPreset(preset);
        }
    });
    offenseSelect.addEventListener('change', render);
    intensitySelect.addEventListener('change', render);
    radiusInput.addEventListener('input', render);
}

// ---- Load ----

async function loadPreset(preset: Preset): Promise<void> {
    showOverlay(`Loading ${preset.name} crime data…`);
    try {
        const response = await axios.get<TransformedFeatureCollection>(
            preset.dataPath,
        );
        allPoints = response.data.features
            .filter(
                (feature) =>
                    feature.geometry && feature.geometry.type === 'Point',
            )
            .map((feature) => ({
                lat: feature.geometry.coordinates[1],
                lng: feature.geometry.coordinates[0],
                offense: feature.properties.offense,
                age: feature.properties.age,
                date: feature.properties.date,
            }));

        if (allPoints.length === 0) {
            showOverlay(`No crime data available for ${preset.name}.`, true);
            return;
        }

        titleEl.textContent = `${preset.name} Crime Heatmap (2024)`;
        sourceLink.textContent = preset.source.name;
        sourceLink.href = preset.source.url;
        map.setView(
            new L.LatLng(preset.center.lat, preset.center.lng),
            preset.zoom,
        );
        populateOffenses(allPoints, preset.defaultOffense);
        render();
        hideOverlay();
    } catch (error: unknown) {
        console.error(error);
        showOverlay(
            `Failed to load ${preset.name} crime data. Please retry later.`,
            true,
        );
    }
}

populatePresets();
bindEvents();
presetSelect.value = PRESETS[0].id;
void loadPreset(PRESETS[0]);
