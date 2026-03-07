const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const IntersectionReport = require('./models/IntersectionReport');
const ParkingSpot = require('./models/ParkingSpot');
const BikeSegment = require('./models/BikeSegment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanflow';

const GTA_INTERSECTIONS = [
  { name: 'Yonge & Dundas', coords: [-79.3832, 43.6561] },
  { name: 'Yonge & Bloor', coords: [-79.3871, 43.6709] },
  { name: 'King & Bay', coords: [-79.3812, 43.6488] },
  { name: 'Queen & Spadina', coords: [-79.3968, 43.6488] },
  { name: 'Bathurst & Bloor', coords: [-79.4113, 43.6656] },
  { name: 'Dundas & University', coords: [-79.3899, 43.6553] },
  { name: 'College & Yonge', coords: [-79.3845, 43.6614] },
  { name: 'Front & Yonge', coords: [-79.3785, 43.6453] },
  { name: 'Queen & University', coords: [-79.3896, 43.6517] },
  { name: 'Bloor & Avenue', coords: [-79.3948, 43.6695] },
  { name: 'St Clair & Yonge', coords: [-79.3935, 43.6876] },
  { name: 'Eglinton & Yonge', coords: [-79.3983, 43.7065] },
  { name: 'Lawrence & Yonge', coords: [-79.4017, 43.7252] },
  { name: 'Finch & Yonge', coords: [-79.4149, 43.7808] },
  { name: 'Dundas & Ossington', coords: [-79.4225, 43.6501] },
  { name: 'Queen & Broadview', coords: [-79.3529, 43.6593] },
  { name: 'Danforth & Pape', coords: [-79.3451, 43.6779] },
  { name: 'Bloor & Dufferin', coords: [-79.4356, 43.6601] },
  { name: 'Lakeshore & Strachan', coords: [-79.4087, 43.6361] },
  { name: 'Hurontario & Dundas', coords: [-79.6499, 43.6019] },
];

const REPORT_TYPES = ['near_miss', 'cyclist_conflict', 'pedestrian_conflict', 'aggressive_driver'];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function generateIntersectionReports() {
  const reports = [];
  for (const intersection of GTA_INTERSECTIONS) {
    const numReports = Math.floor(rand(1, 8));
    for (let i = 0; i < numReports; i++) {
      reports.push({
        location: {
          type: 'Point',
          coordinates: [
            intersection.coords[0] + rand(-0.001, 0.001),
            intersection.coords[1] + rand(-0.001, 0.001),
          ],
        },
        reportType: REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)],
        severity: Math.floor(rand(1, 6)),
        description: `Report near ${intersection.name}`,
        createdAt: new Date(Date.now() - Math.floor(rand(0, 30 * 24 * 60 * 60 * 1000))),
      });
    }
  }
  return reports;
}

const PARKING_STREETS = [
  { name: 'King St W', base: [-79.3890, 43.6467] },
  { name: 'Queen St W', base: [-79.3920, 43.6493] },
  { name: 'Front St W', base: [-79.3850, 43.6445] },
  { name: 'Adelaide St W', base: [-79.3870, 43.6480] },
  { name: 'Richmond St W', base: [-79.3880, 43.6500] },
  { name: 'Dundas St W', base: [-79.3940, 43.6540] },
  { name: 'College St', base: [-79.3960, 43.6580] },
  { name: 'Harbord St', base: [-79.4010, 43.6630] },
  { name: 'Bloor St W', base: [-79.4050, 43.6650] },
  { name: 'Ossington Ave', base: [-79.4220, 43.6520] },
];

function generateParkingSpots() {
  const spots = [];
  for (const street of PARKING_STREETS) {
    const numSpots = Math.floor(rand(2, 5));
    for (let i = 0; i < numSpots; i++) {
      spots.push({
        location: {
          type: 'Point',
          coordinates: [
            street.base[0] + rand(-0.003, 0.003),
            street.base[1] + rand(-0.001, 0.001),
          ],
        },
        status: Math.random() > 0.4 ? 'available' : 'taken',
        streetName: street.name,
        restrictions: Math.random() > 0.5 ? 'No parking 7-9am' : '',
        reportedBy: 'seed',
        updatedAt: new Date(Date.now() - Math.floor(rand(0, 4 * 60 * 60 * 1000))),
      });
    }
  }
  return spots;
}

