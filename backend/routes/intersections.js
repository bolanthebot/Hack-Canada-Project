const router = require('express').Router();
const Intersection = require('../models/Intersection');

// GET /api/intersections — list all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Intersection.find().sort({ createdAt: -1 });
    // const reports = await Intersection.find().sort({ createdAt: -1 }).limit(100)
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/intersections — create a report
router.post('/', async (req, res) => {
  try {
    const { location, reportType, severity, description } = req.body;

    if (!location || !location.coordinates) {
      return res.status(400).json({ error: 'location with coordinates is required' });
    }
    if (!reportType) {
      return res.status(400).json({ error: 'reportType is required' });
    }
    if (!severity || severity < 1 || severity > 5) {
      return res.status(400).json({ error: 'severity must be between 1 and 5' });
    }

    const report = await Intersection.create({
      location,
      reportType,
      severity,
      description: description || ''
    });

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
