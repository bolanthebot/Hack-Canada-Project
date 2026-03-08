import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const ROUTE_META = {
  fastest: { label: 'Fastest', color: '#60a5fa', fallbackDesc: 'Shortest travel time' },
  cheapest: { label: 'Cheapest', color: '#34d399', fallbackDesc: 'Avoids tolls' },
  safest: { label: 'Safest', color: '#c084fc', fallbackDesc: 'Avoids highways' },
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1017] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-gray-200 font-mono shadow-xl">
      ${payload[0].value.toFixed(2)} total
    </div>
  );
};

// ── Fuel bar ─────────────────────────────────────────────────────────────────

function FuelBar({ percent }) {
  const color = percent > 40 ? '#34d399' : percent > 15 ? '#fbbf24' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-mono tabular-nums" style={{ color }}>{percent}%</span>
    </div>
  );
}

// ── Trip planner section ──────────────────────────────────────────────────────

function NoStopsNeeded({ data }) {
  return (
    <div className="bg-[#0d1017] border border-emerald-500/20 rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-lg">✓</div>
        <div>
          <div className="text-[13px] font-semibold text-emerald-400">No stops needed</div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Your current range of {data.currentRangeKm} km covers the full {data.routeDistanceKm} km route
          </div>
        </div>
      </div>
    </div>
  );
}

