import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function getRiskColor(severity) {
  if (severity >= 4) return '#f87171';
  if (severity >= 2) return '#fbbf24';
  return '#6bd192ff';
}

function createIcon(color) {
  return L.divIcon({
    html: `<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" fill="${color}" opacity="0.9"/><circle cx="10" cy="10" r="8" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.3"/></svg>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const TYPE_LABELS = {
  near_miss: 'Near miss',
  cyclist_conflict: 'Cyclist conflict',
  pedestrian_conflict: 'Pedestrian conflict',
  aggressive_driver: 'Aggressive driving',
};

export default function IntersectionMarkers({ reports, grouped }) {
  if (grouped && grouped.length > 0) {
    return grouped.map((g, i) => (
      <Marker
        key={`g-${i}`}
        position={[g._id.lat, g._id.lng]}
        icon={createIcon(getRiskColor(g.avgSeverity))}
      >
        <Popup>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{g.count} report{g.count !== 1 ? 's' : ''} here</div>
            <div style={{ color: '#6b7280', fontSize: 12 }}>
              Avg severity: {g.avgSeverity?.toFixed(1)}/5
            </div>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
              {[...new Set(g.types)].map((t) => TYPE_LABELS[t]).join(' / ')}
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  }

  return reports.map((r) => (
    <Marker
      key={r._id}
      position={[r.location.coordinates[1], r.location.coordinates[0]]}
      icon={createIcon(getRiskColor(r.severity))}
    >
      <Popup>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{TYPE_LABELS[r.reportType]}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>Severity: {r.severity}/5</div>
          {r.description && (
            <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
              "{r.description}"
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  ));
}
