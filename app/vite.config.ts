import { defineConfig } from 'vite';

// The app root is this directory: index.html is the entry, public/ holds the
// data file and the vendored Leaflet heatmap plugin, build output lands in dist/.
export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    },
});
