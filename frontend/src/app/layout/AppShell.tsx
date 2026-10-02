import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../auth/AuthContext';
import logoImg from '../../assets/logo.png';
import logoShortImg from '../../assets/logo-short.png';
import darkModeImg from '../../assets/dark-mode.png';
import settingsIcon from '../../assets/settings-icon.png';
import dashboardGray from '../../assets/sidebar/dashboard-gray.png';
import dashboardPurple from '../../assets/sidebar/dashboard-purple.png';
import defectItemsGray from '../../assets/sidebar/defect-items-gray.png';
import defectItemsPurple from '../../assets/sidebar/defect-items-purple.png';
import emergencyGray from '../../assets/sidebar/emergency-gray.png';
import emergencyPurple from '../../assets/sidebar/emergency-purple.png';
import fleetGray from '../../assets/sidebar/fleet-gray.png';
import fleetPurple from '../../assets/sidebar/fleet-purple.png';
import historyGray from '../../assets/sidebar/history-gray.png';
import historyPurple from '../../assets/sidebar/history-purple.png';
import liveMonitoringGray from '../../assets/sidebar/live-monitoring-gray.png';
import liveMonitoringPurple from '../../assets/sidebar/live-monitoring-purple.png';
import missingItemsGray from '../../assets/sidebar/missing-items-gray.png';
import missingItemsPurple from '../../assets/sidebar/missing-items-purple.png';
import orderQueueGray from '../../assets/sidebar/order-queue-gray.png';
import orderQueuePurple from '../../assets/sidebar/order-queue-purple.png';
import placeOrderGray from '../../assets/sidebar/place-order-gray.png';
import placeOrderPurple from '../../assets/sidebar/place-order-purple.png';
import planningGray from '../../assets/sidebar/planning-gray.png';
import planningPurple from '../../assets/sidebar/planning-purple.png';
import receiveAndConfirmGray from '../../assets/sidebar/receive-and-confirm-gray.png';
import receiveAndConfirmPurple from '../../assets/sidebar/receive-and-confirm-purple.png';
import scanPackagesGray from '../../assets/sidebar/scan-packages-gray.png';
import scanPackagesPurple from '../../assets/sidebar/scan-packages-purple.png';
import trackOrdersGray from '../../assets/sidebar/track-orders-gray.png';
import trackOrdersPurple from '../../assets/sidebar/track-orders-purple.png';
import auditTrailGray from '../../assets/sidebar/audit-trail-gray.png';
import auditTrailPurple from '../../assets/sidebar/audit-trail-purple.png';
import forecastGray from '../../assets/sidebar/forecast-gray.png';
import forecastPurple from '../../assets/sidebar/forecast-purple.png';
import fineLedgerGray from '../../assets/sidebar/fine-ledger-gray.png';
import fineLedgerPurple from '../../assets/sidebar/fine-ledger-purple.png';
import fuelIntegrityGray from '../../assets/sidebar/fuel-integrity-gray.png';
import fuelIntegrityPurple from '../../assets/sidebar/fuel-integrity-purple.png';
import usersGray from '../../assets/sidebar/users-gray.png';
import usersPurple from '../../assets/sidebar/users-purple.png';
import masterDataGray from '../../assets/sidebar/master-data-gray.png';
import masterDataPurple from '../../assets/sidebar/master-data-purple.png';
import configurationGray from '../../assets/sidebar/configuration-gray.png';
import configurationPurple from '../../assets/sidebar/configuration-purple.png';

