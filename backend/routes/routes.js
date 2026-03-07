// const router = require('express').Router();
// const axios = require('axios');
// const { decode } = require('@googlemaps/polyline-codec');

// const ROUTES_API = 'https://routes.googleapis.com/directions/v2:computeRoutes';
// const GAS_PRICES = { regular: 1.65, premium: 1.85, diesel: 1.72 };
// const FIELD_MASK = [
//   'routes.duration',
//   'routes.distanceMeters',
//   'routes.description',
//   'routes.polyline.encodedPolyline',
// ].join(',');

// const VALID_MODES = ['DRIVE', 'BICYCLE', 'WALK'];

// const ONTARIO_CSV_URL = 'https://ontario.ca/v1/files/fuel-prices/canadianpumppricesall.csv';

// const FALLBACK_PRICES = {
//   toronto: 172,
//   ottawa: 165,
//   kingston: 168,
//   oshawa: 170,
//   montreal: 163,
// };

// const CITY_COORDS = {
//   toronto: { lat: 43.6532, lng: -79.3832 },
//   ottawa: { lat: 45.4215, lng: -75.6972 },
//   kingston: { lat: 44.2312, lng: -76.4860 },
//   oshawa: { lat: 43.8971, lng: -78.8658 },
//   montreal: { lat: 45.5017, lng: -73.5673 },
// };

// const OVERPASS_ENDPOINTS = [
//   'https://overpass-api.de/api/interpreter',
//   'https://overpass.kumi.systems/api/interpreter',
//   'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
// ];

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // ---------------------------------------------------------------------------
// // Ontario Open Data CSV price fetcher
// // Data row layout (15 cols — quoted cities with commas are NOT split in data):
// //   0:Date  1:Toronto  2:Ottawa  3:Thunder Bay  4:St.John's/NL  5:Charlottetown
// //   6:Halifax  7:Saint John/NB  8:Montreal  9:Winnipeg  10:Regina  11:Calgary
// //   12:Vancouver  13:Tax Status  14:Situation fiscale
// // ---------------------------------------------------------------------------
// const CSV_COL = { date: 0, toronto: 1, ottawa: 2, montreal: 8, taxStatus: 13 };

// let priceCache = null;
// let priceCacheTime = 0;
// let intelCache = null;
// let intelCacheTime = 0;
// const INTEL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
// const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// async function fetchOntarioPrices() {
//   const now = Date.now();
//   if (priceCache && (now - priceCacheTime) < CACHE_TTL_MS) {
//     console.log('  Gas prices: using cached data');
//     return priceCache;
//   }

//   try {
//     console.log('  Gas prices: fetching Ontario Open Data CSV...');
//     const { data: csv } = await axios.get(ONTARIO_CSV_URL, { timeout: 10000 });
//     const lines = csv.trim().split(/\r?\n/);
//     let latestPrices = null;

//     for (let i = lines.length - 1; i >= 1; i--) {
//       const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
//       if (cols[CSV_COL.taxStatus]?.toLowerCase() !== 'total') continue;

//       const toronto = parseFloat(cols[CSV_COL.toronto]);
//       const ottawa = parseFloat(cols[CSV_COL.ottawa]);
//       const montreal = parseFloat(cols[CSV_COL.montreal]);
//       const date = cols[CSV_COL.date];

//       if (isNaN(toronto) || isNaN(ottawa)) continue;

//       latestPrices = {
//         toronto,
//         ottawa,
//         montreal: isNaN(montreal) ? Math.round((toronto + ottawa) / 2) : montreal,
//         kingston: Math.round((toronto + ottawa) / 2),
//         oshawa: Math.round((toronto * 2 + ottawa) / 3),
//       };

//       console.log(`  Gas prices: loaded for ${date} → Toronto:${toronto} Ottawa:${ottawa} Montreal:${latestPrices.montreal} Kingston:${latestPrices.kingston} Oshawa:${latestPrices.oshawa} ¢/L`);
//       break;
//     }

//     if (!latestPrices) throw new Error('No valid Total row found in CSV');
//     priceCache = latestPrices;
//     priceCacheTime = now;
//     return latestPrices;
//   } catch (err) {
//     console.warn(`  Gas prices: CSV failed (${err.message}) — using hardcoded fallback`);
//     return FALLBACK_PRICES;
//   }
// }

// // ---------------------------------------------------------------------------
// // Parse ALL historical Total rows from CSV for trend analysis
// // Returns array of { date, toronto, ottawa, montreal } sorted oldest → newest
// // ---------------------------------------------------------------------------
// async function fetchOntarioPriceHistory() {
//   try {
//     const { data: csv } = await axios.get(ONTARIO_CSV_URL, { timeout: 10000 });
//     const lines = csv.trim().split(/\r?\n/);
//     const history = [];

//     for (let i = 1; i < lines.length; i++) {
//       const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
//       if (cols[CSV_COL.taxStatus]?.toLowerCase() !== 'total') continue;

//       const toronto = parseFloat(cols[CSV_COL.toronto]);
//       const ottawa = parseFloat(cols[CSV_COL.ottawa]);
//       const montreal = parseFloat(cols[CSV_COL.montreal]);
//       const date = cols[CSV_COL.date];

//       if (isNaN(toronto) || isNaN(ottawa) || !date) continue;
//       history.push({ date, toronto, ottawa, montreal: isNaN(montreal) ? null : montreal });
//     }

//     return history; // already chronological in CSV
//   } catch (err) {
//     console.warn(`  Price history fetch failed: ${err.message}`);
//     return [];
//   }
// }

// function estimatePrice(lat, lng, prices) {
//   let closest = null;
//   let minDist = Infinity;
//   for (const [city, coords] of Object.entries(CITY_COORDS)) {
//     const d = Math.sqrt((lat - coords.lat) ** 2 + (lng - coords.lng) ** 2);
//     if (d < minDist) { minDist = d; closest = city; }
//   }
//   return prices[closest] ?? 168;
// }

// // ---------------------------------------------------------------------------
// // Route helpers
// // ---------------------------------------------------------------------------

// function buildWaypoint(input) {
//   if (typeof input === 'string') return { address: input };
//   if (Array.isArray(input) && input.length === 2) {
//     return { location: { latLng: { latitude: input[1], longitude: input[0] } } };
//   }
//   if (input && input.lat != null && input.lng != null) {
//     return { location: { latLng: { latitude: input.lat, longitude: input.lng } } };
//   }
//   throw new Error('Invalid waypoint format');
// }

// async function fetchRoute(origin, destination, { travelMode = 'DRIVE', routeModifiers = {} } = {}) {
//   const apiKey = process.env.GOOGLE_MAPS_API_KEY;
//   if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
//     throw new Error('GOOGLE_MAPS_API_KEY is not configured in .env');
//   }

//   const body = {
//     origin: buildWaypoint(origin),
//     destination: buildWaypoint(destination),
//     travelMode,
//     languageCode: 'en-US',
//     units: 'METRIC',
//   };

//   if (travelMode === 'DRIVE') {
//     body.routingPreference = 'TRAFFIC_AWARE_OPTIMAL';
//     body.routeModifiers = routeModifiers;
//   }

//   const response = await fetch(ROUTES_API, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-Goog-Api-Key': apiKey,
//       'X-Goog-FieldMask': FIELD_MASK,
//     },
//     body: JSON.stringify(body),
//   });

//   if (!response.ok) {
//     const err = await response.json().catch(() => ({}));
//     throw new Error(err.error?.message || `Routes API returned ${response.status}`);
//   }

//   const data = await response.json();
//   if (!data.routes || data.routes.length === 0) {
//     throw new Error('No routes found between the given locations');
//   }
//   return data.routes[0];
// }

// function parseRoute(raw) {
//   const distanceKm = raw.distanceMeters / 1000;
//   const durationSec = parseInt(raw.duration.replace('s', ''), 10);
//   return {
//     distance: Math.round(distanceKm * 10) / 10,
//     duration: Math.round(durationSec / 60),
//     description: raw.description || '',
//     polyline: raw.polyline?.encodedPolyline || '',
//   };
// }

// // ---------------------------------------------------------------------------
// // Gas stop helpers
// // ---------------------------------------------------------------------------

// function decodePolylineWithDistance(encodedPolyline) {
//   const points = decode(encodedPolyline);
//   if (points.length === 0) return [];

//   const result = [{ lat: points[0][0], lng: points[0][1], distFromStart: 0 }];
//   for (let i = 1; i < points.length; i++) {
//     const [lat1, lng1] = points[i - 1];
//     const [lat2, lng2] = points[i];
//     const R = 6371;
//     const dLat = ((lat2 - lat1) * Math.PI) / 180;
//     const dLng = ((lng2 - lng1) * Math.PI) / 180;
//     const a =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLng / 2) ** 2;
//     const segKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     result.push({ lat: lat2, lng: lng2, distFromStart: result[i - 1].distFromStart + segKm });
//   }
//   return result;
// }

