import { useEffect, useMemo } from 'react';
import { Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { decodePolyline } from '../../utils/polyline';

const MODE_COLORS = {
  DRIVE: '#60a5fa',
  BICYCLE: '#34d399',
  WALK: '#f59e0b',
};

function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function RouteLayer({ route }) {
  const map = useMap();

  const points = useMemo(() => {
    if (!route?.polyline) return [];
    return decodePolyline(route.polyline);
  }, [route?.polyline]);

  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60] });
  }, [points, map]);

  if (points.length === 0) return null;

  const color = MODE_COLORS[route.travelMode] || '#60a5fa';

  return (
    <>
      <Polyline
        positions={points}
        pathOptions={{ color, weight: 5, opacity: 0.85 }}
      />
      <Marker position={points[0]} icon={circleIcon('#22c55e')}>
        <Popup>Origin</Popup>
      </Marker>
      <Marker position={points[points.length - 1]} icon={circleIcon('#ef4444')}>
        <Popup>Destination</Popup>
      </Marker>
    </>
  );
}
