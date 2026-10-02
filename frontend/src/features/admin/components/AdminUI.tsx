import type { ReactNode } from 'react';

export function AdminIcon({ name }: { name: 'box' | 'truck' | 'clock' | 'alert' | 'down' | 'trend' | 'calendar' | 'warehouse' | 'leaf' | 'shirt' | 'monitor' | 'shield' | 'fuel' | 'file' | 'users' | 'sync' | 'pin' | 'search' | 'download' | 'chevron' | 'check' }) {
  const paths: Record<typeof name, ReactNode> = {
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 4 9-4V8m-9 5v8"/></>,
    truck: <><path d="M2 5h13v12H2zM15 9h4l3 3v5h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5m0 3h.01"/></>,
    down: <path d="m7 10 5 5 5-5"/>, trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    warehouse: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M8 21v-8h8v8m-5-8v8"/></>, leaf: <><path d="M20 4C9 4 4 9 4 16a4 4 0 0 0 4 4c7 0 12-5 12-16Z"/><path d="M4 20c3-5 7-8 12-11"/></>,
    shirt: <><path d="m8 4 4 2 4-2 5 3-3 4-2-1v11H8V10l-2 1-3-4 5-3Z"/></>, monitor: <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>, fuel: <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h16M7 7h6v5H7z"/><path d="M16 5h2l3 3v8a2 2 0 0 1-4 0v-4"/></>,
    file: <><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 12h8m-8 4h8"/></>, users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m2-11a3 3 0 0 1 0 6m2 2a4 4 0 0 1 2 3v1"/></>,
    sync: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.5-3"/></>, pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    search: <><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/></>, download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></>, chevron: <path d="m9 18 6-6-6-6"/>, check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <header className="admin-page-header"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="admin-page-action">{action}</div>}</header>;
}

export function AdminStat({ label, value, note, icon, tone = 'purple' }: { label: string; value: string; note: string; icon: ReactNode; tone?: 'purple' | 'green' | 'amber' | 'red' }) {
  return <article className="admin-stat"><div className="admin-stat-top"><span>{label}</span><i className={`tone-${tone}`}>{icon}</i></div><strong>{value}</strong><small className={tone === 'green' || tone === 'amber' || tone === 'red' ? `text-${tone}` : ''}>{note}</small></article>;
}

export function AdminPanel({ title, icon, action, children, className = '' }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`admin-panel ${className}`}><header className="admin-panel-header">{icon && <span className="admin-panel-icon">{icon}</span>}<h2>{title}</h2>{action && <div className="admin-panel-action">{action}</div>}</header>{children}</section>;
}

export function AdminBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`admin-badge ${tone.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{children}</span>;
}

export function AdminDrawer({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode }) {
  return <div className="admin-drawer-backdrop" onMouseDown={onClose}><aside className="admin-drawer" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="admin-drawer-close" onClick={onClose} type="button" aria-label="Close details">×</button><p className="admin-drawer-eyebrow">Record details</p><h2>{title}</h2>{subtitle && <p className="admin-drawer-subtitle">{subtitle}</p>}{children}</aside></div>;
}

export function AdminSelect({ label, value, values, onChange }: { label?: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <label className="admin-select-wrap">{label && <span className="admin-select-label">{label}</span>}<select value={value} onChange={(event) => onChange(event.target.value)}>{values.map((option) => <option key={option}>{option}</option>)}</select><AdminIcon name="down" /></label>;
}

export function AdminSearch({ value, onChange, placeholder = 'Search records...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="admin-search"><AdminIcon name="search"/><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></label>;
}
