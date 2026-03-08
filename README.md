# UrbanFlow - Smart Mobility System 🏙️

UrbanFlow is a unified, intelligent mobility dashboard for the Greater Toronto Area (GTA) and beyond. Built during Hack Canada, it aggregates live traffic data, fuel prices, routing intelligence, and carbon impact into a sleek, dark-themed dashboard.

> **Current Branch**: `deploy-test` (Production candidate)

## ✨ Key Features

1.  **Dashboard Analytics**: Top-level metrics on congestion, accidents over time, and predictive models.
2.  **Carbon Cost Navigator**: A unique routing tool that compares driving vs. cycling, calculating actual fuel costs, predicted CO₂ emissions, and safety scores based on protected bike lanes using Toronto Open Data.
3.  **Market Intelligence**: An AI-powered (Claude 3.5 Sonnet) tool that analyzes live worldwide news and 8 years of local Ontario pricing data to recommend the best time to refuel. It even includes a statistical volatility forecast.
4.  **Interactive Maps**: Heatmaps of dangerous intersections and live routing leveraging Leaflet.

## 🛠️ Tech Stack & Tools

*   **Frontend**: React 19, Vite, Tailwind CSS v4, Recharts, React-Leaflet, Auth0 (for Market Intelligence).
*   **Backend**: Node.js, Express, MongoDB/Mongoose.
*   **APIs & Data**: Google Maps Routes API (directions & polyline decoding), Overpass API/OpenStreetMap (gas station locations), Ontario Open Data (CSV parsing for fuel prices), Claude API (Market Intelligence).

## 🚀 Deployment Status

Currently configured for production deployment on this branch (`deploy-test`):

*   **Frontend Hosting**: (E.g., Vercel / Netlify / Render - *Update with actual URL once deployed*)
*   **Backend Hosting**: (E.g., Render / Heroku / DigitalOcean - *Update with actual URL once deployed*)
*   **Database**: MongoDB Atlas

### CORS Configuration
The backend is currently allowing CORS requests from `localhost`, `.vercel.app`, and `.netlify.app` domains.

## 💻 Local Development

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/yourusername/Hack-Canada-Project.git
    cd Hack-Canada-Project
    git checkout deploy-test
    ```
2.  **Install dependencies**:
    ```bash
    npm run install:all
    ```
3.  **Environment Variables (`.env`)**:
    You need to create a `.env` in the root directory:
    ```env
    MONGODB_URI=your_mongodb_uri
    PORT=5000
    GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    ANTHROPIC_API_KEY=your_anthropic_api_key
    ```
4.  **Run Development Servers**:
    ```bash
    npm run dev
    ```
    *(Runs both the Vite React frontend and the Node.js Express backend concurrently)*
