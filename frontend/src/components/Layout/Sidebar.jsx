import { NavLink, Link } from 'react-router-dom';

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
    <path d="M8 2v16" /><path d="M16 6v16" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
  </svg>
);

const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-[1002] flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-64'
        } shadow-xl shadow-gray-200/50`}
    >
      <Link
        to="/"
        className="flex items-center gap-3 px-5 h-20 shrink-0 hover:bg-gray-50 transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform active:scale-95">
          <span className="text-[14px] font-black text-white tracking-widest leading-none">UF</span>
        </div>
        {!collapsed && (
          <span className="text-lg font-black text-gray-800 tracking-tight">
            UrbanFlow
          </span>
        )}
      </Link>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <div className={`transition-transform duration-300 group-hover:scale-110`}>
              <Icon />
            </div>
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <button
          onClick={onToggle}
          className="w-full h-12 flex items-center justify-center rounded-2xl text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-500 ${collapsed ? '' : 'rotate-180'}`}>
            <path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
