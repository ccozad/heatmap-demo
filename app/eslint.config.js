import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    prettier,
    {
        ignores: ['dist/**', 'public/leaflet-heatmap.js'],
    },
    {
        // Browser code: the heatmap CDN/vendored libraries arrive as globals.
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                L: 'readonly',
                HeatmapOverlay: 'readonly',
                axios: 'readonly',
            },
        },
    },
    {
        // Build/config files run in Node.
        files: ['vite.config.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    },
];
