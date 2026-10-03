import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { House, Route as RouteIcon, Box, History, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../app/auth/AuthContext';
import { APIProvider } from '@vis.gl/react-google-maps';
import { DriverModalProvider } from './DriverModals';
import { DRIVER_INITIALS } from './data/driverData';
import logo from '../../assets/logo-short.png';
import './driver.css';

const TABS = [
  { to: '/drive', label: 'Home', icon: House, end: true },
  { to: '/drive/route', label: 'Route', icon: RouteIcon, end: false },
  { to: '/drive/delivery', label: 'Delivery', icon: Box, end: false },
  { to: '/drive/history', label: 'History', icon: History, end: false },
];

function useDarkTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        setDark(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return [dark, toggle];
}

export function DriverWorkspace() {
  const location = useLocation();
  const { user } = useAuth();
  const [dark, toggleDark] = useDarkTheme();
  const immersive = location.pathname.endsWith('/route/map');

  const initials = user?.displayName
    ? user.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : DRIVER_INITIALS;

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
  const shell = (
    <DriverModalProvider>
      <div className={`dv-app${immersive ? ' dv-app-immersive' : ''}`}>
        {!immersive && (
          <header className="dv-topbar">
            <div className="dv-brand">
              <img src={logo} alt="" className="dv-logo" />
              <span>Waypoint</span>
            </div>
            <div className="dv-topbar-actions">
              <button
                className="dv-icon-button"
                type="button"
                onClick={toggleDark}
                aria-pressed={dark}
                aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <NavLink
                to="/drive/profile"
                className={({ isActive }) => `dv-avatar${isActive ? ' active' : ''}`}
                aria-label="Profile"
              >
                {initials}
              </NavLink>
            </div>
          </header>
        )}

        <main className={immersive ? 'dv-immersive-main' : 'dv-content'}>
          <Outlet />
        </main>

        {!immersive && (
          <nav className="dv-tabbar" aria-label="Driver navigation">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `dv-tab${isActive ? ' active' : ''}`}
              >
                <Icon size={20} aria-hidden />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </DriverModalProvider>
  );

  if (!mapsKey) return shell;
  return (
    <APIProvider apiKey={mapsKey} region="LK">
      {shell}
    </APIProvider>
  );
}
