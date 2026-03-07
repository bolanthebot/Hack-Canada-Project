require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/intersections', require('./routes/intersections'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/bike', require('./routes/bike'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanflow';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => console.log(`✓ Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
