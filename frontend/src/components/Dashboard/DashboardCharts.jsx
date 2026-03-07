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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl shadow-gray-200/50 animate-in fade-in zoom-in duration-300">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label || 'Metric'}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></div>
            <span className="text-sm font-black text-gray-800 tabular-nums">{p.value}</span>
            <span className="text-[10px] font-bold text-gray-400">{p.name}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-100/50">
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter italic">"Intelligence Sync Active"</p>
        </div>
      </div>
    );
  }
  return null;
};

function ChartCard({ title, subtitle, children, wide }) {
  return (
    <div className={`bg-white border border-gray-100/80 rounded-[2rem] p-8 ${wide ? 'lg:col-span-2' : ''} animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all group`}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5">{title}</h3>
          <p className="text-[10px] font-bold text-gray-300 tracking-tight">{subtitle || 'Regional Data Points'}</p>
        </div>
        <div className="flex gap-1 opacity-10 group-hover:opacity-100 transition-opacity duration-700">
          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
          <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
        </div>
      </div>
      <div style={{ width: '100%', height: 240 }}>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <ChartCard title="Incident Distribution" subtitle="Hazard Types across GTA">
        <PieChart>
          <Pie
            data={typeData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            dataKey="value"
            paddingAngle={10}
            stroke="none"
          >
            {typeData.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ChartCard>

      <ChartCard title="Occupancy Dynamics" subtitle="24h Parking Availability Stream" wide>
        <AreaChart data={hourData}>
          <defs>
            <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="6 6" stroke="#f8fafc" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={false} dy={15} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={false} width={30} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
          <Area type="monotone" dataKey="open" stroke="#10b981" strokeWidth={4} fill="url(#colorOpen)" animationDuration={2000} />
          <Area type="monotone" dataKey="full" stroke="#f43f5e" strokeWidth={4} fill="url(#colorFull)" animationDuration={2500} />
        </AreaChart>
      </ChartCard>

      <ChartCard title="High-Risk Vectors" subtitle="Critical Hotspots by Density" wide>
        <BarChart data={topData} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="reports" fill="#f43f5e" radius={[0, 12, 12, 0]} barSize={28} animationDuration={2000} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Infrastructure Integrity" subtitle="Safety Score Distribution">
        <BarChart data={bikeData}>
          <CartesianGrid strokeDasharray="6 6" stroke="#f8fafc" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={false} dy={15} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={false} width={24} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="segments" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={40} animationDuration={2000} />
        </BarChart>
      </ChartCard>
    </div>
  );
}
