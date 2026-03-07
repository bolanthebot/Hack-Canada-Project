import { useEffect, useMemo } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '../../utils/polyline';

const ROUTE_COLORS = {
  fastest: '#2563eb', // Blue
  cheapest: '#059669', // Emerald
  safest: '#7c3aed', // Purple
};

function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};border:2.5px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 4px ${color}33;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function stopIcon(stopNumber) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px;height:32px;border-radius:50%;
        background:#1e293b;border:2px solid #3b82f6;
        box-shadow:0 4px 12px rgba(59,130,246,0.3);
        display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:900;color:white;font-family:Inter,sans-serif;
      ">${stopNumber}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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

export default function RouteMap({ routes = [], activeRoute, gasStops = null, gasLoading = false }) {
  const decoded = useMemo(
    () => routes
      .filter((r) => r.polyline)
      .map((r) => ({ ...r, points: decodePolyline(r.polyline) })),
    [routes],
  );

  const origin = decoded.length > 0 ? decoded[0].points[0] : null;
  const dest = decoded.length > 0 ? decoded[0].points[decoded[0].points.length - 1] : null;
  const plannedStops = gasStops?.plannedStops || [];

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden relative border border-gray-100 shadow-xl group" style={{ height: 480 }}>
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

        {/* Inactive routes */}
        {decoded
          .filter((r) => r.routeType !== activeRoute)
          .map((r) => (
            <Polyline
              key={r.routeType}
              positions={r.points}
              pathOptions={{
                color: ROUTE_COLORS[r.routeType] || '#888',
                weight: 4,
                opacity: 0.1,
              }}
            />
          ))}

        {/* Active route — with glow */}
        {decoded
          .filter((r) => r.routeType === activeRoute)
          .map((r) => (
            <div key={`${r.routeType}-container`}>
              <Polyline
                positions={r.points}
                pathOptions={{
                  color: ROUTE_COLORS[r.routeType] || '#888',
                  weight: 12,
                  opacity: 0.1,
                }}
              />
              <Polyline
                positions={r.points}
                pathOptions={{
                  color: ROUTE_COLORS[r.routeType] || '#888',
                  weight: 6,
                  opacity: 1,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </div>
          ))}

        {/* Markers */}
        {origin && (
          <Marker position={origin} icon={circleIcon('#3b82f6')}>
            <Popup><span className="font-black uppercase text-[10px] tracking-widest text-blue-600">Origin Point</span></Popup>
          </Marker>
        )}
        {dest && (
          <Marker position={dest} icon={circleIcon('#10b981')}>
            <Popup><span className="font-black uppercase text-[10px] tracking-widest text-emerald-600">Destination Point</span></Popup>
          </Marker>
        )}

        {/* Planned gas stop markers */}
        {plannedStops.map((stop) => (
          <Marker
            key={stop.stopNumber}
            position={[stop.lat, stop.lng]}
            icon={stopIcon(stop.stopNumber)}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
              <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/30 shadow-xl">
                {stop.recommendedStation ? stop.recommendedStation.name : `Stop ${stop.stopNumber}`}
              </div>
            </Tooltip>
            <Popup>
              <div className="p-1 min-w-[200px]">
                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">
                  Optimization Stop {stop.stopNumber}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Distance</span>
                    <span className="text-sm font-black text-gray-800">{stop.distFromStartKm.toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Fuel State</span>
                    <span className={`text-sm font-black ${stop.fuelPercentOnArrival < 20 ? 'text-rose-500' : 'text-amber-500'}`}>
                      {stop.fuelPercentOnArrival}%
                    </span>
                  </div>
                  {stop.recommendedStation && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <span className="text-sm">★</span> Best Value Station
                      </div>
                      <div className="text-sm font-black text-gray-800 leading-tight">
                        {stop.recommendedStation.name}
                      </div>
                      <div className="text-xl font-black text-emerald-600 mt-1">
                        ${(stop.recommendedStation.estimatedPriceCentsPerL / 100).toFixed(2)}<span className="text-[10px] ml-1 text-gray-400">/L</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 mt-2 italic">
                        +{stop.recommendedStation.detourKm}km detour from optimal path
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>

      {/* Premium Legend Overlay */}
      {decoded.length > 0 && (
        <div className="absolute bottom-8 left-8 right-8 z-[1000] flex justify-between items-end pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl px-6 py-4 flex gap-8 shadow-2xl border border-white/50 pointer-events-auto">
            {decoded.map((r) => (
              <div key={r.routeType} className={`flex items-center gap-2.5 transition-opacity ${activeRoute === r.routeType ? 'opacity-100' : 'opacity-40'}`}>
                <span
                  className="w-3 h-3 rounded-full shadow-inner"
                  style={{ background: ROUTE_COLORS[r.routeType] }}
                />
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">{r.routeType}</span>
              </div>
            ))}
          </div>

          {(plannedStops.length > 0 || gasLoading) && (
            <div className={`bg-blue-600 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl shadow-blue-500/30 border border-blue-400/30 transition-all duration-500 pointer-events-auto ${gasLoading ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'}`}>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className={`text-white text-xs font-black ${gasLoading ? 'animate-spin' : ''}`}>
                  {gasLoading ? '○' : plannedStops.length}
                </span>
              </div>
              <div>
                <div className="text-[9px] font-black text-blue-100 uppercase tracking-widest leading-none mb-1">Fuel Planning</div>
                <div className="text-[11px] font-black text-white uppercase tracking-wider">
                  {gasLoading ? 'Calculating Assets...' : 'Optimal Stops Found'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}