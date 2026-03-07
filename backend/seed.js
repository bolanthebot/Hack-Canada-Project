require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Intersection = require('./models/Intersection');
const Parking = require('./models/Parking');
const BikeSegment = require('./models/BikeSegment');

const MONGODB_URI = process.env.MONGODB_URI;

// Insert a few documents into the sales collection.



// ── Intersection seed data (GTA locations) ──────────────────────────
const intersections = [
  { coords: [-79.3832, 43.6532], type: 'near_miss', severity: 4, desc: 'Car ran red light at Bay & Dundas' },
  { coords: [-79.3806, 43.6534], type: 'cyclist_conflict', severity: 3, desc: 'Cyclist cut off by right-turning vehicle' },
  { coords: [-79.3832, 43.6532], type: 'pedestrian_conflict', severity: 5, desc: 'Driver blew through crosswalk' },
  { coords: [-79.3871, 43.6426], type: 'aggressive_driver', severity: 4, desc: 'Road rage incident near Union Station' },
  { coords: [-79.3957, 43.6437], type: 'near_miss', severity: 2, desc: 'Near miss at Spadina & King' },
  { coords: [-79.3957, 43.6437], type: 'cyclist_conflict', severity: 4, desc: 'Dooring incident on Spadina' },
  { coords: [-79.4044, 43.6532], type: 'near_miss', severity: 3, desc: 'Close call at Bathurst & Dundas' },
  { coords: [-79.4044, 43.6532], type: 'near_miss', severity: 4, desc: 'T-bone near miss' },
  { coords: [-79.4044, 43.6532], type: 'pedestrian_conflict', severity: 5, desc: 'Pedestrian almost hit' },
  { coords: [-79.3461, 43.6629], type: 'aggressive_driver', severity: 3, desc: 'Aggressive lane changing on DVP ramp' },
  { coords: [-79.3461, 43.6629], type: 'near_miss', severity: 4, desc: 'Sideswipe near miss on DVP exit' },
  { coords: [-79.4191, 43.6363], type: 'cyclist_conflict', severity: 2, desc: 'Cyclist squeezed on King West' },
  { coords: [-79.3788, 43.6548], type: 'near_miss', severity: 3, desc: 'Red-light runner at Yonge & Dundas' },
  { coords: [-79.3788, 43.6548], type: 'pedestrian_conflict', severity: 4, desc: 'Pedestrian conflict at Yonge-Dundas Square' },
  { coords: [-79.4583, 43.6369], type: 'near_miss', severity: 2, desc: 'Minor close call at Roncesvalles' },
  { coords: [-79.3440, 43.7731], type: 'aggressive_driver', severity: 5, desc: 'Dangerous driving on Sheppard Ave' },
  { coords: [-79.3440, 43.7731], type: 'near_miss', severity: 3, desc: 'Near miss at Sheppard & Yonge' },
  { coords: [-79.5441, 43.5890], type: 'cyclist_conflict', severity: 3, desc: 'Cyclist conflict in Mississauga' },
  { coords: [-79.5441, 43.5890], type: 'near_miss', severity: 4, desc: 'Close call near Square One' },
  { coords: [-79.2318, 43.7731], type: 'pedestrian_conflict', severity: 3, desc: 'Pedestrian issue in Scarborough' },
  { coords: [-79.4149, 43.7615], type: 'near_miss', severity: 2, desc: 'Near miss on Finch Ave' },
  { coords: [-79.3500, 43.6700], type: 'aggressive_driver', severity: 4, desc: 'Tailgating on Bloor' },
  { coords: [-79.3650, 43.6480], type: 'cyclist_conflict', severity: 3, desc: 'Door zone conflict on College St' },
  { coords: [-79.3950, 43.6700], type: 'near_miss', severity: 3, desc: 'Close call at Christie & Bloor' },
  { coords: [-79.4100, 43.6550], type: 'pedestrian_conflict', severity: 4, desc: 'Pedestrian scramble confusion at Dundas & Ossington' },
  { coords: [-79.3700, 43.6600], type: 'near_miss', severity: 2, desc: 'Minor incident near UofT' },
  { coords: [-79.3832, 43.6500], type: 'aggressive_driver', severity: 5, desc: 'Aggressive honking and swerving at Bay & Queen' },
  { coords: [-79.3750, 43.6550], type: 'cyclist_conflict', severity: 4, desc: 'Cyclist nearly hit at Church & Wellesley' },
  { coords: [-79.3900, 43.6400], type: 'near_miss', severity: 3, desc: 'Near miss at University & Front' },
  { coords: [-79.4200, 43.6450], type: 'pedestrian_conflict', severity: 3, desc: 'Jaywalker conflict at Dufferin & Queen' },
];

