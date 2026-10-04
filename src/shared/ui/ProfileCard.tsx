import React from 'react';
import {
  UserCheck,
  AlertCircle,
  Bell,
  Building2,
  Globe,
  Settings,
  HelpCircle,
  LogOut,
  CloudOff,
  Receipt,
  Plus,
  PackageCheck,
  Boxes,
} from 'lucide-react';
import { AuthUser, UserRole } from '../../app/auth/AuthContext';

export interface ProfileCardProps {
  user?: AuthUser | { displayName?: string; email?: string; role?: UserRole } | null;
  onSignOut?: () => void;
  onNavigate?: (path: string) => void;
  onItemClick?: (itemKey: string) => void;
  className?: string;
}

export function ProfileCard({
  user,
  onSignOut,
  onNavigate,
  onItemClick,
  className = '',
}: ProfileCardProps) {
  const role: UserRole = (user?.role as UserRole) ?? 'DISPATCHER';
  const displayName = user?.displayName || (role === 'DRIVER' ? 'Nuwan Silva' : 'Sunil Perera');

  // Generate initials
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'WP';

  // Role subtitle logic
  const getSubtitle = () => {
    switch (role) {
      case 'DISPATCHER':
        return 'Dispatcher · Peliyagoda';
      case 'DRIVER':
        return 'Driver · VEH014';
      case 'LOADER':
        return 'Loader · Bay 3';
      case 'STOREKEEPER':
        return 'Storekeeper · Central Depot';
      default: {
        const roleStr = String(role);
        return `${roleStr.charAt(0) + roleStr.slice(1).toLowerCase()} · Waypoint`;
      }
    }
  };

  const handleAction = (key: string, path?: string) => {
    if (key === 'logout' && onSignOut) {
      onSignOut();
      return;
    }
    if (path && onNavigate) {
      onNavigate(path);
    }
    if (onItemClick) {
      onItemClick(key);
    }
  };

  return (
    <div className={`wp-profile-card ${className}`}>
      {/* Top Profile Summary Tile */}
      <div className="wp-profile-top">
        <div className="wp-profile-user-info">
          <p className="wp-profile-name">{displayName}</p>
          <p className="wp-profile-subtitle">{getSubtitle()}</p>
        </div>
        <div className="wp-profile-ring">
          <div className="wp-profile-ring-inner">{initials}</div>
        </div>
      </div>

      {/* Role-Specific Menu Items */}
      <div className="wp-profile-menu-list">
        {/* Profile Item (Active) */}
        <button
          type="button"
          className="wp-profile-item active"
          onClick={() => handleAction('profile', '/profile')}
        >
          <UserCheck className="w-[18px] h-[18px] shrink-0 text-purple-600 dark:text-purple-400" />
          <span>Profile</span>
        </button>

        {/* Dispatcher specific */}
        {role === 'DISPATCHER' && (
          <>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('reviews', '/dispatch/reviews')}
            >
              <AlertCircle className="w-[18px] h-[18px] shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Pending reviews</span>
              <span className="wp-profile-badge badge-warning">3</span>
            </button>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('notifications')}
            >
              <Bell className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
              <span>Notifications</span>
            </button>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('depot')}
            >
              <Building2 className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
              <span>Switch depot</span>
              <span className="wp-profile-plus-btn">
                <Plus className="w-3.5 h-3.5" />
              </span>
            </button>
          </>
        )}

        {/* Driver specific */}
        {role === 'DRIVER' && (
          <>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('sync-queue')}
            >
              <CloudOff className="w-[18px] h-[18px] shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Sync queue</span>
              <span className="wp-profile-badge badge-warning">3 pending</span>
            </button>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('reimbursement')}
            >
              <Receipt className="w-[18px] h-[18px] shrink-0 text-purple-600 dark:text-purple-400" />
              <span>Fine reimbursement</span>
              <span className="wp-profile-badge badge-accent">1</span>
            </button>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('notifications')}
            >
              <Bell className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
              <span>Notifications</span>
            </button>
          </>
        )}

        {/* Loader specific */}
        {role === 'LOADER' && (
          <>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('scans')}
            >
              <PackageCheck className="w-[18px] h-[18px] shrink-0 text-purple-600 dark:text-purple-400" />
              <span>Load manifests</span>
            </button>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('notifications')}
            >
              <Bell className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
              <span>Notifications</span>
            </button>
          </>
        )}

        {/* Storekeeper specific */}
        {role === 'STOREKEEPER' && (
          <>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('inventory')}
            >
              <Boxes className="w-[18px] h-[18px] shrink-0 text-purple-600 dark:text-purple-400" />
              <span>Depot inventory</span>
            </button>
            <button
              type="button"
              className="wp-profile-item"
              onClick={() => handleAction('notifications')}
            >
              <Bell className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
              <span>Notifications</span>
            </button>
          </>
        )}

        {/* Common Settings & Language */}
        <button
          type="button"
          className="wp-profile-item"
          onClick={() => handleAction('language')}
        >
          <Globe className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
          <span>Language</span>
          <span className="wp-profile-badge badge-accent">EN</span>
        </button>
        <button
          type="button"
          className="wp-profile-item"
          onClick={() => handleAction('settings', '/settings')}
        >
          <Settings className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
          <span>Settings</span>
        </button>

        {/* Divider */}
        <hr className="wp-profile-divider" />

        {/* Support & Logout */}
        <button
          type="button"
          className="wp-profile-item"
          onClick={() => handleAction('help', '/help')}
        >
          <HelpCircle className="w-[18px] h-[18px] shrink-0 text-gray-600 dark:text-gray-300" />
          <span>Help center</span>
        </button>
        <button
          type="button"
          className="wp-profile-item text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={() => handleAction('logout')}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-red-600 dark:text-red-400">Sign out</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
