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

export default function RouteResults({ result, activeRoute, onRouteHover }) {
  const { gasPrice, routes } = result;

  const chartData = routes.map((r) => ({
    name: ROUTE_META[r.routeType].label,
    total: r.totalCost,
    color: ROUTE_META[r.routeType].color,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Cost Analysis</h2>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${gasPrice}/L Predicted</span>
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} barSize={44}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} width={36} />
              <Tooltip {...tt} />
              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routes.map((route) => {
          const meta = ROUTE_META[route.routeType];
          const isActive = activeRoute === route.routeType;
          return (
            <div
              key={route.routeType}
              className={`bg-white p-6 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${isActive ? 'shadow-xl shadow-gray-200/50 scale-[1.02]' : 'hover:border-gray-200 border-transparent shadow-sm'
                }`}
              style={isActive ? { borderColor: meta.color } : {}}
              onMouseEnter={() => onRouteHover?.(route.routeType)}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                <span className="text-sm font-black text-gray-800">{meta.label}</span>
              </div>
              <div className="text-[11px] font-bold text-gray-400 mb-6 uppercase tracking-wider">
                {route.description || meta.fallbackDesc}
              </div>

              <div className="text-3xl font-black text-gray-800 tabular-nums mb-6">
                ${route.totalCost.toFixed(2)}
              </div>

              <div className="space-y-3 text-xs">
                <Row label="Distance" value={`${route.distance.toFixed(1)} km`} />
                <Row label="Est. Time" value={`${route.duration} min`} />
                <div className="h-px bg-gray-50 my-2" />
                <Row label="Fuel Cost" value={`$${route.fuelCost.toFixed(2)}`} dim />
                <Row label="Time Cost" value={`$${route.timeCost.toFixed(2)}`} dim />
                <Row label="Risk Factor" value={`$${route.riskCost.toFixed(2)}`} dim />
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
    <div className="flex justify-between items-center">
      <span className={`font-bold uppercase tracking-widest text-[9px] ${dim ? 'text-gray-300' : 'text-gray-400'}`}>{label}</span>
      <span className={`tabular-nums font-black ${dim ? 'text-gray-400' : 'text-gray-700'}`}>{value}</span>
    </div>
  );
}
