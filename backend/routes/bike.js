


const router = require('express').Router();
const BikeSegment = require('../models/BikeSegment');

const cache = {};
const CACHE_TTL = 30000;

function getCache(key) {
  const item = cache[key];
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) { delete cache[key]; return null; }
  return item.data;
}

function setCache(key, data) {
  cache[key] = { data, timestamp: Date.now() };
}

router.get('/segments', async (req, res) => {
  try {
    const minScore = req.query.minScore !== undefined ? Number(req.query.minScore) : 0;
    const cacheKey = `segments_${minScore}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const filter = { safetyScore: { $gte: minScore } };

    const segments = await BikeSegment.find(filter)
      .limit(500)
      .select('name safetyScore hasLane geometry lighting trafficSpeed accidentCount roadWidth');

    setCache(cacheKey, segments);
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/segments/:id', async (req, res) => {
  try {
    const segment = await BikeSegment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json(segment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/segments', async (req, res) => {
  try {
    const segment = await BikeSegment.create(req.body);
    Object.keys(cache).forEach(k => delete cache[k]);
    res.status(201).json(segment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
