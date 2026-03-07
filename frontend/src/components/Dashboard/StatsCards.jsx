const StatCard = ({ value, label, sub, icon, colorClass, borderClass, bgClass }) => (
  <div className="nav-card !bg-white border-gray-100 flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${bgClass} ${colorClass} shadow-inner group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div>
      <div className="text-3xl font-black text-gray-800 mb-1 tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">
        {label}
      </div>
      <div className="text-[11px] font-medium text-gray-500 leading-tight">
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
      colorClass: 'text-rose-600',
      bgClass: 'bg-rose-50',
    },
    {
      value: stats?.totalParking ?? '...',
      label: 'Parking Spots',
      sub: `${stats?.availableParking ?? 0} currently available`,
      icon: '🅿️',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
    {
      value: stats?.totalBikeSegments ?? '...',
      label: 'Bike Routes',
      sub: 'Monitored & safety-scored',
      icon: '🚲',
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
    },
    {
      value: stats?.availableParking != null
        ? `${Math.round((stats.availableParking / Math.max(stats.totalParking, 1)) * 100)}%`
        : '...',
      label: 'Availability',
      sub: 'Average parking occupancy',
      icon: '📉',
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, i) => (
        <StatCard key={i} {...item} />
      ))}
    </div>
  );
}
