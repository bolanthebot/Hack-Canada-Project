import { useEffect, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Polyline, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ROUTE_COLORS = {
  fastest: '#60a5fa',
  cheapest: '#34d399',
  safest: '#c084fc',
};

function decodePolyline(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0; result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function FitBounds({ decoded }) {
  const map = useMap();
  useEffect(() => {
    const allPts = decoded.flatMap((r) => r.points);
    if (allPts.length === 0) return;
    map.fitBounds(L.latLngBounds(allPts), { padding: [50, 50] });
  }, [decoded, map]);
  return null;
}

export default function RouteMap({ routes = [], activeRoute }) {
  const decoded = useMemo(
    () =>
      routes
        .filter((r) => r.polyline)
        .map((r) => ({ ...r, points: decodePolyline(r.polyline) })),
    [routes],
  );

  const origin = decoded.length > 0 ? decoded[0].points[0] : null;
  const dest =
    decoded.length > 0
      ? decoded[0].points[decoded[0].points.length - 1]
      : null;

  return (
    <div className="bg-[#12151c] rounded-lg overflow-hidden relative" style={{ height: 380 }}>
      <LeafletMap
        center={[43.6532, -79.3832]}
        zoom={11}
        zoomControl={false}
        className="w-full h-full"
        style={{ height: '100%', background: '#0c0f14' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {decoded.length > 0 && <FitBounds decoded={decoded} />}

        {decoded
          .filter((r) => r.routeType !== activeRoute)
          .map((r) => (
            <Polyline
              key={r.routeType}
              positions={r.points}
              pathOptions={{
                color: ROUTE_COLORS[r.routeType] || '#888',
                weight: 3,
                opacity: 0.3,
              }}
            />
          ))}

        {decoded
          .filter((r) => r.routeType === activeRoute)
          .map((r) => (
            <Polyline
              key={`${r.routeType}-active`}
              positions={r.points}
              pathOptions={{
                color: ROUTE_COLORS[r.routeType] || '#888',
                weight: 5,
                opacity: 1,
              }}
            />
          ))}

        {origin && (
          <Marker position={origin} icon={circleIcon('#22c55e')}>
            <Popup>Origin</Popup>
          </Marker>
        )}
        {dest && (
          <Marker position={dest} icon={circleIcon('#ef4444')}>
            <Popup>Destination</Popup>
          </Marker>
        )}
      </LeafletMap>

      {decoded.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#12151c]/90 backdrop-blur rounded px-3 py-2 flex gap-3">
          {decoded.map((r) => (
            <div key={r.routeType} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: ROUTE_COLORS[r.routeType] }}
              />
              <span className="text-[10px] text-gray-400 capitalize">{r.routeType}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
