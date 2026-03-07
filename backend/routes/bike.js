const router = require('express').Router();
const BikeSegment = require('../models/BikeSegment');

// GET /api/bike/segments — list segments, optional ?minScore filter
router.get('/segments', async (req, res) => {
  try {
    const filter = {};
    if (req.query.minScore) {
      filter.safetyScore = { $gte: Number(req.query.minScore) };
    }
    const segments = await BikeSegment.find(filter).sort({ safetyScore: -1 });
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bike/segments/:id — single segment
router.get('/segments/:id', async (req, res) => {
  try {
    const segment = await BikeSegment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json(segment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
