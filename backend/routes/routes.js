const router = require('express').Router();

const ROUTES_API = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const GAS_PRICES = { regular: 1.65, premium: 1.85, diesel: 1.72 };
const FIELD_MASK = [
  'routes.duration',
  'routes.distanceMeters',
  'routes.description',
  'routes.polyline.encodedPolyline',
].join(',');

const VALID_MODES = ['DRIVE', 'BICYCLE', 'WALK'];

function buildWaypoint(input) {
  if (typeof input === 'string') {
    return { address: input };
  }
  if (Array.isArray(input) && input.length === 2) {
    return {
      location: {
        latLng: { latitude: input[1], longitude: input[0] },
      },
    };
  }
  if (input && input.lat != null && input.lng != null) {
    return {
      location: {
        latLng: { latitude: input.lat, longitude: input.lng },
      },
    };
  }
  throw new Error('Invalid waypoint format — provide an address string, [lng, lat] array, or { lat, lng } object');
}

async function fetchRoute(origin, destination, { travelMode = 'DRIVE', routeModifiers = {} } = {}) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    throw new Error('GOOGLE_MAPS_API_KEY is not configured in .env');
  }

  const body = {
    origin: buildWaypoint(origin),
    destination: buildWaypoint(destination),
    travelMode,
    languageCode: 'en-US',
    units: 'METRIC',
  };

  if (travelMode === 'DRIVE') {
    body.routingPreference = 'TRAFFIC_AWARE_OPTIMAL';
    body.routeModifiers = routeModifiers;
  }

  const response = await fetch(ROUTES_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Routes API returned ${response.status}`);
  }

  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No routes found between the given locations');
  }
  return data.routes[0];
}

function parseRoute(raw) {
  const distanceKm = raw.distanceMeters / 1000;
  const durationSec = parseInt(raw.duration.replace('s', ''), 10);
  return {
    distance: Math.round(distanceKm * 10) / 10,
    duration: Math.round(durationSec / 60),
    description: raw.description || '',
    polyline: raw.polyline?.encodedPolyline || '',
  };
}

// POST /api/routes/navigate — single route for the main map
router.post('/navigate', async (req, res) => {
  try {
    const { origin, destination, travelMode = 'DRIVE' } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination are required' });
    }

    const mode = VALID_MODES.includes(travelMode.toUpperCase())
      ? travelMode.toUpperCase()
      : 'DRIVE';

    const raw = await fetchRoute(origin, destination, { travelMode: mode });
    const route = parseRoute(raw);
    route.travelMode = mode;

    res.json(route);
  } catch (err) {
    console.error('Navigate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/routes/plan — compare fastest / cheapest / safest (driving only)
router.post('/plan', async (req, res) => {
  try {
    const { origin, destination, fuelType = 'regular', fuelEfficiency = 10 } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination are required' });
    }

    const gasPrice = GAS_PRICES[fuelType] || GAS_PRICES.regular;

    const [fastestRaw, cheapestRaw, safestRaw] = await Promise.all([
      fetchRoute(origin, destination, { travelMode: 'DRIVE' }),
      fetchRoute(origin, destination, { travelMode: 'DRIVE', routeModifiers: { avoidTolls: true } }),
      fetchRoute(origin, destination, { travelMode: 'DRIVE', routeModifiers: { avoidHighways: true } }),
    ]);

    const RISK_FACTOR = { fastest: 0.05, cheapest: 0.04, safest: 0.02 };

    const routes = [
      { routeType: 'fastest', raw: fastestRaw },
      { routeType: 'cheapest', raw: cheapestRaw },
      { routeType: 'safest', raw: safestRaw },
    ].map(({ routeType, raw }) => {
      const { distance, duration, description, polyline } = parseRoute(raw);
      const fuelCost = Math.round(((distance / fuelEfficiency) * gasPrice) * 100) / 100;
      const timeCost = Math.round((duration * 0.35) * 100) / 100;
      const riskCost = Math.round((distance * RISK_FACTOR[routeType]) * 100) / 100;
      const totalCost = Math.round((fuelCost + timeCost + riskCost) * 100) / 100;

      return { routeType, distance, duration, fuelCost, timeCost, riskCost, totalCost, description, polyline };
    });

    res.json({ gasPrice, routes });
  } catch (err) {
    console.error('Route planning error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
