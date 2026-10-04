import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { allocate, allowanceMinutes, checkPlan, scheduleStops, tripStarts, tripKm, tripFuel, tripMinutes, timeToMinutes, weekStart, addDays, type PlanningOrder, type PlanningVehicle, type TravelProfile, type Brand, type DockType, type TripDraft } from './planning-engine';

const roleEnum = z.enum(['ADMIN', 'DISPATCHER', 'STOREKEEPER', 'LOADER', 'DRIVER']);

export const adminCreateUserFn = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(128),
    role: roleEnum,
    outletId: z.string().max(32).optional(),
    depotId: z.string().max(32).optional(),
    vehicleId: z.string().max(32).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'ADMIN' });
    if (!isAdmin) throw new Error('Only administrators can create users.');
    if (data.role === 'STOREKEEPER' && !data.outletId) throw new Error('Store managers must be assigned to an outlet.');
    if (data.role === 'DRIVER' && !data.vehicleId) throw new Error('Drivers must be assigned to a vehicle.');

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    let depotId = data.depotId ?? null;
    if (!depotId && data.vehicleId) {
      const { data: v } = await supabaseAdmin.from('vehicle').select('home_depot_id').eq('id', data.vehicleId).maybeSingle();
      depotId = v?.home_depot_id ?? null;
    }
    if (!depotId && data.outletId) {
      const { data: o } = await supabaseAdmin.from('outlet').select('depot_id').eq('id', data.outletId).maybeSingle();
      depotId = o?.depot_id ?? null;
    }
    const email = data.email.toLowerCase();
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email, password: data.password, email_confirm: true,
    });
    if (error || !created.user) {
      throw new Error(error?.message?.includes('already') ? 'An account with this email already exists.' : (error?.message ?? 'Could not create user.'));
    }
    const id = created.user.id;
    await supabaseAdmin.from('profiles').upsert({
      id, email, outlet_id: data.outletId ?? null, depot_id: depotId, vehicle_id: data.vehicleId ?? null, active: true,
    });
    await supabaseAdmin.from('user_roles').delete().eq('user_id', id);
    const { error: roleErr } = await supabaseAdmin.from('user_roles').insert({ user_id: id, role: data.role });
    if (roleErr) throw new Error(roleErr.message);
    return { id };
  });


async function requirePlanner(sb: any, userId: string, depotId: string) {
  const [{ data: isAdmin }, { data: isDispatcher }] = await Promise.all([
    sb.rpc('has_role', { _user_id: userId, _role: 'ADMIN' }),
    sb.rpc('has_role', { _user_id: userId, _role: 'DISPATCHER' }),
  ]);
  if (!isAdmin && !isDispatcher) throw new Error('You do not have access to run plans.');
  if (!isAdmin) {
    const { data: me } = await sb.from('profiles').select('depot_id').eq('id', userId).maybeSingle();
    if (me?.depot_id && me.depot_id !== depotId) throw new Error('You do not have access to this depot.');
  }
}

/** Remove a draft plan and put its orders back in the queue. Refuses once loading/driving has started. */
async function discardDraftPlan(sb: any, planId: string, planDate: string) {
  const { data: trips } = await sb.from('trip').select('id, status, trip_stop(order_id, loading_status, status)').eq('plan_id', planId);
  const started = (trips ?? []).some((t: any) => !['DRAFT', 'PLANNED'].includes(t.status)
    || (t.trip_stop ?? []).some((s: any) => (s.loading_status && s.loading_status !== 'PENDING') || !['PLANNED', 'PENDING'].includes(s.status)));
  if (started) return false;
  const servedIds = (trips ?? []).flatMap((t: any) => (t.trip_stop ?? []).map((s: any) => s.order_id));
  const { data: defs } = await sb.from('deferral_record').select('order_id, score_breakdown').eq('plan_id', planId);
  if (servedIds.length) await sb.from('orders').update({ status: 'PLACED' }).in('id', servedIds);
  for (const d of defs ?? []) {
    const wasDeferred = Number(d.score_breakdown?.deferredYesterday ?? 0) > 0;
    await sb.from('orders').update({ status: 'PLACED', order_date: planDate, deferred_yesterday: wasDeferred }).eq('id', d.order_id);
  }
  await sb.from('dispatch_plan').delete().eq('id', planId);
  return true;
}

