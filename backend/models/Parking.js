const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema(
  {
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    status: {
      type: String,
      enum: ['available', 'taken'],
      default: 'available',
    },
    streetName: { type: String, default: '' },
    restrictions: { type: String, default: '' },
  },
  { timestamps: true }
);

parkingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Parking', parkingSchema);
