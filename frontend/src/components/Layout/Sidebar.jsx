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
    <>
      <aside
        className={`fixed top-0 left-0 h-full bg-[#10131a] z-50 hidden md:flex flex-col transition-all duration-200 ${
          collapsed ? 'w-[52px]' : 'w-52'
        }`}
      >
        <div className="flex items-center gap-2.5 px-3 h-14 shrink-0">
          <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white leading-none">UF</span>
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold text-gray-100 tracking-[-0.01em]">
              UrbanFlow
            </span>
          )}
        </div>

        <div className="px-3 mb-1">
          <div className="h-px bg-white/[0.06]" />
        </div>

        <nav className="flex-1 px-2 pt-1 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2 py-[7px] rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white/[0.08] text-gray-100'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
                }`
              }
            >
              <item.Icon />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pb-2 space-y-1.5">
          {isLoading ? (
            <div className="text-[12px] text-gray-500 px-2">Checking auth...</div>
          ) : isAuthenticated ? (
            <>
              {!collapsed && (
                <div className="px-2 text-[12px] text-gray-400 truncate">
                  {user?.email || user?.name}
                </div>
              )}
              <button
                onClick={logout}
                className="w-full py-1.5 rounded-md text-[12px] text-gray-300 bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={signup}
                className="w-full py-1.5 rounded-md text-[12px] text-gray-200 bg-teal-600 hover:bg-teal-500 transition-colors"
              >
                Signup
              </button>
              <button
                onClick={() => login()}
                className="w-full py-1.5 rounded-md text-[12px] text-gray-300 bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                Login
              </button>
            </>
          )}
        </div>

        <div className="px-2 pb-3">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center py-1.5 rounded-md text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? (
                <><path d="M13 17l5-5-5-5" /><path d="M6 17l5-5-5-5" /></>
              ) : (
                <><path d="M11 17l-5-5 5-5" /><path d="M18 17l-5-5 5-5" /></>
              )}
            </svg>
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#10131a]/95 backdrop-blur border-t border-white/[0.08]">
        <div className="grid grid-cols-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors ${
                  isActive ? 'text-teal-400' : 'text-gray-500'
                }`
              }
            >
              <item.Icon />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
