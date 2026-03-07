const IntersectionReport = require('../models/IntersectionReport');
const ParkingSpot = require('../models/ParkingSpot');
const BikeSegment = require('../models/BikeSegment');

exports.getStats = async (_req, res) => {
  try {
    const [
      totalIntersections,
      totalParking,
      availableParking,
      totalBikeSegments,
      intersectionsByType,
      topIntersections,
      parkingByHour,
      bikeScoreDistribution,
    ] = await Promise.all([
      IntersectionReport.countDocuments(),
      ParkingSpot.countDocuments(),
      ParkingSpot.countDocuments({ status: 'available' }),
      BikeSegment.countDocuments(),

      IntersectionReport.aggregate([
        { $group: { _id: '$reportType', count: { $sum: 1 } } },
      ]),

      IntersectionReport.aggregate([
        {
          $group: {
            _id: {
              lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 3] },
              lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 3] },
            },
            count: { $sum: 1 },
            avgSeverity: { $avg: '$severity' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      ParkingSpot.aggregate([
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

      BikeSegment.aggregate([
        {
          $bucket: {
            groupBy: '$safetyScore',
            boundaries: [0, 20, 40, 60, 80, 100],
            default: 'other',
            output: { count: { $sum: 1 } },
          },
        },
      ]),
    ]);

    res.json({
      totalIntersections,
      totalParking,
      availableParking,
      totalBikeSegments,
      intersectionsByType,
      topIntersections,
      parkingByHour,
      bikeScoreDistribution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
