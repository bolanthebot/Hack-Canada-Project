const StatCard = ({ value, label, sub, icon, colorClass }) => (
  <div className="nav-card !bg-white/[0.02] border-white/5 flex flex-col justify-between min-h-[140px] hover:!bg-white/[0.04]">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colorClass} bg-opacity-10 shadow-sm border border-opacity-20 ${colorClass.replace('text-', 'border-').replace('text-', 'bg-')}`}>
        {icon}
      </div>
    </div>
    <div>
      <div className="text-3xl font-black text-gray-100 mb-1 tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
        {label}
      </div>
      <div className="text-[10px] font-medium text-gray-600 leading-tight">
        {sub}
      </div>
    </div>
  </div>
);

export default function StatsCards({ stats }) {
  const items = [
    {
      value: stats?.totalIntersections ?? '...',
      label: 'Safety Reports',
      sub: 'User-submitted danger zones',
      icon: '⚠️',
      colorClass: 'text-rose-400 bg-rose-400 border-rose-400',
    },
    {
      value: stats?.totalParking ?? '...',
      label: 'Parking Spots',
      sub: `${stats?.availableParking ?? 0} currently available`,
      icon: '🅿️',
      colorClass: 'text-blue-400 bg-blue-400 border-blue-400',
    },
    {
      value: stats?.totalBikeSegments ?? '...',
      label: 'Bike Routes',
      sub: 'Monitored & safety-scored',
      icon: '🚲',
      colorClass: 'text-emerald-400 bg-emerald-400 border-emerald-400',
    },
    {
      value: stats?.availableParking != null
        ? `${Math.round((stats.availableParking / Math.max(stats.totalParking, 1)) * 100)}%`
        : '...',
      label: 'Availability',
      sub: 'Average parking occupancy',
      icon: '📉',
      colorClass: 'text-amber-400 bg-amber-400 border-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <StatCard key={i} {...item} />
      ))}
    </div>
  );
}
