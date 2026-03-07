import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points, options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatData = points.map((p) => [
      p.location.coordinates[1],
      p.location.coordinates[0],
      p.severity || 3,
    ]);

    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 20,
      maxZoom: 17,
      max: 5,
      gradient: {
        0.2: '#22c55e',
        0.4: '#eab308',
        0.6: '#f97316',
        0.8: '#ef4444',
        1.0: '#dc2626',
      },
      ...options,
    });

    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [map, points, options]);

  return null;
}
