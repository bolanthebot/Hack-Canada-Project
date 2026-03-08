import { useState, useEffect, useCallback } from 'react';
import MapContainer from '../components/Map/MapContainer';
import LayerControl from '../components/Map/LayerControl';
import HeatmapLayer from '../components/Map/HeatmapLayer';
import IntersectionMarkers from '../components/Intersection/IntersectionMarkers';
import ReportModal from '../components/Intersection/ReportModal';
import ParkingMarkers from '../components/Parking/ParkingMarkers';
import BikeSegments from '../components/Bike/BikeSegments';
import BikeFilterPanel from '../components/Bike/BikeFilterPanel';
import RouteSearchPanel from '../components/Map/RouteSearchPanel';
import RouteLayer from '../components/Map/RouteLayer';
import { intersectionApi, parkingApi, bikeApi } from '../api';

export default function HomePage() {
  const [activeLayers, setActiveLayers] = useState(['intersections','heatmap']);
  const [intersections, setIntersections] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [bikeSegments, setBikeSegments] = useState([]);
  const [bikeMinScore, setBikeMinScore] = useState(0);
  const [route, setRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [clickedDest, setClickedDest] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  const loadIntersections = useCallback(async () => {
    try {
      const [reportsRes, hotspotsRes] = await Promise.all([
        intersectionApi.getAll(),
        intersectionApi.getHotspots(),
      ]);
      setIntersections(reportsRes.data);
      setHotspots(hotspotsRes.data);
    } catch { console.log("Intersection data didn't load") }
  }, []);

  const loadParking = useCallback(async () => {
    try {
      const res = await parkingApi.getAll();
      setParkingSpots(res.data);
    } catch { console.log("Parking data didn't load") }
  }, []);

  const loadBike = useCallback(async () => {
    try {
      const res = await bikeApi.getSegments({ minScore: bikeMinScore });
      setBikeSegments(res.data);
    } catch { console.log("Bike data didn't load") }
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
    <div className="relative w-full h-[100dvh]">
      <MapContainer center={userLocation} userLocation={userLocation} onMapClick={setClickedDest}>
        <ReportModal onReported={loadIntersections} />

        {activeLayers.includes('intersections') && (
          <IntersectionMarkers reports={intersections} grouped={hotspots} />
        )}

        {activeLayers.includes('heatmap') && (
          <HeatmapLayer points={intersections} />
        )}

        {activeLayers.includes('greenp') && (
          <ParkingMarkers 
             spots={parkingSpots.filter(spot => spot.source === 'green_p')} 
             onUpdate={loadParking} 
          />
        )}

        {activeLayers.includes('street_parking') && (
          <ParkingMarkers 
             spots={parkingSpots.filter(spot => spot.source === 'user_reported')} 
             onUpdate={loadParking} 
          />
        )}

        {activeLayers.includes('bike') && (
          <BikeSegments segments={bikeSegments} />
        )}

        {route && <RouteLayer route={route} />}
      </MapContainer>

      <RouteSearchPanel
        userLocation={userLocation}
        clickedDest={clickedDest}
        onRouteFound={setRoute}
        onRouteClear={() => setRoute(null)}
      />

      <LayerControl activeLayers={activeLayers} onToggle={toggleLayer} />

      {activeLayers.includes('bike') && (
        <BikeFilterPanel minScore={bikeMinScore} onMinScoreChange={setBikeMinScore} />
      )}
    </div>
  );
}
