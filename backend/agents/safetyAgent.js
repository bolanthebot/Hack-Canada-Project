const axios = require('axios');
const BikeSegment = require('../models/BikeSegment');

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ALERT_DURATION_MS = 60 * 60 * 1000; // 1 hour
const SCORE_PENALTY = 20;

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

async function runSafetyAgent() {
    console.log('\n========== SAFETY AGENT ==========');

    if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not configured');

    // 1. Agentic Claude loop — search for Toronto bike incidents
    const prompt = `You are a Toronto cycling safety monitor. Search for recent news (last 24 hours) about:
1. Bike accidents or cyclist injuries in Toronto
2. Road closures affecting cyclists in Toronto  
3. Construction zones on Toronto bike routes
4. Any dangerous conditions for cyclists in Toronto

Return ONLY a JSON array, no markdown, no preamble:
[
  {
    "location": "intersection or street name in Toronto",
    "lat": 0.0,
    "lng": 0.0,
    "severity": "low|medium|high",
    "type": "accident|closure|construction|hazard",
    "description": "one sentence description"
  }
]

If you find no incidents return an empty array: []
Only include incidents where you can identify a specific Toronto location with coordinates.

CRITICAL: Your entire response must be ONLY the JSON array. No explanation, no "Based on my research", no text before or after. Start with [ and end with ].`;

    const messages = [{ role: 'user', content: prompt }];
    const tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    const headers = {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
    };

    let finalText = '';
    let turns = 0;

    while (turns < 6) {
        turns++;
        console.log(`  Turn ${turns}...`);

        const { data } = await axios.post(
            'https://api.anthropic.com/v1/messages',
            { model: 'claude-sonnet-4-5', max_tokens: 1000, tools, messages },
            { headers, timeout: 60000 }
        );

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
                messages.push({ role: 'user', content: [{ type: 'text', text: 'Continue with your analysis.' }] });
            }
            continue;
        }
        break;
    }

    console.log(`Claude done in ${turns} turn(s)`);

    // 2. Parse incidents
    let incidents = [];
    try {
        let clean = finalText.trim()
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```\s*$/i, '')
            .trim();
        // Extract JSON array even if Claude added text around it
        const arrayMatch = clean.match(/\[[\s\S]*\]/);
        if (arrayMatch) clean = arrayMatch[0];
        incidents = JSON.parse(clean);
        console.log(`Found ${incidents.length} incident(s)`);
    } catch (err) {
        console.warn('Could not parse incidents JSON:', err.message);
        return { updated: 0, incidents: [] };
    }

    if (!incidents.length) {
        console.log('No incidents found — no updates needed');
        console.log('===================================\n');
        return { updated: 0, incidents: [] };
    }

    // 3. For each incident, find nearby segments and penalize score
    const allSegments = await BikeSegment.find().select('name safetyScore geometry').lean();
    let updatedCount = 0;
    const updatedSegments = [];

    for (const incident of incidents) {
        if (!incident.lat || !incident.lng) continue;
        console.log(`\nIncident: ${incident.type} at ${incident.location} (${incident.severity})`);

        const RADIUS_KM = incident.severity === 'high' ? 1.0 : incident.severity === 'medium' ? 0.75 : 0.5;
        const nearby = allSegments.filter(seg => {
            if (!seg.geometry?.coordinates?.length) return false;
            // Check if any point of segment is within radius
            return seg.geometry.coordinates.some(([lng, lat]) =>
                haversineKm(incident.lat, incident.lng, lat, lng) <= RADIUS_KM
            );
        });

        console.log(`  Found ${nearby.length} segments within ${RADIUS_KM}km`);

        const penalty = incident.severity === 'high' ? 25 : incident.severity === 'medium' ? 15 : 8;

        for (const seg of nearby) {
            const newScore = Math.max(0, seg.safetyScore - penalty);
            await BikeSegment.findByIdAndUpdate(seg._id, {
                alertScore: newScore,
                alertReason: `${incident.type}: ${incident.description}`,
                lastAlertAt: new Date(),
            });
            updatedCount++;
            updatedSegments.push({ name: seg.name, oldScore: seg.safetyScore, newScore, reason: incident.description });
            console.log(`  Updated: ${seg.name} ${seg.safetyScore} → ${newScore}`);
        }
    }

    // 4. Auto-expire old alerts (older than 1 hour)
    const expireResult = await BikeSegment.updateMany(
        { lastAlertAt: { $lt: new Date(Date.now() - ALERT_DURATION_MS) } },
        { $set: { alertScore: null, alertReason: null, lastAlertAt: null } }
    );
    console.log(`\nExpired ${expireResult.modifiedCount} old alert(s)`);
    console.log(`Total updated: ${updatedCount} segment(s)`);
    console.log('===================================\n');

    return { updated: updatedCount, incidents, updatedSegments };
}

module.exports = { runSafetyAgent };