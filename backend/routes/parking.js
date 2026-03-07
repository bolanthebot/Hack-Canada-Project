const router = require('express').Router();
const Parking = require('../models/Parking');

// GET /api/parking — list all spots
router.get('/', async (req, res) => {
  try {
    const spots = await Parking.find().sort({ updatedAt: -1 });
    // const spots = await Parking.find().sort({ updatedAt: -1 }).limit(100)
    res.json(spots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/parking — report / update a spot
router.post('/', async (req, res) => {
  try {
    const { location, status, streetName } = req.body;

    // Try to find an existing spot near these coordinates
    // const existing = await Parking.findOne({
    //   'location.coordinates': location.coordinates,
    // });
    const existing = await Parking.findOne({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: location.coordinates },
          $maxDistance: 10 // within 10 meters
        }
      }
    });

    if (existing) {
      existing.status = status;
      if (streetName) existing.streetName = streetName;
      await existing.save();
      return res.json(existing);
    }

    const spot = await Parking.create(req.body);
    res.status(201).json(spot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/parking/predict — simple heuristic prediction
router.post('/predict', (req, res) => {
  const { hour = 12, day_of_week = 3 } = req.body;

  // Simple heuristic: parking is scarcer during business hours on weekdays
  let probability = 0.6;

  // Weekday rush hours (8-10, 16-18) are tighter
  const isWeekday = day_of_week >= 1 && day_of_week <= 5;
  const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 16 && hour <= 18);
  const isBusinessHours = hour >= 9 && hour <= 17;

  if (isWeekday && isRushHour) probability = 0.15;
  else if (isWeekday && isBusinessHours) probability = 0.3;
  else if (isWeekday) probability = 0.7;
  else probability = 0.75; // weekends

  // Late night / early morning — lots of availability
  if (hour >= 22 || hour <= 5) probability = 0.9;

  // Add a bit of deterministic noise based on hour
  probability = Math.min(1, Math.max(0, probability + (Math.sin(hour * 1.3) * 0.08)));

  res.json({ probability: Math.round(probability * 100) / 100 });
});

module.exports = router;