const colomboIso = (date: string, minutes: number) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(Math.round(minutes % 60)).padStart(2, '0');
  return new Date(`${date}T${h}:${m}:00+05:30`).toISOString();
};

export const runPlanFn = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    depotId: z.string().min(1).max(32),
    planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    replan: z.boolean().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await requirePlanner(sb, context.userId, data.depotId);

    const { data: existing } = await sb.from('dispatch_plan').select('id').eq('depot_id', data.depotId).eq('plan_date', data.planDate).maybeSingle();
    if (existing) {
      const discarded = data.replan ? await discardDraftPlan(sb, existing.id, data.planDate) : false;
      if (!discarded) {
        const [{ data: trips }, { data: defs }] = await Promise.all([
          sb.from('trip').select('vehicle_id, trip_no, trip_stop(order_id, seq)').eq('plan_id', existing.id).order('vehicle_id').order('trip_no'),
          sb.from('deferral_record').select('order_id, reason_code, priority_score').eq('plan_id', existing.id),
        ]);
        if (data.replan) throw new Error('Loading has already started for this plan, so it can no longer be re-planned.');
        return {
          planId: existing.id, depotId: data.depotId, planDate: data.planDate,
          tripCount: trips?.length ?? 0, deferralCount: defs?.length ?? 0, violations: [] as string[],
          deferrals: (defs ?? []).map((d) => ({ orderId: d.order_id, reasonCode: d.reason_code, priorityScore: Number(d.priority_score) })),
          trips: (trips ?? []).map((t) => ({
            vehicleId: t.vehicle_id, tripNo: t.trip_no,
            orderIds: [...(t.trip_stop ?? [])].sort((a, b) => a.seq - b.seq).map((s) => s.order_id),
          })),
        };
      }
    }

    const wk = weekStart(data.planDate);
    const [{ data: orderRows, error: oErr }, { data: vehicleRows }, { data: districts }, { data: allowRows }, { data: fuelRows }, { data: weekTrips }] = await Promise.all([
      sb.from('orders').select('id, outlet_id, temp_requirement, order_weight_kg, order_volume_m3, deferred_yesterday, days_since_last_served, product_brand, outlet!inner(brand, district_id, depot_id, parking_constraint, dock_type, window_open, window_close, mall_window_start, mall_window_end)')
        .eq('order_date', data.planDate).eq('outlet.depot_id', data.depotId).in('status', ['PLACED', 'CONFIRMED', 'QUEUED', 'NEXT_RUN', 'DEFERRED']).order('placed_at'),
      sb.from('vehicle').select('*').eq('home_depot_id', data.depotId),
      sb.from('district').select('*').eq('depot_id', data.depotId),
      sb.from('service_allowance').select('*'),
      sb.from('fuel_usage').select('vehicle_id, litres_used').eq('week_start', wk),
      sb.from('trip').select('vehicle_id, est_fuel_l, dispatch_plan!inner(plan_date, depot_id)')
        .eq('dispatch_plan.depot_id', data.depotId).gte('dispatch_plan.plan_date', wk).lt('dispatch_plan.plan_date', addDays(wk, 7)).neq('dispatch_plan.plan_date', data.planDate),
    ]);
    if (oErr) throw new Error(oErr.message);
    const table: Record<string, number> = {};
    (allowRows ?? []).forEach((a) => { table[`${a.brand}:${a.dock_type}`] = a.minutes; });

    // Fuel already consumed this week: recorded usage + fuel planned on other days of the week.
    const weeklyFuel: Record<string, number> = {};
    (fuelRows ?? []).forEach((f) => { weeklyFuel[f.vehicle_id] = (weeklyFuel[f.vehicle_id] ?? 0) + Number(f.litres_used); });
    (weekTrips ?? []).forEach((t) => { weeklyFuel[t.vehicle_id] = (weeklyFuel[t.vehicle_id] ?? 0) + Number(t.est_fuel_l ?? 0); });

    const orders: PlanningOrder[] = (orderRows ?? []).map((r) => {
      const brand = r.outlet.brand as Brand;
      const temperature = r.temp_requirement as 'CHILLED' | 'AMBIENT';
      const open = timeToMinutes(r.outlet.mall_window_start ?? r.outlet.window_open);
      const close = timeToMinutes(r.outlet.mall_window_end ?? r.outlet.window_close);
      return {
        id: r.id, depotId: r.outlet.depot_id, districtId: r.outlet.district_id, brand, temperature,
        parkingConstraint: r.outlet.parking_constraint as 'STANDARD' | 'VAN_ONLY',
        dockType: r.outlet.dock_type as DockType,
        weightKg: Number(r.order_weight_kg), volumeM3: Number(r.order_volume_m3),
        windowOpenMin: open, windowCloseMin: close,
        chilledPerishable: temperature === 'CHILLED' && brand === 'FRESH',
        tightWindow: close != null && open != null && close - open <= 150,
        festivalRamp: false, lowValueOrDeferrable: brand === 'STYLE',
        deferredYesterday: r.deferred_yesterday, daysSinceLastServed: r.days_since_last_served,
      };
    });
    const vehicles: PlanningVehicle[] = (vehicleRows ?? []).map((v) => ({
      id: v.id, depotId: v.home_depot_id, type: v.type as 'TRUCK' | 'VAN', temperature: v.temp as 'REEFER' | 'AMBIENT',
      status: v.status as 'AVAILABLE' | 'IN_WORKSHOP', weightCapKg: Number(v.weight_cap_kg), volumeCapM3: Number(v.volume_cap_m3),
      weeklyFuelQuotaL: Number(v.weekly_fuel_quota_l), kmPerL: Number(v.km_per_l),
    }));
    const travel: Record<string, TravelProfile> = {};
    (districts ?? []).forEach((d) => {
      travel[d.id] = { depotToDistrictMinutes: d.depot_to_district_freeflow_min, depotToDistrictKm: Number(d.depot_to_district_km), interStopMinutes: d.inter_stop_freeflow_min, interStopKm: Number(d.inter_stop_km) };
    });

    const result = allocate(orders, vehicles, travel, weeklyFuel, table);
    const violations = checkPlan(result.trips, weeklyFuel, table);
    if (violations.length) throw new Error(`Plan failed its own constraint check: ${violations.slice(0, 3).join('; ')}`);

    const { data: plan, error: pErr } = await sb.from('dispatch_plan')
      .insert({ depot_id: data.depotId, plan_date: data.planDate, status: 'DRAFT', created_by: context.userId }).select('id').single();
    if (pErr || !plan) throw new Error(pErr?.message ?? 'Could not save plan.');

    const byVehicle = new Map<string, typeof result.trips>();
    result.trips.forEach((t) => byVehicle.set(t.vehicleId, [...(byVehicle.get(t.vehicleId) ?? []), t]));
    const outTrips: { vehicleId: string; tripNo: number; orderIds: string[] }[] = [];
    for (const vTrips of byVehicle.values()) {
      const starts = tripStarts(vTrips, table);
      for (const trip of vTrips) {
        const stops = scheduleStops(trip.travel, trip.orders, starts.get(trip)!, table);
        const { data: t, error: tErr } = await sb.from('trip').insert({
          plan_id: plan.id, vehicle_id: trip.vehicleId, trip_no: trip.tripNo, brand: trip.brand, district_id: trip.districtId,
          temp_class: trip.orders.some((o) => o.temperature === 'CHILLED') ? 'CHILLED' : 'AMBIENT',
          planned_minutes: tripMinutes(trip.travel, trip.orders, table),
          total_weight_kg: trip.orders.reduce((s, o) => s + o.weightKg, 0),
          total_volume_m3: trip.orders.reduce((s, o) => s + o.volumeM3, 0),
          est_km: tripKm(trip.travel, trip.orders), est_fuel_l: tripFuel(trip.travel, trip.orders, trip.vehicle), status: 'DRAFT',
        }).select('id').single();
        if (tErr || !t) throw new Error(tErr?.message ?? 'Could not save trip.');
        const { error: sErr } = await sb.from('trip_stop').insert(stops.map((s, seq) => ({
          trip_id: t.id, order_id: s.order.id, seq, planned_arrival: colomboIso(data.planDate, s.serviceStartMin),
          handling_allowance_min: allowanceMinutes(s.order.brand, s.order.dockType, table), status: 'PLANNED',
        })));
        if (sErr) throw new Error(sErr.message);
        await sb.from('orders').update({ status: 'PLANNED' }).in('id', trip.orders.map((o) => o.id));
        outTrips.push({ vehicleId: trip.vehicleId, tripNo: trip.tripNo, orderIds: stops.map((s) => s.order.id) });
      }
    }
    if (result.deferrals.length) {
      const { error: dErr } = await sb.from('deferral_record').insert(result.deferrals.map((d) => ({
        order_id: d.orderId, plan_id: plan.id, reason_code: d.reasonCode, unavoidable: d.unavoidable,
        priority_score: d.priorityScore, score_breakdown: d.scoreBreakdown, dispatcher_note: d.reason, notified_at: new Date().toISOString(),
      })));
      if (dErr) throw new Error(dErr.message);
      // Deferred orders stay on this date flagged DEFERRED; carry them to the next run with top priority.
      await sb.from('orders').update({ status: 'DEFERRED', deferred_yesterday: true }).in('id', result.deferrals.map((d) => d.orderId));
    }
    return {
      planId: plan.id, depotId: data.depotId, planDate: data.planDate,
      tripCount: result.trips.length, deferralCount: result.deferrals.length, violations,
      deferrals: result.deferrals.map((d) => ({ orderId: d.orderId, reasonCode: d.reasonCode, priorityScore: d.priorityScore })),
      trips: outTrips,
    };
  });