// ── Parking seed data ───────────────────────────────────────────────
const parkingSpots = [
  { coords: [-79.3830, 43.6535], status: 'available', street: 'Bay St', restrictions: 'No parking 7-9 AM' },
  { coords: [-79.3810, 43.6540], status: 'taken', street: 'Yonge St', restrictions: 'Max 2 hours' },
  { coords: [-79.3850, 43.6520], status: 'available', street: 'University Ave', restrictions: '' },
  { coords: [-79.3960, 43.6440], status: 'taken', street: 'Spadina Ave', restrictions: 'Permit required after 6 PM' },
  { coords: [-79.3955, 43.6445], status: 'available', street: 'Spadina Ave', restrictions: '' },
  { coords: [-79.4050, 43.6530], status: 'available', street: 'Bathurst St', restrictions: 'No parking street cleaning Tue' },
  { coords: [-79.4045, 43.6540], status: 'taken', street: 'Bathurst St', restrictions: '' },
  { coords: [-79.3465, 43.6630], status: 'available', street: 'Broadview Ave', restrictions: '' },
  { coords: [-79.3460, 43.6625], status: 'taken', street: 'Broadview Ave', restrictions: 'Max 1 hour' },
  { coords: [-79.4195, 43.6365], status: 'available', street: 'King St W', restrictions: 'No stopping rush hour' },
  { coords: [-79.3790, 43.6550], status: 'taken', street: 'Dundas St E', restrictions: '' },
  { coords: [-79.3785, 43.6545], status: 'available', street: 'Dundas St E', restrictions: 'Max 3 hours' },
  { coords: [-79.4585, 43.6370], status: 'available', street: 'Roncesvalles Ave', restrictions: '' },
  { coords: [-79.3445, 43.7735], status: 'taken', street: 'Sheppard Ave E', restrictions: 'Permit Zone A' },
  { coords: [-79.3505, 43.6705], status: 'available', street: 'Bloor St E', restrictions: '' },
  { coords: [-79.3655, 43.6485], status: 'taken', street: 'College St', restrictions: 'Max 2 hours' },
  { coords: [-79.3700, 43.6605], status: 'available', street: 'Harbord St', restrictions: '' },
  { coords: [-79.3905, 43.6405], status: 'available', street: 'Front St W', restrictions: 'No parking weekends' },
  { coords: [-79.3755, 43.6555], status: 'taken', street: 'Church St', restrictions: '' },
  { coords: [-79.4105, 43.6555], status: 'available', street: 'Ossington Ave', restrictions: '' },
  { coords: [-79.5445, 43.5895], status: 'available', street: 'Hurontario St', restrictions: 'Max 3 hours' },
  { coords: [-79.2320, 43.7735], status: 'taken', street: 'McCowan Rd', restrictions: '' },
  { coords: [-79.4155, 43.7620], status: 'available', street: 'Finch Ave W', restrictions: '' },
  { coords: [-79.4205, 43.6455], status: 'taken', street: 'Dufferin St', restrictions: 'Permit required' },
  { coords: [-79.3835, 43.6505], status: 'available', street: 'Queen St W', restrictions: 'No parking 4-6 PM' },
];

