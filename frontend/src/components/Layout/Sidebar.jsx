import { NavLink, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
    <path d="M8 2v16" /><path d="M16 6v16" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    <path d="M3 20h18" />
  </svg>
);

const RouteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" />
    <circle cx="18" cy="5" r="3" />
  </svg>
);

const navItems = [
  { to: '/', label: 'Map Explorer', Icon: MapIcon },
  { to: '/dashboard', label: 'Safety Insights', Icon: ChartIcon },
  { to: '/route-planner', label: 'Route Planner', Icon: RouteIcon },
];

export default function Sidebar({ collapsed, onToggle }) {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect: login,
    logout: auth0Logout,
  } = useAuth0();

  const signup = () =>
    login({ authorizationParams: { screen_hint: 'signup' } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-[1002] flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${collapsed ? 'w-[80px]' : 'w-72'
        } shadow-[20px_0_40px_rgba(0,0,0,0.02)]`}
    >
      <Link
        to="/"
        className="flex items-center gap-4 px-6 h-24 shrink-0 group"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-all duration-500 active:scale-95">
          <span className="text-[13px] font-black text-white tracking-tighter">UF</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-700">
            <span className="text-xl font-black text-gray-900 tracking-tight leading-tight">
              UrbanFlow
            </span>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] opacity-80">
              Intelligence Hub
            </span>
          </div>
        )}
      </Link>

      <nav className="flex-1 px-4 mt-8 space-y-3">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-500 ${isActive
                ? 'bg-blue-50/60 text-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.06)]'
                : 'text-gray-400 hover:text-gray-800 hover:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r-full animate-in fade-in zoom-in duration-500" />
                )}
                <div className={`transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-gray-700'}`}>
                  <Icon />
                </div>
                {!collapsed && (
                  <span className="truncate tracking-tight animate-in fade-in duration-700">
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pb-4 space-y-2">
        {isLoading ? (
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 group-hover:animate-pulse">Syncing Auth...</div>
        ) : isAuthenticated ? (
          <div className="flex flex-col gap-2">
            {!collapsed && (
              <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100/50 text-[10px] font-bold text-gray-500 truncate">
                {user?.email || user?.name}
              </div>
            )}
            <button
              onClick={logout}
              className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={signup}
              className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all duration-300 active:scale-95"
            >
              Create Account
            </button>
            <button
              onClick={() => login()}
              className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      <div className="p-6 pt-2 border-t border-gray-50/50">
        <button
          onClick={onToggle}
          className="w-full h-14 flex items-center justify-center rounded-2xl text-gray-300 hover:text-blue-600 hover:bg-blue-50/40 transition-all duration-500 group"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${collapsed ? '' : 'rotate-180'}`}>
            <path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
