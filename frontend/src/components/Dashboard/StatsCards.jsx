const IconSafety = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconParking = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h4a3 3 0 010 6H9" />
  </svg>
);

const IconBike = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="15" cy="5" r="1" />
    <path d="M15 7a2 2 0 012 2" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" />
  </svg>
);

const IconTrend = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const StatCard = ({ value, label, sub, Icon, colorClass }) => (
  <div className="bg-white border border-gray-100/80 rounded-[2rem] p-6 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] transition-all duration-500 group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 ${colorClass} group-hover:bg-current group-hover:text-white transition-all duration-500`}>
      <Icon />
    </div>

    <div className="flex-1">
      <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">
        {label}
      </div>
      <div className="text-2xl font-black text-gray-900 tracking-tighter tabular-nums mb-0.5">
        {value}
      </div>
      <div className="text-[10px] font-bold text-gray-400">
        {sub}
      </div>
    </div>

    <div className="w-1.5 h-1.5 rounded-full bg-gray-100 group-hover:bg-blue-500 transition-colors duration-500"></div>
  </div>
);

export default function StatsCards({ stats }) {
  const items = [
    {
      value: stats?.totalIntersections ?? 0,
      label: 'Safety Reports',
      sub: 'GTA Incident Reports',
      Icon: IconSafety,
      colorClass: 'text-rose-600',
      gradientClass: 'from-rose-50 to-rose-100/50',
    },
    {
      value: stats?.totalParking ?? 0,
      label: 'Urban Parking',
      sub: `${stats?.availableParking ?? 0} spots available`,
      Icon: IconParking,
      colorClass: 'text-blue-600',
      gradientClass: 'from-blue-50 to-blue-100/50',
    },
    {
      value: stats?.totalBikeSegments ?? 0,
      label: 'Transit Lines',
      sub: 'Cycling Infrastructure',
      Icon: IconBike,
      colorClass: 'text-emerald-600',
      gradientClass: 'from-emerald-50 to-emerald-100/50',
    },
    {
      value: stats?.availableParking != null
        ? `${Math.round((stats.availableParking / Math.max(stats.totalParking, 1)) * 100)}%`
        : '0%',
      label: 'System Load',
      sub: 'Avg. Network Occupancy',
      Icon: IconTrend,
      colorClass: 'text-amber-600',
      gradientClass: 'from-amber-50 to-amber-100/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {items.map((item, i) => (
        <StatCard key={i} {...item} />
      ))}
    </div>
  );
}
