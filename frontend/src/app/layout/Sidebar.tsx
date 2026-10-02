import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../auth/AuthContext';
import {
  LayoutDashboard,
  ListOrdered,
  CalendarRange,
  Truck,
  Radio,
  AlertTriangle,
  History,
  ScanLine,
  PackageX,
  PackageMinus,
  PackagePlus,
  MapPin,
  PackageCheck,
  Calendar,
  Fuel,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';

export interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

export const navItems: Record<UserRole, NavItem[]> = {
  DISPATCHER: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dispatch' },
    { icon: ListOrdered, label: 'Order Queue', path: '/dispatch/orders' },
    { icon: CalendarRange, label: 'Planning', path: '/dispatch/planning' },
    { icon: Truck, label: 'Fleet & Fuel', path: '/dispatch/fleet' },
    { icon: Radio, label: 'Live Monitoring', path: '/dispatch/live' },
    { icon: AlertTriangle, label: 'Emergency', path: '/dispatch/alerts' },
    { icon: History, label: 'History', path: '/dispatch/history' },
  ],
  LOADER: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/load' },
    { icon: ScanLine, label: 'Scan Packages', path: '/load/scan-packages' },
    { icon: PackageX, label: 'Defect Items', path: '/load/defect-items' },
    { icon: PackageMinus, label: 'Missing Items', path: '/load/missing-items' },
  ],
  STOREKEEPER: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/store' },
    { icon: PackagePlus, label: 'Place Order', path: '/store/place-order' },
    { icon: MapPin, label: 'Track Orders', path: '/store/track' },
    { icon: PackageCheck, label: 'Receive & Confirm', path: '/store/receive' },
    { icon: History, label: 'History', path: '/store/history' },
  ],
  DRIVER: [
    { icon: Calendar, label: 'Today', path: '/drive' },
    { icon: MapPin, label: 'My Stops', path: '/drive/stops' },
    { icon: Fuel, label: 'Fuel Log', path: '/drive/fuel' },
    { icon: History, label: 'History', path: '/drive/history' },
  ],
};

export const workspaceLabels: Record<UserRole, string> = {
  DISPATCHER: 'Dispatcher operations',
  LOADER: 'Loader operations',
  STOREKEEPER: 'Store Manager operations',
  DRIVER: 'Driver operations',
};

interface SidebarProps {
  role: UserRole;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export function Sidebar({
  role,
  sidebarOpen,
  sidebarCollapsed,
  onClose,
  onSignOut,
}: SidebarProps) {
  const links = navItems[role] ?? [];

  return (
    <>
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
          type="button"
        />
      )}
      <aside
        className={`sidebar${sidebarOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}
      >
        <div className="sidebar-workspace">
          <span>Workspace</span>
          <strong>{workspaceLabels[role]}</strong>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {links.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.split('/').length === 2}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={onClose}
                aria-label={item.label}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="nav-icon">
                  <IconComponent className="w-5 h-5" />
                </span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className="nav-link"
            onClick={onClose}
            aria-label="Settings"
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <span className="nav-icon">
              <Settings className="w-5 h-5" />
            </span>
            <span className="nav-label">Settings</span>
          </NavLink>
          <NavLink
            to="/help"
            className="nav-link"
            onClick={onClose}
            aria-label="Help"
            title={sidebarCollapsed ? 'Help' : undefined}
          >
            <span className="nav-icon">
              <HelpCircle className="w-5 h-5" />
            </span>
            <span className="nav-label">Help</span>
          </NavLink>
          <button
            className="nav-link logout-link"
            onClick={onSignOut}
            type="button"
          >
            <span className="nav-icon">
              <LogOut className="w-5 h-5" />
            </span>
            <span className="nav-label">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
