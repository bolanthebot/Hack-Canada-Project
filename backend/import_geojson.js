require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const BikeSegment = require('./models/BikeSegment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mongodbVSCodePlaygroundDB';
const GEOJSON_PATH = '../sources/cycling-network - 4326.geojson';

function calculateScore(infra) {
  const safeInfra = ['Cycle Track', 'Multi-Use Trail', 'Bi-Directional Cycle Track'];
  const okInfra = ['Bike Lane', 'Buffered Bike Lane', 'Suggested On-Street Route'];
  
  if (safeInfra.includes(infra)) return 85 + Math.floor(Math.random() * 15);
  if (okInfra.includes(infra)) return 55 + Math.floor(Math.random() * 25);
  return 30 + Math.floor(Math.random() * 20); // Sharrows or mixed traffic
}

async function importGeoJSON() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Parsing GeoJSON file...');
    const data = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf-8'));
    
    const features = data.features || [];
    console.log(`Found ${features.length} features.`);

    console.log('Clearing existing BikeSegments...');
    await BikeSegment.deleteMany({});

    console.log('Preparing documents...');
    const docs = [];
    
    for (const feature of features) {
      if (!feature.geometry || !feature.geometry.coordinates) continue;
      
      const props = feature.properties || {};
      const streetName = props.STREET_NAME || 'Unknown Street';
      const infra = props.INFRA_HIGHORDER || props.INFRA_LOWORDER || 'Unknown';
      const hasLane = infra.includes('Lane') || infra.includes('Track') || infra.includes('Trail');
      
      // The schema expects a 'LineString', but MultiLineString requires flattening
      // or we just take the first line string if it's a MultiLineString.
      let coordinates = [];
      if (feature.geometry.type === 'MultiLineString') {
        coordinates = feature.geometry.coordinates[0]; // just take the first line segment to keep it simple
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

    console.log(`Inserting ${docs.length} bike segments...`);
    // Insert in batches if it's large, but standard insertMany usually handles thousands fine
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
