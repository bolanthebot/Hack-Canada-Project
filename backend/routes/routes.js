const router = require('express').Router();

// Haversine distance in km
function haversine([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Simulated gas prices per litre (CAD)
const GAS_PRICES = { regular: 1.65, premium: 1.85, diesel: 1.72 };

// POST /api/routes/plan
router.post('/plan', (req, res) => {
  try {
    const { origin, destination, fuelType = 'regular', fuelEfficiency = 10 } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination are required' });
    }

    const straightDist = haversine(origin, destination);
    const gasPrice = GAS_PRICES[fuelType] || GAS_PRICES.regular;

    // Generate three route variants
    const routes = [
      {
        routeType: 'fastest',
        distanceMultiplier: 1.15,   // fairly direct
        speedKmh: 55,
        riskMultiplier: 1.0,
      },
      {
        routeType: 'cheapest',
        distanceMultiplier: 1.3,    // longer but avoids tolls / highway
        speedKmh: 40,
        riskMultiplier: 0.8,
      },
      {
        routeType: 'safest',
        distanceMultiplier: 1.4,    // avoids danger zones
        speedKmh: 35,
        riskMultiplier: 0.3,
      },
    ].map((r) => {
      const distance = Math.round(straightDist * r.distanceMultiplier * 10) / 10;
      const duration = Math.round((distance / r.speedKmh) * 60);           // minutes
      const fuelCost = Math.round(((distance / fuelEfficiency) * gasPrice) * 100) / 100;
      const timeCost = Math.round((duration * 0.35) * 100) / 100;          // $0.35/min value of time
      const riskCost = Math.round((distance * 0.05 * r.riskMultiplier) * 100) / 100;
      const totalCost = Math.round((fuelCost + timeCost + riskCost) * 100) / 100;

      return {
        routeType: r.routeType,
        distance,
        duration,
        fuelCost,
        timeCost,
        riskCost,
        totalCost,
      };
    });

    res.json({ gasPrice, routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
