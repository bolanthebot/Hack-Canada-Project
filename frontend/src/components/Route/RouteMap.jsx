import { Fragment, useEffect, useMemo } from 'react';
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
  fastest: '#60a5fa',
  cheapest: '#34d399',
  safest: '#c084fc',
};

function circleIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};border:2.5px solid rgba(255,255,255,0.9);
      box-shadow:0 2px 8px rgba(0,0,0,0.6),0 0 0 4px ${color}33;
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
        background:#0d1017;border:2px solid #14b8a6;
        box-shadow:0 2px 12px rgba(0,0,0,0.7),0 0 16px rgba(20,184,166,0.3);
        display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:700;color:#14b8a6;font-family:monospace;
      ">${stopNumber}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FitBounds({ decoded, gasStops }) {
  const map = useMap();
  useEffect(() => {
    const routePts = decoded.flatMap((r) => r.points);
    const stopPts = (gasStops?.plannedStops || [])
      .map((stop) => {
        if (stop.recommendedStation?.lat != null && stop.recommendedStation?.lng != null) {
          return [stop.recommendedStation.lat, stop.recommendedStation.lng];
        }
        if (stop.lat != null && stop.lng != null) {
          return [stop.lat, stop.lng];
        }
        return null;
      })
      .filter(Boolean);
    const allPts = [...routePts, ...stopPts];
    if (allPts.length === 0) return;
    map.fitBounds(L.latLngBounds(allPts), { padding: [60, 60] });
  }, [decoded, gasStops, map]);
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

  // Extract planned stops from the new data shape
  const plannedStops = gasStops?.plannedStops || [];

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.05] h-[300px] sm:h-[400px]">
      <LeafletMap
        center={[43.6532, -79.3832]}
        zoom={11}
        zoomControl={false}
        className="w-full h-full"
        style={{ height: '100%', background: '#080a0f' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {decoded.length > 0 && <FitBounds decoded={decoded} gasStops={gasStops} />}

        {/* Inactive routes */}
        {decoded
          .filter((r) => r.routeType !== activeRoute)
          .map((r) => (
            <Polyline
              key={r.routeType}
              positions={r.points}
              pathOptions={{ color: ROUTE_COLORS[r.routeType] || '#888', weight: 3, opacity: 0.2 }}
            />
          ))}

        {/* Active route — glow */}
        {decoded
          .filter((r) => r.routeType === activeRoute)
          .map((r) => (
            <Fragment key={`${r.routeType}-group`}>
              <Polyline
                positions={r.points}
                pathOptions={{ color: ROUTE_COLORS[r.routeType] || '#888', weight: 10, opacity: 0.15 }}
              />
              <Polyline
                positions={r.points}
                pathOptions={{ color: ROUTE_COLORS[r.routeType] || '#888', weight: 4, opacity: 1 }}
              />
            </Fragment>
          ))}

        {/* Origin / destination */}
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

        {/* Planned gas stop markers */}
        {plannedStops.map((stop) => (
          <Marker
            key={stop.stopNumber}
            position={
              stop.recommendedStation?.lat != null && stop.recommendedStation?.lng != null
                ? [stop.recommendedStation.lat, stop.recommendedStation.lng]
                : [stop.lat, stop.lng]
            }
            icon={stopIcon(stop.stopNumber)}
          >
            <Tooltip direction="top" offset={[0, -18]} opacity={1}>
              <div style={{
                background: '#0d1017',
                border: '1px solid rgba(20,184,166,0.3)',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 12,
                fontFamily: 'monospace',
                color: '#e5e7eb',
                whiteSpace: 'nowrap',
              }}>
                {stop.recommendedStation
                  ? `${stop.recommendedStation.name} · ${stop.recommendedStation.estimatedPriceCentsPerL}¢/L`
                  : `Stop ${stop.stopNumber}`
                }
              </div>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 180, fontFamily: 'monospace' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  Stop {stop.stopNumber} · {stop.distFromStartKm} km
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
                  Fuel on arrival: {stop.fuelPercentOnArrival}%
                </div>
                {stop.recommendedStation && (
                  <>
                    <div style={{ fontSize: 12, color: '#34d399', fontWeight: 700 }}>
                      ★ {stop.recommendedStation.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#34d399', fontWeight: 700, marginTop: 2 }}>
                      {stop.recommendedStation.estimatedPriceCentsPerL}¢/L
                    </div>
                    {stop.recommendedStation.address && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        {stop.recommendedStation.address}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      +{stop.recommendedStation.detourKm} km detour
                    </div>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>

      {/* Legend */}
      {decoded.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] flex items-center gap-2 flex-wrap">
          <div className="bg-[#0d1017]/95 backdrop-blur border border-white/[0.06] rounded-lg px-3 py-2 flex items-center gap-3 flex-wrap">
            {decoded.map((r) => (
              <div key={r.routeType} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: ROUTE_COLORS[r.routeType] }} />
                <span className="text-[10px] text-gray-500 capitalize font-mono">{r.routeType}</span>
              </div>
            ))}
          </div>

          {plannedStops.length > 0 && (
            <div className="bg-[#0d1017]/95 backdrop-blur border border-teal-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-teal-500/60 flex items-center justify-center">
                <span className="text-[8px] font-bold text-teal-400">1</span>
              </div>
              <span className="text-[10px] text-teal-500 font-mono">fuel stops</span>
            </div>
          )}
        </div>
      )}

      {/* Gas loading indicator */}
      {gasLoading && (
        <div className="absolute top-3 right-3 sm:right-12 z-[1000] bg-[#0d1017]/95 backdrop-blur border border-teal-500/20 rounded-full px-3 py-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[11px] text-teal-400 font-mono">planning stops…</span>
        </div>
      )}
    </div>
  );
}