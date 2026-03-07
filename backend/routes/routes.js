const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/routeController');

router.post('/plan', ctrl.planRoute);

module.exports = router;
