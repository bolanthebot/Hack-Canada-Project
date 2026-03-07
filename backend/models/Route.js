const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  origin: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  destination: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  waypoints: [
    {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
    },
  ],
  routeType: { type: String, enum: ['fastest', 'cheapest', 'safest'], required: true },
  totalCost: { type: Number, default: 0 },
  fuelCost: { type: Number, default: 0 },
  timeCost: { type: Number, default: 0 },
  riskCost: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Route', routeSchema);
