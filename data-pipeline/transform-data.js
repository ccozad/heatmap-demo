// Read in each line from a csv file and transform the data
// into geoJSON format
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
} else if (path.extname(fileName) !== '.csv') {
    console.error('The provided file is not a CSV file.');
    process.exit(1);
} else {
    console.log(`Processing file: ${fileName}`);
}

const inputStream = fs.createReadStream(fileName);
const rl = readline.createInterface({
    input: inputStream
});
const outputFileName = 'data.json';
const outputStream = fs.createWriteStream(outputFileName);
output = {"type": "FeatureCollection", "features": []};
rl.on('line', (line) => {
    const columns = line.split(',');

    //Columns: name,id,nametype,recclass,mass,fall,year,reclat,reclong,GeoLocation

    const id = columns[1].trim();
    const massStr = columns[4].trim();
    if (!id || !massStr) {
      //console.error(`Invalid data in line: ${line}`);
      return;
    }
    const mass = parseFloat(columns[4].trim());
    const latitude = parseFloat(columns[7].trim());
    const longitude = parseFloat(columns[8].trim());

    if (isNaN(latitude) || isNaN(longitude)) {
        //console.error(`Invalid coordinates for ${line}`);
        return;
    }

    const feature = {
        type: 'Feature',
        properties: { id, mass },
        geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
        }
    };

    output.features.push(feature);
});

rl.on('close', () => {
    console.log('Finished processing file.');
    outputStream.write(JSON.stringify(output, null, 2), (err) => {
        if (err) {
            console.error(`Error writing to output file: ${err.message}`);
        } else {
            console.log(`GeoJSON data written to ${outputFileName}`);
        }
    });
});
