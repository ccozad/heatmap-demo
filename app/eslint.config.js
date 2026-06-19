import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['dist/**', 'public/leaflet-heatmap.js'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        // Browser code: the heatmap CDN/vendored libraries arrive as globals.
        files: ['src/**/*.ts'],
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
        files: ['vite.config.ts', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    },
);
