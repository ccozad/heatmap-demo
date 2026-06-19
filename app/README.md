# Overview

The heatmap demo is a static site built and served with [Vite](https://vite.dev/).
There is no runtime server — the production build is a folder of static files.

# Requirements

Node 20 or newer (see `.nvmrc`, which pins Node 22). From the `/app` directory run
`npm install` once to install dependencies.

# Scripts

Run all commands from the `/app` directory:

- `npm run dev` — start the Vite dev server with hot reload at http://localhost:3000/
- `npm run build` — produce the deployable static site in `app/dist/`
- `npm run preview` — serve the built `dist/` locally to verify a production build
- `npm run lint` — run ESLint
- `npm run format` — format the source with Prettier
