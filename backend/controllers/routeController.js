const axios = require('axios');
const IntersectionReport = require('../models/IntersectionReport');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

function generateRouteVariant(origin, destination, type, baseDist) {
  const jitter = () => (Math.random() - 0.5) * 0.01;
  const midLat = (origin[1] + destination[1]) / 2 + jitter();
  const midLng = (origin[0] + destination[0]) / 2 + jitter();

  const multipliers = {
    fastest: { dist: 1.0, time: 0.8, risk: 1.3 },
    cheapest: { dist: 1.15, time: 1.2, risk: 1.1 },
    safest: { dist: 1.25, time: 1.3, risk: 0.5 },
  };
  const m = multipliers[type];

  const distance = baseDist * m.dist;
  const fuelCost = distance * 0.12;
  const timeCost = distance * 0.05 * m.time;
  const riskCost = distance * 0.03 * m.risk;

  return {
    routeType: type,
    origin: { type: 'Point', coordinates: origin },
    destination: { type: 'Point', coordinates: destination },
    waypoints: [{ type: 'Point', coordinates: [midLng, midLat] }],
    distance: Math.round(distance * 100) / 100,
    duration: Math.round((distance / 60) * m.time * 60),
    fuelCost: Math.round(fuelCost * 100) / 100,
    timeCost: Math.round(timeCost * 100) / 100,
    riskCost: Math.round(riskCost * 100) / 100,
    totalCost: Math.round((fuelCost + timeCost + riskCost) * 100) / 100,
  };
}

exports.planRoute = async (req, res) => {
  try {
    const { origin, destination, fuelEfficiency, fuelType } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination required' });
    }

    const R = 6371;
    const dLat = ((destination[1] - origin[1]) * Math.PI) / 180;
    const dLon = ((destination[0] - origin[0]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((origin[1] * Math.PI) / 180) *
        Math.cos((destination[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const baseDist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    let gasPrice = 1.65;
    try {
      const mlRes = await axios.post(`${ML_SERVICE_URL}/ml/gas-price/predict`, {
        fuel_type: fuelType || 'regular',
      });
      gasPrice = mlRes.data.predicted_price;
    } catch {
      // use default
    }

    const routes = ['fastest', 'cheapest', 'safest'].map((type) => {
      const route = generateRouteVariant(origin, destination, type, baseDist);
      route.fuelCost = Math.round(route.distance * (1 / (fuelEfficiency || 10)) * gasPrice * 100) / 100;
      route.totalCost = Math.round((route.fuelCost + route.timeCost + route.riskCost) * 100) / 100;
      return route;
    });

    res.json({ gasPrice, routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
