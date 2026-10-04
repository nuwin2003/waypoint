import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Sidebar, navItems } from './Sidebar';
import { TopBar } from './TopBar';
import { useConnectivity } from '../../shared/hooks/useConnectivity';
import { api } from '../../api';
import { syncPendingOrders } from '../../shared/offlineSync';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const { online, pending } = useConnectivity();
  const role = user?.role ?? 'DISPATCHER';
  const links = navItems[role] ?? [];

  const syncOrders = async () => {
    await syncPendingOrders(api.createOrder);
  };

  useEffect(() => {
    if (online && pending > 0) void syncOrders();
  }, [online, pending]);

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
  };

  return (
    <div className={`app-container${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Extracted TopBar Component */}
      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleMobileSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebarCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        darkMode={darkMode}
        onToggleDarkMode={toggleDark}
        user={user}
        onSignOut={handleSignOut}
        online={online}
        pending={pending}
        onSync={syncOrders}
      />

      {/* Main Container */}
      <div className="main-wrapper">
        <Sidebar
          role={role}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onSignOut={handleSignOut}
        />
        <main className="content-area">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {links.slice(0, 4).map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length === 2}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <div className="nav-icon-box">
                <IconComponent className="w-5 h-5" />
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
