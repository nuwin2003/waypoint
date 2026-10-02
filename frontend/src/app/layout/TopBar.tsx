import { useState, useRef, useEffect } from 'react';
import logoShortImg from '../../assets/logo-short.png';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
} from 'lucide-react';

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: { displayName?: string; email?: string } | null;
  onSignOut: () => void;
}

export function TopBar({
  sidebarOpen,
  onToggleMobileSidebar,
  sidebarCollapsed,
  onToggleSidebarCollapse,
  searchQuery,
  onSearchChange,
  darkMode,
  onToggleDarkMode,
  user,
  onSignOut,
}: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'WP';

  return (
    <header className="top-header">
      {/* Mobile Drawer Toggle Button */}
      <button
        className="mobile-menu-btn"
        onClick={onToggleMobileSidebar}
        type="button"
        aria-label="Toggle menu"
        aria-expanded={sidebarOpen}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Brand Logo & Sidebar Collapse Toggle */}
      <div className="brand-logo-area">
        <a className="brand-home-link" href="/" aria-label="Waypoint home">
          <img className="brand-logo-short" src={logoShortImg} alt="Waypoint logo" />
          <span className="brand-logo-text">Waypoint</span>
        </a>
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebarCollapse}
          type="button"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* User Greeting */}
      <div className="header-left">
        <span className="header-greeting">
          Good morning, <strong>{user?.displayName ?? 'User'}</strong>
        </span>
      </div>

      {/* Global Search Input */}
      <div className="header-search">
        <span className="search-icon">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="search"
          placeholder="Search routes, orders, vehicles…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Dark / Light Mode Toggle */}
        <button
          className="icon-btn"
          onClick={onToggleDarkMode}
          type="button"
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          className="icon-btn notification-btn"
          type="button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="badge-dot" />
        </button>

        {/* User Profile Menu */}
        <div className="profile-menu-wrap" ref={profileMenuRef}>
          <button
            className="user-profile-bubble"
            title={user?.displayName}
            aria-label="Profile menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
            type="button"
          >
            {initials}
          </button>
          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu-user">
                <strong>{user?.displayName ?? 'User'}</strong>
                <small>{user?.email ?? 'user@waypoint.com'}</small>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onSignOut();
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-inherit inline" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
