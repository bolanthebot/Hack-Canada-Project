const mongoose = require('mongoose');

const bikeSegmentSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  geometry: {
    type: { type: String, enum: ['LineString'], default: 'LineString' },
    coordinates: { type: [[Number]], required: true },
  },
  safetyScore: { type: Number, min: 0, max: 100, default: 50 },
  hasLane: { type: Boolean, default: false },
  trafficSpeed: { type: Number, default: 50 },
  accidentCount: { type: Number, default: 0 },
  lighting: { type: String, enum: ['good', 'moderate', 'poor'], default: 'moderate' },
  roadWidth: { type: Number, default: 3 },
});

bikeSegmentSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('BikeSegment', bikeSegmentSchema);
