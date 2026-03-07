const ParkingSpot = require('../models/ParkingSpot');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

exports.getAll = async (req, res) => {
  try {
    const { swLat, swLng, neLat, neLng } = req.query;
    let query = {};

    if (swLat && swLng && neLat && neLng) {
      query.location = {
        $geoWithin: {
          $box: [
            [parseFloat(swLng), parseFloat(swLat)],
            [parseFloat(neLng), parseFloat(neLat)],
          ],
        },
      };
    }

    const spots = await ParkingSpot.find(query).sort({ updatedAt: -1 });
    res.json(spots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.report = async (req, res) => {
  try {
    const { location, status, streetName, restrictions, reportedBy } = req.body;

    const existing = await ParkingSpot.findOne({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: location.coordinates },
          $maxDistance: 20,
        },
      },
    });

    if (existing) {
      existing.status = status;
      existing.updatedAt = new Date();
      if (reportedBy) existing.reportedBy = reportedBy;
      await existing.save();
      return res.json(existing);
    }

    const spot = new ParkingSpot({ location, status, streetName, restrictions, reportedBy });
    await spot.save();
    res.status(201).json(spot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.predict = async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/ml/parking/predict`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'ML service unavailable', details: err.message });
  }
};
