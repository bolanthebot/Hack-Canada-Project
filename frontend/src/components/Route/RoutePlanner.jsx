import CarbonComparison from './CarbonComparison';
import MarketIntelligence from './MarketIntelligence';
import { useState } from 'react';
import { routeApi } from '../../api';
import toast from 'react-hot-toast';
import RouteResults from './RouteResults';
import RouteMap from './RouteMap';

const PRESETS = [
  { label: 'Mississauga → Toronto', origin: 'Mississauga, ON', destination: 'Downtown Toronto, ON' },
  { label: 'Scarborough → Toronto', origin: 'Scarborough, ON', destination: 'Downtown Toronto, ON' },
  { label: 'North York → Toronto', origin: 'North York, ON', destination: 'Downtown Toronto, ON' },
];

const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold";
const labelCls = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 px-1";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${on ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-100'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-300 ${on ? 'translate-x-6 bg-white' : 'translate-x-1 bg-gray-400'
          }`}
      />
    </button>
  );
}

export default function RoutePlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [fuelType, setFuelType] = useState('regular');
  const [fuelEfficiency, setFuelEfficiency] = useState('10');

  const [findGas, setFindGas] = useState(false);
  const [tankKm, setTankKm] = useState('500');
  const [currentFuelPercent, setCurrentFuelPercent] = useState('100');
  const [gasStops, setGasStops] = useState(null);
  const [gasLoading, setGasLoading] = useState(false);

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
    setGasStops(null);
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
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }

    if (findGas) {
      setGasLoading(true);
      try {
        const gasRes = await routeApi.getGasStops({
          origin: origin.trim(),
          destination: destination.trim(),
          tankKm: parseFloat(tankKm) || 500,
          currentFuelPercent: parseFloat(currentFuelPercent) || 100,
        });
        setGasStops(gasRes.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Could not fetch gas stops');
      } finally {
        setGasLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080a0f] p-4 sm:p-6 lg:p-10">
      {/* Page header */}
      <div className="max-w-[1200px] mx-auto mb-8">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-teal-500 font-semibold mb-2">
              Navigation
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Route Planner</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Speed · Cost · Safety — powered by Google Maps
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-5 text-[11px] text-gray-600 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />fastest</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />cheapest</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" />safest</span>
          </div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight leading-none mb-3">
            Smart Route Planner
          </h1>
          <p className="text-sm font-semibold text-gray-400 max-w-lg leading-relaxed">
            Compare routes optimized for speed, cost, or safety — powered by Google Maps and UrbanFlow real-time data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Area */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit space-y-8">
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Origin Point">
                  <input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Mississauga, ON"
                    className={inputCls}
                  />
                </Field>

                <Field label="Destination Point">
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
                    <input
                      type="number"
                      value={fuelEfficiency}
                      onChange={(e) => setFuelEfficiency(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Gas Logic Integration */}
                <div className="pt-2 border-t border-gray-50">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Find gas stops</div>
                      <div className="text-[10px] font-bold text-gray-300 uppercase mt-0.5">Along proposed route</div>
                    </div>
                    <Toggle on={findGas} onToggle={() => setFindGas(!findGas)} />
                  </div>

                  {findGas && (
                    <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <Field label="Tank range (km)">
                        <input
                          type="number"
                          value={tankKm}
                          onChange={(e) => setTankKm(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Current fuel %">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={currentFuelPercent}
                          onChange={(e) => setCurrentFuelPercent(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all mt-4 active:scale-95"
                >
                  {loading ? 'Analyzing Grid Data...' : 'Compare Routes →'}
                </button>
              </form>
            </div>
          </div>

          {/* Main Visualizer Area */}
          <div className="lg:col-span-8 space-y-10">
            <RouteMap
              routes={result?.routes || []}
              activeRoute={activeRoute}
              gasStops={gasStops?.stations || []}
              gasLoading={gasLoading}
            />

            {result ? (
              <RouteResults
                result={result}
                activeRoute={activeRoute}
                onRouteHover={setActiveRoute}
                gasStops={gasStops}
                gasLoading={gasLoading}
              />
            ) : (
              <div className="bg-white border border-gray-100 border-dashed rounded-[3rem] h-[500px] flex items-center justify-center animate-pulse">
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-12 group-hover:rotate-0 transition-transform">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </div>
                  <div className="text-gray-900 font-black text-sm mb-2 uppercase tracking-[0.3em]">No Intelligence Proposed</div>
                  <p className="text-gray-400 font-bold text-xs max-w-[240px] mx-auto leading-relaxed uppercase opacity-60">
                    Configure your origin and destination endpoints to begin neural route processing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}