// function haversineKm(lat1, lng1, lat2, lng2) {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLng = ((lng2 - lng1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//     Math.cos((lat2 * Math.PI) / 180) *
//     Math.sin(dLng / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }

// async function fetchNearbyGasStations(lat, lng) {
//   for (const radiusM of [5000, 10000, 15000]) {
//     const query = `[out:json];node["amenity"="fuel"](around:${radiusM},${lat},${lng});out;`;

//     for (const endpoint of OVERPASS_ENDPOINTS) {
//       try {
//         const url = `${endpoint}?data=${encodeURIComponent(query)}`;
//         const { data } = await axios.get(url, { timeout: 15000 });

//         if (!data.elements || data.elements.length === 0) break;

//         const host = endpoint.split('/')[2];
//         console.log(`  Overpass [${host}]: ${data.elements.length} stations at ${radiusM / 1000}km for (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

//         return data.elements.map((el) => ({
//           id: el.id,
//           lat: el.lat,
//           lng: el.lon,
//           name: el.tags?.name || el.tags?.brand || 'Gas Station',
//           brand: el.tags?.brand || null,
//           address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']]
//             .filter(Boolean).join(' '),
//         }));
//       } catch (err) {
//         const host = endpoint.split('/')[2];
//         if (err.response?.status === 429) {
//           console.warn(`  Overpass 429 on ${host} — trying next mirror`);
//           await sleep(500);
//         } else {
//           console.warn(`  Overpass skipping ${host}: ${err.response?.status || err.message}`);
//         }
//       }
//     }

//     console.warn(`  Overpass: 0 results at ${radiusM / 1000}km — trying wider radius`);
//     await sleep(1000);
//   }

//   return [];
// }

// function planStopZones(polylinePoints, tankKm, currentFuelPercent, safetyBufferPercent = 15) {
//   const safetyKm = (safetyBufferPercent / 100) * tankKm;
//   const MIN_STOP_DIST_KM = 20;
//   const stopZones = [];

//   let fuelKmRemaining = (currentFuelPercent / 100) * tankKm;
//   let lastStopDist = 0;
//   let prevDist = 0;

//   for (const pt of polylinePoints) {
//     const distTravelled = pt.distFromStart - prevDist;
//     fuelKmRemaining -= distTravelled;
//     prevDist = pt.distFromStart;

//     const distSinceLastStop = pt.distFromStart - lastStopDist;

//     if (fuelKmRemaining <= safetyKm && distSinceLastStop >= MIN_STOP_DIST_KM) {
//       stopZones.push({ distFromStart: pt.distFromStart, lat: pt.lat, lng: pt.lng });
//       fuelKmRemaining = tankKm;
//       lastStopDist = pt.distFromStart;
//     }
//   }

//   return stopZones;
// }

// // ---------------------------------------------------------------------------
// // POST /api/routes/navigate
// // ---------------------------------------------------------------------------
// router.post('/navigate', async (req, res) => {
//   try {
//     const { origin, destination, travelMode = 'DRIVE' } = req.body;
//     if (!origin || !destination) {
//       return res.status(400).json({ error: 'origin and destination are required' });
//     }
//     const mode = VALID_MODES.includes(travelMode.toUpperCase()) ? travelMode.toUpperCase() : 'DRIVE';
//     const raw = await fetchRoute(origin, destination, { travelMode: mode });
//     const route = parseRoute(raw);
//     route.travelMode = mode;
//     res.json(route);
//   } catch (err) {
//     console.error('Navigate error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ---------------------------------------------------------------------------
// // POST /api/routes/plan
// // ---------------------------------------------------------------------------
// router.post('/plan', async (req, res) => {
//   try {
//     const { origin, destination, fuelType = 'regular', fuelEfficiency = 10 } = req.body;
//     if (!origin || !destination) {
//       return res.status(400).json({ error: 'origin and destination are required' });
//     }

//     const gasPrice = GAS_PRICES[fuelType] || GAS_PRICES.regular;

//     const [fastestRaw, cheapestRaw, safestRaw] = await Promise.all([
//       fetchRoute(origin, destination, { travelMode: 'DRIVE' }),
//       fetchRoute(origin, destination, { travelMode: 'DRIVE', routeModifiers: { avoidTolls: true } }),
//       fetchRoute(origin, destination, { travelMode: 'DRIVE', routeModifiers: { avoidHighways: true } }),
//     ]);

//     const RISK_FACTOR = { fastest: 0.05, cheapest: 0.04, safest: 0.02 };

//     const routes = [
//       { routeType: 'fastest', raw: fastestRaw },
//       { routeType: 'cheapest', raw: cheapestRaw },
//       { routeType: 'safest', raw: safestRaw },
//     ].map(({ routeType, raw }) => {
//       const { distance, duration, description, polyline } = parseRoute(raw);
//       const fuelCost = Math.round(((distance / fuelEfficiency) * gasPrice) * 100) / 100;
//       const timeCost = Math.round((duration * 0.35) * 100) / 100;
//       const riskCost = Math.round((distance * RISK_FACTOR[routeType]) * 100) / 100;
//       const totalCost = Math.round((fuelCost + timeCost + riskCost) * 100) / 100;
//       return { routeType, distance, duration, fuelCost, timeCost, riskCost, totalCost, description, polyline };
//     });

//     res.json({ gasPrice, routes });
//   } catch (err) {
//     console.error('Route planning error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ---------------------------------------------------------------------------
// // POST /api/routes/gas-stops — Tesla-style trip planner
// // ---------------------------------------------------------------------------
// router.post('/gas-stops', async (req, res) => {
//   try {
//     const { origin, destination, tankKm = 500, currentFuelPercent = 100 } = req.body;

//     if (!origin || !destination) {
//       return res.status(400).json({ error: 'origin and destination are required' });
//     }

//     const raw = await fetchRoute(origin, destination, { travelMode: 'DRIVE' });
//     const { distance, polyline } = parseRoute(raw);
//     const polylinePoints = decodePolylineWithDistance(polyline);
//     const routeTotalKm = polylinePoints[polylinePoints.length - 1].distFromStart;

//     console.log('\n========== GAS STOP PLANNER ==========');
//     console.log(`Route:          ${origin}  →  ${destination}`);
//     console.log(`Route distance: ${Math.round(routeTotalKm)} km  (${polylinePoints.length} polyline points)`);
//     console.log(`Tank:           ${tankKm} km total range`);
//     console.log(`Current fuel:   ${currentFuelPercent}%  =  ${Math.round((currentFuelPercent / 100) * tankKm)} km`);
//     console.log(`Safety buffer:  15%  =  ${Math.round(0.15 * tankKm)} km`);

//     const stopZones = planStopZones(polylinePoints, tankKm, currentFuelPercent);
//     const lowFuelWarning = stopZones.length > 0 && stopZones[0].distFromStart <= 25;

//     console.log(`\nStop zones:     ${stopZones.length}${lowFuelWarning ? '  ⚠️  low fuel at departure' : ''}`);
//     stopZones.forEach((z, i) => {
//       console.log(`  Zone ${i + 1}: ${Math.round(z.distFromStart)} km  (${z.lat.toFixed(4)}, ${z.lng.toFixed(4)})`);
//     });

//     if (stopZones.length === 0) {
//       console.log('\nResult: no stops needed');
//       console.log('=======================================\n');
//       return res.json({
//         routeDistanceKm: Math.round(routeTotalKm * 10) / 10,
//         stopsNeeded: 0,
//         canCompleteWithoutStop: true,
//         lowFuelWarning: false,
//         currentRangeKm: Math.round((currentFuelPercent / 100) * tankKm),
//         plannedStops: [],
//       });
//     }

//     console.log('\nFetching prices...');
//     const prices = await fetchOntarioPrices();

//     console.log('\nFetching stations (sequential to avoid rate limits)...');
//     const stationResultsPerZone = [];
//     for (let i = 0; i < stopZones.length; i++) {
//       if (i > 0) await sleep(1500);
//       stationResultsPerZone.push(await fetchNearbyGasStations(stopZones[i].lat, stopZones[i].lng));
//     }

//     console.log('\nCity prices:');
//     for (const [city, price] of Object.entries(prices)) {
//       console.log(`  ${city}: ${price}¢/L`);
//     }

//     console.log('\nStations per zone:');
//     stationResultsPerZone.forEach((stations, i) => {
//       console.log(`  Zone ${i + 1}: ${stations.length} stations`);
//       stations.slice(0, 5).forEach(s => console.log(`    - ${s.name}${s.address ? '  |  ' + s.address : ''}`));
//       if (stations.length > 5) console.log(`    ... +${stations.length - 5} more`);
//     });

//     const plannedStops = [];
//     let fuelKmRemaining = (currentFuelPercent / 100) * tankKm;
//     let prevDist = 0;

//     for (let i = 0; i < stopZones.length; i++) {
//       const zone = stopZones[i];
//       const stations = stationResultsPerZone[i];