/** Move deferred orders to the next run date (dispatcher decision), keeping the deferral record. */
export const carryDeferredFn = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    depotId: z.string().min(1).max(32),
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    orderId: z.string().uuid().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await requirePlanner(sb, context.userId, data.depotId);
    if (data.toDate <= data.fromDate) throw new Error('The next run must be after this plan date.');
    let query = sb.from('orders').select('id, days_since_last_served, outlet!inner(depot_id)')
      .eq('order_date', data.fromDate).eq('status', 'DEFERRED').eq('outlet.depot_id', data.depotId);
    if (data.orderId) query = query.eq('id', data.orderId);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    for (const r of rows ?? []) {
      await sb.from('orders').update({ order_date: data.toDate, status: 'NEXT_RUN', deferred_yesterday: true, days_since_last_served: r.days_since_last_served + 1 }).eq('id', r.id);
    }
    return { moved: rows?.length ?? 0 };
  });

/** Reset the seeded peak-day scenario (S1-* orders) onto a chosen date so the judge walkthrough always works. */
export const resetDemoDayFn = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await requirePlanner(sb, context.userId, 'PELIYAGODA');
    const { data: demo } = await sb.from('orders').select('id').like('order_ref', 'S1-%');
    const ids = (demo ?? []).map((o) => o.id);
    if (!ids.length) throw new Error('Demo orders are missing.');
    const { data: stops } = await sb.from('trip_stop').select('trip!inner(plan_id)').in('order_id', ids);
    const { data: defs } = await sb.from('deferral_record').select('plan_id').in('order_id', ids);
    const planIds = [...new Set([...(stops ?? []).map((s: any) => s.trip.plan_id), ...(defs ?? []).map((d) => d.plan_id)])];
    if (planIds.length) await sb.from('dispatch_plan').delete().in('id', planIds);
    const { data: originals } = await sb.from('orders').select('id, order_ref').in('id', ids);
    const deferredSeed = new Set(['S1-020', 'S1-023', 'S1-025', 'S1-038', 'S1-041', 'S1-045', 'S1-050', 'S1-068', 'S1-079', 'S1-083']);
    for (const o of originals ?? []) {
      await sb.from('orders').update({ order_date: data.planDate, status: 'PLACED', deferred_yesterday: deferredSeed.has(o.order_ref) }).eq('id', o.id);
    }
    return { orders: ids.length };
  });

