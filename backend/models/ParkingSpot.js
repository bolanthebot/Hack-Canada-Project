const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  status: {
    type: String,
    enum: ['available', 'taken'],
    required: true,
  },
  streetName: { type: String, default: '' },
  restrictions: { type: String, default: '' },
  reportedBy: { type: String, default: 'anonymous' },
  updatedAt: { type: Date, default: Date.now },
});

parkingSpotSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);