function generateBikeSegments() {
  const segments = [
    {
      name: 'Bloor St Bike Lane (Spadina to Avenue)',
      coords: [[-79.4014, 43.6657], [-79.3948, 43.6695]],
      hasLane: true, trafficSpeed: 40, accidentCount: 2, lighting: 'good', roadWidth: 4,
    },
    {
      name: 'College St (Bathurst to Spadina)',
      coords: [[-79.4113, 43.6580], [-79.3968, 43.6590]],
      hasLane: true, trafficSpeed: 45, accidentCount: 3, lighting: 'good', roadWidth: 3.5,
    },
    {
      name: 'Harbord St (Spadina to University)',
      coords: [[-79.4014, 43.6630], [-79.3899, 43.6625]],
      hasLane: true, trafficSpeed: 35, accidentCount: 1, lighting: 'good', roadWidth: 3,
    },
    {
      name: 'Dundas St (Ossington to Bathurst)',
      coords: [[-79.4225, 43.6501], [-79.4113, 43.6520]],
      hasLane: false, trafficSpeed: 50, accidentCount: 5, lighting: 'moderate', roadWidth: 2.5,
    },
    {
      name: 'Queen St (Broadview to Parliament)',
      coords: [[-79.3529, 43.6593], [-79.3637, 43.6545]],
      hasLane: false, trafficSpeed: 45, accidentCount: 4, lighting: 'moderate', roadWidth: 2,
    },
    {
      name: 'Danforth Ave (Pape to Broadview)',
      coords: [[-79.3451, 43.6779], [-79.3529, 43.6754]],
      hasLane: false, trafficSpeed: 50, accidentCount: 3, lighting: 'moderate', roadWidth: 2.5,
    },
    {
      name: 'Wellesley St (Yonge to Parliament)',
      coords: [[-79.3832, 43.6650], [-79.3680, 43.6645]],
      hasLane: true, trafficSpeed: 40, accidentCount: 1, lighting: 'good', roadWidth: 3.5,
    },
    {
      name: 'Richmond St (Spadina to University)',
      coords: [[-79.3968, 43.6500], [-79.3896, 43.6495]],
      hasLane: true, trafficSpeed: 40, accidentCount: 2, lighting: 'good', roadWidth: 3,
    },
    {
      name: 'Sherbourne St (Bloor to Queen)',
      coords: [[-79.3748, 43.6718], [-79.3721, 43.6532]],
      hasLane: true, trafficSpeed: 45, accidentCount: 3, lighting: 'moderate', roadWidth: 3.5,
    },
    {
      name: 'Bay St (Front to Dundas)',
      coords: [[-79.3812, 43.6453], [-79.3832, 43.6561]],
      hasLane: false, trafficSpeed: 50, accidentCount: 6, lighting: 'good', roadWidth: 2,
    },
    {
      name: 'Spadina Ave (Bloor to King)',
      coords: [[-79.4014, 43.6657], [-79.3968, 43.6467]],
      hasLane: true, trafficSpeed: 40, accidentCount: 2, lighting: 'good', roadWidth: 4,
    },
    {
      name: 'University Ave (Queen to Bloor)',
      coords: [[-79.3896, 43.6517], [-79.3920, 43.6680]],
      hasLane: false, trafficSpeed: 60, accidentCount: 4, lighting: 'good', roadWidth: 2,
    },
    {
      name: 'Lakeshore Blvd (Strachan to Yonge)',
      coords: [[-79.4087, 43.6361], [-79.3785, 43.6380]],
      hasLane: true, trafficSpeed: 55, accidentCount: 2, lighting: 'moderate', roadWidth: 3,
    },
    {
      name: 'St George St (Bloor to Harbord)',
      coords: [[-79.3985, 43.6688], [-79.3995, 43.6630]],
      hasLane: true, trafficSpeed: 30, accidentCount: 0, lighting: 'good', roadWidth: 4,
    },
    {
      name: 'Ossington Ave (Dundas to Bloor)',
      coords: [[-79.4225, 43.6501], [-79.4255, 43.6601]],
      hasLane: false, trafficSpeed: 45, accidentCount: 3, lighting: 'poor', roadWidth: 2,
    },
    {
      name: 'King St E (Yonge to Parliament)',
      coords: [[-79.3785, 43.6488], [-79.3637, 43.6500]],
      hasLane: false, trafficSpeed: 40, accidentCount: 5, lighting: 'moderate', roadWidth: 2.5,
    },
    {
      name: 'Adelaide St E (Yonge to Sherbourne)',
      coords: [[-79.3785, 43.6500], [-79.3721, 43.6510]],
      hasLane: true, trafficSpeed: 40, accidentCount: 1, lighting: 'good', roadWidth: 3,
    },
    {
      name: 'Davenport Rd (Avenue to Dupont)',
      coords: [[-79.3948, 43.6740], [-79.4060, 43.6750]],
      hasLane: false, trafficSpeed: 50, accidentCount: 2, lighting: 'moderate', roadWidth: 2.5,
    },
    {
      name: 'Gerrard St (Parliament to Broadview)',
      coords: [[-79.3637, 43.6610], [-79.3529, 43.6640]],
      hasLane: false, trafficSpeed: 45, accidentCount: 3, lighting: 'poor', roadWidth: 2,
    },
    {
      name: 'Martin Goodman Trail (Lakeshore)',
      coords: [[-79.4200, 43.6340], [-79.3700, 43.6360]],
      hasLane: true, trafficSpeed: 15, accidentCount: 0, lighting: 'good', roadWidth: 5,
    },
  ];

  return segments.map((s) => {
    const laneScore = s.hasLane ? 100 : 20;
    const speedScore = Math.max(0, 100 - s.trafficSpeed);
    const accScore = Math.max(0, 100 - s.accidentCount * 15);
    const lightScores = { good: 100, moderate: 60, poor: 20 };
    const lightScore = lightScores[s.lighting];
    const widthScore = Math.min(100, s.roadWidth * 25);
    const safetyScore =
      0.3 * laneScore + 0.3 * speedScore + 0.2 * accScore + 0.15 * lightScore + 0.05 * widthScore;

    return {
      name: s.name,
      geometry: { type: 'LineString', coordinates: s.coords },
      safetyScore: Math.round(safetyScore * 10) / 10,
      hasLane: s.hasLane,
      trafficSpeed: s.trafficSpeed,
      accidentCount: s.accidentCount,
      lighting: s.lighting,
      roadWidth: s.roadWidth,
    };
  });
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await IntersectionReport.deleteMany({});
    await ParkingSpot.deleteMany({});
    await BikeSegment.deleteMany({});
    console.log('Cleared existing data');

    const intersections = generateIntersectionReports();
    await IntersectionReport.insertMany(intersections);
    console.log(`Seeded ${intersections.length} intersection reports`);

    const parking = generateParkingSpots();
    await ParkingSpot.insertMany(parking);
    console.log(`Seeded ${parking.length} parking spots`);

    const bikeSegments = generateBikeSegments();
    await BikeSegment.insertMany(bikeSegments);
    console.log(`Seeded ${bikeSegments.length} bike segments`);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
