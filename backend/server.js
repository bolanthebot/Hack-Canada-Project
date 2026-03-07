const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const intersectionRoutes = require('./routes/intersections');
const parkingRoutes = require('./routes/parking');
const bikeRoutes = require('./routes/bike');
const routeRoutes = require('./routes/routes');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urbanflow';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/intersections', intersectionRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bike', bikeRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`UrbanFlow API running on port ${PORT}`);
});
