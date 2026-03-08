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
    // Green P Specific Fields
    source: { type: String, enum: ['user_reported', 'green_p'], default: 'user_reported' },
    capacity: { type: Number, default: 0 },
    rate: { type: String, default: '' },
    carparkType: { type: String, default: '' },
    paymentMethods: { type: [String], default: [] },
  },
  { timestamps: true }
);

parkingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Parking', parkingSchema);
