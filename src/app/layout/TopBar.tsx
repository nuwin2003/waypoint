import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import logoShortImg from '../../assets/logo-short.png';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { NotificationCard, NotificationItem } from '../../shared/ui/NotificationCard';
import { ProfileCard } from '../../shared/ui/ProfileCard';
import { UserRole } from '../auth/AuthContext';

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: { displayName?: string; email?: string; role?: UserRole } | null;
  onSignOut: () => void;
  online: boolean;
  pending: number;
  onSync: () => Promise<void>;
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
  online,
  pending,
  onSync,
}: TopBarProps) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Vehicle breakdown — R-5',
      description: 'M. Rizwan reported a breakdown near Kadawatha. 1 unserved stop (Tech Colombo Flagship).',
      time: '09:12',
      unread: true,
    },
    {
      id: '2',
      title: 'Offline conflict on R-1',
      description: 'Driver completed stop 2 offline before your reassignment. Both records kept.',
      time: '08:58',
      unread: true,
    },
  ]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }
    if (profileOpen || notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen, notificationOpen]);

  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.role === 'DRIVER' ? 'NS' : 'SP');

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
        {sidebarCollapsed ? (
          <button
            className="collapsed-brand-btn"
            onClick={onToggleSidebarCollapse}
            type="button"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <img className="brand-logo-img collapsed-logo" src={logoShortImg} alt="Waypoint logo" />
            <span className="collapsed-expand-arrow">
              <ChevronRight className="w-5 h-5" />
            </span>
          </button>
        ) : (
          <>
            <Link className="brand-home-link" to="/" aria-label="Waypoint home">
              <img className="brand-logo-img" src={logoShortImg} alt="Waypoint logo" />
              <span className="brand-logo-text">Waypoint</span>
            </Link>
            <button
              className="sidebar-toggle"
              onClick={onToggleSidebarCollapse}
              type="button"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* User Greeting */}
      <div className="header-left">
        <span className="header-greeting">
          Good morning, <strong>{user?.displayName ?? (user?.role === 'DRIVER' ? 'Nuwan Silva' : 'Sunil Perera')}</strong>
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
        {(!online || pending > 0) && (
          <button
            className={`connectivity-button${online ? ' online' : ''}`}
            type="button"
            onClick={() => void handleSync()}
            disabled={!online || syncing || pending === 0}
            title={online ? `Sync ${pending} pending item${pending === 1 ? '' : 's'}` : 'You are offline'}
          >
            <span className="connectivity-dot" aria-hidden="true" />
            {online ? (syncing ? 'Syncing…' : `Sync ${pending}`) : 'You are offline'}
          </button>
        )}
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
        <div className="relative" ref={notificationMenuRef}>
          <button
            className={`icon-btn notification-btn ${notificationOpen ? 'active' : ''}`}
            type="button"
            aria-label={`Notifications (${unreadCount} unread)`}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
            aria-expanded={notificationOpen}
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="badge-count">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {notificationOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-24px)] animate-in fade-in zoom-in-95 duration-150">
              <NotificationCard
                notifications={notifications}
                onMarkAllRead={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                }}
                onNotificationClick={(item) => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                  );
                }}
              />
            </div>
          )}
        </div>

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
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[300px] sm:w-[310px] max-w-[calc(100vw-24px)] animate-in fade-in zoom-in-95 duration-150">
              <ProfileCard
                user={user}
                onSignOut={() => {
                  setProfileOpen(false);
                  onSignOut();
                }}
                onNavigate={(path) => {
                  setProfileOpen(false);
                  navigate(path);
                }}
                onItemClick={(key) => {
                  if (key === 'notifications') {
                    setProfileOpen(false);
                    setNotificationOpen(true);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
