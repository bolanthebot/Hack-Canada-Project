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

const StatCard = ({ value, label, sub, Icon, colorClass, gradientClass }) => (
  <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[220px] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-700 group hover:-translate-y-1">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center bg-gradient-to-br ${gradientClass} ${colorClass} shadow-lg shadow-current/10 group-hover:scale-110 transition-all duration-500`}>
        <Icon />
      </div>
      <div className="w-2 h-2 rounded-full bg-gray-100 group-hover:animate-ping"></div>
    </div>

    <div>
      <div className="flex items-baseline gap-1">
        <div className="text-4xl font-black text-gray-900 mb-2 tracking-tighter tabular-nums">
          {value}
        </div>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden group-hover:block animate-in fade-in duration-500">Live</span>
      </div>

      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 leading-none">
        {label}
      </div>

      <div className="text-[11px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit">
        {sub}
      </div>
    </div>
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
