axios.get('/data.json').then(response => {
  
    let fullData = response.data;
    let allPointFeatures = fullData.features.filter(feature => feature.geometry && feature.geometry.type === 'Point');
    let points = allPointFeatures.map(feature => {
      return {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        mass: feature.properties.mass
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
      "radius": 20,
      "useLocalExtrema": true,
      valueField: 'mass'
    }

    let heatmapLayer = new HeatmapOverlay(cfg)

    // Determine min/max (from sales.js file) for the heatmap.js plugin
    let min = Math.min(...points.map(point=> point.mass));
    let max = Math.max(...points.map(point => point.mass));

    // Create the overall Leaflet map using the two layers we created
    let propertyHeatMap = new L.Map('map', {
      center: new L.LatLng(39.275, -76.613),
      zoom: 10,
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