//       const stationsWithPrice = stations
//         .map(s => ({
//           ...s,
//           estimatedPriceCentsPerL: estimatePrice(s.lat, s.lng, prices),
//           detourKm: Math.round(haversineKm(zone.lat, zone.lng, s.lat, s.lng) * 10) / 10,
//         }))
//         .sort((a, b) => a.estimatedPriceCentsPerL - b.estimatedPriceCentsPerL);

//       fuelKmRemaining -= (zone.distFromStart - prevDist);
//       const fuelPercentOnArrival = Math.max(0, Math.round((fuelKmRemaining / tankKm) * 100));
//       const best = stationsWithPrice[0] || null;

//       console.log(`\nStop ${i + 1}: at ${Math.round(zone.distFromStart)} km — arriving with ${fuelPercentOnArrival}% fuel`);
//       console.log(`  Best: ${best ? `${best.name} @ ${best.estimatedPriceCentsPerL}¢/L (+${best.detourKm} km detour)` : 'none found'}`);

//       plannedStops.push({
//         stopNumber: i + 1,
//         distFromStartKm: Math.round(zone.distFromStart * 10) / 10,
//         fuelPercentOnArrival,
//         recommendedStation: best,
//         nearbyAlternatives: stationsWithPrice.slice(1, 4),
//         lat: zone.lat,
//         lng: zone.lng,
//       });

//       fuelKmRemaining = tankKm;
//       prevDist = zone.distFromStart;
//     }

//     const fuelPercentAtDestination = Math.max(
//       0,
//       Math.round(((fuelKmRemaining - (routeTotalKm - prevDist)) / tankKm) * 100)
//     );

//     console.log(`\nArriving at destination: ~${fuelPercentAtDestination}% fuel`);
//     console.log('=======================================\n');

//     res.json({
//       routeDistanceKm: Math.round(routeTotalKm * 10) / 10,
//       stopsNeeded: plannedStops.length,
//       canCompleteWithoutStop: false,
//       lowFuelWarning,
//       currentRangeKm: Math.round((currentFuelPercent / 100) * tankKm),
//       fuelPercentAtDestination,
//       plannedStops,
//     });
//   } catch (err) {
//     console.error('Gas stops error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ---------------------------------------------------------------------------

// // ---------------------------------------------------------------------------
// // POST /api/routes/market-intelligence
// // Uses Claude with web_search (agentic loop) to analyze geopolitical/economic
// // events affecting oil prices, combined with historical CSV trend data.
// // Request body: { city?: string }
// // ---------------------------------------------------------------------------
// router.post('/market-intelligence', async (req, res) => {
//   const { city = 'Ontario' } = req.body;
//   const anthropicKey = process.env.ANTHROPIC_API_KEY;

//   if (!anthropicKey) {
//     return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
//   }

//   console.log('\n========== MARKET INTELLIGENCE ==========');
//   console.log(`Region: ${city}`);

//   // Return cached result if fresh
//   if (intelCache && (Date.now() - intelCacheTime) < INTEL_CACHE_TTL_MS) {
//     console.log('Returning cached intel (age:', Math.round((Date.now() - intelCacheTime) / 1000), 's)');
//     console.log('==========================================\n');
//     return res.json(intelCache);
//   }

//   try {
//     // 1. Historical price trend analysis from CSV
//     console.log('Fetching price history...');
//     const history = await fetchOntarioPriceHistory();
//     const recent = history.slice(-12);
//     const torontoRecent = recent.map(r => r.toronto).filter(Boolean);
//     const avg12 = (torontoRecent.reduce((a, b) => a + b, 0) / torontoRecent.length).toFixed(1);
//     const latest = torontoRecent[torontoRecent.length - 1];
//     const fourWeeksAgo = torontoRecent[torontoRecent.length - 4] ?? torontoRecent[0];
//     const trend4w = (latest - fourWeeksAgo).toFixed(1);
//     const trendDirection = trend4w > 0 ? 'rising' : trend4w < 0 ? 'falling' : 'flat';
//     const recentSummary = recent.slice(-6).map(r =>
//       `${r.date}: Toronto ${r.toronto}c/L, Ottawa ${r.ottawa}c/L`
//     ).join('\n');

//     console.log(`Stats - latest:${latest}c | avg:${avg12}c | trend:${trend4w > 0 ? '+' : ''}${trend4w}c (${trendDirection})`);

//     // 2. Agentic Claude loop with web search
//     console.log('Starting Claude agentic loop...');

//     const prompt = `You are a fuel price analyst for Canadian drivers. Analyze current world events and their impact on gasoline prices in ${city}, Canada.

// Recent Ontario pump price data (cents per litre, taxes included):
// ${recentSummary}

// Current price: ${latest}c/L | 12-month average: ${avg12}c/L | 4-week trend: ${trend4w > 0 ? '+' : ''}${trend4w}c/L (${trendDirection})

// Search the web for the latest news (last 7 days) on:
// 1. Geopolitical events affecting oil supply (Middle East, OPEC, sanctions, conflicts)
// 2. Crude oil price movements and supply/demand shifts
// 3. Canada-specific fuel price news

// Return ONLY a JSON object, no markdown fences, no preamble:
// {
//   "currentPriceCents": ${latest},
//   "avgPriceCents": ${avg12},
//   "trendCentsPerMonth": ${trend4w},
//   "trendDirection": "${trendDirection}",
//   "geopoliticalEvents": [{"event": "string", "impact": "string", "severity": "low|medium|high"}],
//   "oilMarketSummary": "2-3 sentence summary",
//   "priceOutlook": "rising|falling|stable",
//   "predictedRangeLow": 0,
//   "predictedRangeHigh": 0,
//   "recommendation": "fill_now|wait|neutral",
//   "recommendationReason": "1-2 sentence plain English for a driver",
//   "confidence": "low|medium|high",
//   "lastUpdated": "${new Date().toISOString().split('T')[0]}"
// }`;

//     const messages = [{ role: 'user', content: prompt }];
//     const tools = [{ type: 'web_search_20250305', name: 'web_search' }];
//     const headers = {
//       'x-api-key': anthropicKey,
//       'anthropic-version': '2023-06-01',
//       'content-type': 'application/json',
//     };

//     let finalText = '';
//     let turns = 0;

//     while (turns < 8) {
//       turns++;
//       console.log(`  Turn ${turns}...`);

//       let data;
//       try {
//         const resp = await axios.post(
//           'https://api.anthropic.com/v1/messages',
//           { model: 'claude-sonnet-4-5', max_tokens: 1500, tools, messages },
//           { headers, timeout: 60000 }
//         );
//         data = resp.data;
//       } catch (apiErr) {
//         // Network unreachable — build a stat-only fallback response
//         console.warn('  Claude API unreachable:', apiErr.code || apiErr.message);
//         const fallbackOutlook = parseFloat(trend4w) > 2 ? 'rising' : parseFloat(trend4w) < -2 ? 'falling' : 'stable';
//         const fallbackRec = fallbackOutlook === 'rising' ? 'fill_now' : fallbackOutlook === 'falling' ? 'wait' : 'neutral';
//         return res.json({
//           currentPriceCents: latest ?? 127,
//           avgPriceCents: parseFloat(avg12) || 130,
//           trendCentsPerMonth: parseFloat(trend4w) || 0,
//           trendDirection,
//           geopoliticalEvents: [],
//           oilMarketSummary: `Based on Ontario pump price data: current price ${latest ?? 127}¢/L, 12-month avg ${avg12}¢/L. Live geopolitical analysis unavailable.`,
//           priceOutlook: fallbackOutlook,
//           predictedRangeLow: Math.round((latest ?? 127) - 8),
//           predictedRangeHigh: Math.round((latest ?? 127) + 12),
//           recommendation: fallbackRec,
//           recommendationReason: fallbackOutlook === 'rising'
//             ? `Prices have risen ${trend4w}¢/L over the past 4 weeks — consider filling up soon.`
//             : fallbackOutlook === 'falling'
//               ? `Prices have dropped ${Math.abs(trend4w)}¢/L recently — you may save by waiting.`
//               : `Prices are relatively stable around ${avg12}¢/L. Fill up when convenient.`,
//           confidence: 'low',
//           fallback: true,
//           lastUpdated: new Date().toISOString().split('T')[0],
//         });
//       }

//       const { content, stop_reason } = data;
//       console.log(`  stop_reason: ${stop_reason} | blocks: [${content.map(b => b.type).join(', ')}]`);

//       const text = content.filter(b => b.type === 'text').map(b => b.text).join('');
//       if (text) finalText = text;

//       if (stop_reason === 'end_turn') break;

//       if (stop_reason === 'tool_use') {
//         messages.push({ role: 'assistant', content });

//         const resultBlocks = content.filter(b =>
//           b.type === 'web_search_tool_result' || b.type === 'tool_result'
//         );

