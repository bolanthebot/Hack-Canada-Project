# UrbanFlow

UrbanFlow is a smart city navigation app that finds you routes by speed, safety, or cost while showing bike-safe paths, danger zones, cheaper gas, and open parking for easier commuting.

[https://urban.lukasdsouza.com/](https://urban.lukasdsouza.com/)

## Key Features

1.  **Dashboard Analytics**: Top-level metrics on congestion, accidents over time, and predictive models.
2.  **Carbon Cost Calculator**: A routing tool that compares driving vs. cycling, calculating actual fuel costs, predicted CO2 emissions, and safety scores based on protected bike lanes using Toronto Open Data.
3.  **Market Intelligence**: An AI-powered (Claude 4.5 Sonnet) tool that analyzes live worldwide news and 8 years of local Ontario pricing data to recommend the best times to refuel. It includes a projected price chart.
4.  **Interactive Maps**: Heatmaps of dangerous road zones and live routing using Leaflet and the Google Maps API.

## Tech Stack & Tools

*   **Authentication**: Auth0
*   **Frontend**: React, Vite, Tailwind CSS, Recharts, Leaflet.js
*   **Backend**: Node.js, Express, Mongoose
*   **Database**: MongoDB
*   **APIs & Data**: Google Maps Routes API, Overpass API/OpenStreetMap, Ontario Open Data (Toronto, Waterloo, Kitchener), Claude API

## Deployment Status

Currently configured for production deployment on this branch (`deploy-test`):

*   **Frontend Hosting**: We used Vultr
*   **Backend Hosting**: We used Vultr
*   **Database**: MongoDB Atlas

## Local Development

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/yourusername/Hack-Canada-Project.git
    cd Hack-Canada-Project
    git checkout deploy
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
