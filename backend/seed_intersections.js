require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Intersection = require('./models/Intersection');

const reportTypes = ['near_miss', 'cyclist_conflict', 'pedestrian_conflict', 'aggressive_driver'];

// Logic to skew severity (more low-severity, fewer high-severity)
const getRandomSeverity = () => {
  const r = Math.random();
  if (r < 0.40) return 1;      // 40% probability
  else if (r < 0.70) return 2; // 30% probability
  else if (r < 0.85) return 3; // 15% probability
  else if (r < 0.95) return 4; // 10% probability
  return 5;                    // 5% probability
};

// Generate random coordinates (70% wider Toronto, 30% Kitchener/Waterloo)
const getRandomLocation = () => {
  const isKW = Math.random() < 0.3;
  let latMin, latMax, lngMin, lngMax;

  if (isKW) {
    // Kitchener/Waterloo area
    latMin = 43.38; latMax = 43.50;
    lngMin = -80.60; lngMax = -80.40;
  } else {
    // Wider Toronto area (adjusted to stay north of Lake Ontario)
    latMin = 43.62; latMax = 43.85; // Raised latMin to avoid lake
    lngMin = -79.63; lngMax = -79.12;
  }

  // To additionally prevent points in the water, check a simple polyline approximation of the shoreline
  // For Toronto, roughly: anything south of 43.58 is water, and further east, the shore goes up to ~43.66
  // We'll use a very simple heuristic to discard water points
  let lat = latMin + Math.random() * (latMax - latMin);
  let lng = lngMin + Math.random() * (lngMax - lngMin);
  
  if (!isKW) {
    // Basic shoreline approximation logic: slope from Humber Bay (~ -79.48, 43.63) towards Scarborough (~ -79.16, 43.76)
    // We'll regenerate if it happens to be lower than the rough shoreline.
    // Shoreline roughly follows: y = 0.406 * (x + 79.48) + 43.63
    let limitLat = 0.406 * (lng + 79.48) + 43.63;
    while (lat < limitLat) {
      lat = latMin + Math.random() * (latMax - latMin);
      lng = lngMin + Math.random() * (lngMax - lngMin);
      limitLat = 0.406 * (lng + 79.48) + 43.63;
    }
  }

  return [lng, lat];
};

const seedData = Array.from({ length: 200 }).map(() => ({
  location: {
    type: 'Point',
    coordinates: getRandomLocation(),
  },
  reportType: reportTypes[Math.floor(Math.random() * reportTypes.length)],
  severity: getRandomSeverity(),
  description: 'Mock data created from seed script',
}));

const seedIntersections = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('Missing MONGODB_URI in .env');
      process.exit(1);
    }
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Optional: clear existing records first if you want a clean slate
    await Intersection.deleteMany({});
    console.log('Cleared existing intersection data');

    await Intersection.insertMany(seedData);
    console.log(`Successfully added ${seedData.length} intersection reports`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedIntersections();