// ── Bike segment seed data ──────────────────────────────────────────
const bikeSegments = [
  {
    name: 'Bloor St — Bike Lane (Spadina to Avenue)',
    coords: [[-79.4003, 43.6654], [-79.3960, 43.6658], [-79.3920, 43.6662], [-79.3880, 43.6666], [-79.3840, 43.6670]],
    safetyScore: 82, hasLane: true, trafficSpeed: 35, accidentCount: 1, lighting: 'good', roadWidth: 4,
  },
  {
    name: 'College St (Spadina to University)',
    coords: [[-79.3960, 43.6580], [-79.3920, 43.6575], [-79.3880, 43.6570], [-79.3840, 43.6565]],
    safetyScore: 58, hasLane: false, trafficSpeed: 45, accidentCount: 3, lighting: 'moderate', roadWidth: 3,
  },
  {
    name: 'Harbord St Protected Lane',
    coords: [[-79.4100, 43.6620], [-79.4050, 43.6618], [-79.4000, 43.6616], [-79.3950, 43.6614]],
    safetyScore: 91, hasLane: true, trafficSpeed: 30, accidentCount: 0, lighting: 'good', roadWidth: 4.5,
  },
  {
    name: 'King St W (Bathurst to Spadina)',
    coords: [[-79.4050, 43.6430], [-79.4010, 43.6432], [-79.3980, 43.6434], [-79.3960, 43.6436]],
    safetyScore: 42, hasLane: false, trafficSpeed: 50, accidentCount: 4, lighting: 'moderate', roadWidth: 2.5,
  },
  {
    name: 'Dundas St (Yonge to Jarvis)',
    coords: [[-79.3788, 43.6555], [-79.3750, 43.6558], [-79.3720, 43.6561], [-79.3690, 43.6564]],
    safetyScore: 35, hasLane: false, trafficSpeed: 55, accidentCount: 5, lighting: 'poor', roadWidth: 2,
  },
  {
    name: 'Waterfront Trail (Harbourfront)',
    coords: [[-79.3950, 43.6380], [-79.3900, 43.6375], [-79.3850, 43.6370], [-79.3800, 43.6365], [-79.3750, 43.6362]],
    safetyScore: 95, hasLane: true, trafficSpeed: 20, accidentCount: 0, lighting: 'good', roadWidth: 5,
  },
  {
    name: 'Richmond St Protected (Spadina to Bay)',
    coords: [[-79.3960, 43.6500], [-79.3920, 43.6502], [-79.3880, 43.6504], [-79.3840, 43.6506]],
    safetyScore: 78, hasLane: true, trafficSpeed: 40, accidentCount: 1, lighting: 'good', roadWidth: 3.5,
  },
  {
    name: 'Sherbourne St (Bloor to Wellesley)',
    coords: [[-79.3756, 43.6685], [-79.3756, 43.6650], [-79.3756, 43.6615], [-79.3756, 43.6580]],
    safetyScore: 72, hasLane: true, trafficSpeed: 38, accidentCount: 2, lighting: 'moderate', roadWidth: 3,
  },
  {
    name: 'DVP Trail (Don Mills to Lakeshore)',
    coords: [[-79.3590, 43.6900], [-79.3580, 43.6800], [-79.3570, 43.6700], [-79.3560, 43.6600], [-79.3550, 43.6500]],
    safetyScore: 88, hasLane: true, trafficSpeed: 15, accidentCount: 0, lighting: 'moderate', roadWidth: 4,
  },
  {
    name: 'Queen St W (Ossington to Dufferin)',
    coords: [[-79.4200, 43.6455], [-79.4150, 43.6457], [-79.4100, 43.6459]],
    safetyScore: 25, hasLane: false, trafficSpeed: 50, accidentCount: 6, lighting: 'poor', roadWidth: 2,
  },
  {
    name: 'Davenport Rd (Avenue to Yonge)',
    coords: [[-79.3920, 43.6730], [-79.3880, 43.6728], [-79.3840, 43.6726], [-79.3800, 43.6724]],
    safetyScore: 48, hasLane: false, trafficSpeed: 48, accidentCount: 3, lighting: 'moderate', roadWidth: 2.5,
  },
  {
    name: 'Lakeshore Blvd Trail',
    coords: [[-79.4200, 43.6350], [-79.4100, 43.6345], [-79.4000, 43.6340], [-79.3900, 43.6338]],
    safetyScore: 90, hasLane: true, trafficSpeed: 18, accidentCount: 0, lighting: 'good', roadWidth: 5,
  },
  {
    name: 'Yonge St (Bloor to Wellesley)',
    coords: [[-79.3862, 43.6685], [-79.3862, 43.6660], [-79.3862, 43.6635], [-79.3862, 43.6610]],
    safetyScore: 30, hasLane: false, trafficSpeed: 45, accidentCount: 5, lighting: 'good', roadWidth: 2,
  },
  {
    name: 'Finch Hydro Corridor Trail',
    coords: [[-79.4300, 43.7550], [-79.4200, 43.7555], [-79.4100, 43.7560], [-79.4000, 43.7565]],
    safetyScore: 85, hasLane: true, trafficSpeed: 10, accidentCount: 0, lighting: 'poor', roadWidth: 4,
  },
  {
    name: 'Roncesvalles Ave',
    coords: [[-79.4510, 43.6430], [-79.4520, 43.6400], [-79.4530, 43.6370]],
    safetyScore: 62, hasLane: false, trafficSpeed: 38, accidentCount: 2, lighting: 'good', roadWidth: 3,
  },
];

// ── Seed runner ─────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Intersection.deleteMany({}),
    Parking.deleteMany({}),
    BikeSegment.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Insert intersections
  await Intersection.insertMany(
    intersections.map((i) => ({
      location: { type: 'Point', coordinates: i.coords },
      reportType: i.type,
      severity: i.severity,
      description: i.desc,
    }))
  );
  console.log(`✓ Inserted ${intersections.length} intersection reports`);

  // Insert parking spots
  await Parking.insertMany(
    parkingSpots.map((p) => ({
      location: { type: 'Point', coordinates: p.coords },
      status: p.status,
      streetName: p.street,
      restrictions: p.restrictions,
    }))
  );
  console.log(`✓ Inserted ${parkingSpots.length} parking spots`);

  // Insert bike segments
  await BikeSegment.insertMany(
    bikeSegments.map((b) => ({
      name: b.name,
      geometry: { type: 'LineString', coordinates: b.coords },
      safetyScore: b.safetyScore,
      hasLane: b.hasLane,
      trafficSpeed: b.trafficSpeed,
      accidentCount: b.accidentCount,
      lighting: b.lighting,
      roadWidth: b.roadWidth,
    }))
  );
  console.log(`✓ Inserted ${bikeSegments.length} bike segments`);

  console.log('\nSeed complete!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
