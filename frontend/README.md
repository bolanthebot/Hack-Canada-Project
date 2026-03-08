# UrbanFlow Frontend: Urban Intelligence Hub

A premium, daytime-optimized mobility dashboard and navigation interface for the Greater Toronto Area (GTA). Built for the Hack Canada Hackathon.

## 🚀 Recent Accomplishments & Features

### 1. Urban Intelligence Hub (Dashboard)
- **Safety Score Gauge**: A custom animated SVG visualizer that provides a real-time safety index for the city.
- **Live Intelligence Feed**: An auto-scrolling, severity-coded feed of recent safety reports directly from the backend.
- **Advanced Analytics**: Interactive charts (Recharts) featuring:
    - **Glassmorphism Tooltips**: Custom-built tooltips with backdrop-blur and zoom-in animations.
    - **Occupancy Dynamics**: 24h parking availability streams with multi-stop gradients.
    - **High-Risk Vectors**: Hotspot density visualization for dangerous intersections.
- **Minimalist Senior UX**: Understated design language with high information density and professional typography.

### 2. Smart Navigation & Routing
- **Daytime Map Aesthetic**: Vibrant, high-contrast map tiles optimized for clarity and professional presentation.
- **Advanced Route Planner**: 
    - Compare routes by speed, cost, and safety.
    - Bike-safe route highlighting (Green Pathing).
    - Real-time gas price predictions integrated into trip costs.
- **Clean Token Overlays**: Refined markers for intersections, parking, and user location (removed legacy Accuracy Ripples for a cleaner look).

### 3. Hardware-Inspired UI/UX
- **Glassmorphism Design System**: Extensive use of backdrop-blur, subtle borders, and premium shadows.
- **Micro-Animations**: Smooth transitions, pulsing indicators, and animated data entry points for a responsive feel.
- **Fixed-Frame Navigation**: A professional sidebar with collapsed states and perfectly bounded scrolling containers.

## 🛠 Tech Stack
- **Core**: React 18, Vite
- **Styling**: Tailwind CSS (Minimalist utility first)
- **Mapping**: Leaflet / React-Leaflet
- **Data Viz**: Recharts
- **Icons/UI**: Custom SVGs & Lucide React
- **Toast**: React Hot Toast

## 🚦 Getting Started
1. **Install Dependencies**: `npm install`
2. **Environment**: Ensure `.env` is configured with `PORT=5005` (matching backend).
3. **Run Dev**: `npm run dev`
4. **Data Sync**: Ensure the backend is running with a connected MongoDB instance to hydrate the "Live" metrics.

---
*Targeting Vision Zero by 2030 • UrbanFlow Core Engine v2.4.0*