type IconName = 'home' | 'map' | 'box' | 'truck' | 'radio' | 'alert' | 'list' | 'chart' | 'check' | 'pin' | 'fuel' | 'clock' | 'settings' | 'help' | 'search' | 'bell' | 'sun' | 'moon' | 'menu' | 'chevron' | 'logout';
type SidebarIcon = 'dashboard' | 'defect-items' | 'emergency' | 'fleet' | 'history' | 'live-monitoring' | 'missing-items' | 'order-queue' | 'place-order' | 'planning' | 'receive-and-confirm' | 'scan-packages' | 'track-orders' | 'audit-trail' | 'forecast' | 'fine-ledger' | 'fuel-integrity' | 'users' | 'master-data' | 'configuration';
const sidebarIcons: Record<SidebarIcon, { gray: string; purple: string }> = {
  dashboard: { gray: dashboardGray, purple: dashboardPurple },
  'defect-items': { gray: defectItemsGray, purple: defectItemsPurple },
  emergency: { gray: emergencyGray, purple: emergencyPurple },
  fleet: { gray: fleetGray, purple: fleetPurple },
  history: { gray: historyGray, purple: historyPurple },
  'live-monitoring': { gray: liveMonitoringGray, purple: liveMonitoringPurple },
  'missing-items': { gray: missingItemsGray, purple: missingItemsPurple },
  'order-queue': { gray: orderQueueGray, purple: orderQueuePurple },
  'place-order': { gray: placeOrderGray, purple: placeOrderPurple },
  planning: { gray: planningGray, purple: planningPurple },
  'receive-and-confirm': { gray: receiveAndConfirmGray, purple: receiveAndConfirmPurple },
  'scan-packages': { gray: scanPackagesGray, purple: scanPackagesPurple },
  'track-orders': { gray: trackOrdersGray, purple: trackOrdersPurple },
  'audit-trail': { gray: auditTrailGray, purple: auditTrailPurple },
  forecast: { gray: forecastGray, purple: forecastPurple },
  'fine-ledger': { gray: fineLedgerGray, purple: fineLedgerPurple },
  'fuel-integrity': { gray: fuelIntegrityGray, purple: fuelIntegrityPurple },
  users: { gray: usersGray, purple: usersPurple },
  'master-data': { gray: masterDataGray, purple: masterDataPurple },
  configuration: { gray: configurationGray, purple: configurationPurple },
};
const iconPaths: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6', map: 'M3 6 8 4l8 2 5-2v14l-5 2-8-2-5 2zM8 4v14m8-12v14',
  box: 'm12 3 9 5-9 5-9-5 9-5zM3 8v9l9 4 9-4V8M12 13v8', truck: 'M3 6h12v11H3zM15 10h4l3 3v4h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  radio: 'M4 9a12 12 0 0 1 16 0M7 12a7 7 0 0 1 10 0m-7 3a3 3 0 0 1 4 0m-2 3h.01', alert: 'M12 3 2.8 20h18.4L12 3zm0 6v5m0 3h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01', chart: 'M4 19V5m0 14h17M8 15l4-4 3 2 5-6', check: 'm5 12 4 4L19 6', pin: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  fuel: 'M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h16M7 7h6v5H7zm9-2h2l3 3v8a2 2 0 0 1-4 0v-4', clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-16v6l4 2', settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4', help: 'M9.1 9a3 3 0 1 1 5.8 1c-.8 1.2-2.9 1.5-2.9 3.5m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
  search: 'M21 21l-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z', bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4', sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z', moon: 'M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5z', menu: 'M4 6h16M4 12h16M4 18h16', chevron: 'm9 18 6-6-6-6', logout: 'M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-6',
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>;
}

const navItems: Record<UserRole, { icon?: IconName; asset?: SidebarIcon; label: string; path: string; badge?: string }[]> = {
  ADMIN: [
    { asset: 'dashboard', label: 'Home', path: '/admin' },
    { asset: 'audit-trail', label: 'Audit Trail', path: '/admin/audit' },
    { asset: 'forecast', label: 'Forecast', path: '/admin/forecast' },
    { asset: 'fine-ledger', label: 'Fine Ledger', path: '/admin/fines' },
    { asset: 'fuel-integrity', label: 'Fuel Integrity', path: '/admin/fuel', badge: '3' },
    { asset: 'users', label: 'Users', path: '/admin/users' },
    { asset: 'master-data', label: 'Master Data', path: '/admin/master-data' },
    { asset: 'configuration', label: 'Configuration', path: '/admin/configuration' },
  ],
  DISPATCHER: [
    { asset: 'dashboard', label: 'Dashboard', path: '/dispatch' },
    { asset: 'order-queue', label: 'Order Queue', path: '/dispatch/orders' },
    { asset: 'planning', label: 'Planning', path: '/dispatch/planning' },
    { asset: 'fleet', label: 'Fleet & Fuel', path: '/dispatch/fleet' },
    { asset: 'live-monitoring', label: 'Live Monitoring', path: '/dispatch/live' },
    { asset: 'emergency', label: 'Emergency', path: '/dispatch/alerts' },
    { asset: 'history', label: 'History', path: '/dispatch/history' },
  ],
  LOADER: [
    { asset: 'dashboard', label: 'Dashboard', path: '/load' },
    { asset: 'scan-packages', label: 'Scan Packages', path: '/load/scan-packages' },
    { asset: 'defect-items', label: 'Defect Items', path: '/load/defect-items' },
    { asset: 'missing-items', label: 'Missing Items', path: '/load/missing-items' },
  ],
  STOREKEEPER: [
    { asset: 'dashboard', label: 'Dashboard', path: '/store' },
    { asset: 'place-order', label: 'Place Order', path: '/store/place-order' },
    { asset: 'track-orders', label: 'Track Orders', path: '/store/track' },
    { asset: 'receive-and-confirm', label: 'Receive & Confirm', path: '/store/receive' },
    { asset: 'history', label: 'History', path: '/store/history' },
  ],
  DRIVER: [
    { icon: 'home', asset: 'dashboard', label: 'Today', path: '/drive' },
    { icon: 'pin', asset: 'live-monitoring', label: 'My Stops', path: '/drive/stops' },
    { icon: 'fuel', asset: 'fleet', label: 'Fuel Log', path: '/drive/fuel' },
    { icon: 'clock', asset: 'history', label: 'History', path: '/drive/history' },
  ],
};

