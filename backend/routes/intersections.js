const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/intersectionController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/hotspots', ctrl.getHotspots);

module.exports = router;
