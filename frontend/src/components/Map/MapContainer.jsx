import { MapContainer as LeafletMap, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TORONTO_CENTER = [43.6532, -79.3832];

export default function MapContainer({ children, className = '' }) {
  return (
    <LeafletMap
      center={TORONTO_CENTER}
      zoom={13}
      zoomControl={false}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100vh' }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {children}
    </LeafletMap>
  );
}
