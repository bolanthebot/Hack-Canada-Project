import { useState } from 'react';
import { routeApi } from '../../api';
import toast from 'react-hot-toast';
import RouteResults from './RouteResults';

const PRESETS = [
  { label: 'Mississauga to Downtown', origin: [-79.6441, 43.5890], destination: [-79.3832, 43.6532] },
  { label: 'Scarborough to Downtown', origin: [-79.2318, 43.7731], destination: [-79.3832, 43.6532] },
  { label: 'North York to Downtown', origin: [-79.4149, 43.7615], destination: [-79.3832, 43.6532] },
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
  const [originLng, setOriginLng] = useState('-79.6441');
  const [originLat, setOriginLat] = useState('43.5890');
  const [destLng, setDestLng] = useState('-79.3832');
  const [destLat, setDestLat] = useState('43.6532');
  const [fuelType, setFuelType] = useState('regular');
  const [fuelEfficiency, setFuelEfficiency] = useState('10');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    setOriginLng(String(preset.origin[0]));
    setOriginLat(String(preset.origin[1]));
    setDestLng(String(preset.destination[0]));
    setDestLat(String(preset.destination[1]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await routeApi.plan({
        origin: [parseFloat(originLng), parseFloat(originLat)],
        destination: [parseFloat(destLng), parseFloat(destLat)],
        fuelType,
        fuelEfficiency: parseFloat(fuelEfficiency),
      });
      setResult(res.data);
    } catch {
      toast.error('Could not calculate routes');
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
            Compare routes optimized for speed, cost, or safety
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
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Origin lat">
                    <input value={originLat} onChange={(e) => setOriginLat(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Origin lng">
                    <input value={originLng} onChange={(e) => setOriginLng(e.target.value)} className={inputCls} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Destination lat">
                    <input value={destLat} onChange={(e) => setDestLat(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Destination lng">
                    <input value={destLng} onChange={(e) => setDestLng(e.target.value)} className={inputCls} />
                  </Field>
                </div>

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

          <div className="lg:col-span-8">
            {result ? (
              <RouteResults result={result} />
            ) : (
              <div className="bg-[#12151c] rounded-lg h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-600 text-sm mb-1">No routes calculated yet</div>
                  <div className="text-gray-700 text-xs">Pick a common route or enter coordinates</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
