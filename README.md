# Overview

This repo has a minimal example for creating a heatmap overlaid on a map. We'll use crime statistics as an interesting dataset to visualize.

![Heatmap example](/images/heatmap.png?raw=true "Heatmap example")

# Technology

 - Vanilla JavaScript
 - [Leaflet](https://leafletjs.com/) A JavaScript library for mobile-friendly interactive maps
 - [heatmap.js](https://www.npmjs.com/package/heatmapjs) A library for rendering heatmap visualizations
 - [leaflet heatmap plugin](https://github.com/pa7/heatmap.js/tree/develop/plugins/leaflet-heatmap) A plugin that allows heatmaps to rendered as map layers
 - [OpenStreetMap](https://www.openstreetmap.org/) OpenStreetMap is an open source provider of map data
 - [Axios HTTP](https://axios-http.com/docs/intro) Promise based HTTP client
 - [Node.js](https://nodejs.org/en) Free, open-source, cross-platform JavaScript runtime environment
 - [Express](https://expressjs.com/) Fast, opinionated, minimalist web framework for Node.js

# Data

This demo uses2024 Washington DC crime data from the US government data clearinghouse https://catalog.data.gov/dataset/crime-incidents-in-2024

# Understanding the code

## Data pipeline

The data pipeline takes the full size crime data file and reduces it to a smaller set of fields to reduce browser load times. You could experiment with the scripo to extract different type of crime events. The output of running the transform data script is the `data.json` file included in `/app/public`.

## Heatmap example

The headmap is rendered inside of a static html page. CSS and Javascript files are loaded from public CDN sources. The leaflet heatmap plugin was not found on a public CDN so it's included here for convenience. If you plan on using the heatmap leaflet script in a commercial application, see Patrick Wied's website for heatmap.js for details on commercial use.

A simple express server is used to serve the html and supporting JavaScript files. the `crime.js` script in `/app/public` loads data points, initializes map layers and configure the rendering parameters for the heatmap. Heatmaps are different than a normal point plot on a map because added dimensions of radius and intensity allow for greater visulition detail. For this example we vary the intensite using the age (in days) so older crime events appear with reduced intensity. We don't vary the radius but conceptially the radius could be set based on some ranged value like the value of a theft or number of people arrested in a crime event.