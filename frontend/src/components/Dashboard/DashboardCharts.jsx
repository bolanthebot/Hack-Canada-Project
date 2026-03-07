import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const TYPE_LABELS = {
  near_miss: 'Near Miss',
  cyclist_conflict: 'Cyclist Conflict',
  pedestrian_conflict: 'Pedestrian Conflict',
  aggressive_driver: 'Aggressive Driving',
};

const PIE_COLORS = ['#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];

const tt = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.05)',
    borderRadius: 16,
    color: '#1f2937',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    padding: '12px 16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  cursor: { fill: 'rgba(0,0,0,0.02)' },
};

function ChartCard({ title, children, wide }) {
  return (
    <div className={`nav-card !bg-white border-gray-100 p-8 ${wide ? 'lg:col-span-2' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm hover:shadow-md transition-shadow`}>
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{title}</h3>
      <div style={{ width: '100%', height: 280 }}>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <ChartCard title="Incident Distribution">
        <PieChart>
          <Pie
            data={typeData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
            paddingAngle={8}
            stroke="none"
          >
            {typeData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tt} />
        </PieChart>
      </ChartCard>

      <ChartCard title="Parking Occupancy Trend" wide>
        <AreaChart data={hourData}>
          <defs>
            <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} dy={10} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} width={30} />
          <Tooltip {...tt} />
          <Area type="monotone" dataKey="open" stroke="#10b981" fillOpacity={1} fill="url(#colorOpen)" strokeWidth={3} />
          <Area type="monotone" dataKey="full" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFull)" strokeWidth={3} />
        </AreaChart>
      </ChartCard>

      <ChartCard title="High-Risk Hotspots" wide>
        <BarChart data={topData} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} tickLine={false} axisLine={false} />
          <Tooltip {...tt} />
          <Bar dataKey="reports" fill="#f43f5e" radius={[0, 8, 8, 0]} barSize={24} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Cycling Infrastructure Safety">
        <BarChart data={bikeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} dy={10} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} width={24} />
          <Tooltip {...tt} />
          <Bar dataKey="segments" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={36} />
        </BarChart>
      </ChartCard>
    </div>
  );
}
