import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import MarketIntelligence from './MarketIntelligence';


const TYPE_LABELS = {
  near_miss: 'Near miss',
  cyclist_conflict: 'Cyclist',
  pedestrian_conflict: 'Pedestrian',
  aggressive_driver: 'Aggressive',
};

const PIE_COLORS = ['#f87171', '#60a5fa', '#fbbf24', '#c084fc'];

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
  cursor: { fill: 'rgba(255,255,255,0.02)' },
};

function ChartCard({ title, children, wide }) {
  return (
    <div className={`bg-[#12151c] rounded-lg p-4 sm:p-5 ${wide ? 'lg:col-span-2' : ''}`}>
      <h3 className="text-[13px] font-medium text-gray-300 mb-4">{title}</h3>
      <div className="w-full h-[200px] sm:h-[220px]">
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardCharts({ stats }) {
  const typeData = (stats?.intersectionsByType || []).map((t) => ({
    name: TYPE_LABELS[t._id] || t._id,
    value: t.count,
  }));

  const topData = (stats?.topIntersections || []).map((t, i) => ({
    name: `${t._id.lat.toFixed(2)}, ${t._id.lng.toFixed(2)}`,
    reports: t.count,
  }));

  const hourData = (stats?.parkingByHour || []).map((h) => ({
    hour: `${String(h._id).padStart(2, '0')}:00`,
    open: h.available,
    full: h.taken,
  }));

  const bikeData = (stats?.bikeScoreDistribution || []).map((b) => ({
    range: b._id === 'other' ? '100' : `${b._id}`,
    segments: b.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Market Intelligence */}
      <div className="lg:col-span-3">
        <MarketIntelligence autoLoad={false} />
      </div>



      <ChartCard title="Incident breakdown">
        <PieChart>
          <Pie
            data={typeData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            dataKey="value"
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            style={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }}
          >
            {typeData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tt} />
        </PieChart>
      </ChartCard>

      <ChartCard title="Parking over the day" wide>
        <AreaChart data={hourData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
          <Tooltip {...tt} />
          <Area type="monotone" dataKey="open" stroke="#34d399" fill="#34d399" fillOpacity={0.08} strokeWidth={1.5} />
          <Area type="monotone" dataKey="full" stroke="#f87171" fill="#f87171" fillOpacity={0.05} strokeWidth={1.5} />
        </AreaChart>
      </ChartCard>

      <ChartCard title="Worst intersections" wide>
        <BarChart data={topData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={72} tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip {...tt} />
          <Bar dataKey="reports" fill="#f87171" radius={[0, 3, 3, 0]} barSize={14} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Safety score distribution">
        <BarChart data={bikeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={24} />
          <Tooltip {...tt} />
          <Bar dataKey="segments" fill="#60a5fa" radius={[3, 3, 0, 0]} barSize={28} />
        </BarChart>
      </ChartCard>

    </div>
  );
}
