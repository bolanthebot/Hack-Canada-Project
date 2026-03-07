import { useState, useEffect, useCallback } from 'react';
import MapContainer from '../components/Map/MapContainer';
import LayerControl from '../components/Map/LayerControl';
import HeatmapLayer from '../components/Map/HeatmapLayer';
import IntersectionMarkers from '../components/Intersection/IntersectionMarkers';
import ReportModal from '../components/Intersection/ReportModal';
import ParkingMarkers from '../components/Parking/ParkingMarkers';
import BikeSegments from '../components/Bike/BikeSegments';
import BikeFilterPanel from '../components/Bike/BikeFilterPanel';
import RouteLayer from '../components/Map/RouteLayer';
import { intersectionApi, parkingApi, bikeApi, routeApi } from '../api';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [activeLayers, setActiveLayers] = useState(['intersections', 'parking', 'bike']);
  const [intersections, setIntersections] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [bikeSegments, setBikeSegments] = useState([]);
  const [bikeMinScore, setBikeMinScore] = useState(0);
  const [route, setRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [travelMode, setTravelMode] = useState('DRIVE'); // DRIVE or BICYCLE
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => { },
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

  const handleMapClick = async (coords) => {
    if (!userLocation) {
      toast.error('Getting your location... try again in a moment');
      return;
    }

    setLoadingRoute(true);
    try {
      const res = await routeApi.navigate({
        origin: { lat: userLocation[0], lng: userLocation[1] },
        destination: coords,
        travelMode: travelMode,
      });
      // Ensure the route object contains the travelMode for color logic in RouteLayer
      setRoute({ ...res.data, travelMode });
      toast.success(`${travelMode === 'DRIVE' ? 'Car' : 'Bike'} route calculated`);
    } catch (err) {
      toast.error('Could not find a valid route');
    } finally {
      setLoadingRoute(false);
    }
  };

  const toggleLayer = (id) => {
    setActiveLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={userLocation} userLocation={userLocation} onMapClick={handleMapClick}>
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

          {route && <RouteLayer route={route} />}
        </MapContainer>
      </div>

      {/* Floating Mode Toggle Top Left */}
      <div className="absolute top-6 left-6 z-[1001] pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-3">
          <div className="glass-panel rounded-2xl p-1.5 flex bg-white/90 backdrop-blur shadow-xl border border-gray-100 min-w-40 overflow-hidden">
            <button
              onClick={() => {
                setTravelMode('DRIVE');
                if (route) setRoute(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${travelMode === 'DRIVE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="text-sm">🚗</span>
              {!route && <span>Car</span>}
            </button>
            <button
              onClick={() => {
                setTravelMode('BICYCLE');
                if (route) setRoute(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${travelMode === 'BICYCLE' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="text-sm">🚲</span>
              {!route && <span>Bike</span>}
            </button>
          </div>

          <div className="px-4 py-2 bg-white/80 backdrop-blur border border-gray-100 rounded-full shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
              {loadingRoute ? 'Calculating...' : 'Tap map for destination'}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-[1001]">
        <LayerControl activeLayers={activeLayers} onToggle={toggleLayer} />
      </div>

      {/* Active Navigation Bottom Bar */}
      {route && (
        <div className="absolute bottom-10 left-[72px] right-0 flex justify-center z-[1001] pointer-events-none px-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-5 flex items-center justify-between gap-12 pointer-events-auto shadow-2xl border border-white/50 animate-in slide-in-from-bottom duration-500 min-w-[600px]">
            <div className="flex items-center gap-8 pl-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${route.travelMode === 'BICYCLE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                  {route.travelMode === 'BICYCLE' ? '🚲' : '🚗'}
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Navigation</div>
                  <div className="text-sm font-black text-gray-800">Live {route.travelMode === 'BICYCLE' ? 'Bike Route' : 'Driving Path'}</div>
                </div>
              </div>

              <div className="w-[1px] h-10 bg-gray-100"></div>

              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ETA</div>
                  <div className={`text-3xl font-black tabular-nums ${route.travelMode === 'BICYCLE' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                    {route.duration}<span className="text-sm ml-1 font-bold">min</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Distance</div>
                  <div className="text-3xl font-black text-gray-800 tabular-nums">
                    {route.distance.toFixed(1)}<span className="text-sm ml-1 font-bold">km</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pr-2">
              <button
                onClick={() => setRoute(null)}
                className="px-10 py-5 rounded-2xl bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all outline-none"
              >
                Cancel
              </button>
              <button className={`px-12 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all ${route.travelMode === 'BICYCLE'
                ? 'bg-emerald-600 shadow-emerald-500/30 hover:bg-emerald-700'
                : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700'
                }`}>
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Controls */}
      <div className="absolute bottom-6 right-6 pointer-events-none z-[1001]">
        <div className="pointer-events-auto">
          {activeLayers.includes('bike') && (
            <BikeFilterPanel minScore={bikeMinScore} onMinScoreChange={setBikeMinScore} />
          )}
        </div>
      </div>
    </div>
  );
}