/** Persist a dispatcher edit only after the entire revised draft passes the same hard rules as allocation. */
export const editPlanFn = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    depotId: z.string().min(1).max(32), planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    operation: z.enum(['vehicle', 'move', 'reorder', 'assign']), tripId: z.string().uuid(),
    vehicleId: z.string().max(32).optional(), orderId: z.string().uuid().optional(),
    orderIds: z.array(z.string().uuid()).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await requirePlanner(sb, context.userId, data.depotId);
    const { data: plan, error: planError } = await sb.from('dispatch_plan').select('id, status, edit_version')
      .eq('depot_id', data.depotId).eq('plan_date', data.planDate).single();
    if (planError || !plan || plan.status !== 'DRAFT') throw new Error('Only a draft plan can be edited.');

    const wk = weekStart(data.planDate);
    const [tripResult, defResult, vehicleResult, districtResult, allowanceResult, fuelResult, weekResult] = await Promise.all([
      sb.from('trip').select('id, vehicle_id, trip_no, status, started_at, trip_stop(order_id, seq, status, loading_status, orders!inner(id, temp_requirement, order_weight_kg, order_volume_m3, deferred_yesterday, days_since_last_served, outlet!inner(brand, district_id, depot_id, parking_constraint, dock_type, window_open, window_close, mall_window_start, mall_window_end)))').eq('plan_id', plan.id),
      sb.from('deferral_record').select('order_id, reason_code, unavoidable, priority_score, score_breakdown, dispatcher_note, orders!inner(id, temp_requirement, order_weight_kg, order_volume_m3, deferred_yesterday, days_since_last_served, outlet!inner(brand, district_id, depot_id, parking_constraint, dock_type, window_open, window_close, mall_window_start, mall_window_end))').eq('plan_id', plan.id),
      sb.from('vehicle').select('*').eq('home_depot_id', data.depotId),
      sb.from('district').select('*').eq('depot_id', data.depotId),
      sb.from('service_allowance').select('*'),
      sb.from('fuel_usage').select('vehicle_id, litres_used').eq('week_start', wk),
      sb.from('trip').select('vehicle_id, est_fuel_l, dispatch_plan!inner(plan_date, depot_id)').eq('dispatch_plan.depot_id', data.depotId).gte('dispatch_plan.plan_date', wk).lt('dispatch_plan.plan_date', addDays(wk, 7)).neq('dispatch_plan.plan_date', data.planDate),
    ]);
    for (const result of [tripResult, defResult, vehicleResult, districtResult, allowanceResult, fuelResult, weekResult]) {
      if (result.error) throw new Error(result.error.message);
    }
    const tripRows = tripResult.data ?? [];
    if (tripRows.some((t) => t.status !== 'DRAFT' || t.started_at || t.trip_stop.some((s) => s.status !== 'PLANNED' || s.loading_status !== 'PENDING'))) {
      throw new Error('Loading or driving has started; this plan cannot be edited.');
    }
    const table: Record<string, number> = {};
    (allowanceResult.data ?? []).forEach((a) => { table[`${a.brand}:${a.dock_type}`] = a.minutes; });
    const weeklyFuel: Record<string, number> = {};
    (fuelResult.data ?? []).forEach((f) => { weeklyFuel[f.vehicle_id] = (weeklyFuel[f.vehicle_id] ?? 0) + Number(f.litres_used); });
    (weekResult.data ?? []).forEach((t) => { weeklyFuel[t.vehicle_id] = (weeklyFuel[t.vehicle_id] ?? 0) + Number(t.est_fuel_l); });
    const vehicles = new Map<string, PlanningVehicle>((vehicleResult.data ?? []).map((v) => [v.id, {
      id: v.id, depotId: v.home_depot_id, type: v.type as PlanningVehicle['type'], temperature: v.temp as PlanningVehicle['temperature'],
      status: v.status as PlanningVehicle['status'], weightCapKg: Number(v.weight_cap_kg), volumeCapM3: Number(v.volume_cap_m3),
      weeklyFuelQuotaL: Number(v.weekly_fuel_quota_l), kmPerL: Number(v.km_per_l),
    }]));
    const travel = new Map<string, TravelProfile>((districtResult.data ?? []).map((d) => [d.id, {
      depotToDistrictMinutes: d.depot_to_district_freeflow_min, depotToDistrictKm: Number(d.depot_to_district_km),
      interStopMinutes: d.inter_stop_freeflow_min, interStopKm: Number(d.inter_stop_km),
    }]));
    type OrderRow = (typeof tripRows)[number]['trip_stop'][number]['orders'];
    const orders = new Map<string, PlanningOrder>();
    const mapOrder = (row: OrderRow) => {
      const o = row.outlet;
      const mapped: PlanningOrder = {
        id: row.id, depotId: o.depot_id, districtId: o.district_id, brand: o.brand as Brand,
        temperature: row.temp_requirement as PlanningOrder['temperature'], parkingConstraint: o.parking_constraint as PlanningOrder['parkingConstraint'],
        dockType: o.dock_type as DockType, weightKg: Number(row.order_weight_kg), volumeM3: Number(row.order_volume_m3),
        windowOpenMin: timeToMinutes(o.mall_window_start ?? o.window_open), windowCloseMin: timeToMinutes(o.mall_window_end ?? o.window_close),
        chilledPerishable: row.temp_requirement === 'CHILLED' && o.brand === 'FRESH',
        tightWindow: (() => { const open = timeToMinutes(o.mall_window_start ?? o.window_open); const close = timeToMinutes(o.mall_window_end ?? o.window_close); return open != null && close != null && close - open <= 150; })(),
        festivalRamp: false, lowValueOrDeferrable: o.brand === 'STYLE', deferredYesterday: row.deferred_yesterday,
        daysSinceLastServed: row.days_since_last_served,
      };
      orders.set(mapped.id, mapped);
    };
    tripRows.forEach((t) => t.trip_stop.forEach((s) => mapOrder(s.orders)));
    (defResult.data ?? []).forEach((d) => mapOrder(d.orders));
    const drafts = tripRows.map((t) => ({ id: t.id, vehicleId: t.vehicle_id, orderIds: [...t.trip_stop].sort((a, b) => a.seq - b.seq).map((s) => s.order_id) }));
    const target = drafts.find((t) => t.id === data.tripId);
    if (!target) throw new Error('Trip not found in this plan.');
    const deferrals = [...(defResult.data ?? [])];
    if (data.operation === 'vehicle') {
      if (!data.vehicleId) throw new Error('Select a vehicle.');
      target.vehicleId = data.vehicleId;
    } else if (data.operation === 'reorder') {
      if (!data.orderIds || data.orderIds.length !== target.orderIds.length ||
          new Set(data.orderIds).size !== target.orderIds.length || data.orderIds.some((id) => !target.orderIds.includes(id))) {
        throw new Error('The stop sequence must contain exactly the same orders.');
      }
      target.orderIds = data.orderIds;
    } else {
      if (!data.orderId) throw new Error('Select an order.');
      const source = drafts.find((t) => t.orderIds.includes(data.orderId ?? ''));
      const deferredIndex = deferrals.findIndex((d) => d.order_id === data.orderId);
      if (data.operation === 'assign' && deferredIndex < 0) throw new Error('Order is not deferred on this plan.');
      if (data.operation === 'move' && (!source || source.id === target.id)) throw new Error('Choose another trip for the order.');
      if (source) source.orderIds = source.orderIds.filter((id) => id !== data.orderId);
      if (deferredIndex >= 0) deferrals.splice(deferredIndex, 1);
      target.orderIds.push(data.orderId);
    }
    if (drafts.some((d) => !d.orderIds.length)) throw new Error('A trip cannot be left empty. Move its other orders first.');
    const byVehicle = new Map<string, TripDraft[]>();
    const built = drafts.map((d) => {
      const vehicle = vehicles.get(d.vehicleId);
      const tripOrders = d.orderIds.map((id) => orders.get(id));
      if (!vehicle || vehicle.status !== 'AVAILABLE' || tripOrders.some((o) => !o)) throw new Error('Vehicle or order is unavailable.');
      const validOrders = tripOrders.filter((o): o is PlanningOrder => Boolean(o));
      const first = validOrders[0];
      if (!first || validOrders.some((o) => o.brand !== first.brand || o.districtId !== first.districtId)) throw new Error('Trips must serve one brand and district.');
      const profile = travel.get(first.districtId);
      if (!profile) throw new Error('District travel data is missing.');
      const draft: TripDraft = { vehicleId: vehicle.id, tripNo: 1, brand: first.brand, districtId: first.districtId, vehicle, travel: profile, orders: validOrders };
      byVehicle.set(vehicle.id, [...(byVehicle.get(vehicle.id) ?? []), draft]);
      return { id: d.id, draft };
    });
    for (const [vehicleId, vehicleTrips] of byVehicle) {
      vehicleTrips.sort((a, b) => Number(b.brand === 'FRESH') - Number(a.brand === 'FRESH') || built.findIndex((x) => x.draft === a) - built.findIndex((x) => x.draft === b));
      vehicleTrips.forEach((t, i) => { t.tripNo = i + 1; });
      if (vehicleTrips.length > 2) throw new Error(`${vehicleId} already has two trips.`);
    }
    const violations = checkPlan(built.map((x) => x.draft), weeklyFuel, table);
    for (const { draft } of built) {
      if (draft.vehicle.status !== 'AVAILABLE' || draft.orders.some((o) => o.parkingConstraint === 'VAN_ONLY' && draft.vehicle.type !== 'VAN')) violations.push(`${draft.vehicleId}: van-only outlet requires a van`);
    }
    if (violations.length) throw new Error(violations[0]);
    const payload = built.map(({ id, draft }) => {
      const siblings = byVehicle.get(draft.vehicleId) ?? [];
      const start = tripStarts(siblings, table, true).get(draft);
      if (start === undefined) throw new Error('Could not schedule this trip.');
      const stops = scheduleStops(draft.travel, draft.orders, start, table, true);
      if (stops.some((s) => s.late)) throw new Error(`${draft.vehicleId} trip ${draft.tripNo}: a stop would miss its delivery window.`);
      return {
        id, vehicleId: draft.vehicleId, tripNo: draft.tripNo, brand: draft.brand, districtId: draft.districtId,
        tempClass: draft.orders.some((o) => o.temperature === 'CHILLED') ? 'CHILLED' : 'AMBIENT',
        plannedMinutes: tripMinutes(draft.travel, draft.orders, table), weightKg: draft.orders.reduce((n, o) => n + o.weightKg, 0),
        volumeM3: draft.orders.reduce((n, o) => n + o.volumeM3, 0), estKm: tripKm(draft.travel, draft.orders),
        estFuelL: tripFuel(draft.travel, draft.orders, draft.vehicle), orderIds: draft.orders.map((o) => o.id),
        stops: stops.map((s, seq) => ({ orderId: s.order.id, seq, arrival: colomboIso(data.planDate, s.serviceStartMin), allowance: allowanceMinutes(s.order.brand, s.order.dockType, table) })),
      };
    });
    const { data: version, error } = await sb.rpc('apply_dispatch_draft_edit', {
      p_plan_id: plan.id, p_expected_version: plan.edit_version, p_trips: payload,
      p_deferrals: deferrals.map((d) => ({ orderId: d.order_id, reasonCode: d.reason_code, unavoidable: d.unavoidable,
        priorityScore: d.priority_score, scoreBreakdown: d.score_breakdown, reason: d.dispatcher_note })),
    });
    if (error) throw new Error(error.message);
    return { version };
  });
