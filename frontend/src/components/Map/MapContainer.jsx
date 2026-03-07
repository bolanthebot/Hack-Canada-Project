import { MapContainer as LeafletMap, TileLayer, ZoomControl, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [43.6532, -79.3832];

function FlyToCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 2, easeLinearity: 0.1 });
  }, [center, map]);
  return null;
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapContainer({ children, center, userLocation, onMapClick, className = '' }) {
  return (
    <LeafletMap
      center={center || DEFAULT_CENTER}
      zoom={13}
      zoomControl={false}
      className={`w-full h-full animate-in fade-in duration-1000 ${className}`}
      style={{ minHeight: '100vh', background: '#f8f9fa' }}
    >
      <ZoomControl position="bottomright" />

      {/* Standard OpenStreetMap Style (Vibrant Colors, Yellow Roads) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && <FlyToCenter center={center} />}
      {onMapClick && <ClickHandler onMapClick={onMapClick} />}

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={7}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#2563eb',
            fillOpacity: 1,
            weight: 3,
          }}
        />
      )}

      {children}
    </LeafletMap>
  );
}
