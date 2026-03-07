const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/parkingController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.report);
router.post('/predict', ctrl.predict);

module.exports = router;
