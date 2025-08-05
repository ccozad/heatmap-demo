axios.get('/data.json').then(response => {
  
    let fullData = response.data;
    let allPointFeatures = fullData.features.filter(feature => feature.geometry && feature.geometry.type === 'Point');
    let points = allPointFeatures.map(feature => {
      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        age: feature.properties.age
      }
    });
    
    // Create the base Leaflet layer (the map itself)
    let baseLayer = L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
        {
            attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        }
    );

    // Configure and create the heatmap.js layer
    let cfg = {
      "radius": 4,
      "useLocalExtrema": true,
      valueField: 'age'
    }

    let heatmapLayer = new HeatmapOverlay(cfg)

    // Determine min/max (from sales.js file) for the heatmap.js plugin
    let min = Math.min(...points.map(point=> point.age));
    let max = Math.max(...points.map(point => point.age));

    // Create the overall Leaflet map using the two layers we created
    let propertyHeatMap = new L.Map('map', {
      center: new L.LatLng(38.904722, -77.016389),
      zoom: 12,
      layers: [baseLayer, heatmapLayer]
    })

    // Add data (from sales.js file) to the heatmap.js layer
    heatmapLayer.setData({
      min: min,
      max: max,
      data: points
    });
}).catch(error => {
    console.log(error)
})