//         if (resultBlocks.length > 0) {
//           messages.push({ role: 'user', content: resultBlocks });
//         } else {
//           messages.push({ role: 'user', content: [{ type: 'text', text: 'Please continue with your analysis.' }] });
//         }
//         continue;
//       }

//       break;
//     }

//     console.log(`Claude done in ${turns} turn(s)`);
//     console.log('Raw text (first 300):', finalText.slice(0, 300));

//     if (!finalText) throw new Error('Claude returned no text after agentic loop');

//     const clean = finalText.replace(/```json|```/g, '').trim();
//     const intelligence = JSON.parse(clean);

//     console.log(`Outlook:${intelligence.priceOutlook} | Rec:${intelligence.recommendation} | Confidence:${intelligence.confidence}`);
//     console.log('==========================================\n');

//     intelCache = intelligence;
//     intelCacheTime = Date.now();
//     res.json(intelligence);
//   } catch (err) {
//     console.error('Market intelligence error:', JSON.stringify(err.response?.data) || err.message);
//     console.error('Status:', err.response?.status);
//     console.error('Stack:', err.stack?.split('\n').slice(0, 4).join('\n'));
//     res.status(500).json({ error: 'Market intelligence unavailable', fallback: true, message: err.message });
//   }
// });


// // ---------------------------------------------------------------------------
// // POST /api/routes/compare
// //
// // Carbon Cost Navigator — compares driving vs cycling for a given route.
// // Uses real bike segment safety data, intersection collision reports,
// // live gas prices, and Canada's carbon tax rate.
// //
// // Request body: { origin, destination, fuelEfficiencyLpkm? }
// // ---------------------------------------------------------------------------
// router.post('/compare', async (req, res) => {
//   const { origin, destination, fuelEfficiencyLpkm = 10 } = req.body;

//   if (!origin || !destination) {
//     return res.status(400).json({ error: 'origin and destination are required' });
//   }

//   console.log('\n========== CARBON COST NAVIGATOR ==========');
//   console.log(`Route: ${origin} → ${destination}`);

//   try {
//     const BikeSegment = require('../models/BikeSegment');
//     const Intersection = require('../models/Intersection');

//     // Canada carbon tax: ~$80/tonne CO2 in 2026 = $0.08/kg
//     const CARBON_TAX_PER_KG = 0.08;
//     // Average car emits ~0.233 kg CO2 per km (Natural Resources Canada)
//     const CO2_KG_PER_KM = 0.233;
//     // Average cycling speed km/h
//     const CYCLING_SPEED_KMH = 18;
//     // Bounding box padding in degrees for spatial queries
//     const BBOX_PAD = 0.01; // ~1km corridor each side

//     // 1. Fetch driving route
//     const drivingRaw = await fetchRoute(origin, destination, { travelMode: 'DRIVE' });
//     const driving = parseRoute(drivingRaw);
//     const polyPoints = decodePolylineWithDistance(drivingRaw.polyline?.encodedPolyline || '');

//     // 2. Get live gas price
//     const prices = await fetchOntarioPrices();
//     const gasPriceCpl = prices.toronto / 100; // convert ¢ to $

//     // 3. Compute driving costs
//     const fuelLitres = driving.distance / fuelEfficiencyLpkm;
//     const fuelCostCAD = parseFloat((fuelLitres * gasPriceCpl).toFixed(2));
//     const carbonKgDriving = parseFloat((driving.distance * CO2_KG_PER_KM).toFixed(2));
//     const carbonTaxCAD = parseFloat((carbonKgDriving * CARBON_TAX_PER_KG).toFixed(2));
//     const totalDrivingCost = parseFloat((fuelCostCAD + carbonTaxCAD).toFixed(2));

//     console.log(`Driving: ${driving.distance}km | fuel $${fuelCostCAD} | carbon ${carbonKgDriving}kg ($${carbonTaxCAD}) | total $${totalDrivingCost}`);

//     // 4. Build bounding box from polyline for spatial queries
//     const lats = polyPoints.map(p => p.lat);
//     const lngs = polyPoints.map(p => p.lng);
//     const minLat = Math.min(...lats) - BBOX_PAD;
//     const maxLat = Math.max(...lats) + BBOX_PAD;
//     const minLng = Math.min(...lngs) - BBOX_PAD;
//     const maxLng = Math.max(...lngs) + BBOX_PAD;

//     // 5. Fetch all segments + intersections, filter in JS
//     // (3893 docs is fine — avoids complex MongoDB nested array geo queries)
//     const [allSegments, allIntersections] = await Promise.all([
//       BikeSegment.find().select('name safetyScore hasLane accidentCount geometry').lean(),
//       Intersection.find().lean(),
//     ]);

//     const nearbySegments = allSegments.filter(seg => {
//       if (!seg.geometry?.coordinates?.length) return false;
//       return seg.geometry.coordinates.some(([lng, lat]) =>
//         lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
//       );
//     });

//     const intersections = allIntersections.filter(i => {
//       const [lng, lat] = i.location?.coordinates || [];
//       return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
//     });

//     const dangerousIntersections = intersections.filter(i => i.severity >= 3).length;
//     console.log(`Bike segments in corridor: ${nearbySegments.length} / ${allSegments.length}`);
//     console.log(`Intersections in corridor: ${intersections.length} (${dangerousIntersections} dangerous)`);

//     // 6. Compute cycling safety metrics
//     const avgSafetyScore = nearbySegments.length > 0
//       ? parseFloat((nearbySegments.reduce((s, seg) => s + (seg.safetyScore || 0), 0) / nearbySegments.length).toFixed(1))
//       : 50;

//     const segmentsWithLane = nearbySegments.filter(s => s.hasLane).length;
//     const safeLanePercent = nearbySegments.length > 0
//       ? Math.round((segmentsWithLane / nearbySegments.length) * 100)
//       : 0;

//     const totalAccidents = nearbySegments.reduce((s, seg) => s + (seg.accidentCount || 0), 0);

//     // 8. Cycling time estimate — slightly longer distance due to different routing
//     const cyclingDistanceKm = driving.distance * 0.92; // cyclists take slightly shorter paths
//     const cyclingDurationMin = Math.round((cyclingDistanceKm / CYCLING_SPEED_KMH) * 60);
//     const timeDiffMin = cyclingDurationMin - driving.duration;

//     // 9. Safety rating for cycling (0-100)
//     // Penalize for low safety score, dangerous intersections, no lanes
//     // Normalize intersection penalty by route distance so long routes aren't unfairly penalized
//     const intersectionDensity = driving.distance > 0 ? dangerousIntersections / driving.distance : 0;
//     const safetyScore = Math.max(0, Math.min(100,
//       avgSafetyScore
//       - (intersectionDensity * 10)   // per km density penalty
//       - (totalAccidents * 1.5)
//       + (safeLanePercent * 0.3)
//     ));

//     // 10. Recommendation logic
//     let recommendation, recommendationReason;
//     const shortEnoughToCycle = cyclingDistanceKm <= 20;
//     const safeEnoughToCycle = safetyScore >= 45;
//     const fasterOrSimilar = timeDiffMin <= 10; // cycling within 10 min of driving

//     if (shortEnoughToCycle && safeEnoughToCycle && fasterOrSimilar) {
//       recommendation = 'cycling';
//       const timeMsg = timeDiffMin < 0
//         ? `${Math.abs(timeDiffMin)} minutes FASTER than driving`
//         : timeDiffMin === 0 ? 'same time as driving' : `only ${timeDiffMin} min slower than driving`;
//       recommendationReason = `Cycling is ${timeMsg}. The corridor has ${safeLanePercent}% protected lanes, a safety score of ${safetyScore.toFixed(0)}/100, and saves $${totalDrivingCost} + ${carbonKgDriving}kg CO₂.`;
//     } else if (!shortEnoughToCycle) {
//       recommendation = 'driving';
//       recommendationReason = `At ${cyclingDistanceKm.toFixed(1)}km this route is too long to cycle comfortably. Driving costs $${totalDrivingCost} and emits ${carbonKgDriving}kg CO₂ ($${carbonTaxCAD} carbon tax).`;
//     } else if (!safeEnoughToCycle) {
//       recommendation = 'driving';
//       recommendationReason = `Cycling safety score is ${safetyScore.toFixed(0)}/100 with ${dangerousIntersections} dangerous intersections in this corridor. Driving is the safer choice.`;
//     } else {
//       recommendation = 'driving';
//       recommendationReason = `Cycling would take ${timeDiffMin} min longer. Driving costs $${totalDrivingCost} and emits ${carbonKgDriving}kg CO₂ ($${carbonTaxCAD} carbon tax).`;
//     }

//     console.log(`Cycling: ${cyclingDistanceKm.toFixed(1)}km | ${cyclingDurationMin}min | safety:${safetyScore.toFixed(0)} | rec:${recommendation}`);
//     console.log('============================================\n');

