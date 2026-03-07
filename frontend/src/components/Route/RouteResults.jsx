import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const ROUTE_META = {
  fastest: { label: 'Fastest', color: '#60a5fa', fallbackDesc: 'Shortest travel time' },
  cheapest: { label: 'Cheapest', color: '#34d399', fallbackDesc: 'Avoids tolls' },
  safest: { label: 'Safest', color: '#c084fc', fallbackDesc: 'Avoids highways' },
};

const tt = {
  contentStyle: {
    background: '#1a1e27',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6,
    color: '#e5e7eb',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    padding: '6px 10px',
  },
};

export default function RouteResults({ result, activeRoute, onRouteHover }) {
  const { gasPrice, routes } = result;

  const chartData = routes.map((r) => ({
    name: ROUTE_META[r.routeType].label,
    total: r.totalCost,
    color: ROUTE_META[r.routeType].color,
  }));

  return (
    <div className="space-y-3">
      <div className="bg-[#12151c] rounded-lg p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[13px] font-medium text-gray-300">Total cost comparison</h2>
          <span className="text-[11px] text-gray-600 font-mono">${gasPrice}/L predicted</span>
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
              <Tooltip {...tt} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
        {routes.map((route) => {
          const meta = ROUTE_META[route.routeType];
          const isActive = activeRoute === route.routeType;
          return (
            <div
              key={route.routeType}
              className={`bg-[#0c0f14] p-5 cursor-pointer transition-colors ${isActive ? 'ring-1 ring-inset' : 'hover:bg-[#0f1219]'}`}
              style={isActive ? { ringColor: meta.color, boxShadow: `inset 0 0 0 1px ${meta.color}40` } : {}}
              onMouseEnter={() => onRouteHover?.(route.routeType)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-[13px] font-medium text-gray-200">{meta.label}</span>
              </div>
              <div className="text-[11px] text-gray-600 mb-4">
                {route.description || meta.fallbackDesc}
              </div>

              <div className="text-2xl font-semibold text-gray-100 tabular-nums mb-4">
                ${route.totalCost.toFixed(2)}
              </div>

              <div className="space-y-2 text-[12px]">
                <Row label="Distance" value={`${route.distance.toFixed(1)} km`} />
                <Row label="Est. time" value={`${route.duration} min`} />
                <div className="h-px bg-white/[0.04] my-1.5" />
                <Row label="Fuel" value={`$${route.fuelCost.toFixed(2)}`} dim />
                <Row label="Time penalty" value={`$${route.timeCost.toFixed(2)}`} dim />
                <Row label="Risk penalty" value={`$${route.riskCost.toFixed(2)}`} dim />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, dim }) {
  return (
    <div className="flex justify-between">
      <span className={dim ? 'text-gray-600' : 'text-gray-500'}>{label}</span>
      <span className={`tabular-nums ${dim ? 'text-gray-500' : 'text-gray-300'}`}>{value}</span>
    </div>
  );
}
