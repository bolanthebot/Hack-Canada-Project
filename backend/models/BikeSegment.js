const mongoose = require('mongoose');

const bikeSegmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    geometry: {
      type: { type: String, enum: ['LineString'], default: 'LineString' },
      coordinates: { type: [[Number]], required: true }, // [[lng, lat], ...]
    },
    safetyScore: { type: Number, min: 0, max: 100, required: true },
    hasLane: { type: Boolean, default: false },
    trafficSpeed: { type: Number, default: 40 },     // km/h average
    accidentCount: { type: Number, default: 0 },
    lighting: {
      type: String,
      enum: ['good', 'moderate', 'poor'],
      default: 'moderate',
    },
    roadWidth: { type: Number, default: 3 },          // metres
  },
  { timestamps: true }
);

module.exports = mongoose.model('BikeSegment', bikeSegmentSchema);
