import { useState, useEffect, useCallback } from 'react';
import MapContainer from '../components/Map/MapContainer';
import LayerControl from '../components/Map/LayerControl';
import HeatmapLayer from '../components/Map/HeatmapLayer';
import IntersectionMarkers from '../components/Intersection/IntersectionMarkers';
import ReportModal from '../components/Intersection/ReportModal';
import ParkingMarkers from '../components/Parking/ParkingMarkers';
import ParkingPanel from '../components/Parking/ParkingPanel';
import BikeSegments from '../components/Bike/BikeSegments';
import BikeFilterPanel from '../components/Bike/BikeFilterPanel';
import { intersectionApi, parkingApi, bikeApi } from '../api';

export default function HomePage() {
  const [activeLayers, setActiveLayers] = useState(['intersections', 'parking', 'bike']);
  const [intersections, setIntersections] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [bikeSegments, setBikeSegments] = useState([]);
  const [bikeMinScore, setBikeMinScore] = useState(0);

  const loadIntersections = useCallback(async () => {
    try {
      const [reportsRes, hotspotsRes] = await Promise.all([
        intersectionApi.getAll(),
        intersectionApi.getHotspots(),
      ]);
      setIntersections(reportsRes.data);
      setHotspots(hotspotsRes.data);
    } catch { /* empty */ }
  }, []);

  const loadParking = useCallback(async () => {
    try {
      const res = await parkingApi.getAll();
      setParkingSpots(res.data);
    } catch { /* empty */ }
  }, []);

  const loadBike = useCallback(async () => {
    try {
      const res = await bikeApi.getSegments({ minScore: bikeMinScore });
      setBikeSegments(res.data);
    } catch { /* empty */ }
  }, [bikeMinScore]);

  useEffect(() => { loadIntersections(); }, [loadIntersections]);
  useEffect(() => { loadParking(); }, [loadParking]);
  useEffect(() => { loadBike(); }, [loadBike]);

  const toggleLayer = (id) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative w-full h-screen">
      <MapContainer>
        <ReportModal onReported={loadIntersections} />

        {activeLayers.includes('intersections') && (
          <IntersectionMarkers reports={intersections} grouped={hotspots} />
        )}

        {activeLayers.includes('heatmap') && (
          <HeatmapLayer points={intersections} />
        )}

        {activeLayers.includes('parking') && (
          <ParkingMarkers spots={parkingSpots} onUpdate={loadParking} />
        )}

        {activeLayers.includes('bike') && (
          <BikeSegments segments={bikeSegments} />
        )}
      </MapContainer>

      <LayerControl activeLayers={activeLayers} onToggle={toggleLayer} />

      {activeLayers.includes('parking') && <ParkingPanel />}

      {activeLayers.includes('bike') && (
        <BikeFilterPanel minScore={bikeMinScore} onMinScoreChange={setBikeMinScore} />
      )}
    </div>
  );
}