//     res.json({
//       origin,
//       destination,
//       driving: {
//         distanceKm: driving.distance,
//         durationMin: driving.duration,
//         fuelLitres: parseFloat(fuelLitres.toFixed(2)),
//         fuelCostCAD,
//         carbonKg: carbonKgDriving,
//         carbonTaxCAD,
//         totalCostCAD: totalDrivingCost,
//         dangerousIntersections,
//         gasPriceCentsPerL: prices.toronto,
//       },
//       cycling: {
//         distanceKm: parseFloat(cyclingDistanceKm.toFixed(1)),
//         durationMin: cyclingDurationMin,
//         timeDiffMin,
//         avgSafetyScore,
//         safeLanePercent,
//         accidentsOnRoute: totalAccidents,
//         nearbySegments: nearbySegments.length,
//         safetyScore: parseFloat(safetyScore.toFixed(1)),
//         totalCostCAD: 0,
//         carbonKg: 0,
//       },
//       comparison: {
//         costSavedCAD: totalDrivingCost,
//         carbonSavedKg: carbonKgDriving,
//         carbonTaxSavedCAD: carbonTaxCAD,
//         timeCostMin: timeDiffMin,
//       },
//       recommendation,
//       recommendationReason,
//     });
//   } catch (err) {
//     console.error('Compare error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
const router = require('express').Router();
const axios = require('axios');
const { decode } = require('@googlemaps/polyline-codec');

const ROUTES_API = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const GAS_PRICES = { regular: 1.65, premium: 1.85, diesel: 1.72 };
const FIELD_MASK = [
  'routes.duration',
  'routes.distanceMeters',
  'routes.description',
  'routes.polyline.encodedPolyline',
].join(',');

const VALID_MODES = ['DRIVE', 'BICYCLE', 'WALK'];

const ONTARIO_CSV_URL = 'https://ontario.ca/v1/files/fuel-prices/canadianpumppricesall.csv';

const FALLBACK_PRICES = {
  toronto: 172,
  ottawa: 165,
  kingston: 168,
  oshawa: 170,
  montreal: 163,
};

const CITY_COORDS = {
  toronto: { lat: 43.6532, lng: -79.3832 },
  ottawa: { lat: 45.4215, lng: -75.6972 },
  kingston: { lat: 44.2312, lng: -76.4860 },
  oshawa: { lat: 43.8971, lng: -78.8658 },
  montreal: { lat: 45.5017, lng: -73.5673 },
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Ontario Open Data CSV price fetcher
// Data row layout (15 cols — quoted cities with commas are NOT split in data):
//   0:Date  1:Toronto  2:Ottawa  3:Thunder Bay  4:St.John's/NL  5:Charlottetown
//   6:Halifax  7:Saint John/NB  8:Montreal  9:Winnipeg  10:Regina  11:Calgary
//   12:Vancouver  13:Tax Status  14:Situation fiscale
// ---------------------------------------------------------------------------
const CSV_COL = { date: 0, toronto: 1, ottawa: 2, montreal: 8, taxStatus: 13 };

let priceCache = null;
let priceCacheTime = 0;
let intelCache = null;
let intelCacheTime = 0;
const INTEL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

async function fetchOntarioPrices() {
  const now = Date.now();
  if (priceCache && (now - priceCacheTime) < CACHE_TTL_MS) {
    console.log('  Gas prices: using cached data');
    return priceCache;
  }

  try {
    console.log('  Gas prices: fetching Ontario Open Data CSV...');
    const { data: csv } = await axios.get(ONTARIO_CSV_URL, { timeout: 10000 });
    const lines = csv.trim().split(/\r?\n/);
    let latestPrices = null;

    for (let i = lines.length - 1; i >= 1; i--) {
      const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
      if (cols[CSV_COL.taxStatus]?.toLowerCase() !== 'total') continue;

      const toronto = parseFloat(cols[CSV_COL.toronto]);
      const ottawa = parseFloat(cols[CSV_COL.ottawa]);
      const montreal = parseFloat(cols[CSV_COL.montreal]);
      const date = cols[CSV_COL.date];

      if (isNaN(toronto) || isNaN(ottawa)) continue;

      latestPrices = {
        toronto,
        ottawa,
        montreal: isNaN(montreal) ? Math.round((toronto + ottawa) / 2) : montreal,
        kingston: Math.round((toronto + ottawa) / 2),
        oshawa: Math.round((toronto * 2 + ottawa) / 3),
      };

      console.log(`  Gas prices: loaded for ${date} → Toronto:${toronto} Ottawa:${ottawa} Montreal:${latestPrices.montreal} Kingston:${latestPrices.kingston} Oshawa:${latestPrices.oshawa} ¢/L`);
      break;
    }

    if (!latestPrices) throw new Error('No valid Total row found in CSV');
    priceCache = latestPrices;
    priceCacheTime = now;
    return latestPrices;
  } catch (err) {
    console.warn(`  Gas prices: CSV failed (${err.message}) — using hardcoded fallback`);
    return FALLBACK_PRICES;
  }
}

// ---------------------------------------------------------------------------
// Parse ALL historical Total rows from CSV for trend analysis
// Returns array of { date, toronto, ottawa, montreal } sorted oldest → newest
// ---------------------------------------------------------------------------
async function fetchOntarioPriceHistory() {
  try {
    const { data: csv } = await axios.get(ONTARIO_CSV_URL, { timeout: 10000 });
    const lines = csv.trim().split(/\r?\n/);
    const history = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
      if (cols[CSV_COL.taxStatus]?.toLowerCase() !== 'total') continue;

      const toronto = parseFloat(cols[CSV_COL.toronto]);
      const ottawa = parseFloat(cols[CSV_COL.ottawa]);
      const montreal = parseFloat(cols[CSV_COL.montreal]);
      const date = cols[CSV_COL.date];

      if (isNaN(toronto) || isNaN(ottawa) || !date) continue;
      history.push({ date, toronto, ottawa, montreal: isNaN(montreal) ? null : montreal });
    }

    return history; // already chronological in CSV
  } catch (err) {
    console.warn(`  Price history fetch failed: ${err.message}`);
    return [];
  }
}

function estimatePrice(lat, lng, prices) {
  let closest = null;
  let minDist = Infinity;
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const d = Math.sqrt((lat - coords.lat) ** 2 + (lng - coords.lng) ** 2);
    if (d < minDist) { minDist = d; closest = city; }
  }
  return prices[closest] ?? 168;
}

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

