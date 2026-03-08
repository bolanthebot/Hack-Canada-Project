import { MapContainer as LeafletMap, TileLayer, ZoomControl, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [43.6532, -79.3832];

function FlyToCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.2 });
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
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100dvh' }}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {center && <FlyToCenter center={center} />}
      {onMapClick && <ClickHandler onMapClick={onMapClick} />}

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={8}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.35,
            weight: 2,
          }}
        />
      )}

      {children}
    </LeafletMap>
  );
}
