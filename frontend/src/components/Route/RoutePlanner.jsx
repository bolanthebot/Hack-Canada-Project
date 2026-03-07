import { useState } from 'react';
import { routeApi } from '../../api';
import toast from 'react-hot-toast';
import RouteResults from './RouteResults';
import RouteMap from './RouteMap';

const PRESETS = [
  { label: 'Mississauga to Downtown Toronto', origin: 'Mississauga, ON', destination: 'Downtown Toronto, ON' },
  { label: 'Scarborough to Downtown Toronto', origin: 'Scarborough, ON', destination: 'Downtown Toronto, ON' },
  { label: 'North York to Downtown Toronto', origin: 'North York, ON', destination: 'Downtown Toronto, ON' },
];

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold";

export default function RoutePlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [fuelType, setFuelType] = useState('regular');
  const [fuelEfficiency, setFuelEfficiency] = useState('10');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState('fastest');

  const applyPreset = (preset) => {
    setOrigin(preset.origin);
    setDestination(preset.destination);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      toast.error('Enter both origin and destination');
      return;
    }
    setLoading(true);
    try {
      const res = await routeApi.plan({
        origin: origin.trim(),
        destination: destination.trim(),
        fuelType,
        fuelEfficiency: parseFloat(fuelEfficiency),
      });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not calculate routes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 lg:p-12 bg-gray-50/30">
      <div className="max-w-[1240px] mx-auto">
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Advanced Route Logic</span>
          </div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight leading-none mb-3">
            Smart Route Planner
          </h1>
          <p className="text-sm font-semibold text-gray-400 max-w-lg">
            Compare routes optimized for speed, cost, or safety — powered by Google Maps and UrbanFlow real-time data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="mb-8">
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">
                  Common destinations
                </div>
                <div className="space-y-2">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => applyPreset(p)}
                      className="w-full text-left text-xs font-bold text-gray-500 hover:text-blue-600 py-3 px-4 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-50 mb-8" />

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="OriginPoint">
                  <input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Mississauga, ON"
                    className={inputCls}
                  />
                </Field>

                <Field label="DestinationPoint">
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Downtown Toronto, ON"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Fuel Type">
                    <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={inputCls}>
                      <option value="regular">Regular</option>
                      <option value="premium">Premium</option>
                      <option value="diesel">Diesel</option>
                    </select>
                  </Field>

                  <Field label="Km / Litre">
                    <input type="number" value={fuelEfficiency} onChange={(e) => setFuelEfficiency(e.target.value)} className={inputCls} />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-black py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all mt-4 active:scale-95"
                >
                  {loading ? 'Analyzing Data...' : 'Compare Routes'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <RouteMap
              routes={result?.routes || []}
              activeRoute={activeRoute}
            />

            {result ? (
              <RouteResults
                result={result}
                activeRoute={activeRoute}
                onRouteHover={setActiveRoute}
              />
            ) : (
              <div className="bg-white border border-gray-100 border-dashed rounded-[3rem] h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </div>
                  <div className="text-gray-800 font-black text-sm mb-1 uppercase tracking-widest">No routes calculated</div>
                  <div className="text-gray-400 font-bold text-xs">Enter your commute details to begin comparison</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
