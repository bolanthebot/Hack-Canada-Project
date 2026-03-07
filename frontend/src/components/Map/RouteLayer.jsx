import { useEffect, useMemo } from 'react';
import { Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { decodePolyline } from '../../utils/polyline';

const MODE_THEME = {
  DRIVE: {
    color: '#2563eb', // Blue
    border: '#1d4ed8',
  },
  BICYCLE: {
    color: '#10b981', // Green
    border: '#047857',
  },
  WALK: {
    color: '#8b5cf6', // Purple
    border: '#6d28d9',
  },
};

function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #ffffff;
        border: 4px solid ${color};
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
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
    map.fitBounds(L.latLngBounds(points), { padding: [120, 120] });
  }, [points, map]);

  if (points.length === 0) return null;

  // Use travelMode from route or default to DRIVE
  const modeKey = route.travelMode || 'DRIVE';
  const theme = MODE_THEME[modeKey] || MODE_THEME.DRIVE;

  return (
    <>
      {/* Route Border/Shadow */}
      <Polyline
        positions={points}
        pathOptions={{
          color: theme.border,
          weight: 12,
          opacity: 0.1,
          lineCap: 'round',
        }}
      />

      {/* Main Route Line */}
      <Polyline
        positions={points}
        pathOptions={{
          color: theme.color,
          weight: 7,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Origin/Dest Markers with Mode Theming */}
      <Marker position={points[0]} icon={circleIcon(theme.color)}>
        <Popup>Origin</Popup>
      </Marker>
      <Marker position={points[points.length - 1]} icon={circleIcon('#f43f5e')}>
        <Popup>Destination</Popup>
      </Marker>
    </>
  );
}
