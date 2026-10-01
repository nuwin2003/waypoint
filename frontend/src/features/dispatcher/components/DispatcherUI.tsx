import type { ReactNode } from 'react';

export function DispatcherPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return <header className="dispatch-page-header"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</header>;
}

export function DispatcherBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`dispatch-badge ${tone.replace(/ /g, '-')}`}>{children}</span>;
}

export function DispatcherStat({ label, value, note, icon }: { label: string; value: string; note?: string; icon?: ReactNode }) {
  return <article className="dispatch-stat-card"><div className="dispatch-stat-heading"><span>{label}</span>{icon && <i aria-hidden="true">{icon}</i>}</div><strong>{value}</strong>{note && <small>{note}</small>}</article>;
}

export function DispatchIcon({ name }: { name: 'truck' | 'box' | 'clock' | 'pin' | 'check' | 'alert' | 'edit' | 'fuel' | 'chevron' }) {
  const paths: Record<typeof name, ReactNode> = {
    truck: <><path d="M2 5h13v12H2zM15 9h4l3 3v5h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 4 9-4V8m-9 5v8"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    alert: <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5m0 3h.01"/></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19.4 7.8a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z"/></>,
    fuel: <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M2 21h16M7 7h6v5H7z"/><path d="M16 5h2l3 3v8a2 2 0 0 1-4 0v-4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function DispatchSectionHeading({ title, meta }: { title: string; meta?: string }) {
  return <div className="dispatch-section-heading"><h2>{title}</h2>{meta && <span>{meta}</span>}</div>;
}
