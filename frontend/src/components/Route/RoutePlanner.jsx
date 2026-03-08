import CarbonComparison from './CarbonComparison';
import { useState } from 'react';
import { routeApi } from '../../api';
import toast from 'react-hot-toast';
import RouteResults from './RouteResults';
import RouteMap from './RouteMap';

const inputCls = `
  w-full bg-transparent border-0 border-b border-white/10 px-0 py-2.5
  text-[13px] text-gray-100 placeholder-gray-600
  focus:outline-none focus:border-teal-400/60
  transition-colors duration-200 font-mono tracking-wide
`;

const labelCls = "block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-1";

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
      className={`relative inline-flex h-[22px] w-10 items-center rounded-full transition-all duration-300 ${on ? 'bg-teal-500' : 'bg-white/[0.07]'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full shadow-md transition-transform duration-300 ${on ? 'translate-x-5 bg-white' : 'translate-x-1 bg-gray-500'
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-teal-500 font-semibold mb-2">
              Navigation
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Route Planner</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Speed / Cost / Safety
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-5 text-[11px] text-gray-600 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />fastest</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />cheapest</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" />safest</span>
          </div>
        </div>
        <div className="mt-5 h-px bg-gradient-to-r from-teal-500/40 via-white/5 to-transparent" />
      </div>

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-[#0d1017] border border-white/[0.05] rounded-xl overflow-hidden top-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
              <Field label="Origin">
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="From..."
                  className={inputCls}
                />
              </Field>

              <Field label="Destination">
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="To..."
                  className={inputCls}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Fuel">
                  <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={inputCls}>
                    <option value="regular">Regular</option>
                    <option value="premium">Premium</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </Field>
                <Field label="km/L">
                  <input
                    type="number"
                    value={fuelEfficiency}
                    onChange={(e) => setFuelEfficiency(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Gas toggle */}
              <div className="pt-1 border-t border-white/[0.04]">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className={labelCls}>Find gas stops</div>
                    <div className="text-[11px] text-gray-600">Show stations along route</div>
                  </div>
                  <Toggle on={findGas} onToggle={() => setFindGas((v) => !v)} />
                </div>

                {findGas && (
                  <div className="mt-3 pl-3 border-l-2 border-teal-500/30 space-y-4">
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
                className="w-full mt-1 py-3 rounded-lg text-[13px] font-bold tracking-wide
                  bg-teal-500 hover:bg-teal-400 active:scale-[0.98]
                  disabled:opacity-30 disabled:cursor-not-allowed
                  text-[#080a0f] transition-all duration-200
                  shadow-[0_0_24px_rgba(20,184,166,0.3)] hover:shadow-[0_0_32px_rgba(20,184,166,0.5)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Calculating…
                  </span>
                ) : (
                  'Compare routes →'
                )}
              </button>
            </form>
          </div>
          {/* Carbon Cost Navigator */}
          <div className="px-5 py-5 border-t border-white/[0.04]">
            <CarbonComparison
              defaultOrigin={origin}
              defaultDestination={destination}
            />
          </div>

        </div>

        {/* Main content */}
        <div className="lg:col-span-9 space-y-5">
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
            <div className="bg-[#0d1017] border border-white/[0.04] rounded-xl h-36 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-3 opacity-20">⤢</div>
                <div className="text-gray-600 text-[13px]">No routes calculated yet</div>
                <div className="text-gray-700 text-[11px] mt-1">Pick a preset or enter addresses above</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}