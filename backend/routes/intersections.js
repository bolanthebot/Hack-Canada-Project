const router = require('express').Router();
const Intersection = require('../models/Intersection');

// GET /api/intersections — list all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Intersection.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/intersections — create a report
router.post('/', async (req, res) => {
  try {
    const report = await Intersection.create(req.body);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/intersections/hotspots — aggregate by rounded lat/lng
router.get('/hotspots', async (req, res) => {
  try {
    const hotspots = await Intersection.aggregate([
      {
        $group: {
          _id: {
            lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 4] },
            lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 4] },
          },
          count: { $sum: 1 },
          avgSeverity: { $avg: '$severity' },
          types: { $push: '$reportType' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json(hotspots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