function StopCard({ stop, isLast }) {
  const { recommendedStation: rec, nearbyAlternatives: alts } = stop;
  const fuelColor = stop.fuelPercentOnArrival > 40 ? '#34d399' : stop.fuelPercentOnArrival > 15 ? '#fbbf24' : '#ef4444';

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[18px] top-[52px] w-px bg-white/[0.06]" style={{ height: 'calc(100% - 20px)' }} />
      )}

      <div className="flex gap-3">
        {/* Stop number badge */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
          <span className="text-[12px] font-bold text-teal-400">{stop.stopNumber}</span>
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between mb-3">
            <div className="min-w-0">
              <span className="text-[12px] font-semibold text-gray-300">
                Stop {stop.stopNumber}
              </span>
              <span className="text-[11px] text-gray-600 ml-2 font-mono">
                at {stop.distFromStartKm} km
              </span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-gray-600 mb-1">fuel on arrival</div>
              <FuelBar percent={stop.fuelPercentOnArrival} />
            </div>
          </div>

          {/* Recommended station */}
          {rec ? (
            <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-xl p-3.5 mb-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm flex-shrink-0">
                    ★
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-200 truncate">{rec.name}</div>
                    {rec.address && (
                      <div className="text-[11px] text-gray-600 mt-0.5 break-words">{rec.address}</div>
                    )}
                    <div className="text-[11px] text-gray-600 mt-0.5">+{rec.detourKm} km detour</div>
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-[15px] font-bold text-emerald-400 tabular-nums">
                    {rec.estimatedPriceCentsPerL}¢/L
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">cheapest</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 mb-2 text-[12px] text-gray-600">
              No stations found in this area
            </div>
          )}

          {/* Alternatives */}
          {alts && alts.length > 0 && (
            <div className="space-y-1.5">
              {alts.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0">
                    <span className="text-[12px] text-gray-400 truncate block">{s.name}</span>
                    {s.address && (
                      <span className="text-[10px] text-gray-700 truncate block">{s.address}</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className="text-[12px] font-mono text-gray-400 tabular-nums">
                      {s.estimatedPriceCentsPerL}¢/L
                    </div>
                    <div className="text-[10px] text-gray-700">+{s.detourKm} km</div>
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
    <div className="bg-[#0d1017] border border-white/[0.05] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-teal-500 font-semibold mb-0.5">
            Trip planner
          </div>
          <h3 className="text-[14px] font-semibold text-gray-200">Fuel stop plan</h3>
        </div>
        {gasStops && !gasLoading && (
          <div className="text-[11px] text-gray-600 font-mono bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.05]">
            {gasStops.stopsNeeded} stop{gasStops.stopsNeeded !== 1 ? 's' : ''} needed
          </div>
        )}
      </div>

      {gasLoading && (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      )}

      {!gasLoading && gasStops?.canCompleteWithoutStop && (
        <NoStopsNeeded data={gasStops} />
      )}

      {!gasLoading && gasStops && !gasStops.canCompleteWithoutStop && (
        <>
          {/* Route summary bar */}
          <div className="flex items-center gap-2 mb-5 px-1 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-gray-500 font-mono">Origin</span>
            </div>
            {gasStops.plannedStops.map((stop) => (
              <div key={stop.stopNumber} className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-teal-400">{stop.stopNumber}</span>
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[11px] text-gray-500 font-mono">Dest.</span>
              </div>
            </div>
          </div>

          {/* Stop cards */}
          <div>
            {gasStops.plannedStops.map((stop, i) => (
              <StopCard
                key={stop.stopNumber}
                stop={stop}
                isLast={i === gasStops.plannedStops.length - 1}
              />
            ))}
          </div>

          {/* Arrival fuel */}
          <div className="mt-2 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-gray-500">Estimated fuel at destination</span>
              <div className="w-32">
                <FuelBar percent={gasStops.fuelPercentAtDestination} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function RouteResults({ result, activeRoute, onRouteHover, gasStops, gasLoading }) {
  const navigate = useNavigate();
  const { gasPrice, routes } = result;

  const chartData = routes.map((r) => ({
    name: ROUTE_META[r.routeType].label,
    total: r.totalCost,
    color: ROUTE_META[r.routeType].color,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Chart */}
        <div className="xl:col-span-2 bg-[#0d1017] border border-white/[0.05] rounded-xl p-5">
          <div className="mb-1">
            <div className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold mb-0.5">Overview</div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[14px] font-semibold text-gray-200">Total cost</h3>
              <span className="text-[11px] text-gray-600 font-mono">${gasPrice}/L</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 190 }} className="mt-4">
            <ResponsiveContainer>
              <BarChart data={chartData} barSize={32} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} width={32} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="total" radius={[5, 5, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route cards */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {routes.map((route) => {
            const meta = ROUTE_META[route.routeType];
            const isActive = activeRoute === route.routeType;
            return (
              <div
                key={route.routeType}
                onMouseEnter={() => onRouteHover?.(route.routeType)}
                className="relative bg-[#0d1017] border rounded-xl p-4 cursor-pointer transition-all duration-200 overflow-hidden"
                style={{
                  borderColor: isActive ? `${meta.color}40` : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive ? `0 0 24px ${meta.color}18` : 'none',
                }}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }}
                  />
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{meta.label}</span>
                </div>
                <div className="text-[11px] text-gray-600 mb-4 leading-relaxed min-h-[28px]">
                  {route.description || meta.fallbackDesc}
                </div>
                <div className="mb-4">
                  <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Total</div>
                  <div className="text-[22px] font-bold tabular-nums" style={{ color: meta.color }}>
                    ${route.totalCost.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <StatRow label="Distance" value={`${route.distance.toFixed(1)} km`} />
                  <StatRow label="Time" value={`${route.duration} min`} />
                  <div className="h-px bg-white/[0.04] my-2" />
                  <StatRow label="Fuel" value={`$${route.fuelCost.toFixed(2)}`} muted />
                  <StatRow label="Time cost" value={`$${route.timeCost.toFixed(2)}`} muted />
                  <StatRow label="Risk" value={`$${route.riskCost.toFixed(2)}`} muted />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/', { state: { importedRoute: route } });
                  }}
                  className={`w-full mt-4 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-white/[0.1] text-white hover:bg-white/[0.15]'
                      : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300'
                  }`}
                  style={{ backgroundColor: isActive ? `${meta.color}20` : undefined, color: isActive ? meta.color : undefined }}
                >
                  Send to map
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <TripPlannerSection gasStops={gasStops} gasLoading={gasLoading} />
    </div>
  );
}

function StatRow({ label, value, muted }) {
  return (
    <div className="flex justify-between items-center">
      <span className={muted ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
      <span className={`tabular-nums font-mono ${muted ? 'text-gray-600' : 'text-gray-300'}`}>{value}</span>
    </div>
  );
}