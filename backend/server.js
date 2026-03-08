require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: true,  // allow ALL origins
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/intersections', require('./routes/intersections'));
app.use('/api/parking', require('./routes/parking'));
app.use('/api/bike', require('./routes/bike'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/agent', require('./routes/agent'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// const PORT = process.env.PORT || 5000;

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => console.log(`✓ Backend running on port ${PORT}`));
    // Safety agent — auto run every 30 minutes
    const { runSafetyAgent } = require('./agents/safetyAgent');
    setInterval(async () => {
      try {
        await runSafetyAgent();
      } catch (err) {
        console.error('Scheduled agent error:', err.message);
      }
    }, 30 * 60 * 1000);

    // Run once on startup
    runSafetyAgent().catch(err => console.error('Startup agent error:', err.message));

  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
