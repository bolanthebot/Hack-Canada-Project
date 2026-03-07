import { useState, useEffect, useRef } from 'react';
import { routeApi } from '../../api';
import toast from 'react-hot-toast';

const MODES = [
  { id: 'DRIVE', label: 'Car', icon: '🚗' },
  { id: 'BICYCLE', label: 'Bike', icon: '🚲' },
  { id: 'WALK', label: 'Walk', icon: '🚶' },
];

export default function RouteSearchPanel({ userLocation, clickedDest, onRouteFound, onRouteClear }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVE');
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [destCoords, setDestCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevClickRef = useRef(null);

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
    <div className="absolute top-4 left-4 z-[1000] glass-panel rounded-2xl p-4 w-[320px] animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-100 tracking-tight">Plan Your Journey</h2>
        {route && (
          <button
            onClick={handleClear}
            className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal-500"></div>
          <div className="absolute left-[15px] top-full h-3 w-px bg-white/10 group-last:hidden"></div>
          <div className="flex gap-2 pl-6">
            <input
              value={origin}
              onChange={handleOriginChange}
              onKeyDown={handleKeyDown}
              placeholder="Starting point"
              className="input-base w-full pr-10"
            />
            <button
              onClick={handleUseMyLocation}
              title="Use my location"
              className={`absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${useMyLocation
                  ? 'text-teal-400'
                  : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-rose-500"></div>
          <div className="flex gap-2 pl-6">
            <input
              value={destination}
              onChange={handleDestChange}
              onKeyDown={handleKeyDown}
              placeholder="Where to?"
              className="input-base w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setTravelMode(m.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${travelMode === m.id
                ? 'bg-teal-500/20 border-teal-500/30 text-teal-400 shadow-sm'
                : 'bg-white/[0.04] border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.08]'
              }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center h-11"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Calculating...</span>
          </div>
        ) : (
          <span>Get Directions</span>
        )}
      </button>

      {route && (
        <div className="mt-6 pt-4 border-t border-white/[0.06] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[20px] font-bold text-gray-100">{route.duration} <span className="text-sm font-medium text-gray-500">min</span></div>
              <div className="text-sm text-gray-400 font-medium">{route.distance} km</div>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Route Safety</div>
              <div className="text-xs font-bold text-emerald-500">Optimized</div>
            </div>
          </div>

          {route.description && (
            <div className="p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
              <div className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-1.5">Overview</div>
              <div className="text-xs text-gray-300 leading-relaxed font-medium capitalize prose prose-invert">{route.description}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
