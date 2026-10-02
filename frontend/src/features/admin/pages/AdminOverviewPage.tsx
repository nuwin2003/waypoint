import { useEffect, useMemo, useState } from 'react';
import { api, type AdminOverview } from '../../../api';
import { AdminBadge, AdminHeader, AdminIcon, AdminPanel, AdminSelect, AdminStat } from '../components/AdminUI';

const periodOptions = [{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }, { label: 'This year', days: 365 }];
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const displayDate = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const label = (value: string) => value === 'FRESH' ? 'Fresh' : value === 'STYLE' ? 'Style' : value === 'TECH' ? 'Tech' : value;
const emptyOverview = (date: string): AdminOverview => ({
  date,
  confirmedOrders: 0,
  plannedStops: 0,
  completedStops: 0,
  atRiskDeliveries: 0,
  deferredOrders: 0,
  progress: [],
  trend: [],
  depotPerformance: [],
  brandPerformance: [],
});

export function AdminOverviewPage() {
  const today = isoDate(new Date());
  const [date, setDate] = useState(today);
  const [depot, setDepot] = useState('All depots');
  const [brand, setBrand] = useState('All brands');
  const [period, setPeriod] = useState(periodOptions[0].label);
  const [overview, setOverview] = useState<AdminOverview>(() => emptyOverview(today));
  const [error, setError] = useState('');
  const periodDays = periodOptions.find((option) => option.label === period)?.days ?? 7;

  useEffect(() => {
    setOverview(emptyOverview(date));
    setError('');
    api.adminOverview({ date, depotId: depot === 'All depots' ? undefined : depot, brand: brand === 'All brands' ? undefined : brand.toUpperCase(), periodDays })
      .then(setOverview)
      .catch((reason: unknown) => {
        setOverview(emptyOverview(date));
        setError(reason instanceof Error ? reason.message : 'Could not load the overview.');
      });
  }, [date, depot, brand, periodDays]);

  const completionRate = overview.plannedStops > 0 ? Math.round(overview.completedStops * 100 / overview.plannedStops) : 0;
  const trendPath = useMemo(() => {
    if (!overview.trend.length) return '';
    const max = Math.max(100, ...overview.trend.map((point) => point.onTimePercent));
    return overview.trend.map((point, index) => {
      const x = overview.trend.length === 1 ? 310 : index * 620 / (overview.trend.length - 1);
      const y = 190 - (point.onTimePercent / max) * 170;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [overview]);

  return <div className="admin-page admin-overview-page">
    <AdminHeader title="Admin overview" subtitle="A clear view of your delivery network." action={<><AdminBadge tone="green">✓ &nbsp; Live operational data</AdminBadge><AdminSelect value={displayDate(date)} values={[displayDate(date)]} onChange={() => undefined} /></>} />
    <div className="admin-toolbar"><div className="admin-toolbar-filters"><AdminSelect value={depot} values={['All depots', 'PELIYAGODA', 'KANDY']} onChange={setDepot} /><AdminSelect value={brand} values={['All brands', 'Fresh', 'Style', 'Tech']} onChange={setBrand} /><label className="admin-date-filter">Snapshot date<input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} /></label></div><span>Snapshot for {displayDate(date)} <b>·</b> API-backed</span></div>
    {error && <div className="admin-toast" role="alert">{error}<button onClick={() => setError('')} type="button">×</button></div>}
      <div className="admin-stats-grid four"><AdminStat label="Confirmed orders" value={String(overview.confirmedOrders)} note="Orders with a dispatch status" icon={<AdminIcon name="box" />} tone="purple" /><AdminStat label="Completed deliveries" value={`${overview.completedStops}/${overview.plannedStops}`} note={`${completionRate}% complete of planned stops`} icon={<AdminIcon name="truck" />} tone="purple" /><AdminStat label="At-risk deliveries" value={String(overview.atRiskDeliveries)} note="Planned arrivals past due" icon={<AdminIcon name="clock" />} tone="amber" /><AdminStat label="Deferred orders" value={String(overview.deferredOrders)} note="Deferred, failed, or disputed orders" icon={<AdminIcon name="down" />} tone="red" /></div>
      <div className="admin-overview-charts">
        <AdminPanel title="On-time delivery performance" icon={<AdminIcon name="trend" />} action={<AdminSelect value={period} values={periodOptions.map((option) => option.label)} onChange={setPeriod} />} className="admin-performance-panel">
          <div className="admin-chart-result"><strong>{overview.trend.length ? `${Math.round(overview.trend.reduce((total, point) => total + point.onTimePercent, 0) / overview.trend.length)}.0` : '0.0'}<small>%</small></strong><AdminBadge tone="neutral">{overview.trend.length} data points</AdminBadge><span>from completed orders</span></div>
          <div className="admin-line-chart"><div className="admin-chart-ylabels"><span>100%</span><span>50%</span><span>0%</span></div><svg viewBox="0 0 620 210" preserveAspectRatio="none" role="img" aria-label="On-time delivery performance trend"><path className="admin-chart-gridline" d="M0 20H620M0 105H620M0 190H620" />{trendPath && <path className="admin-chart-line" d={trendPath} />}</svg><div className="admin-chart-xlabels">{overview.trend.slice(-7).map((point) => <span key={point.date}>{point.date.slice(5)}</span>)}</div></div>
          <p className="admin-chart-note">Percentage of orders marked delivered or received on each operating date.</p>
        </AdminPanel>
        <AdminPanel title="Delivery progress" action={<AdminSelect value={period} values={periodOptions.map((option) => option.label)} onChange={setPeriod} />} className="admin-progress-panel">
          <div className="admin-donut-wrap"><div className="admin-donut" style={{ '--progress': `${completionRate}%` } as React.CSSProperties}><div><strong>{completionRate}%</strong><span>of stops completed</span></div></div></div>
          <div className="admin-legend-grid">{['Delivered', 'In transit', 'Loading', 'Pending'].map((name) => <span key={name}><i className={name === 'Delivered' ? 'purple' : name === 'In transit' ? 'lilac' : name === 'Loading' ? 'amber' : 'pale'} />{name} <b>{overview.progress.find((item) => item.label === name)?.count ?? 0}</b></span>)}</div>
        </AdminPanel>
      </div>
      <div className="admin-overview-lower">
        <AdminPanel title="Depot performance" icon={<AdminIcon name="warehouse" />} className="admin-depot-panel"><div className="admin-chart-legend"><span><i className="purple" />Completed</span><span><i className="pale" />Planned</span></div><div className="admin-bar-chart">{overview.depotPerformance.map((item) => <div className="admin-bars-group" key={item.label}><i style={{ height: `${item.planned ? item.completed / item.planned * 100 : 0}%` }} /><i className="planned" style={{ height: `${item.planned ? 100 : 0}%` }} /><span>{item.label}</span></div>)}</div>{overview.depotPerformance.length === 0 && <p className="admin-chart-note">No depot records for this snapshot.</p>}</AdminPanel>
        <AdminPanel title="Service by brand" icon={<AdminIcon name="box" />} className="admin-brand-panel">{overview.brandPerformance.map((item) => { const rate = item.planned ? Math.round(item.completed / item.planned * 100) : 0; return <div className="admin-brand-progress" key={item.label}><div><strong>{label(item.label)}</strong><b>{rate}%</b></div><div className="admin-progress-track"><i style={{ width: `${rate}%` }} /></div><small>{item.completed} of {item.planned} orders completed</small></div>; })}{overview.brandPerformance.length === 0 && <p className="admin-chart-note">No brand records for this snapshot.</p>}</AdminPanel>
        <AdminPanel title="Operational attention" icon={<AdminIcon name="shield" />} action={<AdminBadge tone={overview.atRiskDeliveries + overview.deferredOrders ? 'amber' : 'green'}>{overview.atRiskDeliveries + overview.deferredOrders ? 'Needs review' : 'Clear'}</AdminBadge>} className="admin-integrity-panel"><div className="admin-integrity-row"><div><strong>At-risk deliveries</strong><small>Planned arrivals past due</small></div><b>{overview.atRiskDeliveries}</b></div><div className="admin-integrity-row"><div><strong>Deferred orders</strong><small>Orders requiring follow-up</small></div><b>{overview.deferredOrders}</b></div><p className="admin-panel-footnote">Derived from current dispatch and order records.</p></AdminPanel>
      </div>
      <AdminPanel title="Needs attention" action={<AdminBadge tone={overview.atRiskDeliveries + overview.deferredOrders ? 'amber' : 'green'}>{overview.atRiskDeliveries + overview.deferredOrders}</AdminBadge>} className="admin-attention-panel"><div className="admin-empty-state">{overview.atRiskDeliveries + overview.deferredOrders ? 'Review the at-risk and deferred records in the dispatch workspace.' : 'No operational attention items for this snapshot.'}</div></AdminPanel>
  </div>;
}
