import { useEffect, useMemo } from 'react';
import { MapContainer as LeafletMap, TileLayer, Polyline, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '../../utils/polyline';

const ROUTE_COLORS = {
  fastest: '#2563eb',
  cheapest: '#059669',
  safest: '#7c3aed',
};

function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.15)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FitBounds({ decoded }) {
  const map = useMap();
  useEffect(() => {
    const allPts = decoded.flatMap((r) => r.points);
    if (allPts.length === 0) return;
    map.fitBounds(L.latLngBounds(allPts), { padding: [60, 60] });
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
    <div className="bg-white rounded-3xl overflow-hidden relative border border-gray-100 shadow-sm" style={{ height: 440 }}>
      <LeafletMap
        center={[43.6532, -79.3832]}
        zoom={11}
        zoomControl={false}
        className="w-full h-full"
        style={{ height: '100%', background: '#f8f9fa' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
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
                weight: 4,
                opacity: 0.15,
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
                weight: 6,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          ))}

        {origin && (
          <Marker position={origin} icon={circleIcon('#3b82f6')}>
            <Popup>Origin</Popup>
          </Marker>
        )}
        {dest && (
          <Marker position={dest} icon={circleIcon('#10b981')}>
            <Popup>Destination</Popup>
          </Marker>
        )}
      </LeafletMap>

      {decoded.length > 0 && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 flex gap-5 shadow-xl border border-gray-100">
          {decoded.map((r) => (
            <div key={r.routeType} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: ROUTE_COLORS[r.routeType] }}
              />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{r.routeType}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
