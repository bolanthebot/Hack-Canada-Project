import { NavLink } from 'react-router-dom';

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
    <path d="M8 2v16" /><path d="M16 6v16" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
  </svg>
);

const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" />
    <circle cx="18" cy="5" r="3" />
  </svg>
);

const navItems = [
  { to: '/', label: 'Map Explorer', Icon: MapIcon },
  { to: '/dashboard', label: 'Safety Insights', Icon: ChartIcon },
  { to: '/route-planner', label: 'Route Planner', Icon: RouteIcon },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#0c0f14] border-r border-white/[0.04] z-50 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[64px]' : 'w-60'
        }`}
    >
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <span className="text-[12px] font-black text-white tracking-widest leading-none">UF</span>
        </div>
        {!collapsed && (
          <span className="text-base font-bold text-gray-100 tracking-tight">
            UrbanFlow
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1.5">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/10'
                : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
              }`
            }
          >
            <div className={`transition-transform duration-200 group-hover:scale-110`}>
              <Icon />
            </div>
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2.5 rounded-xl text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.06]"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}>
            <path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
