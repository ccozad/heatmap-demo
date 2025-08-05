const fs = require('fs');
const readline = require('readline');
const path = require('path');

// The file name is the first argument
const fileName = process.argv[2];
if (!fileName) {
    console.error('Please provide a CSV file name as an argument.');
    process.exit(1);
} else if (!fs.existsSync(fileName)) {
    console.error(`File ${fileName} does not exist.`);
    process.exit(1);
} else if (path.extname(fileName) !== '.geojson') {
    console.error('The provided file is not a geojson file.');
    process.exit(1);
} else {
    console.log(`Processing file: ${fileName}`);
}

// Read in all of the file and parse it as JSON
const fileContent = fs.readFileSync(fileName, 'utf8');
const data = JSON.parse(fileContent);
const transformedData = {
    type: 'FeatureCollection',
    features: data.features
        .filter(feature => feature.geometry && feature.geometry.type === 'Point' && feature.properties.OFFENSE === "MOTOR VEHICLE THEFT")
        .map(feature => ({
            type: 'Feature',
            // Extract just the CCN property
            properties: { 
                CCN: feature.properties.CCN,
                // age is days since the date stored in REPORT_DAT, which has a
                // date format of 2024-06-13T16:01:39Z
                age: Math.floor((Date.now() - new Date(feature.properties.REPORT_DAT)) / (1000 * 60 * 60 * 24))
            },
            geometry: feature.geometry
    }))
};

// Write the transformed data to a new file
fs.writeFileSync("data.json", JSON.stringify(transformedData, null, 2));