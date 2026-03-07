const BikeSegment = require('../models/BikeSegment');

exports.getSegments = async (req, res) => {
  try {
    const { minScore } = req.query;
    let query = {};

    if (minScore) {
      query.safetyScore = { $gte: parseFloat(minScore) };
    }

    const segments = await BikeSegment.find(query);
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSegmentById = async (req, res) => {
  try {
    const segment = await BikeSegment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json(segment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
