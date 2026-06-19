import { defineConfig } from 'vite';

// The app root is this directory: index.html is the entry, public/ holds the
// data files and the vendored Leaflet heatmap plugin, build output lands in dist/.
//
// GitHub Pages serves a project site under /<repo>/, so production builds use
// that base path; the dev server stays at the root. Override with VITE_BASE if
// the repo is renamed or deployed elsewhere.
export default defineConfig(({ command }) => ({
    base:
        process.env.VITE_BASE ?? (command === 'build' ? '/heatmap-demo/' : '/'),
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    },
}));
