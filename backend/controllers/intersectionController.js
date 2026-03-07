const IntersectionReport = require('../models/IntersectionReport');

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

    const reports = await IntersectionReport.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const report = new IntersectionReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getHotspots = async (req, res) => {
  try {
    const hotspots = await IntersectionReport.aggregate([
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
      { $limit: 50 },
    ]);
    res.json(hotspots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
