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

```javascript
// Read in all of the file and parse it as JSON
const fileContent = fs.readFileSync(fileName, 'utf8');
const data = JSON.parse(fileContent);
const transformedData = {
    type: 'FeatureCollection',
    features: data.features
        .filter(feature => feature.geometry && feature.geometry.type === 'Point' && feature.properties.OFFENSE === "MOTOR VEHICLE THEFT")
        .map(feature => ({
            type: 'Feature',
            // Extract just the CCN property and calculate the age
            properties: { 
                CCN: feature.properties.CCN,
                // age is days since the date stored in REPORT_DAT, which has a
                // date format of 2024-06-13T16:01:39Z
                age: Math.floor((Date.now() - new Date(feature.properties.REPORT_DAT)) / (1000 * 60 * 60 * 24))
            },
            geometry: feature.geometry
    }))
};
```

Each feature in the original data looks similar to:
```json
{ 
    "type": "Feature", 
    "properties": { 
        "CCN": "24089883", 
        "REPORT_DAT": "2024-06-13T16:01:39Z", 
        "SHIFT": "DAY", 
        "METHOD": "OTHERS", 
        "OFFENSE": "THEFT F/AUTO", 
        "BLOCK": "3000 - 3099 BLOCK OF SEDGWICK STREET NW", 
        "XBLOCK": 394578.43, 
        "YBLOCK": 141325.32, 
        "WARD": "3", 
        "ANC": "3C", 
        "DISTRICT": "2", 
        "PSA": "203", 
        "NEIGHBORHOOD_CLUSTER": "Cluster 12", 
        "BLOCK_GROUP": "000600 1", 
        "CENSUS_TRACT": "000600", 
        "VOTING_PRECINCT": "Precinct 27", 
        "LATITUDE": 38.9398002378, 
        "LONGITUDE": -77.062535800500001, 
        "BID": null, 
        "START_DATE": "2024-06-13T15:54:00Z", 
        "END_DATE": "2024-06-13T15:55:00Z", 
        "OBJECTID": 748354431, 
        "OCTO_RECORD_ID": null 
    }, 
    "geometry": { 
        "type": "Point", 
        "coordinates": [ 
            -77.062538105942409, 
            38.939808031652007 
        ] 
    }
}

```

Each feature in the transformed data looks similar to:
```json
{
    "type": "Feature",
    "properties": {
        "CCN": "24143013",
        "age": 322
    },
    "geometry": {
        "type": "Point",
        "coordinates": [
          -76.97595710905172,
          38.913029933944934
        ]
    }
}
```


## Heatmap example

The headmap is rendered inside of a static html page. CSS and Javascript files are loaded from public CDN sources. The leaflet heatmap plugin was not found on a public CDN so it's included here for convenience. If you plan on using the heatmap leaflet script in a commercial application, see Patrick Wied's website for heatmap.js for details on commercial use.

A simple express server is used to serve the html and supporting JavaScript files. the `crime.js` script in `/app/public` loads data points, initializes map layers and configure the rendering parameters for the heatmap. Heatmaps are different than a normal point plot on a map because added dimensions of radius and intensity allow for greater visulition detail. For this example we vary the intensite using the age (in days) so older crime events appear with reduced intensity. We don't vary the radius but conceptially the radius could be set based on some ranged value like the value of a theft or number of people arrested in a crime event.

We configure the heatmap with radius info and the property to use to calculate intensity
```javascript
    // Configure and create the heatmap.js layer
    let cfg = {
      "radius": 4,
      "useLocalExtrema": true,
      valueField: 'age'
    }

    let heatmapLayer = new HeatmapOverlay(cfg)
```

The heatmap uses min and max values to map into a color range for the intensity value
```javascript
    // Determine min/max for the heatmap.js plugin
    let min = Math.min(...points.map(point=> point.age));
    let max = Math.max(...points.map(point => point.age));
```

The leaflet map is configured with the maptile layer and the heatmap layer. The map is centered at given coordinates (in this case the center of Washington DC) with a given zoom level.

```javascript
    // Create the overall Leaflet map using the two layers we created
    let propertyHeatMap = new L.Map('map', {
      center: new L.LatLng(38.904722, -77.016389),
      zoom: 12,
      layers: [baseLayer, heatmapLayer]
    })
```

The heatmap is populated with data and given a range to map intensity to colors.

```javascript
    // Add data to the heatmap.js layer
    heatmapLayer.setData({
      min: min,
      max: max,
      data: points
    });
```