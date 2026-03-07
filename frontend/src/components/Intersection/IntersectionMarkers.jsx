import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const RISK_LEVELS = {
  high: { color: '#f43f5e', label: 'High Risk' },
  med: { color: '#f59e0b', label: 'Moderate Risk' },
  low: { color: '#10b981', label: 'Low Risk' },
};

function getRiskLevel(count) {
  if (count >= 5) return RISK_LEVELS.high;
  if (count >= 2) return RISK_LEVELS.med;
  return RISK_LEVELS.low;
}

function createIcon(level) {
  return L.divIcon({
    html: `
      <div class="marker-pulse" style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${level.color};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      "></div>
    `,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const TYPE_LABELS = {
  near_miss: 'Near Miss',
  cyclist_conflict: 'Cyclist Conflict',
  pedestrian_conflict: 'Pedestrian Conflict',
  aggressive_driver: 'Aggressive Driving',
};

function IntersectionPopup({ count, avgSeverity, types, reportType, severity, description }) {
  const isHighRisk = count >= 5 || severity >= 5;
  return (
    <div className="p-1 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isHighRisk ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
        <div className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">
          Safety Alert
        </div>
      </div>

      <div className="text-sm font-bold text-[#1f2937] mb-1">
        {count ? `${count} Incident Reports` : TYPE_LABELS[reportType]}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-[#6b7280] uppercase">Severity</span>
        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-[#4b5563]">
          {(avgSeverity || severity || 0).toFixed(1)} / 5
        </span>
      </div>

      {(types || description) && (
        <div className="pt-2 border-t border-gray-100 text-[10px] text-[#9ca3af] italic leading-relaxed">
          {types ? [...new Set(types)].map(t => TYPE_LABELS[t]).join(' • ') : `"${description}"`}
        </div>
      )}
    </div>
  );
}

export default function IntersectionMarkers({ reports, grouped }) {
  if (grouped && grouped.length > 0) {
    return grouped.map((g, i) => (
      <Marker
        key={`g-${i}`}
        position={[g._id.lat, g._id.lng]}
        icon={createIcon(getRiskLevel(g.count))}
      >
        <Popup>
          <IntersectionPopup
            count={g.count}
            avgSeverity={g.avgSeverity}
            types={g.types}
          />
        </Popup>
      </Marker>
    ));
  }

  return reports.map((r) => (
    <Marker
      key={r._id}
      position={[r.location.coordinates[1], r.location.coordinates[0]]}
      icon={createIcon(getRiskLevel(r.severity))}
    >
      <Popup>
        <IntersectionPopup
          reportType={r.reportType}
          severity={r.severity}
          description={r.description}
        />
      </Popup>
    </Marker>
  ));
}
