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

const inputCls = "w-full bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-2 text-[13px] text-gray-200 focus:outline-none focus:border-teal-500/40 font-mono";

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
    <div className="min-h-screen p-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-100 mb-1">Route planner</h1>
          <p className="text-sm text-gray-500">
            Compare routes optimized for speed, cost, or safety — powered by Google Maps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-[#12151c] rounded-lg p-5">
              <div className="mb-5">
                <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wide mb-2">
                  Common routes
                </div>
                <div className="space-y-1">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => applyPreset(p)}
                      className="w-full text-left text-[12px] text-gray-400 hover:text-gray-200 py-1.5 px-2.5 rounded hover:bg-white/[0.04] transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/[0.04] mb-5" />

              <form onSubmit={handleSubmit} className="space-y-3">
                <Field label="Origin">
                  <input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Mississauga, ON"
                    className={inputCls}
                  />
                </Field>

                <Field label="Destination">
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Downtown Toronto, ON"
                    className={inputCls}
                  />
                </Field>

                <Field label="Fuel type">
                  <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={inputCls}>
                    <option value="regular">Regular</option>
                    <option value="premium">Premium</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </Field>

                <Field label="Fuel efficiency (km/L)">
                  <input type="number" value={fuelEfficiency} onChange={(e) => setFuelEfficiency(e.target.value)} className={inputCls} />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-[13px] font-medium py-2.5 rounded transition-colors mt-2"
                >
                  {loading ? 'Calculating...' : 'Compare routes'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
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
              <div className="bg-[#12151c] rounded-lg h-40 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-600 text-sm mb-1">No routes calculated yet</div>
                  <div className="text-gray-700 text-xs">Pick a common route or enter an address</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
