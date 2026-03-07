import { Polyline, Popup } from 'react-leaflet';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts';

function getColor(score) {
  if (score >= 70) return '#34d399';
  if (score >= 50) return '#fbbf24';
  if (score >= 30) return '#fb923c';
  return '#f87171';
}

function getRadarData(segment) {
  const laneScore = segment.hasLane ? 100 : 20;
  const speedScore = Math.max(0, 100 - segment.trafficSpeed);
  const accScore = Math.max(0, 100 - segment.accidentCount * 15);
  const lightScores = { good: 100, moderate: 60, poor: 20 };
  const widthScore = Math.min(100, segment.roadWidth * 25);

  return [
    { factor: 'Lane', value: laneScore },
    { factor: 'Speed', value: speedScore },
    { factor: 'Crashes', value: accScore },
    { factor: 'Light', value: lightScores[segment.lighting] || 60 },
    { factor: 'Width', value: widthScore },
  ];
}

export default function BikeSegments({ segments }) {
  return segments.map((seg) => {
    const positions = seg.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const color = getColor(seg.safetyScore);

    return (
      <Polyline
        key={seg._id}
        positions={positions}
        pathOptions={{ color, weight: 4, opacity: 0.75 }}
      >
        <Popup minWidth={230}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{seg.name}</div>
            <div style={{ color, fontWeight: 600, fontSize: 12, marginBottom: 8 }}>
              {seg.safetyScore}/100
            </div>
            <div style={{ width: 210, height: 150 }}>
              <ResponsiveContainer>
                <RadarChart data={getRadarData(seg)}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', gap: 8 }}>
              <span>{seg.hasLane ? 'Has bike lane' : 'No dedicated lane'}</span>
              <span>{seg.trafficSpeed} km/h avg</span>
            </div>
          </div>
        </Popup>
      </Polyline>
    );
  });
}
