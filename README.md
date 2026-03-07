# UrbanFlow - Smart Mobility System for the GTA

A smart mobility platform for the Greater Toronto Area featuring dangerous intersection reporting, smart parking, bike route safety scoring, and eco route planning.

## Tech Stack

- **Frontend:** React, Leaflet, Recharts, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **ML Service:** Python, Flask, scikit-learn

## Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB running on `localhost:27017`

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Install Python dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Start all services

```bash
npm run dev
```

This starts:
- Frontend at http://localhost:5173
- Backend API at http://localhost:5000
- ML Service at http://localhost:5001

## Features

1. **Dangerous Intersection Reporting** - Click the map to report near-miss incidents, view risk heatmaps
2. **Smart Street Parking** - Real-time parking availability with ML-powered predictions
3. **Bike Route Safety Index** - Color-coded bike routes with safety scoring
4. **Smart Eco Route Planner** - Compare fastest, cheapest, and safest routes