function buildWaypoint(input) {
  if (typeof input === 'string') return { address: input };
  if (Array.isArray(input) && input.length === 2) {
    return { location: { latLng: { latitude: input[1], longitude: input[0] } } };
  }
  if (input && input.lat != null && input.lng != null) {
    return { location: { latLng: { latitude: input.lat, longitude: input.lng } } };
  }
  throw new Error('Invalid waypoint format');
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

// ---------------------------------------------------------------------------
// Gas stop helpers
// ---------------------------------------------------------------------------

function decodePolylineWithDistance(encodedPolyline) {
  const points = decode(encodedPolyline);
  if (points.length === 0) return [];

  const result = [{ lat: points[0][0], lng: points[0][1], distFromStart: 0 }];
  for (let i = 1; i < points.length; i++) {
    const [lat1, lng1] = points[i - 1];
    const [lat2, lng2] = points[i];
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    const segKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    result.push({ lat: lat2, lng: lng2, distFromStart: result[i - 1].distFromStart + segKm });
  }
  return result;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearbyGasStations(lat, lng) {
  for (const radiusM of [5000, 10000, 15000]) {
    const query = `[out:json];node["amenity"="fuel"](around:${radiusM},${lat},${lng});out;`;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const url = `${endpoint}?data=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { timeout: 15000 });

        if (!data.elements || data.elements.length === 0) break;

        const host = endpoint.split('/')[2];
        console.log(`  Overpass [${host}]: ${data.elements.length} stations at ${radiusM / 1000}km for (${lat.toFixed(4)}, ${lng.toFixed(4)})`);

        return data.elements.map((el) => ({
          id: el.id,
          lat: el.lat,
          lng: el.lon,
          name: el.tags?.name || el.tags?.brand || 'Gas Station',
          brand: el.tags?.brand || null,
          address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']]
            .filter(Boolean).join(' '),
        }));
      } catch (err) {
        const host = endpoint.split('/')[2];
        if (err.response?.status === 429) {
          console.warn(`  Overpass 429 on ${host} — trying next mirror`);
          await sleep(500);
        } else {
          console.warn(`  Overpass skipping ${host}: ${err.response?.status || err.message}`);
        }
      }
    }

    console.warn(`  Overpass: 0 results at ${radiusM / 1000}km — trying wider radius`);
    await sleep(1000);
  }

  return [];
}

function planStopZones(polylinePoints, tankKm, currentFuelPercent, safetyBufferPercent = 15) {
  const safetyKm = (safetyBufferPercent / 100) * tankKm;
  const MIN_STOP_DIST_KM = 20;
  const stopZones = [];

  let fuelKmRemaining = (currentFuelPercent / 100) * tankKm;
  let lastStopDist = 0;
  let prevDist = 0;

  for (const pt of polylinePoints) {
    const distTravelled = pt.distFromStart - prevDist;
    fuelKmRemaining -= distTravelled;
    prevDist = pt.distFromStart;

    const distSinceLastStop = pt.distFromStart - lastStopDist;

    if (fuelKmRemaining <= safetyKm && distSinceLastStop >= MIN_STOP_DIST_KM) {
      stopZones.push({ distFromStart: pt.distFromStart, lat: pt.lat, lng: pt.lng });
      fuelKmRemaining = tankKm;
      lastStopDist = pt.distFromStart;
    }
  }

  return stopZones;
}

// ---------------------------------------------------------------------------
// POST /api/routes/navigate
// ---------------------------------------------------------------------------
router.post('/navigate', async (req, res) => {
  try {
    const { origin, destination, travelMode = 'DRIVE' } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination are required' });
    }
    const mode = VALID_MODES.includes(travelMode.toUpperCase()) ? travelMode.toUpperCase() : 'DRIVE';
    const raw = await fetchRoute(origin, destination, { travelMode: mode });
    const route = parseRoute(raw);
    route.travelMode = mode;
    res.json(route);
  } catch (err) {
    console.error('Navigate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/routes/plan
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// POST /api/routes/gas-stops — Tesla-style trip planner
// ---------------------------------------------------------------------------
router.post('/gas-stops', async (req, res) => {
  try {
    const { origin, destination, tankKm = 500, currentFuelPercent = 100 } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination are required' });
    }

    const raw = await fetchRoute(origin, destination, { travelMode: 'DRIVE' });
    const { distance, polyline } = parseRoute(raw);
    const polylinePoints = decodePolylineWithDistance(polyline);
    const routeTotalKm = polylinePoints[polylinePoints.length - 1].distFromStart;

    console.log('\n========== GAS STOP PLANNER ==========');
    console.log(`Route:          ${origin}  →  ${destination}`);
    console.log(`Route distance: ${Math.round(routeTotalKm)} km  (${polylinePoints.length} polyline points)`);
    console.log(`Tank:           ${tankKm} km total range`);
    console.log(`Current fuel:   ${currentFuelPercent}%  =  ${Math.round((currentFuelPercent / 100) * tankKm)} km`);
    console.log(`Safety buffer:  15%  =  ${Math.round(0.15 * tankKm)} km`);

    const stopZones = planStopZones(polylinePoints, tankKm, currentFuelPercent);
    const lowFuelWarning = stopZones.length > 0 && stopZones[0].distFromStart <= 25;

    console.log(`\nStop zones:     ${stopZones.length}${lowFuelWarning ? '  ⚠️  low fuel at departure' : ''}`);
    stopZones.forEach((z, i) => {
      console.log(`  Zone ${i + 1}: ${Math.round(z.distFromStart)} km  (${z.lat.toFixed(4)}, ${z.lng.toFixed(4)})`);
    });

    if (stopZones.length === 0) {
      console.log('\nResult: no stops needed');
      console.log('=======================================\n');
      return res.json({
        routeDistanceKm: Math.round(routeTotalKm * 10) / 10,
        stopsNeeded: 0,
        canCompleteWithoutStop: true,
        lowFuelWarning: false,
        currentRangeKm: Math.round((currentFuelPercent / 100) * tankKm),
        plannedStops: [],
      });
    }

    console.log('\nFetching prices...');
    const prices = await fetchOntarioPrices();

    console.log('\nFetching stations (sequential to avoid rate limits)...');
    const stationResultsPerZone = [];
    for (let i = 0; i < stopZones.length; i++) {
      if (i > 0) await sleep(1500);
      stationResultsPerZone.push(await fetchNearbyGasStations(stopZones[i].lat, stopZones[i].lng));
    }

    console.log('\nCity prices:');
    for (const [city, price] of Object.entries(prices)) {
      console.log(`  ${city}: ${price}¢/L`);
    }

    console.log('\nStations per zone:');
    stationResultsPerZone.forEach((stations, i) => {
      console.log(`  Zone ${i + 1}: ${stations.length} stations`);
      stations.slice(0, 5).forEach(s => console.log(`    - ${s.name}${s.address ? '  |  ' + s.address : ''}`));
      if (stations.length > 5) console.log(`    ... +${stations.length - 5} more`);
    });

    const plannedStops = [];
    let fuelKmRemaining = (currentFuelPercent / 100) * tankKm;
    let prevDist = 0;

    for (let i = 0; i < stopZones.length; i++) {
      const zone = stopZones[i];
      const stations = stationResultsPerZone[i];

      const stationsWithPrice = stations
        .map(s => ({
          ...s,
          estimatedPriceCentsPerL: estimatePrice(s.lat, s.lng, prices),
          detourKm: Math.round(haversineKm(zone.lat, zone.lng, s.lat, s.lng) * 10) / 10,
        }))
        .sort((a, b) => a.estimatedPriceCentsPerL - b.estimatedPriceCentsPerL);

      fuelKmRemaining -= (zone.distFromStart - prevDist);
      const fuelPercentOnArrival = Math.max(0, Math.round((fuelKmRemaining / tankKm) * 100));
      const best = stationsWithPrice[0] || null;

      console.log(`\nStop ${i + 1}: at ${Math.round(zone.distFromStart)} km — arriving with ${fuelPercentOnArrival}% fuel`);
      console.log(`  Best: ${best ? `${best.name} @ ${best.estimatedPriceCentsPerL}¢/L (+${best.detourKm} km detour)` : 'none found'}`);

      plannedStops.push({
        stopNumber: i + 1,
        distFromStartKm: Math.round(zone.distFromStart * 10) / 10,
        fuelPercentOnArrival,
        recommendedStation: best,
        nearbyAlternatives: stationsWithPrice.slice(1, 4),
        lat: zone.lat,
        lng: zone.lng,
      });

      fuelKmRemaining = tankKm;
      prevDist = zone.distFromStart;
    }

    const fuelPercentAtDestination = Math.max(
      0,
      Math.round(((fuelKmRemaining - (routeTotalKm - prevDist)) / tankKm) * 100)
    );

    console.log(`\nArriving at destination: ~${fuelPercentAtDestination}% fuel`);
    console.log('=======================================\n');

    res.json({
      routeDistanceKm: Math.round(routeTotalKm * 10) / 10,
      stopsNeeded: plannedStops.length,
      canCompleteWithoutStop: false,
      lowFuelWarning,
      currentRangeKm: Math.round((currentFuelPercent / 100) * tankKm),
      fuelPercentAtDestination,
      plannedStops,
    });
  } catch (err) {
    console.error('Gas stops error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// POST /api/routes/market-intelligence
// Uses Claude with web_search (agentic loop) to analyze geopolitical/economic
// events affecting oil prices, combined with historical CSV trend data.
// Request body: { city?: string }
// ---------------------------------------------------------------------------
router.post('/market-intelligence', async (req, res) => {
  const { city = 'Ontario' } = req.body;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  console.log('\n========== MARKET INTELLIGENCE ==========');
  console.log(`Region: ${city}`);

  // Return cached result if fresh
  if (intelCache && (Date.now() - intelCacheTime) < INTEL_CACHE_TTL_MS) {
    console.log('Returning cached intel (age:', Math.round((Date.now() - intelCacheTime) / 1000), 's)');
    console.log('==========================================\n');
    return res.json(intelCache);
  }

  try {
    // 1. Historical price trend analysis from CSV
    console.log('Fetching price history...');
    const history = await fetchOntarioPriceHistory();
    const recent = history.slice(-12);
    const torontoRecent = recent.map(r => r.toronto).filter(Boolean);
    const avg12 = (torontoRecent.reduce((a, b) => a + b, 0) / torontoRecent.length).toFixed(1);
    const latest = torontoRecent[torontoRecent.length - 1];
    const fourWeeksAgo = torontoRecent[torontoRecent.length - 4] ?? torontoRecent[0];
    const trend4w = (latest - fourWeeksAgo).toFixed(1);
    const trendDirection = trend4w > 0 ? 'rising' : trend4w < 0 ? 'falling' : 'flat';
    const recentSummary = recent.slice(-6).map(r =>
      `${r.date}: Toronto ${r.toronto}c/L, Ottawa ${r.ottawa}c/L`
    ).join('\n');

    console.log(`Stats - latest:${latest}c | avg:${avg12}c | trend:${trend4w > 0 ? '+' : ''}${trend4w}c (${trendDirection})`);

    // 2. Agentic Claude loop with web search
    console.log('Starting Claude agentic loop...');

    const prompt = `You are a fuel price analyst for Canadian drivers. Analyze current world events and their impact on gasoline prices in ${city}, Canada.

Recent Ontario pump price data (cents per litre, taxes included):
${recentSummary}

Current price: ${latest}c/L | 12-month average: ${avg12}c/L | 4-week trend: ${trend4w > 0 ? '+' : ''}${trend4w}c/L (${trendDirection})

Search the web for the latest news (last 7 days) on:
1. Geopolitical events affecting oil supply (Middle East, OPEC, sanctions, conflicts)
2. Crude oil price movements and supply/demand shifts
3. Canada-specific fuel price news

Return ONLY a JSON object, no markdown fences, no preamble:
{
  "currentPriceCents": ${latest},
  "avgPriceCents": ${avg12},
  "trendCentsPerMonth": ${trend4w},
  "trendDirection": "${trendDirection}",
  "geopoliticalEvents": [{"event": "string", "impact": "string", "severity": "low|medium|high"}],
  "oilMarketSummary": "2-3 sentence summary",
  "priceOutlook": "rising|falling|stable",
  "predictedRangeLow": 0,
  "predictedRangeHigh": 0,
  "recommendation": "fill_now|wait|neutral",
  "recommendationReason": "1-2 sentence plain English for a driver",
  "confidence": "low|medium|high",
  "lastUpdated": "${new Date().toISOString().split('T')[0]}"
}`;

    const messages = [{ role: 'user', content: prompt }];
    const tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    const headers = {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    };

    let finalText = '';
    let turns = 0;

    while (turns < 8) {
      turns++;
      console.log(`  Turn ${turns}...`);

      let data;
      try {
        const resp = await axios.post(
          'https://api.anthropic.com/v1/messages',
          { model: 'claude-sonnet-4-5', max_tokens: 1500, tools, messages },
          { headers, timeout: 60000 }
        );
        data = resp.data;
      } catch (apiErr) {
        // Network unreachable — build a stat-only fallback response
        console.warn('  Claude API unreachable:', apiErr.code || apiErr.message);
        const fallbackOutlook = parseFloat(trend4w) > 2 ? 'rising' : parseFloat(trend4w) < -2 ? 'falling' : 'stable';
        const fallbackRec = fallbackOutlook === 'rising' ? 'fill_now' : fallbackOutlook === 'falling' ? 'wait' : 'neutral';
        return res.json({
          currentPriceCents: latest ?? 127,
          avgPriceCents: parseFloat(avg12) || 130,
          trendCentsPerMonth: parseFloat(trend4w) || 0,
          trendDirection,
          geopoliticalEvents: [],
          oilMarketSummary: `Based on Ontario pump price data: current price ${latest ?? 127}¢/L, 12-month avg ${avg12}¢/L. Live geopolitical analysis unavailable.`,
          priceOutlook: fallbackOutlook,
          predictedRangeLow: Math.round((latest ?? 127) - 8),
          predictedRangeHigh: Math.round((latest ?? 127) + 12),
          recommendation: fallbackRec,
          recommendationReason: fallbackOutlook === 'rising'
            ? `Prices have risen ${trend4w}¢/L over the past 4 weeks — consider filling up soon.`
            : fallbackOutlook === 'falling'
              ? `Prices have dropped ${Math.abs(trend4w)}¢/L recently — you may save by waiting.`
              : `Prices are relatively stable around ${avg12}¢/L. Fill up when convenient.`,
          confidence: 'low',
          fallback: true,
          lastUpdated: new Date().toISOString().split('T')[0],
        });
      }

      const { content, stop_reason } = data;
      console.log(`  stop_reason: ${stop_reason} | blocks: [${content.map(b => b.type).join(', ')}]`);

      const text = content.filter(b => b.type === 'text').map(b => b.text).join('');
      if (text) finalText = text;

      if (stop_reason === 'end_turn') break;

      if (stop_reason === 'tool_use') {
        messages.push({ role: 'assistant', content });

        const resultBlocks = content.filter(b =>
          b.type === 'web_search_tool_result' || b.type === 'tool_result'
        );

        if (resultBlocks.length > 0) {
          messages.push({ role: 'user', content: resultBlocks });
        } else {
          messages.push({ role: 'user', content: [{ type: 'text', text: 'Please continue with your analysis.' }] });
        }
        continue;
      }

      break;
    }

    console.log(`Claude done in ${turns} turn(s)`);
    console.log('Raw text (first 300):', finalText.slice(0, 300));

    if (!finalText) throw new Error('Claude returned no text after agentic loop');

    // Strip any markdown fences Claude adds despite instructions
    let clean = finalText.trim();
    // Remove opening fence (```json or ```)
    clean = clean.replace(/^```(?:json)?\s*/i, '');
    // Remove closing fence
    clean = clean.replace(/\s*```\s*$/i, '');
    clean = clean.trim();
    console.log('Cleaned JSON (first 50):', clean.slice(0, 50));
    const intelligence = JSON.parse(clean);

    console.log(`Outlook:${intelligence.priceOutlook} | Rec:${intelligence.recommendation} | Confidence:${intelligence.confidence}`);
    console.log('==========================================\n');

    intelCache = intelligence;
    intelCacheTime = Date.now();
    res.json(intelligence);
  } catch (err) {
    console.error('Market intelligence error:', JSON.stringify(err.response?.data) || err.message);
    console.error('Status:', err.response?.status);
    console.error('Stack:', err.stack?.split('\n').slice(0, 4).join('\n'));
    res.status(500).json({ error: 'Market intelligence unavailable', fallback: true, message: err.message });
  }
});



// ---------------------------------------------------------------------------
// POST /api/routes/price-forecast
// Statistical price forecasting using 8 years of Ontario CSV data.
// ---------------------------------------------------------------------------
router.post('/price-forecast', async (req, res) => {
  const { city = 'toronto' } = req.body;
  try {
    console.log('\n========== PRICE FORECAST ==========');
    const history = await fetchOntarioPriceHistory();
    if (history.length === 0) return res.status(500).json({ error: 'No historical price data available' });

    const col = ['toronto', 'ottawa', 'montreal'].includes(city.toLowerCase()) ? city.toLowerCase() : 'toronto';
    const series = history.map(r => ({ date: r.date, price: r[col] })).filter(r => r.price != null && !isNaN(r.price));

    const buckets = {};
    for (const { date, price } of series) {
      const m = parseInt(date.split('-')[1], 10);
      if (!buckets[m]) buckets[m] = [];
      buckets[m].push(price);
    }
    const NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const seasonalTable = NAMES.map((name, i) => {
      const b = buckets[i + 1] || [];
      return { month: name, avgPrice: b.length > 0 ? parseFloat((b.reduce((a, x) => a + x, 0) / b.length).toFixed(1)) : null, dataPoints: b.length };
    });
    const valid = seasonalTable.filter(m => m.avgPrice != null);
    const annualAvg = parseFloat((valid.reduce((s, m) => s + m.avgPrice, 0) / valid.length).toFixed(1));
    const curMonthAvg = seasonalTable[new Date().getMonth()]?.avgPrice ?? annualAvg;
    const seasonalDelta = parseFloat((curMonthAvg - annualAvg).toFixed(1));

    const last8 = series.slice(-8); const n = last8.length;
    const xM = (n - 1) / 2; const yM = last8.reduce((s, r) => s + r.price, 0) / n;
    let num = 0, den = 0;
    last8.forEach((r, i) => { num += (i - xM) * (r.price - yM); den += (i - xM) ** 2; });
    const regressionDelta = parseFloat(((den ? num / den : 0) * 4).toFixed(1));

    const last12 = series.slice(-12).map(r => r.price);
    const m12 = last12.reduce((a, b) => a + b, 0) / last12.length;
    const stdDev = parseFloat(Math.sqrt(last12.reduce((s, p) => s + (p - m12) ** 2, 0) / last12.length).toFixed(1));

    const latest = series[series.length - 1].price;
    const combinedDelta = parseFloat((seasonalDelta + regressionDelta).toFixed(1));
    const cheapest = valid.reduce((a, b) => a.avgPrice < b.avgPrice ? a : b);
    const priciest = valid.reduce((a, b) => a.avgPrice > b.avgPrice ? a : b);

    console.log(`Latest:${latest}c | seasonal:${seasonalDelta}c | regression:${regressionDelta}c | stdDev:${stdDev}c`);
    console.log('=====================================\n');

    res.json({
      city: col, dataPointsUsed: series.length,
      dataFrom: series[0].date, dataTo: series[series.length - 1].date,
      currentPrice: latest,
      forecast: {
        seasonalDeltaCents: seasonalDelta, regressionDeltaCents: regressionDelta,
        combinedDeltaCents: combinedDelta,
        projectedRangeLow: Math.round(latest + combinedDelta - stdDev),
        projectedRangeHigh: Math.round(latest + combinedDelta + stdDev),
      },
      volatility: { stdDevCents: stdDev, level: stdDev > 15 ? 'high' : stdDev > 8 ? 'medium' : 'low' },
      seasonal: {
        annualAvgCents: annualAvg, currentMonthAvgCents: curMonthAvg,
        cheapestMonth: cheapest.month, cheapestMonthAvg: cheapest.avgPrice,
        mostExpensiveMonth: priciest.month, mostExpensiveMonthAvg: priciest.avgPrice,
        table: seasonalTable,
      },
      recommendation: combinedDelta > 5 ? 'fill_now' : combinedDelta < -5 ? 'wait' : 'neutral',
    });
  } catch (err) {
    console.error('Price forecast error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/routes/compare
//
// Carbon Cost Navigator — compares driving vs cycling for a given route.
// Uses real bike segment safety data, intersection collision reports,
// live gas prices, and Canada's carbon tax rate.
//
// Request body: { origin, destination, fuelEfficiencyLpkm? }
// ---------------------------------------------------------------------------
router.post('/compare', async (req, res) => {
  const { origin, destination, fuelEfficiencyLpkm = 10 } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }

  console.log('\n========== CARBON COST NAVIGATOR ==========');
  console.log(`Route: ${origin} → ${destination}`);

  try {
    const BikeSegment = require('../models/BikeSegment');
    const Intersection = require('../models/Intersection');

    // Canada carbon tax: ~$80/tonne CO2 in 2026 = $0.08/kg
    const CARBON_TAX_PER_KG = 0.08;
    // Average car emits ~0.233 kg CO2 per km (Natural Resources Canada)
    const CO2_KG_PER_KM = 0.233;
    // Average cycling speed km/h
    const CYCLING_SPEED_KMH = 18;
    // Bounding box padding in degrees for spatial queries
    const BBOX_PAD = 0.01; // ~1km corridor each side

    // 1. Fetch driving route
    const drivingRaw = await fetchRoute(origin, destination, { travelMode: 'DRIVE' });
    const driving = parseRoute(drivingRaw);
    const polyPoints = decodePolylineWithDistance(drivingRaw.polyline?.encodedPolyline || '');

    // 2. Get live gas price
    const prices = await fetchOntarioPrices();
    const gasPriceCpl = prices.toronto / 100; // convert ¢ to $

    // 3. Compute driving costs
    const fuelLitres = driving.distance / fuelEfficiencyLpkm;
    const fuelCostCAD = parseFloat((fuelLitres * gasPriceCpl).toFixed(2));
    const carbonKgDriving = parseFloat((driving.distance * CO2_KG_PER_KM).toFixed(2));
    const carbonTaxCAD = parseFloat((carbonKgDriving * CARBON_TAX_PER_KG).toFixed(2));
    const totalDrivingCost = parseFloat((fuelCostCAD + carbonTaxCAD).toFixed(2));

    console.log(`Driving: ${driving.distance}km | fuel $${fuelCostCAD} | carbon ${carbonKgDriving}kg ($${carbonTaxCAD}) | total $${totalDrivingCost}`);

    // 4. Build bounding box from polyline for spatial queries
    const lats = polyPoints.map(p => p.lat);
    const lngs = polyPoints.map(p => p.lng);
    const minLat = Math.min(...lats) - BBOX_PAD;
    const maxLat = Math.max(...lats) + BBOX_PAD;
    const minLng = Math.min(...lngs) - BBOX_PAD;
    const maxLng = Math.max(...lngs) + BBOX_PAD;

    // 5. Fetch all segments + intersections, filter in JS
    // (3893 docs is fine — avoids complex MongoDB nested array geo queries)
    const [allSegments, allIntersections] = await Promise.all([
      BikeSegment.find().select('name safetyScore hasLane accidentCount geometry').lean(),
      Intersection.find().lean(),
    ]);

    const nearbySegments = allSegments.filter(seg => {
      if (!seg.geometry?.coordinates?.length) return false;
      return seg.geometry.coordinates.some(([lng, lat]) =>
        lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
      );
    });

    const intersections = allIntersections.filter(i => {
      const [lng, lat] = i.location?.coordinates || [];
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });

    const dangerousIntersections = intersections.filter(i => i.severity >= 3).length;
    console.log(`Bike segments in corridor: ${nearbySegments.length} / ${allSegments.length}`);
    console.log(`Intersections in corridor: ${intersections.length} (${dangerousIntersections} dangerous)`);

    // 6. Compute cycling safety metrics
    const avgSafetyScore = nearbySegments.length > 0
      ? parseFloat((nearbySegments.reduce((s, seg) => s + (seg.safetyScore || 0), 0) / nearbySegments.length).toFixed(1))
      : 50;

    const segmentsWithLane = nearbySegments.filter(s => s.hasLane).length;
    const safeLanePercent = nearbySegments.length > 0
      ? Math.round((segmentsWithLane / nearbySegments.length) * 100)
      : 0;

    const totalAccidents = nearbySegments.reduce((s, seg) => s + (seg.accidentCount || 0), 0);

    // 8. Cycling time estimate — slightly longer distance due to different routing
    const cyclingDistanceKm = driving.distance * 0.92; // cyclists take slightly shorter paths
    const cyclingDurationMin = Math.round((cyclingDistanceKm / CYCLING_SPEED_KMH) * 60);
    const timeDiffMin = cyclingDurationMin - driving.duration;

    // 9. Safety rating for cycling (0-100)
    // Penalize for low safety score, dangerous intersections, no lanes
    // Normalize intersection penalty by route distance so long routes aren't unfairly penalized
    const intersectionDensity = driving.distance > 0 ? dangerousIntersections / driving.distance : 0;
    const safetyScore = Math.max(0, Math.min(100,
      avgSafetyScore
      - (intersectionDensity * 10)   // per km density penalty
      - (totalAccidents * 1.5)
      + (safeLanePercent * 0.3)
    ));

    // 10. Recommendation logic
    let recommendation, recommendationReason;
    const shortEnoughToCycle = cyclingDistanceKm <= 20;
    const safeEnoughToCycle = safetyScore >= 45;
    const fasterOrSimilar = timeDiffMin <= 10; // cycling within 10 min of driving

    if (shortEnoughToCycle && safeEnoughToCycle && fasterOrSimilar) {
      recommendation = 'cycling';
      const timeMsg = timeDiffMin < 0
        ? `${Math.abs(timeDiffMin)} minutes FASTER than driving`
        : timeDiffMin === 0 ? 'same time as driving' : `only ${timeDiffMin} min slower than driving`;
      recommendationReason = `Cycling is ${timeMsg}. The corridor has ${safeLanePercent}% protected lanes, a safety score of ${safetyScore.toFixed(0)}/100, and saves $${totalDrivingCost} + ${carbonKgDriving}kg CO₂.`;
    } else if (!shortEnoughToCycle) {
      recommendation = 'driving';
      recommendationReason = `At ${cyclingDistanceKm.toFixed(1)}km this route is too long to cycle comfortably. Driving costs $${totalDrivingCost} and emits ${carbonKgDriving}kg CO₂ ($${carbonTaxCAD} carbon tax).`;
    } else if (!safeEnoughToCycle) {
      recommendation = 'driving';
      recommendationReason = `Cycling safety score is ${safetyScore.toFixed(0)}/100 with ${dangerousIntersections} dangerous intersections in this corridor. Driving is the safer choice.`;
    } else {
      recommendation = 'driving';
      recommendationReason = `Cycling would take ${timeDiffMin} min longer. Driving costs $${totalDrivingCost} and emits ${carbonKgDriving}kg CO₂ ($${carbonTaxCAD} carbon tax).`;
    }

    console.log(`Cycling: ${cyclingDistanceKm.toFixed(1)}km | ${cyclingDurationMin}min | safety:${safetyScore.toFixed(0)} | rec:${recommendation}`);
    console.log('============================================\n');

    res.json({
      origin,
      destination,
      driving: {
        distanceKm: driving.distance,
        durationMin: driving.duration,
        fuelLitres: parseFloat(fuelLitres.toFixed(2)),
        fuelCostCAD,
        carbonKg: carbonKgDriving,
        carbonTaxCAD,
        totalCostCAD: totalDrivingCost,
        dangerousIntersections,
        gasPriceCentsPerL: prices.toronto,
      },
      cycling: {
        distanceKm: parseFloat(cyclingDistanceKm.toFixed(1)),
        durationMin: cyclingDurationMin,
        timeDiffMin,
        avgSafetyScore,
        safeLanePercent,
        accidentsOnRoute: totalAccidents,
        nearbySegments: nearbySegments.length,
        safetyScore: parseFloat(safetyScore.toFixed(1)),
        totalCostCAD: 0,
        carbonKg: 0,
      },
      comparison: {
        costSavedCAD: totalDrivingCost,
        carbonSavedKg: carbonKgDriving,
        carbonTaxSavedCAD: carbonTaxCAD,
        timeCostMin: timeDiffMin,
      },
      recommendation,
      recommendationReason,
    });
  } catch (err) {
    console.error('Compare error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;