const workspaceLabels: Record<UserRole, string> = {
  ADMIN: 'Admin operations',
  DISPATCHER: 'Dispatcher operations',
  LOADER: 'Loader operations',
  STOREKEEPER: 'Store Manager operations',
  DRIVER: 'Driver operations',
};

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const role = user?.role ?? 'DISPATCHER';
  const links = navItems[role];

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
  };
  const initials = user?.displayName ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'WP';

  return (
    <div className={`app-container${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <header className="top-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} type="button" aria-label="Toggle menu" aria-expanded={sidebarOpen}><Icon name="menu" /></button>
        <div className="brand-logo-area">
          <a className="brand-home-link" href="/" aria-label="Waypoint home">
            <img className="brand-logo-full" src={logoImg} alt="Waypoint" />
            <img className="brand-logo-short" src={logoShortImg} alt="" aria-hidden="true" />
          </a>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            type="button"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name="chevron" />
          </button>
        </div>
        <div className="header-left">
          <span className="header-greeting">Good morning, <strong>{user?.displayName ?? 'User'}</strong></span>
        </div>
        <div className="header-search">
          <span className="search-icon"><Icon name="search" size={16} /></span>
          <input type="search" placeholder="Search routes, orders, vehicles…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={toggleDark} type="button" aria-label="Toggle dark mode">
            {darkMode ? <Icon name="sun" /> : <img className="dark-mode-icon" src={darkModeImg} alt="" />}
          </button>
          <button className="icon-btn notification-btn" type="button" aria-label="Notifications"><Icon name="bell" /><span className="badge-dot" /></button>
          <div className="profile-menu-wrap">
            <button className="user-profile-bubble" title={user?.displayName} aria-label="Profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(!profileOpen)} type="button">{initials}</button>
            {profileOpen && <div className="profile-menu"><div className="profile-menu-user"><strong>{user?.displayName}</strong><small>{user?.email}</small></div><button type="button" onClick={handleSignOut}>Sign out</button></div>}
          </div>
        </div>
      </header>

      <div className="main-wrapper">
        {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" type="button" />}
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}>
          <div className="sidebar-workspace">
            <span>Workspace</span>
            <strong>{workspaceLabels[role]}</strong>
          </div>
          <nav className="sidebar-nav" aria-label="Main navigation">
            {links.map((item) => <NavLink key={item.path} to={item.path} end={item.path.split('/').length === 2} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setSidebarOpen(false)} aria-label={item.label} title={sidebarCollapsed ? item.label : undefined}>
              {({ isActive }) => <><span className="nav-icon">{item.asset ? <img src={sidebarIcons[item.asset][isActive ? 'purple' : 'gray']} alt="" /> : item.icon ? <Icon name={item.icon} /> : null}</span><span className="nav-label">{item.label}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}</>}
            </NavLink>)}
          </nav>
          <div className="sidebar-footer">
            <NavLink to="/settings" className="nav-link" onClick={() => setSidebarOpen(false)} aria-label="Settings" title={sidebarCollapsed ? 'Settings' : undefined}><span className="nav-icon"><img src={settingsIcon} alt="" /></span><span className="nav-label">Settings</span></NavLink>
            <NavLink to="/help" className="nav-link" onClick={() => setSidebarOpen(false)} aria-label="Help" title={sidebarCollapsed ? 'Help' : undefined}><span className="nav-icon"><Icon name="help" /></span><span className="nav-label">Help</span></NavLink>
            <button className="nav-link logout-link" onClick={handleSignOut} type="button"><span className="nav-icon"><Icon name="logout" /></span><span className="nav-label">Log out</span></button>
          </div>
        </aside>
        <main className="content-area"><Outlet context={{ searchQuery }} /></main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {links.slice(0, 4).map((item) => <NavLink key={item.path} to={item.path} end={item.path.split('/').length === 2} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
          {({ isActive }) => <><div className="nav-icon-box">{item.asset ? <img src={sidebarIcons[item.asset][isActive ? 'purple' : 'gray']} alt="" /> : item.icon ? <Icon name={item.icon} /> : null}</div><span>{item.label}</span></>}
        </NavLink>)}
      </nav>
    </div>
  );
}
