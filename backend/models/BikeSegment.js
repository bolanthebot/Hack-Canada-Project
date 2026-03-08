const mongoose = require('mongoose');
const bikeSegmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    geometry: {
      type: { type: String, enum: ['LineString'], default: 'LineString' },
      coordinates: { type: [[Number]], required: true },
    },
    safetyScore: { type: Number, min: 0, max: 100, required: true },
    hasLane: { type: Boolean, default: false },
    trafficSpeed: { type: Number, default: 40 },
    accidentCount: { type: Number, default: 0 },
    lighting: {
      type: String,
      enum: ['good', 'moderate', 'poor'],
      default: 'moderate',
    },
    roadWidth: { type: Number, default: 3 },
    alertScore: { type: Number, default: null },
    alertReason: { type: String, default: null },
    lastAlertAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BikeSegment', bikeSegmentSchema);