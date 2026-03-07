export default function StatsCards({ stats }) {
  const items = [
    {
      value: stats?.totalIntersections ?? '...',
      label: 'Danger reports',
      sub: 'submitted by users',
    },
    {
      value: stats?.totalParking ?? '...',
      label: 'Parking spots',
      sub: `${stats?.availableParking ?? 0} currently open`,
    },
    {
      value: stats?.totalBikeSegments ?? '...',
      label: 'Bike segments',
      sub: 'scored & mapped',
    },
    {
      value: stats?.availableParking != null
        ? `${Math.round((stats.availableParking / Math.max(stats.totalParking, 1)) * 100)}%`
        : '...',
      label: 'Parking availability',
      sub: 'across all spots',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="bg-[#0c0f14] p-5">
          <div className="text-[28px] font-semibold text-gray-100 tabular-nums leading-none mb-1.5">
            {item.value}
          </div>
          <div className="text-[13px] text-gray-400">{item.label}</div>
          <div className="text-[11px] text-gray-600 mt-0.5">{item.sub}</div>
        </div>
      ))}
    </div>
  );
}
