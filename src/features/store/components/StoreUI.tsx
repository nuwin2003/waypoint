import { useEffect, useState, type ReactNode } from 'react';

const ORDER_CUTOFF_HOUR = 16;
const ORDER_TIME_ZONE = 'Asia/Colombo';

function getColomboDateParts(timestamp: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ORDER_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(timestamp);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

export function useOrderCutoff() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const current = getColomboDateParts(now);
  const currentWallTime = Date.UTC(current.year, current.month - 1, current.day, current.hour, current.minute, current.second);
  const cutoffWallTime = Date.UTC(current.year, current.month - 1, current.day, ORDER_CUTOFF_HOUR);
  const remainingMs = Math.max(0, cutoffWallTime - currentWallTime);

  return {
    beforeCutoff: remainingMs > 0,
    hours: Math.floor(remainingMs / (1000 * 60 * 60)),
    minutes: Math.floor((remainingMs / (1000 * 60)) % 60),
    seconds: Math.floor((remainingMs / 1000) % 60),
  };
}

export function StorePageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="store-page-header">
      <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      {action}
    </header>
  );
}

export function StoreCutoffBanner() {
  const { beforeCutoff, hours, minutes, seconds } = useOrderCutoff();

  return (
    <aside className="store-cutoff-banner">
      <span className="store-cutoff-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="18" r="10"/><path d="M16 12v6l4 2M13 3h6"/></svg></span>
      <div className="store-cutoff-copy"><strong>Order cutoff 4:00 PM</strong><span>After cutoff the queue locks and late orders roll to the next run.</span></div>
      <strong className="store-cutoff-time">
        {beforeCutoff ? `${hours} H ${minutes} Min ${String(seconds).padStart(2, '0')} Sec` : 'Cutoff passed'}
        {beforeCutoff && <small>Left</small>}
      </strong>
    </aside>
  );
}

export function StoreStatusBadge({ status }: { status: string }) {
  return <span className={`store-status-badge ${status.toLowerCase().replace(/ /g, '-')}`}>{status}</span>;
}

export function StoreStatCard({ label, value, note, icon }: { label: string; value: string; note: string; icon: 'clock' | 'box' }) {
  return (
    <article className="store-tracking-stat">
      <span>{label}</span>
      <i aria-hidden="true">{icon === 'clock' ? <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> : <svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 4 9-4V8m-9 5v8"/></svg>}</i>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function StoreIconButton({ label, onClick, children, danger = false }: { label: string; onClick: () => void; children: ReactNode; danger?: boolean }) {
  return <button type="button" className={`store-icon-button${danger ? ' danger' : ''}`} aria-label={label} title={label} onClick={onClick}>{children}</button>;
}

export function StoreIcon({ name }: { name: 'edit' | 'pause' | 'play' | 'trash' | 'truck' | 'box' | 'check' }) {
  const paths: Record<typeof name, ReactNode> = {
    edit: <><path d="m15 5 4 4M4 20l4-.8L19.4 7.8a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z"/></>,
    pause: <><path d="M8 5v14M16 5v14"/></>,
    play: <path d="m8 5 11 7-11 7V5Z"/>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    truck: <><path d="M2 5h13v12H2zM15 9h4l3 3v5h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 4 9-4V8m-9 5v8"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
