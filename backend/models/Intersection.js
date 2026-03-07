const mongoose = require('mongoose');

const intersectionSchema = new mongoose.Schema(
  {
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    reportType: {
      type: String,
      enum: ['near_miss', 'cyclist_conflict', 'pedestrian_conflict', 'aggressive_driver'],
      required: true,
    },
    severity: { type: Number, min: 1, max: 5, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

intersectionSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Intersection', intersectionSchema);
