const mongoose = require('mongoose');

const intersectionReportSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  reportType: {
    type: String,
    enum: ['near_miss', 'cyclist_conflict', 'pedestrian_conflict', 'aggressive_driver'],
    required: true,
  },
  severity: { type: Number, min: 1, max: 5, default: 3 },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

intersectionReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('IntersectionReport', intersectionReportSchema);
