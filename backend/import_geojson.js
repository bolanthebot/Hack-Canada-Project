// require('dotenv').config({ path: '../.env' });
// const fs = require('fs');
// const mongoose = require('mongoose');
// const BikeSegment = require('./models/BikeSegment');

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mongodbVSCodePlaygroundDB';
// const CYCLING_PATH = '../sources/cycling-network - 4326.geojson';
// const KSI_PATH = '../sources/Motor Vehicle Collisions with KSI Data - 4326.geojson';

// function pointToSegmentDistance(px, py, ax, ay, bx, by) {
//   const dx = bx - ax, dy = by - ay;
//   if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
//   const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
//   return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
// }

// function countNearbyAccidents(coordinates, accidents, radiusDeg = 0.001) {
//   let count = 0;
//   for (const [ax, ay] of accidents) {
//     for (let i = 0; i < coordinates.length - 1; i++) {
//       const [x1, y1] = coordinates[i];
//       const [x2, y2] = coordinates[i + 1];
//       if (pointToSegmentDistance(ax, ay, x1, y1, x2, y2) < radiusDeg) {
//         count++;
//         break;
//       }
//     }
//   }
//   return count;
// }

// function calculateScore(infra, accidentCount) {
//   const infraUpper = infra ? infra.toUpperCase() : '';
//   let base;
//   if (infraUpper.includes('TRACK') || infraUpper.includes('TRAIL')) {
//     base = 75 + Math.floor(Math.random() * 20);
//   } else if (infraUpper.includes('LANE') || infraUpper.includes('SHOULDER')) {
//     base = 45 + Math.floor(Math.random() * 25);
//   } else {
//     base = 20 + Math.floor(Math.random() * 25);
//   }
//   const penalty = Math.min(accidentCount * 8, 40);
//   return Math.max(5, base - penalty);
// }

// async function importGeoJSON() {
//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log('Connected to MongoDB');

//     console.log('Loading KSI accident data...');
//     const ksiData = JSON.parse(fs.readFileSync(KSI_PATH, 'utf-8'));
//     const accidents = ksiData.features
//       .filter(f => f.geometry && f.geometry.type === 'Point')
//       .map(f => f.geometry.coordinates);
//     console.log(`Loaded ${accidents.length} accident points`);

//     console.log('Loading cycling network...');
//     const cyclingData = JSON.parse(fs.readFileSync(CYCLING_PATH, 'utf-8'));
//     const features = cyclingData.features || [];
//     console.log(`Found ${features.length} bike segments`);

//     console.log('Clearing existing BikeSegments...');
//     // await BikeSegment.deleteMany({});

//     const docs = [];
//     let processed = 0;

//     for (const feature of features) {
//       if (!feature.geometry || !feature.geometry.coordinates) continue;

//       const props = feature.properties || {};
//       const streetName = props.STREET || props.STREET_NAME || props.NAME || 'Unknown Street';
//       const infra = props.SUBCATEGORY || props.INFRA_HIGHORDER || props.INFRA_LOWORDER || 'Unknown';

//       let coordinates = [];
//       if (feature.geometry.type === 'MultiLineString') {
//         coordinates = feature.geometry.coordinates[0];
//       } else if (feature.geometry.type === 'LineString') {
//         coordinates = feature.geometry.coordinates;
//       }
//       if (!coordinates || coordinates.length === 0) continue;

//       const hasLane = typeof infra === 'string' && (
//         infra.includes('LANE') || infra.includes('TRACK') ||
//         infra.includes('TRAIL') || infra.includes('Lane') ||
//         infra.includes('Track') || infra.includes('Trail')
//       );

//       const accidentCount = countNearbyAccidents(coordinates, accidents);
//       const safetyScore = calculateScore(typeof infra === 'string' ? infra : '', accidentCount);

//       docs.push({
//         name: `${streetName} (${infra})`,
//         geometry: { type: 'LineString', coordinates },
//         safetyScore,
//         hasLane,
//         trafficSpeed: hasLane ? 30 : 50,
//         accidentCount,
//         lighting: safetyScore > 70 ? 'good' : safetyScore > 45 ? 'ok' : 'poor',
//         roadWidth: hasLane ? 4 : 3
//       });

//       processed++;
//       if (processed % 500 === 0) console.log(`Processed ${processed}/${features.length}...`);
//     }

//     console.log(`Inserting ${docs.length} bike segments...`);
//     await BikeSegment.insertMany(docs, { ordered: false });
//     console.log('Import complete!');

//     const green = docs.filter(d => d.safetyScore >= 70).length;
//     const orange = docs.filter(d => d.safetyScore >= 45 && d.safetyScore < 70).length;
//     const red = docs.filter(d => d.safetyScore < 45).length;
//     console.log(`Green (safe): ${green} | Orange (ok): ${orange} | Red (risky): ${red}`);

//   } catch (error) {
//     console.error('Import failed:', error);
//   } finally {
//     await mongoose.disconnect();
//     process.exit(0);
//   }
// }

// importGeoJSON();
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const BikeSegment = require('./models/BikeSegment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mongodbVSCodePlaygroundDB';

const GEOJSON_PATHS = [
  '../sources/waterloo.geojson',
  '../sources/kitchener.geojson',
  '../sources/toronto.geojson',
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