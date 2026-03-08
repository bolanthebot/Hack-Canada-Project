const router = require('express').Router();
const { runSafetyAgent } = require('../agents/safetyAgent');

// POST /api/agent/run — manually trigger safety agent
router.post('/run', async (req, res) => {
    try {
        console.log('Safety agent triggered manually');
        const result = await runSafetyAgent();
        res.json({
            success: true,
            updated: result.updated,
            incidents: result.incidents,
            updatedSegments: result.updatedSegments,
        });
    } catch (err) {
        console.error('Agent error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/agent/alerts — get all currently active alerts
router.get('/alerts', async (req, res) => {
    try {
        const BikeSegment = require('../models/BikeSegment');
        const active = await BikeSegment.find({ lastAlertAt: { $ne: null } })
            .select('name safetyScore alertScore alertReason lastAlertAt geometry')
            .lean();
        res.json({ count: active.length, segments: active });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;