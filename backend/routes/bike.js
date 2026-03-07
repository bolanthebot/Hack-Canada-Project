const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bikeController');

router.get('/segments', ctrl.getSegments);
router.get('/segments/:id', ctrl.getSegmentById);

module.exports = router;
