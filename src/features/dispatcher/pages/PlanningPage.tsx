import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type PlanningContext, type Vehicle } from '../../../api';
import { nextOperatingDay, weekStart } from '@/lib/planning-engine';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarDays, ChevronRight, RotateCw, Search, X } from 'lucide-react';
import { DispatchIcon, DispatcherBadge, DispatcherPageHeader, DispatcherStat } from '../components/DispatcherUI';

const colomboToday = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
type Deferral = NonNullable<PlanningContext['deferrals']>[number];
const percent = (part: number, total: number) => total > 0 ? Math.min(100, Math.round(part / total * 100)) : 0;
const dateFromDay = (day: string) => new Date(`${day}T12:00:00`);
const clock = (value: string | null) => value ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5)) : null;

export function PlanningPage() {
  const [depotId, setDepotId] = useState('PELIYAGODA');
  const [planDate, setPlanDate] = useState(() => nextOperatingDay(colomboToday()));
  const [context, setContext] = useState<PlanningContext>({ orders: [], vehicles: [] });
  const [weeklyFuel, setWeeklyFuel] = useState<Record<string, number>>({});
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [vehicleChoice, setVehicleChoice] = useState('');
  const [moveTarget, setMoveTarget] = useState<Record<string, string>>({});
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [loaded, used, other] = await Promise.all([
        api.planningContext(depotId, planDate),
        supabase.from('fuel_usage').select('vehicle_id, litres_used').eq('week_start', weekStart(planDate)),
        supabase.from('trip').select('vehicle_id, est_fuel_l, dispatch_plan!inner(plan_date, depot_id)')
          .eq('dispatch_plan.depot_id', depotId).gte('dispatch_plan.plan_date', weekStart(planDate))
          .lt('dispatch_plan.plan_date', new Date(dateFromDay(weekStart(planDate)).getTime() + 7 * 86400000).toISOString().slice(0, 10))
          .neq('dispatch_plan.plan_date', planDate),
      ]);
      if (used.error || other.error) throw new Error(used.error?.message ?? other.error?.message);
      const fuel: Record<string, number> = {};
      [...(used.data ?? []).map((f) => ({ vehicle_id: f.vehicle_id, litres: f.litres_used })),
        ...(other.data ?? []).map((t) => ({ vehicle_id: t.vehicle_id, litres: t.est_fuel_l }))]
        .forEach((row) => { fuel[row.vehicle_id] = (fuel[row.vehicle_id] ?? 0) + Number(row.litres); });
      setWeeklyFuel(fuel); setContext(loaded);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load the plan.'); }
    finally { setLoading(false); }
  }, [depotId, planDate]);
  useEffect(() => { void load(); }, [load]);

  const trips = context.trips ?? [];
  const deferrals = context.deferrals ?? [];
  const selected = trips.find((t) => t.tripId === selectedTrip);
  const vehicle = context.vehicles.find((v) => v.id === selected?.vehicleId);
  const assigned = trips.reduce((count, trip) => count + trip.stops.length, 0);
  const totalOrders = context.planId ? assigned + deferrals.length : context.orders.length;
  const risks = trips.filter((trip) => trip.stops.some((stop) => {
    const eta = clock(stop.eta); const close = clock(stop.close);
    return eta !== null && close !== null && close - eta <= 30;
  })).length;
  const visibleTrips = useMemo(() => trips.filter((trip) => `${trip.vehicleId} ${trip.brand} ${trip.districtName} ${trip.stops.map((s) => s.orderRef).join(' ')}`.toLowerCase().includes(search.toLowerCase())), [trips, search]);
  const canEdit = Boolean(context.planId && trips.every((trip) => trip.status === 'DRAFT' && !trip.startedAt && trip.stops.every((stop) => stop.status === 'PLANNED' && stop.loadingStatus === 'PENDING')));
  const act = async (fn: () => Promise<string>) => {
    setRunning(true); setError(''); setNotice('');
    try { setNotice(await fn()); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not save changes.'); }
    finally { setRunning(false); }
  };
  const approve = () => act(async () => {
    await api.approvePlan(context.planId!);
    return 'Plan approved and released to loaders and drivers.';
  });
  const run = () => act(async () => {
    const result = await api.runPlan(depotId, planDate, Boolean(context.planId));
    return `Allocation saved: ${result.tripCount} trips and ${result.deferralCount} deferred orders.`;
  });
  const reset = () => act(async () => {
    const result = await api.resetDemoDay(planDate); setDepotId('PELIYAGODA');
    return `${result.orders} peak-day orders loaded for ${planDate}.`;
  });
  const carry = () => act(async () => {
    const day = nextOperatingDay(planDate); const result = await api.carryDeferred(depotId, planDate, day);
    return `${result.moved} orders moved to ${day}.`;
  });
  const edit = (input: Parameters<typeof api.editPlan>[0], message: string) => act(async () => {
    await api.editPlan(input); return message;
  });
  const base = selected ? { depotId, planDate, tripId: selected.tripId } : null;
  const fuelLeft = (v: Vehicle) => Math.max(0, (v.weeklyFuelQuotaL ?? 0) - (weeklyFuel[v.id] ?? 0) - trips.filter((t) => t.vehicleId === v.id).reduce((n, t) => n + t.estFuelL, 0));
  const moveStop = (stopId: string, offset: number) => {
    if (!selected || !base) return;
    const ids = selected.stops.map((s) => s.orderId);
    const index = ids.indexOf(stopId);
    const next = index + offset;
    if (index < 0 || next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void edit({ ...base, operation: 'reorder', orderIds: ids }, 'Stop order saved.');
  };
  return <div className="dispatch-page dispatch-suggested-page dispatch-live-plan">
    <DispatcherPageHeader title="Suggested dispatch plan" subtitle="Automatically allocated routes for the selected depot and day." />
    <div className="dispatch-plan-controls">
      <div className="dispatch-depot-toggle" role="group" aria-label="Depot">
        {(['PELIYAGODA', 'KANDY'] as const).map((depot) => <Button key={depot} type="button" variant={depotId === depot ? 'default' : 'ghost'} onClick={() => { setDepotId(depot); setSelectedTrip(null); }} aria-pressed={depotId === depot}>{depot === 'KANDY' ? 'Kandy' : 'Peliyagoda'}</Button>)}
      </div>
      <Popover><PopoverTrigger asChild><Button type="button" variant="outline" className="dispatch-plan-date"><CalendarDays size={16} /> {format(dateFromDay(planDate), 'dd MMM yyyy')}</Button></PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start"><Calendar mode="single" selected={dateFromDay(planDate)} onSelect={(date) => { if (date) { setPlanDate(format(date, 'yyyy-MM-dd')); setSelectedTrip(null); } }} initialFocus className="p-3 pointer-events-auto" /></PopoverContent></Popover>
      <div className="dispatch-plan-spacer" />
      <Button type="button" variant="outline" disabled={running || (context.planId != null && !canEdit)} onClick={reset}>Load peak-day demo orders</Button>
      {context.planId && context.planStatus === 'DRAFT' && <Button type="button" variant="secondary" disabled={running || loading || !trips.length} onClick={approve}>Approve &amp; Release Plan</Button>}
      {context.planStatus === 'PUBLISHED' && <DispatcherBadge tone="pass">Released</DispatcherBadge>}
      <Button type="button" disabled={running || loading || !context.orders.length || (context.planId != null && !canEdit)} onClick={run}><RotateCw size={16} /> {running ? 'Working…' : context.planId ? 'Re-run Allocation' : 'Run Allocation'}</Button>
    </div>
    {notice && <div className="dispatch-success-notice" role="status">{notice}<Button type="button" variant="ghost" size="icon" aria-label="Dismiss" onClick={() => setNotice('')}><X size={16} /></Button></div>}
    {error && <div className="dispatch-error-notice" role="alert">{error}<Button type="button" variant="ghost" size="icon" aria-label="Dismiss" onClick={() => setError('')}><X size={16} /></Button></div>}
    <section className="dispatch-suggested-stats">
      <DispatcherStat label="Orders assigned" value={`${assigned} / ${totalOrders}`} note={context.planId ? `${percent(assigned, totalOrders)}% of orders` : 'No plan saved yet'} icon={<DispatchIcon name="box" />} />
      <DispatcherStat label="Active vehicles & trips" value={`${new Set(trips.map((t) => t.vehicleId)).size} · ${trips.length}`} note="Maximum two trips per vehicle" icon={<DispatchIcon name="truck" />} />
      <DispatcherStat label="Window risks" value={String(risks)} note="Routes with 30 minutes or less at a stop" icon={<DispatchIcon name="clock" />} />
      <DispatcherStat label="Deferred" value={String(deferrals.length)} note="Orders awaiting a decision" icon={<DispatchIcon name="alert" />} />
    </section>
    <section className="dispatch-proposal-table-card">
      <header><div><h2>Routes & Trips</h2><p>{context.planId ? `${depotId === 'KANDY' ? 'Kandy' : 'Peliyagoda'} · ${format(dateFromDay(planDate), 'dd MMMM yyyy')}` : 'Run allocation to create a suggested plan'}</p></div><label className="dispatch-plan-search"><Search size={16} /><input type="search" aria-label="Search routes" placeholder="Search route or vehicle" value={search} onChange={(event) => setSearch(event.target.value)} /></label></header>
      <div className="dispatch-table-scroll"><table className="dispatch-proposal-table"><thead><tr><th>Vehicle</th><th>Trip</th><th>Departs · stops</th><th>Weight capacity</th><th>Volume capacity</th><th>Fuel left</th><th>Windows</th><th><span className="dispatch-sr-only">Actions</span></th></tr></thead><tbody>
        {visibleTrips.map((trip) => {
          const v = context.vehicles.find((item) => item.id === trip.vehicleId);
          const risk = trip.stops.some((stop) => { const eta = clock(stop.eta); const close = clock(stop.close); return eta !== null && close !== null && close - eta <= 30; });
          const weight = percent(trip.weightKg, v?.weightCapKg ?? 0); const volume = percent(trip.volumeM3, v?.volumeCapM3 ?? 0);
          return <tr key={trip.tripId}><td><strong>{trip.vehicleId}</strong><small>{v?.type.toLowerCase()} · {v?.temperature.toLowerCase()}</small></td><td><strong>Trip {trip.tripNo}</strong><small>{trip.brand} · {trip.districtName}</small></td><td>{trip.departure} · {trip.stops.length} stops</td><td><span className="dispatch-progress" role="progressbar" aria-label={`${trip.vehicleId} weight capacity`} aria-valuenow={weight} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${weight}%` }} /></span><small>{weight}% · {Math.round(trip.weightKg)} kg</small></td><td><span className="dispatch-progress" role="progressbar" aria-label={`${trip.vehicleId} volume capacity`} aria-valuenow={volume} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${volume}%` }} /></span><small>{volume}% · {trip.volumeM3.toFixed(1)} m³</small></td><td>{v ? fuelLeft(v).toFixed(1) : '—'} L<small>of {v?.weeklyFuelQuotaL ?? '—'} L weekly</small></td><td><DispatcherBadge tone={risk ? 'late' : 'pass'}>{risk ? 'Tight window' : 'Within windows'}</DispatcherBadge></td><td><div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>{trip.status === 'DRAFT' ? <Button variant="outline" size="sm" type="button" disabled={running || loading} onClick={() => void act(async () => { await api.approveTrip(trip.tripId); return `${trip.vehicleId} trip ${trip.tripNo} released to loaders and drivers.`; })}>Release</Button> : <DispatcherBadge tone="assigned">Released</DispatcherBadge>}<Button variant="ghost" type="button" onClick={() => { setSelectedTrip(trip.tripId); setVehicleChoice(trip.vehicleId); }} aria-label={`Inspect and edit ${trip.vehicleId} trip ${trip.tripNo}`}>Inspect / Edit <ChevronRight size={15} /></Button></div></td></tr>;
        })}
      </tbody></table>{loading && <p className="dispatch-empty">Loading plan…</p>}{!loading && !visibleTrips.length && <p className="dispatch-empty">{context.planId ? 'No routes match this search.' : 'No routes yet. Run allocation to assign orders automatically.'}</p>}</div>
    </section>
    <section className="dispatch-plan-deferred"><div className="dispatch-plan-section-heading"><div><h2>Deferred & Unassigned</h2><p>Orders the automatic allocation could not fit, with the exact recorded reason.</p></div>{deferrals.some((d) => !d.moved) && <Button type="button" variant="outline" disabled={running || !canEdit} onClick={carry}>Move all to next run <ChevronRight size={15} /></Button>}</div>
      {deferrals.length === 0 && <p className="dispatch-empty">{context.planId ? 'No deferred orders for this plan.' : 'Deferred orders will appear after allocation.'}</p>}
      <div className="dispatch-plan-deferred-list">{deferrals.map((d: Deferral) => <article key={d.orderId} className="dispatch-plan-deferred-row"><div><strong>{d.orderRef}</strong><span>{d.outletName}</span><small>{d.reason}</small></div><DispatcherBadge tone={d.moved ? 'assigned' : d.unavoidable ? 'deferred' : 'late'}>{d.moved ? 'Moved to next run' : d.unavoidable ? 'Cannot fit fleet' : 'Deferred'}</DispatcherBadge>{!d.moved && <div className="dispatch-plan-assign"><select aria-label={`Select trip for ${d.orderRef}`} value={assignTarget[d.orderId] ?? ''} onChange={(e) => setAssignTarget((current) => ({ ...current, [d.orderId]: e.target.value }))}><option value="">Select a trip</option>{trips.map((t) => <option value={t.tripId} key={t.tripId}>{t.vehicleId} · trip {t.tripNo} · {t.brand} {t.districtName}</option>)}</select><Button type="button" variant="outline" disabled={!canEdit || running || !assignTarget[d.orderId]} onClick={() => void edit({ depotId, planDate, operation: 'assign', tripId: assignTarget[d.orderId], orderId: d.orderId }, `${d.orderRef} assigned to a trip.`)}>Reassign</Button><Button type="button" variant="ghost" disabled={!canEdit || running} onClick={() => void act(async () => { const day = nextOperatingDay(planDate); await api.carryDeferred(depotId, planDate, day, d.orderId); return `${d.orderRef} moved to ${day}.`; })}>Next run</Button></div>}</article>)}</div>
    </section>
    {selected && <div className="dispatch-drawer-scrim" role="presentation" onClick={() => setSelectedTrip(null)}><aside className="dispatch-order-drawer dispatch-plan-drawer" role="dialog" aria-modal="true" aria-label={`Inspect ${selected.vehicleId} trip ${selected.tripNo}`} onClick={(e) => e.stopPropagation()}><Button className="dispatch-plan-drawer-close" variant="ghost" size="icon" aria-label="Close route details" onClick={() => setSelectedTrip(null)}><X size={20} /></Button><span className="dispatch-drawer-kicker">{selected.brand} · {selected.districtName}</span><h2>{selected.vehicleId} · Trip {selected.tripNo}</h2><p>{selected.stops.length} stops · {selected.plannedMinutes} min · {selected.estKm.toFixed(1)} km · {selected.estFuelL.toFixed(1)} L</p>
      <div className="dispatch-plan-drawer-section"><h3>Vehicle</h3><div className="dispatch-plan-drawer-inline"><select aria-label="Change vehicle" value={vehicleChoice} disabled={!canEdit || running} onChange={(e) => setVehicleChoice(e.target.value)}>{context.vehicles.filter((v) => v.status === 'AVAILABLE').map((v) => <option key={v.id} value={v.id}>{v.id} · {v.type.toLowerCase()} · {v.temperature.toLowerCase()}</option>)}</select><Button type="button" disabled={!canEdit || running || vehicleChoice === selected.vehicleId} onClick={() => base && void edit({ ...base, operation: 'vehicle', vehicleId: vehicleChoice }, 'Vehicle changed and route revalidated.')}>Save vehicle</Button></div><small>{vehicle ? `${Math.round(selected.weightKg)} / ${vehicle.weightCapKg} kg · ${selected.volumeM3.toFixed(1)} / ${vehicle.volumeCapM3} m³ · ${fuelLeft(vehicle).toFixed(1)} L fuel left` : ''}</small></div>
      <div className="dispatch-plan-drawer-section"><h3>Stop sequence</h3><ol className="dispatch-plan-stops">{selected.stops.map((stop, index) => <li key={stop.orderId}><span className="dispatch-stop-number">{index + 1}</span><div><strong>{stop.orderRef}</strong><p>{stop.outletName}</p><small>{stop.eta ?? '—'} · window {stop.window}</small><div className="dispatch-plan-move"><select aria-label={`Move ${stop.orderRef} to trip`} value={moveTarget[stop.orderId] ?? ''} onChange={(e) => setMoveTarget((current) => ({ ...current, [stop.orderId]: e.target.value }))}><option value="">Move to trip…</option>{trips.filter((t) => t.tripId !== selected.tripId).map((t) => <option key={t.tripId} value={t.tripId}>{t.vehicleId} · trip {t.tripNo}</option>)}</select><Button variant="outline" size="sm" type="button" disabled={!canEdit || running || !moveTarget[stop.orderId]} onClick={() => void edit({ depotId, planDate, operation: 'move', tripId: moveTarget[stop.orderId], orderId: stop.orderId }, `${stop.orderRef} moved to another trip.`)}>Move</Button></div></div><div className="dispatch-plan-sequence"><Button type="button" size="icon" variant="ghost" aria-label={`Move ${stop.orderRef} earlier`} disabled={!canEdit || running || index === 0} onClick={() => moveStop(stop.orderId, -1)}>↑</Button><Button type="button" size="icon" variant="ghost" aria-label={`Move ${stop.orderRef} later`} disabled={!canEdit || running || index === selected.stops.length - 1} onClick={() => moveStop(stop.orderId, 1)}>↓</Button></div></li>)}</ol></div>
      {!canEdit && <p className="dispatch-plan-lock">This route is no longer editable because loading or driving has started.</p>}
      <Button type="button" variant="outline" onClick={() => setSelectedTrip(null)}>Close details</Button>
    </aside></div>}
  </div>;
}
