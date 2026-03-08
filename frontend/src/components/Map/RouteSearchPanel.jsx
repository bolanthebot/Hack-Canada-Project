import { useState, useEffect, useRef } from 'react';
import { routeApi } from '../../api';
import toast from 'react-hot-toast';

const MODES = [
  { id: 'DRIVE', label: 'Car' },
  { id: 'BICYCLE', label: 'Bike' },
  { id: 'WALK', label: 'Walk' },
];

const inputCls =
  'w-full bg-white/[0.06] border border-white/[0.08] rounded px-2.5 py-1.5 text-[12px] text-gray-200 focus:outline-none focus:border-teal-500/50 placeholder:text-gray-600';

export default function RouteSearchPanel({ userLocation, clickedDest, onRouteFound, onRouteClear }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVE');
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [destCoords, setDestCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevClickRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!clickedDest || clickedDest === prevClickRef.current) return;
    prevClickRef.current = clickedDest;
    const label = `${clickedDest.lat.toFixed(5)}, ${clickedDest.lng.toFixed(5)}`;
    setDestination(label);
    setDestCoords(clickedDest);
  }, [clickedDest]);

  const handleUseMyLocation = () => {
    if (!userLocation) {
      toast.error('Location not available — check browser permissions');
      return;
    }
    setOrigin('My location');
    setUseMyLocation(true);
  };

  const handleOriginChange = (e) => {
    setOrigin(e.target.value);
    setUseMyLocation(false);
  };

  const handleDestChange = (e) => {
    setDestination(e.target.value);
    setDestCoords(null);
  };

  const handleSearch = async () => {
    if ((!origin.trim() && !useMyLocation) || !destination.trim()) {
      toast.error('Enter origin and destination');
      return;
    }
    setLoading(true);
    try {
      const originPayload = useMyLocation
        ? { lat: userLocation[0], lng: userLocation[1] }
        : origin.trim();

      const destPayload = destCoords || destination.trim();

      const res = await routeApi.navigate({
        origin: originPayload,
        destination: destPayload,
        travelMode,
      });
      setRoute(res.data);
      onRouteFound?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not find route');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRoute(null);
    onRouteClear?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-auto z-[1000] bg-[#161a23]/90 backdrop-blur-sm rounded-lg p-3 shadow-lg w-auto sm:w-[260px] max-w-[calc(100vw-1rem)]">
      <div 
        className={`text-[11px] text-gray-500 font-medium uppercase tracking-wide cursor-pointer flex justify-between items-center ${isMinimized ? '' : 'mb-2'}`}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <span>Route</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isMinimized ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </div>

      {!isMinimized && (
        <>
          <div className="space-y-2 mb-3">
        <div>
          <div className="flex gap-1">
            <input
              value={origin}
              onChange={handleOriginChange}
              onKeyDown={handleKeyDown}
              placeholder="Origin"
              className={inputCls}
            />
            <button
              onClick={handleUseMyLocation}
              title="Use my location"
              className={`shrink-0 w-[30px] flex items-center justify-center rounded border transition-colors ${
                useMyLocation
                  ? 'bg-teal-600/30 border-teal-500/50 text-teal-400'
                  : 'bg-white/[0.06] border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/[0.15]'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </button>
          </div>
        </div>
        <input
          value={destination}
          onChange={handleDestChange}
          onKeyDown={handleKeyDown}
          placeholder="Destination — or click on map"
          className={inputCls}
        />
      </div>

      <div className="flex gap-1 mb-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setTravelMode(m.id)}
            className={`flex-1 text-[11px] font-medium py-1.5 rounded transition-colors ${
              travelMode === m.id
                ? 'bg-teal-600 text-white'
                : 'bg-white/[0.05] text-gray-400 hover:text-gray-200 hover:bg-white/[0.08]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-[12px] font-medium py-2 rounded transition-colors"
      >
        {loading ? 'Finding...' : 'Get route'}
      </button>

      {route && (
        <>
          <div className="h-px bg-white/[0.06] my-3" />
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-gray-200 font-medium">{route.distance} km</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-200 font-medium">{route.duration} min</span>
            </div>
            <button
              onClick={handleClear}
              className="text-gray-600 hover:text-gray-300 text-[11px] transition-colors"
            >
              Clear
            </button>
          </div>
          {route.description && (
            <div className="text-[10px] text-gray-600">{route.description}</div>
          )}
        </>
      )}
        </>
      )}
    </div>
  );
}
