const router = require('express').Router();
const Intersection = require('../models/Intersection');
const Parking = require('../models/Parking');
const BikeSegment = require('../models/BikeSegment');

// GET /api/dashboard/stats
router.get('/stats', async (_req, res) => {
  try {
    const [
      totalIntersections,
      intersectionsByType,
      topIntersections,
      totalParking,
      availableParking,
      parkingByHour,
      totalBikeSegments,
      bikeScoreDistribution,
      recentReports,
    ] = await Promise.all([
      // Total intersection reports
      Intersection.countDocuments(),

      // Reports grouped by type
      Intersection.aggregate([
        { $group: { _id: '$reportType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Top 5 worst intersections (most reports at same location)
      Intersection.aggregate([
        {
          $group: {
            _id: {
              lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 4] },
              lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 4] },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Total parking spots
      Parking.countDocuments(),

      // Available parking spots
      Parking.countDocuments({ status: 'available' }),

      // Parking by hour (based on updatedAt)
      Parking.aggregate([
        {
          $group: {
            _id: { $hour: '$updatedAt' },
            available: {
              $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] },
            },
            taken: {
              $sum: { $cond: [{ $eq: ['$status', 'taken'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Total bike segments
      BikeSegment.countDocuments(),

      // Bike score distribution (buckets of 10)
      BikeSegment.aggregate([
        {
          $bucket: {
            groupBy: '$safetyScore',
            boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            default: 'other',
            output: { count: { $sum: 1 } },
          },
        },
      ]),

      // Recent Reports (Latest 10)
      Intersection.find().sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      totalIntersections,
      intersectionsByType,
      topIntersections,
      totalParking,
      availableParking,
      parkingByHour,
      totalBikeSegments,
      bikeScoreDistribution,
      recentReports,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
