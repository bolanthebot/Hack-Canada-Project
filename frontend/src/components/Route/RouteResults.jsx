import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const ROUTE_META = {
  fastest: { label: 'Fastest', color: '#2563eb', fallbackDesc: 'Shortest travel time' },
  cheapest: { label: 'Cheapest', color: '#10b981', fallbackDesc: 'Avoids tolls' },
  safest: { label: 'Safest', color: '#7c3aed', fallbackDesc: 'Avoids highways' },
};

const tt = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: 12,
    color: '#1f2937',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    padding: '10px 14px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  cursor: { fill: 'rgba(0,0,0,0.02)' },
};

// ── Fuel bar ─────────────────────────────────────────────────────────────────

function FuelBar({ percent }) {
  const color = percent > 40 ? '#10b981' : percent > 15 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-black tabular-nums" style={{ color }}>{percent}%</span>
    </div>
  );
}

// ── Trip planner section ──────────────────────────────────────────────────────

function StopCard({ stop, isLast }) {
  const { recommendedStation: rec, nearbyAlternatives: alts } = stop;

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[18px] top-[48px] w-[1px] bg-gray-100" style={{ height: 'calc(100% - 16px)' }} />
      )}

      <div className="flex gap-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <span className="text-[12px] font-black text-blue-600">{stop.stopNumber}</span>
        </div>

        <div className="flex-1 pb-8">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">
                Optimization Stop {stop.stopNumber}
              </span>
              <span className="text-[10px] font-bold text-gray-400 ml-3 uppercase">
                {stop.distFromStartKm.toFixed(1)} km from start
              </span>
            </div>
            <div className="w-24">
              <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 text-right">Fuel Level</div>
              <FuelBar percent={stop.fuelPercentOnArrival} />
            </div>
          </div>

          {rec ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-3 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-xs text-white shadow-lg shadow-emerald-500/20">
                    ★
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 leading-tight">{rec.name}</div>
                    {rec.address && (
                      <div className="text-[11px] font-bold text-gray-400 mt-0.5">{rec.address}</div>
                    )}
                    <div className="text-[10px] font-black text-emerald-600 mt-1 uppercase">+{rec.detourKm} km detour</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black text-emerald-600 tabular-nums leading-none">
                    ${(rec.estimatedPriceCentsPerL / 100).toFixed(2)}<span className="text-[10px] text-gray-400 ml-1">/L</span>
                  </div>
                  <div className="text-[9px] font-black text-emerald-500 mt-1 uppercase tracking-widest">Best Value</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 italic text-[11px] text-gray-400">
              Scanning local infrastructure for compatible stations...
            </div>
          )}

          {alts && alts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {alts.slice(0, 2).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-black text-gray-800 truncate block uppercase tracking-wide">{s.name}</span>
                    <span className="text-[9px] font-bold text-gray-400 truncate block uppercase mt-0.5">${(s.estimatedPriceCentsPerL / 100).toFixed(2)} / L</span>
                  </div>
                  <div className="text-right text-[10px] font-black text-gray-300 group-hover:text-blue-500 transition-colors">
                    +{s.detourKm}km
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TripPlannerSection({ gasStops, gasLoading }) {
  if (!gasLoading && !gasStops) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">
            Logistics Analysis
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Mission Fuel Support</h3>
        </div>
        {!gasLoading && gasStops && (
          <div className="px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
            {gasStops.stopsNeeded} Optimized Stop{gasStops.stopsNeeded !== 1 ? 's' : ''} Proposed
          </div>
        )}
      </div>

      {gasLoading && (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 rounded-[2rem] bg-gray-50 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {!gasLoading && gasStops?.canCompleteWithoutStop && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center text-white text-2xl mb-6 shadow-xl shadow-emerald-500/20">
            ✓
          </div>
          <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-wide">Optimal Range Confirmed</h4>
          <p className="text-sm font-bold text-gray-500 max-w-sm">
            Your current fuel state ({gasStops.currentFuelPercent}%) allows for mission completion without mid-route asset acquisition.
          </p>
        </div>
      )}

      {!gasLoading && gasStops && !gasStops.canCompleteWithoutStop && (
        <div className="max-w-4xl">
          <div className="space-y-0">
            {gasStops.plannedStops.map((stop, i) => (
              <StopCard
                key={stop.stopNumber}
                stop={stop}
                isLast={i === gasStops.plannedStops.length - 1}
              />
            ))}
          </div>

          <div className="mt-4 pt-8 border-t border-gray-50 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2 px-1">Destination Fuel State</div>
              <div className="w-64">
                <FuelBar percent={gasStops.fuelPercentAtDestination} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Status</div>
              <div className="text-xs font-black text-emerald-600 uppercase tracking-widest underline decoration-emerald-200 underline-offset-4">Mission Viable</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main UI ──────────────────────────────────────────────────────────────────

export default function RouteResults({ result, activeRoute, onRouteHover, gasStops, gasLoading }) {
  const { gasPrice, routes } = result;

  const chartData = routes.map((r) => ({
    name: ROUTE_META[r.routeType].label,
    total: r.totalCost,
    color: ROUTE_META[r.routeType].color,
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">Expenditure Intel</div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Financial Comparison</h2>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Avg Fuel: ${(gasPrice).toFixed(2)}/L
          </div>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} tickLine={false} axisLine={false} dy={12} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${v}`} />
              <Tooltip {...tt} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="total" radius={[12, 12, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {routes.map((route) => {
          const meta = ROUTE_META[route.routeType];
          const isActive = activeRoute === route.routeType;
          return (
            <div
              key={route.routeType}
              className={`bg-white p-8 rounded-[2.5rem] cursor-pointer transition-all duration-500 border-2 ${isActive
                ? 'shadow-2xl shadow-blue-500/10 scale-[1.03] animate-in pulse-soft'
                : 'hover:border-gray-200 border-transparent shadow-sm'
                }`}
              style={isActive ? { borderColor: meta.color } : {}}
              onMouseEnter={() => onRouteHover?.(route.routeType)}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 rounded-full shadow-inner" style={{ background: meta.color }} />
                <span className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">{meta.label}</span>
              </div>
              <div className="text-[11px] font-bold text-gray-400 mb-8 uppercase tracking-[0.15em] leading-relaxed min-h-[32px]">
                {route.description || meta.fallbackDesc}
              </div>

              <div className="text-4xl font-black text-gray-900 tabular-nums mb-8 leading-none">
                ${route.totalCost.toFixed(2)}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <StatRow label="Distance" value={`${route.distance.toFixed(1)} km`} />
                <StatRow label="Neural Time" value={`${route.duration} min`} />
                <div className="h-px bg-gray-50 my-2" />
                <StatRow label="Fuel Asset" value={`$${route.fuelCost.toFixed(2)}`} dim />
                <StatRow label="Opportunity" value={`$${route.timeCost.toFixed(2)}`} dim />
                <StatRow label="Conflict Risk" value={`$${route.riskCost.toFixed(2)}`} dim />
              </div>
            </div>
          );
        })}
      </div>

      <TripPlannerSection gasStops={gasStops} gasLoading={gasLoading} />
    </div>
  );
}

function StatRow({ label, value, dim }) {
  return (
    <div className="flex justify-between items-end">
      <span className={`font-black uppercase tracking-widest text-[9px] ${dim ? 'text-gray-300' : 'text-gray-400'}`}>{label}</span>
      <span className={`tabular-nums font-black ${dim ? 'text-gray-400' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}