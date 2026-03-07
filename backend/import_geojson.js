require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const BikeSegment = require('./models/BikeSegment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mongodbVSCodePlaygroundDB';

const GEOJSON_PATHS = [
  '../sources/waterloo.geojson',
  '../sources/kitchener.geojson',
  '../sources/toronto.geojson'
];

function calculateScore(infra) {
  const infraUpper = infra ? infra.toUpperCase() : '';
  const safeInfra = ['CYCLE TRACK', 'MULTI-USE TRAIL', 'BI-DIRECTIONAL CYCLE TRACK', 'BOULEVARD MULTI-USE TRAIL'];
  const okInfra = ['BICYCLE LANE', 'BUFFERED BIKE LANE', 'SUGGESTED ON-STREET ROUTE', 'PAVED SHOULDER'];

  if (safeInfra.includes(infraUpper) || infraUpper.includes('TRACK') || infraUpper.includes('TRAIL')) {
    return 85 + Math.floor(Math.random() * 15);
  }
  if (okInfra.includes(infraUpper) || infraUpper.includes('LANE') || infraUpper.includes('SHOULDER')) {
    return 55 + Math.floor(Math.random() * 25);
  }
  return 30 + Math.floor(Math.random() * 20);
}

async function importGeoJSON() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing BikeSegments...');
    await BikeSegment.deleteMany({});

    const docs = [];

    for (const GEOJSON_PATH of GEOJSON_PATHS) {
      console.log(`Parsing ${GEOJSON_PATH}...`);

      const data = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf-8'));
      const features = data.features || [];

      console.log(`Found ${features.length} features.`);

      for (const feature of features) {
        if (!feature.geometry || !feature.geometry.coordinates) continue;

        const props = feature.properties || {};
        const streetName = props.STREET || props.STREET_NAME || 'Unknown Street';
        const infra = props.SUBCATEGORY || props.INFRA_HIGHORDER || props.INFRA_LOWORDER || 'Unknown';

        const hasLane =
          infra.includes('LANE') ||
          infra.includes('TRACK') ||
          infra.includes('TRAIL') ||
          infra.includes('Lane') ||
          infra.includes('Track') ||
          infra.includes('Trail');

        let coordinates = [];

        if (feature.geometry.type === 'MultiLineString') {
          coordinates = feature.geometry.coordinates[0];
        } else if (feature.geometry.type === 'LineString') {
          coordinates = feature.geometry.coordinates;
        }

        if (!coordinates || coordinates.length === 0) continue;

        docs.push({
          name: `${streetName} (${infra})`,
          geometry: { type: 'LineString', coordinates },
          safetyScore: calculateScore(infra),
          hasLane,
          trafficSpeed: hasLane ? 30 : 50,
          accidentCount: Math.floor(Math.random() * 3),
          lighting: 'good',
          roadWidth: hasLane ? 4 : 3
        });
      }
    }

    console.log(`Inserting ${docs.length} bike segments...`);
    await BikeSegment.insertMany(docs);

    console.log('Import complete!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

importGeoJSON();