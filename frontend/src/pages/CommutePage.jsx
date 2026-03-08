import { useState } from 'react';
import { routeApi } from '../api';

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

function BigStat({ icon, label, value, sub, color = 'teal', pulse = false }) {
    const colors = {
        teal: { val: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/[0.04]', glow: 'shadow-[0_0_40px_rgba(20,184,166,0.08)]' },
        red: { val: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/[0.04]', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.08)]' },
        emerald: { val: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.04]', glow: 'shadow-[0_0_40px_rgba(52,211,153,0.08)]' },
    };
    const c = colors[color];
    return (
        <div className={`relative rounded-2xl border ${c.border} ${c.bg} ${c.glow} p-6 overflow-hidden`}>
            {pulse && (
                <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${color === 'teal' ? 'bg-teal-400' : color === 'emerald' ? 'bg-emerald-400' : 'bg-red-400'}`}>
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-60 ${color === 'teal' ? 'bg-teal-400' : color === 'emerald' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </div>
            )}
            <div className="text-2xl mb-3">{icon}</div>
            <div className={`text-[32px] font-bold tabular-nums leading-none ${c.val} mb-1`}>{value}</div>
            <div className="text-[12px] font-semibold text-gray-300 mt-2">{label}</div>
            {sub && <div className="text-[11px] text-gray-600 mt-1">{sub}</div>}
        </div>
    );
}

function BreakdownRow({ label, perTrip, perMonth, perYear, color = 'text-gray-300' }) {
    return (
        <div className="grid grid-cols-4 gap-4 py-2.5 border-b border-white/[0.03] last:border-0">
            <div className="text-[12px] text-gray-500">{label}</div>
            <div className={`text-[12px] font-mono tabular-nums text-right ${color}`}>{perTrip}</div>
            <div className={`text-[12px] font-mono tabular-nums text-right ${color}`}>{perMonth}</div>
            <div className={`text-[12px] font-mono tabular-nums text-right ${color}`}>{perYear}</div>
        </div>
    );
}

export default function CommutePage() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [daysPerWeek, setDaysPerWeek] = useState('5');
    const [fuelEfficiency, setFuelEfficiency] = useState('10');

    const [result, setResult] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [view, setView] = useState('trip'); // trip | month | year

    const handleSubmit = async () => {
        if (!origin.trim() || !destination.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setForecast(null);

        try {
            const [compareRes, forecastRes] = await Promise.allSettled([
                routeApi.compare({ origin: origin.trim(), destination: destination.trim(), fuelEfficiencyLpkm: parseFloat(fuelEfficiency) || 10 }),
                routeApi.priceForecast({ city: 'toronto' }),
            ]);

            if (compareRes.status === 'fulfilled') {
                setResult(compareRes.value.data);
            } else {
                throw new Error(compareRes.reason?.response?.data?.error || 'Could not calculate commute');
            }
            if (forecastRes.status === 'fulfilled') {
                setForecast(forecastRes.value.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Annual calculations
    const days = parseFloat(daysPerWeek) || 5;
    const tripsPerYear = days * 52 * 2; // round trips
    const weeksPerMonth = 52 / 12;
    const tripsPerMonth = days * weeksPerMonth * 2;

    let annual = null;
    if (result) {
        const d = result.driving;
        const fuelPerTrip = d.fuelCostCAD;
        const carbonTaxPerTrip = d.carbonTaxCAD;
        const totalPerTrip = d.totalCostCAD;

        // Price forecast adjustment
        const forecastDelta = forecast?.forecast?.combinedDeltaCents ?? 0;
        const priceIncreasePercent = forecastDelta / (d.gasPriceCentsPerL || 170);
        const projectedAnnualIncrease = fuelPerTrip * tripsPerYear * priceIncreasePercent;

        const annualFuel = fuelPerTrip * tripsPerYear;
        const annualCarbon = carbonTaxPerTrip * tripsPerYear;
        const annualTotal = totalPerTrip * tripsPerYear;
        const annualCO2 = d.carbonKg * tripsPerYear;

        // Cycling savings
        const cyclingSaved = annualTotal;
        const caloriesPerKm = 40; // kcal/km average
        const annualCalories = result.cycling.distanceKm * tripsPerYear * caloriesPerKm;
        const treesEquivalent = Math.round(annualCO2 / 21.77); // 1 tree absorbs ~21.77kg CO2/year

        annual = {
            fuelPerTrip, carbonTaxPerTrip, totalPerTrip,
            annualFuel, annualCarbon, annualTotal, annualCO2,
            cyclingSaved, annualCalories, treesEquivalent,
            projectedAnnualIncrease,
            tripsPerYear, tripsPerMonth,
            monthlyFuel: fuelPerTrip * tripsPerMonth,
            monthlyCarbon: carbonTaxPerTrip * tripsPerMonth,
            monthlyTotal: totalPerTrip * tripsPerMonth,
        };
    }

    const fmt = (n) => `$${n.toFixed(2)}`;
    const fmtK = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

    return (
        <div className="min-h-screen bg-[#080a0f] p-6 lg:p-10">
            <div className="max-w-[1100px] mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-teal-500 font-semibold mb-2">
                        Commute Intelligence
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Annual Commute Cost</h1>
                    <p className="text-[13px] text-gray-500 mt-1">
                        See what your daily commute actually costs per year — and what you'd save by cycling
                    </p>
                    <div className="mt-5 h-px bg-gradient-to-r from-teal-500/40 via-white/5 to-transparent" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#0d1017] border border-white/[0.05] rounded-xl overflow-hidden sticky top-6">
                            <div className="px-5 py-4 border-b border-white/[0.04]">
                                <div className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold">
                                    Your commute
                                </div>
                            </div>
                            <div className="px-5 py-5 space-y-5">
                                <Field label="Origin">
                                    <input
                                        value={origin}
                                        onChange={(e) => setOrigin(e.target.value)}
                                        placeholder="Home address..."
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Destination">
                                    <input
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="Work address..."
                                        className={inputCls}
                                    />
                                </Field>
                                <Field label="Days per week">
                                    <select value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} className={inputCls}>
                                        {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
                                    </select>
                                </Field>
                                <Field label="Fuel efficiency (km/L)">
                                    <input
                                        type="number"
                                        value={fuelEfficiency}
                                        onChange={(e) => setFuelEfficiency(e.target.value)}
                                        className={inputCls}
                                    />
                                </Field>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !origin.trim() || !destination.trim()}
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
                                    ) : 'Calculate →'}
                                </button>

                                {error && (
                                    <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-9 space-y-5">
                        {!result && !loading && (
                            <div className="bg-[#0d1017] border border-white/[0.04] rounded-xl h-48 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-3 opacity-20">⤢</div>
                                    <div className="text-gray-600 text-[13px]">Enter your commute to see annual costs</div>
                                    <div className="text-gray-700 text-[11px] mt-1">Origin, destination, days per week</div>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="bg-[#0d1017] border border-white/[0.04] rounded-xl h-48 flex items-center justify-center">
                                <div className="flex items-center gap-3 text-gray-500 text-[13px]">
                                    <div className="w-4 h-4 border-2 border-gray-600 border-t-teal-400 rounded-full animate-spin" />
                                    Analysing your commute…
                                </div>
                            </div>
                        )}

                        {result && annual && (
                            <>
                                {/* Big 3 stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <BigStat
                                        icon="🚗"
                                        label="Annual driving cost"
                                        value={fmtK(annual.annualTotal)}
                                        sub={`${tripsPerYear} trips/year · ${days}×/week`}
                                        color="red"
                                        pulse
                                    />
                                    <BigStat
                                        icon="🌿"
                                        label="Annual CO₂ emissions"
                                        value={`${Math.round(annual.annualCO2)} kg`}
                                        sub={`≈ ${annual.treesEquivalent} trees needed to offset`}
                                        color="teal"
                                    />
                                    <BigStat
                                        icon="⚡"
                                        label="Saved by cycling"
                                        value={fmtK(annual.cyclingSaved)}
                                        sub={`${Math.round(annual.annualCalories / 1000)}k kcal burned/year`}
                                        color="emerald"
                                        pulse
                                    />
                                </div>

                                {/* Price forecast banner */}
                                {forecast && (
                                    <div className={`rounded-xl border px-5 py-4 flex items-center justify-between
                    ${forecast.forecast.combinedDeltaCents > 0
                                            ? 'bg-amber-500/[0.04] border-amber-500/20'
                                            : 'bg-emerald-500/[0.04] border-emerald-500/20'}`}>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-500 mb-0.5">
                                                AI Price Forecast
                                            </div>
                                            <div className={`text-[13px] font-semibold ${forecast.forecast.combinedDeltaCents > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                Gas prices {forecast.forecast.combinedDeltaCents > 0 ? '↑ rising' : '↓ falling'} — your annual cost projected to
                                                {forecast.forecast.combinedDeltaCents > 0
                                                    ? ` increase $${Math.abs(annual.projectedAnnualIncrease).toFixed(0)}`
                                                    : ` decrease $${Math.abs(annual.projectedAnnualIncrease).toFixed(0)}`}
                                            </div>
                                            <div className="text-[11px] text-gray-600 mt-0.5">
                                                Current: {result.driving.gasPriceCentsPerL}¢/L · Projected: {forecast.forecast.projectedRangeLow}–{forecast.forecast.projectedRangeHigh}¢/L
                                            </div>
                                        </div>
                                        <div className={`text-[28px] font-bold tabular-nums ${forecast.forecast.combinedDeltaCents > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {forecast.forecast.combinedDeltaCents > 0 ? '+' : ''}{forecast.forecast.combinedDeltaCents}¢
                                        </div>
                                    </div>
                                )}

                                {/* Breakdown table */}
                                <div className="bg-[#0d1017] border border-white/[0.05] rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-0.5">Cost breakdown</div>
                                            <h3 className="text-[14px] font-semibold text-gray-200">Where your money goes</h3>
                                        </div>
                                        {/* Toggle */}
                                        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.05]">
                                            {['trip', 'month', 'year'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setView(v)}
                                                    className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-all duration-150
                            ${view === v ? 'bg-teal-500/20 text-teal-400' : 'text-gray-600 hover:text-gray-400'}`}
                                                >
                                                    {v === 'trip' ? 'Per trip' : v === 'month' ? 'Monthly' : 'Annual'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Table header */}
                                    <div className="grid grid-cols-4 gap-4 pb-2 border-b border-white/[0.06] mb-1">
                                        <div className="text-[10px] uppercase tracking-wider text-gray-600">Category</div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-600 text-right">Per trip</div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-600 text-right">Monthly</div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-600 text-right">Annual</div>
                                    </div>

                                    <BreakdownRow
                                        label="⛽ Fuel cost"
                                        perTrip={fmt(annual.fuelPerTrip)}
                                        perMonth={fmt(annual.monthlyFuel)}
                                        perYear={fmtK(annual.annualFuel)}
                                        color="text-red-400"
                                    />
                                    <BreakdownRow
                                        label="🌿 Carbon tax"
                                        perTrip={fmt(annual.carbonTaxPerTrip)}
                                        perMonth={fmt(annual.monthlyCarbon)}
                                        perYear={fmt(annual.annualCarbon)}
                                        color="text-amber-400"
                                    />
                                    <BreakdownRow
                                        label="💰 Total"
                                        perTrip={fmt(annual.totalPerTrip)}
                                        perMonth={fmt(annual.monthlyTotal)}
                                        perYear={fmtK(annual.annualTotal)}
                                        color="text-white"
                                    />
                                </div>

                                {/* Cycling comparison */}
                                <div className="bg-[#0d1017] border border-white/[0.05] rounded-xl p-5">
                                    <div className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-0.5">Cycling alternative</div>
                                    <h3 className="text-[14px] font-semibold text-gray-200 mb-4">Your corridor analysis</h3>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                        {[
                                            { label: 'Safety score', value: `${result.cycling.safetyScore}/100`, color: result.cycling.safetyScore >= 70 ? 'text-emerald-400' : result.cycling.safetyScore >= 45 ? 'text-amber-400' : 'text-red-400' },
                                            { label: 'Protected lanes', value: `${result.cycling.safeLanePercent}%`, color: 'text-teal-400' },
                                            { label: 'Time difference', value: result.cycling.timeDiffMin < 1 ? `${Math.abs(result.cycling.timeDiffMin)} min faster` : `${result.cycling.timeDiffMin} min slower`, color: result.cycling.timeDiffMin < 0 ? 'text-emerald-400' : 'text-gray-400' },
                                            { label: 'Annual calories', value: `${Math.round(annual.annualCalories / 1000)}k kcal`, color: 'text-purple-400' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5">
                                                <div className="text-[10px] text-gray-600 mb-1">{label}</div>
                                                <div className={`text-[15px] font-bold font-mono ${color}`}>{value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Recommendation */}
                                    <div className={`rounded-xl border px-4 py-3.5 ${result.recommendation === 'cycling'
                                            ? 'bg-emerald-500/[0.05] border-emerald-500/25'
                                            : 'bg-white/[0.02] border-white/[0.06]'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            <div className="text-xl mt-0.5">{result.recommendation === 'cycling' ? '🚲' : '🚗'}</div>
                                            <div>
                                                <div className={`text-[13px] font-semibold mb-1 ${result.recommendation === 'cycling' ? 'text-emerald-400' : 'text-gray-300'}`}>
                                                    {result.recommendation === 'cycling' ? 'Cycling recommended' : 'Driving recommended'}
                                                </div>
                                                <div className="text-[12px] text-gray-500 leading-relaxed">
                                                    {result.recommendationReason}
                                                </div>
                                                {result.recommendation === 'cycling' && (
                                                    <div className="mt-2 text-[11px] text-emerald-600 font-mono">
                                                        That's the equivalent of planting {annual.treesEquivalent} trees 🌳
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}