import { supabase } from '@/integrations/supabase/client';
import { adminCreateUserFn, runPlanFn, resetDemoDayFn, carryDeferredFn, editPlanFn } from '@/lib/waypoint.functions';
import { decideCutoff } from '@/lib/planning-engine';

export type TempRequirement = 'CHILLED' | 'AMBIENT';
export type ProductBrandCode = 'FRESH' | 'STYLE' | 'TECH';

export type Outlet = {
  id: string;
  name: string;
  brand: 'FRESH' | 'STYLE' | 'TECH';
  districtId: string;
  depotId: string;
  parkingConstraint: string;
  dockType: string;
};

export type Vehicle = {
  id: string;
  depotId: string;
  type: string;
  temperature: string;
  status: string;
  weightCapKg: number;
  volumeCapM3: number;
  weeklyFuelQuotaL?: number;
  kmPerL?: number;
};

export type Order = {
  id: string;
  orderRef: string;
  outletId: string;
  productBrand: ProductBrandCode;
  itemDescription: string;
  orderDate: string;
  afterCutoff: boolean;
  tempRequirement: TempRequirement;
  units: number;
  weightKg: number;
  volumeM3: number;
  status: string;
};

export type PlanRunResult = {
  planId: string;
  depotId: string;
  planDate: string;
  tripCount: number;
  deferralCount: number;
  deferrals: Array<{ orderId: string; reasonCode: string; priorityScore: number }>;
  trips?: Array<{ vehicleId: string; tripNo: number; orderIds: string[] }>;
  violations?: string[];
};

export type LoginResponse = {
  accessToken: string;
  email: string;
  role: 'ADMIN' | 'STOREKEEPER' | 'DISPATCHER' | 'LOADER' | 'DRIVER';
  displayName: string;
};

export type CreatedUserResponse = {
  email: string;
  role: LoginResponse['role'];
  displayName: string;
};

export type AdminUser = {
  id: string;
  email: string;
  role: LoginResponse['role'];
  outletId: string | null;
  outletName: string | null;
  depotId: string | null;
  depotName: string | null;
  vehicleId: string | null;
  active: boolean;
};

export type AdminOverview = {
  date: string;
  confirmedOrders: number;
  plannedStops: number;
  completedStops: number;
  atRiskDeliveries: number;
  deferredOrders: number;
  progress: Array<{ label: string; count: number }>;
  trend: Array<{ date: string; onTimePercent: number }>;
  depotPerformance: Array<{ label: string; completed: number; planned: number }>;
  brandPerformance: Array<{ label: string; completed: number; planned: number }>;
};

export type PlanningContext = {
  orders: Array<{
    id: string;
    orderRef: string;
    outletName: string;
    brand: ProductBrandCode;
    depotId: string;
    temperature: TempRequirement;
    weightKg: number;
    volumeM3: number;
    units: number;
    deferredYesterday: boolean;
    status: string;
  }>;
  vehicles: Vehicle[];
  planId?: string | null;
  planStatus?: string | null;
  trips?: Array<{ tripId: string; vehicleId: string; tripNo: number; brand: string; districtName: string; departure: string; tempClass: string; plannedMinutes: number; weightKg: number; volumeM3: number; estKm: number; estFuelL: number; status: string; startedAt: string | null; stops: Array<{ orderId: string; orderRef: string; outletName: string; eta: string | null; window: string; close: string | null; status: string; loadingStatus: string }> }>;
  deferrals?: Array<{ orderId: string; orderRef: string; outletName: string; reasonCode: string; reason: string; unavoidable: boolean; priorityScore: number; moved: boolean }>;
};

export type LoadingTrip = {
  tripId: string;
  vehicleId: string;
  tripNo: number;
  brand: ProductBrandCode;
  temperature: string;
  status: string;
  totalStops: number;
  completedStops: number;
  totalWeightKg: number;
  totalVolumeM3: number;
  districtId: string;
};

export type LoadingTripDetails = LoadingTrip & {
  stops: Array<{
    stopId: string;
    orderId: string;
    orderRef: string;
    outletId: string;
    outletName: string;
    sequence: number;
    status: string;
    units: number;
    weightKg: number;
    volumeM3: number;
  }>;
};

export type LoadingDefect = {
  id: string;
  stopId: string;
  packageCode: string;
  typeAndCargo: string;
  issueNote: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'unresolved' | 'confirmed' | 'resolved';
  units: number;
  scannedCount: number;
  totalCount: number;
};

export type LoadingMissingItem = {
  id: string;
  stopId: string;
  packageCode: string;
  orderRef: string;
  vehicleId: string;
  weight: string;
  status: 'pending-investigation' | 'located';
};

export type DriverRouteStop = {
  stopId: string;
  sequence: number;
  orderId: string;
  orderRef: string;
  outletId: string;
  outletName: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  districtName: string;
  category: string;
  window: string;
  access: string;
  packages: number;
  weightKg: number;
  volumeM3: number;
  distanceKm: number;
  driveMinutes: number;
  status: string;
};

export type DriverTodayRoute = {
  routeId: string;
  routeLabel: string;
  vehicleId: string;
  depotName: string;
  districtName: string;
  status: string;
  totalStops: number;
  completedStops: number;
  plannedDistanceKm: number;
  plannedMinutes: number;
  firstWindow: string | null;
  stops: DriverRouteStop[];
};

export type DriverProofOfDelivery = {
  id: string;
  stopId: string;
  receiverName: string | null;
  outcome: 'DELIVERED' | 'PARTIAL_DELIVERY' | 'UNABLE_TO_DELIVER';
  deliveredUnits: number | null;
  shortUnits: number | null;
  conditionNotes: string | null;
  photoReference: string | null;
  signatureReference: string | null;
  eventTime: string;
  createdAt: string;
};

export type DriverFuelLog = {
  id: string;
  fuelDate: string;
  odometerKm: number;
  litres: number;
  station: string;
  cost: number | null;
  currency: string;
  receiptReference: string | null;
  createdAt: string;
};

export type DriverFineReport = {
  id: string;
  stopId: string | null;
  amount: number;
  currency: string;
  reason: string;
  location: string | null;
  ticketReference: string | null;
  issuedAt: string;
  status: string;
  createdAt: string;
};

export type DriverIncidentReport = {
  id: string;
  stopId: string | null;
  type: string;
  notes: string | null;
  location: string | null;
  reportedAt: string;
  status: string;
  createdAt: string;
};

export type DriverHistory = {
  tripCount: number;
  completedStops: number;
  distanceKm: number;
  packages: number;
  onTimePercent: number;
  trips: Array<{
    routeId: string;
    routeLabel: string;
    planDate: string;
    status: string;
    stops: number;
    completedStops: number;
    packages: number;
    distanceKm: number;
    onTimePercent: number;
  }>;
  fuelLogs: DriverFuelLog[];
  fineReports: DriverFineReport[];
  proofOfDelivery: DriverProofOfDelivery[];
};

// ---------------------------------------------------------------------------
// Data layer: Lovable Cloud replaces the former Spring Boot REST API.
// Function names and return shapes match the original `api` object so the
// screens imported from the repo work unchanged.
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function fail(error: { message: string; code?: string } | null | undefined, fallback = 'Waypoint could not complete the request. Please try again.'): never {
  const msg = error?.message ?? fallback;
  if (/permission|row-level security/i.test(msg)) throw new ApiError('You do not have permission to do that.', 403, error?.code);
  throw new ApiError(msg, 400, error?.code);
}

function check<R extends { data: unknown; error: { message: string; code?: string } | null }>(res: R): NonNullable<R['data']> {
  if (res.error) fail(res.error);
  return res.data as NonNullable<R['data']>;
}

async function me() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new ApiError('Your session has expired. Please sign in again.', 401);
  const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  return { id: data.user.id, outletId: p?.outlet_id ?? null, depotId: p?.depot_id ?? null, vehicleId: p?.vehicle_id ?? null, email: p?.email ?? data.user.email ?? '' };
}

const today = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
/** The delivery day loaders and drivers work on: the nearest plan on/after today, else the latest plan. */
async function activePlanDate(): Promise<string> {
  const t = today();
  const { data: next } = await supabase.from('dispatch_plan').select('id, plan_date').gte('plan_date', t).order('plan_date').limit(5);
  for (const plan of next ?? []) {
    const { count } = await supabase.from('trip').select('id', { count: 'exact', head: true }).eq('plan_id', plan.id);
    if (count) return plan.plan_date;
  }
  const { data: last } = await supabase.from('dispatch_plan').select('plan_date').order('plan_date', { ascending: false }).limit(1);
  return last?.[0]?.plan_date ?? t;
}
const hhmmColombo = (iso: string | null) => iso ? new Date(new Date(iso).getTime() + 330 * 60_000).toISOString().slice(11, 16) : null;
const num = (v: unknown) => Number(v ?? 0);
const hhmm = (t: string | null | undefined) => (t ?? '').slice(0, 5);

type OrderRow = {
  id: string; order_ref: string; outlet_id: string; product_brand: string; item_description: string;
  order_date: string; after_cutoff: boolean; temp_requirement: string; order_units: number;
  order_weight_kg: number; order_volume_m3: number; status: string;
};
const mapOrder = (o: OrderRow): Order => ({
  id: o.id, orderRef: o.order_ref, outletId: o.outlet_id, productBrand: o.product_brand as ProductBrandCode,
  itemDescription: o.item_description, orderDate: o.order_date, afterCutoff: o.after_cutoff,
  tempRequirement: o.temp_requirement as TempRequirement, units: o.order_units,
  weightKg: num(o.order_weight_kg), volumeM3: num(o.order_volume_m3), status: o.status,
});

async function adminUserById(id: string): Promise<AdminUser> {
  const list = await api.adminUsers();
  const u = list.find((x) => x.id === id);
  if (!u) throw new ApiError('User was not found', 404);
  return u;
}

async function planSummary(depotId: string, planDate: string) {
  const { data: plan } = await supabase.from('dispatch_plan').select('id, status').eq('depot_id', depotId).eq('plan_date', planDate).maybeSingle();
  if (!plan) return { planId: null, planStatus: null, trips: [], deferrals: [] };
  const [trips, defs] = await Promise.all([
    supabase.from('trip').select('id, vehicle_id, trip_no, brand, temp_class, planned_minutes, total_weight_kg, total_volume_m3, est_km, est_fuel_l, status, started_at, district!inner(name, depot_to_district_freeflow_min), trip_stop(seq, order_id, status, loading_status, planned_arrival, handling_allowance_min, orders!inner(order_ref, outlet!inner(name, window_open, window_close, mall_window_start, mall_window_end)))').eq('plan_id', plan.id).order('vehicle_id').order('trip_no'),
    supabase.from('deferral_record').select('order_id, reason_code, dispatcher_note, unavoidable, priority_score, orders!inner(order_ref, order_date, status, outlet!inner(name))').eq('plan_id', plan.id).order('priority_score', { ascending: false }),
  ]);
  const familyEnds: Record<string, number> = {};
  const clockText = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
  const plannedTrips = (check(trips) ?? []).map((t) => {
    const key = `${t.vehicle_id}:${t.brand === 'FRESH' ? 'FRESH' : 'DAY'}`;
    const departure = familyEnds[key] ?? (t.brand === 'FRESH' ? 210 : 480);
    const last = [...t.trip_stop].sort((a, b) => b.seq - a.seq)[0];
    const lastEta = hhmmColombo(last?.planned_arrival ?? null);
    const lastMinute = lastEta ? Number(lastEta.slice(0, 2)) * 60 + Number(lastEta.slice(3, 5)) : departure;
    familyEnds[key] = lastMinute + (last?.handling_allowance_min ?? 0) + t.district.depot_to_district_freeflow_min;
    return { t, departure: clockText(departure) };
  });
  return {
    planId: plan.id,
    planStatus: plan.status,
    trips: plannedTrips.map(({ t, departure }) => ({
      tripId: t.id, vehicleId: t.vehicle_id, tripNo: t.trip_no, brand: t.brand, districtName: t.district.name, departure, tempClass: t.temp_class,
      plannedMinutes: t.planned_minutes, weightKg: num(t.total_weight_kg), volumeM3: num(t.total_volume_m3), estKm: num(t.est_km), estFuelL: num(t.est_fuel_l), status: t.status, startedAt: t.started_at,
      stops: [...t.trip_stop].sort((a, b) => a.seq - b.seq).map((s) => ({ orderId: s.order_id, orderRef: s.orders.order_ref, outletName: s.orders.outlet.name, eta: hhmmColombo(s.planned_arrival), window: `${hhmm(s.orders.outlet.mall_window_start ?? s.orders.outlet.window_open)}–${hhmm(s.orders.outlet.mall_window_end ?? s.orders.outlet.window_close)}`, close: hhmm(s.orders.outlet.mall_window_end ?? s.orders.outlet.window_close), status: s.status, loadingStatus: s.loading_status })),
    })),
    deferrals: (check(defs) ?? []).map((d) => ({
      orderId: d.order_id, orderRef: d.orders.order_ref, outletName: d.orders.outlet.name, reasonCode: d.reason_code,
      reason: d.dispatcher_note ?? d.reason_code, unavoidable: d.unavoidable, priorityScore: num(d.priority_score), moved: d.orders.order_date !== planDate || d.orders.status === 'NEXT_RUN',
    })),
  };
}

const AWAITING_APPROVAL = 'The dispatch plan is awaiting dispatcher approval. Trips will appear once it is approved and released.';
/** Throws a clear message when the day only has unapproved (DRAFT) plans. */
async function ensureReleased(day: string, hasRows: boolean) {
  if (hasRows) return;
  const { data } = await supabase.from('dispatch_plan').select('id').eq('plan_date', day).eq('status', 'DRAFT').limit(1);
  if (data?.length) throw new ApiError(AWAITING_APPROVAL, 409);
}

async function tripSummaries(planDate?: string): Promise<LoadingTrip[]> {
  const day = planDate ?? await activePlanDate();
  const q = supabase.from('trip').select('id, vehicle_id, trip_no, brand, temp_class, status, total_weight_kg, total_volume_m3, district_id, dispatch_plan!inner(plan_date, status), trip_stop(id, status)')
    .eq('dispatch_plan.plan_date', day).neq('status', 'DRAFT');
  const rows = check(await q.order('vehicle_id').order('trip_no'));
  await ensureReleased(day, Boolean(rows?.length));
  return (rows ?? []).map((t) => ({
    tripId: t.id, vehicleId: t.vehicle_id, tripNo: t.trip_no, brand: t.brand as ProductBrandCode,
    temperature: t.temp_class, status: t.status, totalStops: t.trip_stop.length,
    completedStops: t.trip_stop.filter((s) => ['LOADED', 'DELIVERED', 'PARTIAL_DELIVERY'].includes(s.status)).length,
    totalWeightKg: num(t.total_weight_kg), totalVolumeM3: num(t.total_volume_m3), districtId: t.district_id,
  }));
}

const STOP_SELECT = 'id, seq, status, loading_status, order_id, orders!inner(order_ref, order_units, order_weight_kg, order_volume_m3, outlet_id, outlet!inner(name, address, latitude, longitude, dock_type, parking_constraint, brand, window_open, window_close, district!inner(name)))';

export const api = {
  health: async () => ({ status: 'UP' }),

  adminUsers: async (): Promise<AdminUser[]> => {
    const [profiles, roles, outlets, depots] = await Promise.all([
      supabase.from('profiles').select('*').order('email'),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('outlet').select('id, name'),
      supabase.from('depot').select('id, name'),
    ]);
    const oName = new Map((check(outlets) ?? []).map((o) => [o.id, o.name]));
    const dName = new Map((check(depots) ?? []).map((d) => [d.id, d.name]));
    const roleOf = new Map((check(roles) ?? []).map((r) => [r.user_id, r.role]));
    return (check(profiles) ?? []).filter((p) => roleOf.has(p.id)).map((p) => ({
      id: p.id, email: p.email, role: roleOf.get(p.id) as LoginResponse['role'],
      outletId: p.outlet_id, outletName: p.outlet_id ? oName.get(p.outlet_id) ?? null : null,
      depotId: p.depot_id, depotName: p.depot_id ? dName.get(p.depot_id) ?? null : null,
      vehicleId: p.vehicle_id, active: p.active,
    }));
  },
  adminCreateUser: async (payload: { email: string; password: string; role: LoginResponse['role']; outletId?: string; depotId?: string; vehicleId?: string }): Promise<AdminUser> => {
    try {
      const { id } = await adminCreateUserFn({ data: payload });
      return adminUserById(id);
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : 'Could not create user.', 400);
    }
  },
  createUser: async (payload: { email: string; password: string; role: LoginResponse['role']; outletId?: string; depotId?: string; vehicleId?: string }): Promise<CreatedUserResponse> => {
    const u = await api.adminCreateUser(payload);
    return { email: u.email, role: u.role, displayName: u.email.split('@')[0] ?? u.email };
  },
  adminSetUserStatus: async (id: string, active: boolean) => {
    check(await supabase.from('profiles').update({ active }).eq('id', id));
    return adminUserById(id);
  },
  adminSetUserAssignment: async (id: string, payload: { depotId?: string; vehicleId?: string }) => {
    check(await supabase.from('profiles').update({ depot_id: payload.depotId ?? null, vehicle_id: payload.vehicleId ?? null }).eq('id', id));
    return adminUserById(id);
  },
  adminOverview: async (params?: { date?: string; depotId?: string; brand?: string; periodDays?: number }): Promise<AdminOverview> => {
    const date = params?.date ?? today();
    const period = params?.periodDays ?? 7;
    const from = new Date(`${date}T00:00:00Z`); from.setUTCDate(from.getUTCDate() - (period - 1));
    let q = supabase.from('orders').select('id, status, order_date, product_brand, outlet!inner(depot_id, depot!inner(name))')
      .gte('order_date', from.toISOString().slice(0, 10)).lte('order_date', date);
    if (params?.depotId) q = q.eq('outlet.depot_id', params.depotId);
    if (params?.brand) q = q.eq('product_brand', params.brand);
    const rows = check(await q) ?? [];
    const day = rows.filter((r) => r.order_date === date);
    const done = (s: string) => ['DELIVERED', 'RECEIVED'].includes(s);
    const planned = (s: string) => !['PLACED', 'NEXT_RUN', 'DEFERRED', 'FAILED'].includes(s);
    const group = (key: (r: (typeof rows)[number]) => string) => {
      const m = new Map<string, { completed: number; planned: number }>();
      day.forEach((r) => { const k = key(r); const v = m.get(k) ?? { completed: 0, planned: 0 }; if (planned(r.status)) v.planned++; if (done(r.status)) v.completed++; m.set(k, v); });
      return [...m.entries()].map(([label, v]) => ({ label, ...v }));
    };
    const trend: AdminOverview['trend'] = [];
    for (let i = 0; i < period; i++) {
      const d = new Date(from); d.setUTCDate(from.getUTCDate() + i);
      const ds = d.toISOString().slice(0, 10);
      const set = rows.filter((r) => r.order_date === ds && planned(r.status));
      trend.push({ date: ds, onTimePercent: set.length ? Math.round((set.filter((r) => done(r.status)).length / set.length) * 100) : 0 });
    }
    const statusCounts = new Map<string, number>();
    day.forEach((r) => statusCounts.set(r.status, (statusCounts.get(r.status) ?? 0) + 1));
    return {
      date,
      confirmedOrders: day.length,
      plannedStops: day.filter((r) => planned(r.status)).length,
      completedStops: day.filter((r) => done(r.status)).length,
      atRiskDeliveries: day.filter((r) => ['SHORT_LOADED', 'FAILED', 'DISPUTED'].includes(r.status)).length,
      deferredOrders: day.filter((r) => ['DEFERRED', 'NEXT_RUN'].includes(r.status)).length,
      progress: [...statusCounts.entries()].map(([label, count]) => ({ label, count })),
      trend,
      depotPerformance: group((r) => r.outlet.depot.name),
      brandPerformance: group((r) => r.product_brand),
    };
  },

  outlets: async (depotId?: string): Promise<Outlet[]> => {
    let q = supabase.from('outlet').select('*').eq('active', true).order('id');
    if (depotId) q = q.eq('depot_id', depotId);
    return (check(await q) ?? []).map((o) => ({
      id: o.id, name: o.name, brand: o.brand as Outlet['brand'], districtId: o.district_id, depotId: o.depot_id,
      parkingConstraint: o.parking_constraint, dockType: o.dock_type,
    }));
  },
  vehicles: async (depotId?: string): Promise<Vehicle[]> => {
    let q = supabase.from('vehicle').select('*').order('id');
    if (depotId) q = q.eq('home_depot_id', depotId);
    return (check(await q) ?? []).map((v) => ({
      id: v.id, depotId: v.home_depot_id, type: v.type, temperature: v.temp, status: v.status,
      weightCapKg: num(v.weight_cap_kg), volumeCapM3: num(v.volume_cap_m3), weeklyFuelQuotaL: num(v.weekly_fuel_quota_l), kmPerL: num(v.km_per_l),
    }));
  },
  orders: async (outletId?: string, orderDate?: string): Promise<Order[]> => {
    let q = supabase.from('orders').select('*').order('placed_at', { ascending: false });
    if (outletId) q = q.eq('outlet_id', outletId);
    if (orderDate) q = q.eq('order_date', orderDate);
    return (check(await q) ?? []).map(mapOrder);
  },
  createOrder: async (payload: { productBrand: ProductBrandCode; itemDescription: string; deliveryDate: string; tempRequirement: TempRequirement; units: number; weightKg: number; volumeM3: number }): Promise<Order> => {
    const u = await me();
    if (!u.outletId) throw new ApiError('Your account is not assigned to an active outlet', 403);
    const decision = decideCutoff(payload.deliveryDate);
    const ref = `WPT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const row = check(await supabase.from('orders').insert({
      order_ref: ref, outlet_id: u.outletId, product_brand: payload.productBrand, item_description: payload.itemDescription,
      order_date: decision.effectiveDate, after_cutoff: decision.afterCutoff, temp_requirement: payload.tempRequirement,
      order_units: payload.units, order_weight_kg: payload.weightKg, order_volume_m3: payload.volumeM3,
      status: decision.afterCutoff ? 'NEXT_RUN' : 'PLACED', created_by: u.id,
    }).select('*').single());
    return mapOrder(row);
  },
  receiveOrder: async (id: string): Promise<Order> => {
    const row = check(await supabase.from('orders').update({ status: 'RECEIVED' }).eq('id', id).neq('status', 'RECEIVED').select('*').maybeSingle());
    if (!row) throw new ApiError('Order was not found or already received', 409);
    return mapOrder(row);
  },

  resetDemoDay: async (planDate: string) => {
    try { return await resetDemoDayFn({ data: { planDate } }); } catch (e) { throw new ApiError(e instanceof Error ? e.message : 'Could not reset demo day.', 400); }
  },
  carryDeferred: async (depotId: string, fromDate: string, toDate: string, orderId?: string) => {
    try { return await carryDeferredFn({ data: { depotId, fromDate, toDate, orderId } }); } catch (e) { throw new ApiError(e instanceof Error ? e.message : 'Could not move deferred orders.', 400); }
  },
  runPlan: async (depotId: string, planDate: string, replan = false): Promise<PlanRunResult> => {
    try {
      return await runPlanFn({ data: { depotId, planDate, replan } });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : 'Could not run plan.', 400);
    }
  },
  editPlan: async (input: { depotId: string; planDate: string; operation: 'vehicle' | 'move' | 'reorder' | 'assign'; tripId: string; vehicleId?: string; orderId?: string; orderIds?: string[] }) => {
    try { return await editPlanFn({ data: input }); }
    catch (e) { throw new ApiError(e instanceof Error ? e.message : 'Could not save the plan change.', 400); }
  },
  planningContext: async (depotId: string, planDate: string): Promise<PlanningContext> => {
    const [orders, vehicles] = await Promise.all([
      supabase.from('orders').select('id, order_ref, product_brand, temp_requirement, order_units, order_weight_kg, order_volume_m3, deferred_yesterday, status, outlet!inner(name, depot_id)')
        .eq('outlet.depot_id', depotId).eq('order_date', planDate).in('status', ['PLACED', 'NEXT_RUN', 'DEFERRED', 'PLANNED'])
        .order('deferred_yesterday', { ascending: false }).order('placed_at'),
      api.vehicles(depotId),
    ]);
    return {
      orders: (check(orders) ?? []).map((o) => ({
        id: o.id, orderRef: o.order_ref, outletName: o.outlet.name, brand: o.product_brand as ProductBrandCode,
        depotId: o.outlet.depot_id, temperature: o.temp_requirement as TempRequirement, weightKg: num(o.order_weight_kg),
        volumeM3: num(o.order_volume_m3), units: o.order_units, deferredYesterday: o.deferred_yesterday, status: o.status,
      })),
      vehicles,
      ...(await planSummary(depotId, planDate)),
    };
  },

  loadingQueue: (planDate?: string) => tripSummaries(planDate),
  /** Nearest plan date on/after today (else latest plan, else today). */
  activePlanDate: () => activePlanDate(),
  /** Dispatcher approval: release a DRAFT plan and its trips to loaders and drivers. */
  approvePlan: async (planId: string) => {
    check(await supabase.from('trip').update({ status: 'PUBLISHED' }).eq('plan_id', planId).eq('status', 'DRAFT'));
    check(await supabase.from('dispatch_plan').update({ status: 'PUBLISHED' }).eq('id', planId).eq('status', 'DRAFT'));
  },
  /** Release a single trip (vehicle) to loaders and drivers. */
  approveTrip: async (tripId: string) => {
    check(await supabase.from('trip').update({ status: 'PUBLISHED' }).eq('id', tripId).eq('status', 'DRAFT'));
  },
  loadingTrip: async (tripId: string): Promise<LoadingTripDetails> => {
    const t = check(await supabase.from('trip').select(`id, vehicle_id, trip_no, brand, temp_class, status, total_weight_kg, total_volume_m3, district_id, trip_stop(${STOP_SELECT})`).eq('id', tripId).single());
    const stops = [...t.trip_stop].sort((a, b) => a.seq - b.seq);
    return {
      tripId: t.id, vehicleId: t.vehicle_id, tripNo: t.trip_no, brand: t.brand as ProductBrandCode, temperature: t.temp_class,
      status: t.status, totalStops: stops.length, completedStops: stops.filter((s) => s.loading_status === 'LOADED').length,
      totalWeightKg: num(t.total_weight_kg), totalVolumeM3: num(t.total_volume_m3), districtId: t.district_id,
      stops: stops.map((s) => ({
        stopId: s.id, orderId: s.order_id, orderRef: s.orders.order_ref, outletId: s.orders.outlet_id, outletName: s.orders.outlet.name,
        sequence: s.seq + 1, status: s.loading_status, units: s.orders.order_units, weightKg: num(s.orders.order_weight_kg), volumeM3: num(s.orders.order_volume_m3),
      })),
    };
  },
  updateLoadingStop: async (stopId: string, status: string): Promise<void> => {
    const row = check(await supabase.from('trip_stop').update({ loading_status: status }).eq('id', stopId).select('order_id').single());
    const orderStatus = status === 'LOADED' ? 'LOADED' : status === 'SHORT_LOADED' ? 'SHORT_LOADED' : 'LOADING';
    await supabase.from('orders').update({ status: orderStatus }).eq('id', row.order_id);
    if (status === 'MISSING') await supabase.from('loading_missing').insert({ stop_id: stopId });
  },
  updateLoadingTrip: async (tripId: string, status: string): Promise<void> => {
    check(await supabase.from('trip').update({ status }).eq('id', tripId));
  },
  loadingDefects: async (): Promise<LoadingDefect[]> => {
    const rows = check(await supabase.from('loading_defect').select('*, trip_stop!inner(id, orders!inner(order_ref, order_units))').order('created_at', { ascending: false }));
    return (rows ?? []).map((d) => ({
      id: d.id, stopId: d.stop_id, packageCode: d.trip_stop.orders.order_ref, typeAndCargo: d.issue_type, issueNote: d.notes,
      severity: d.severity as LoadingDefect['severity'], timestamp: d.created_at, status: d.status as LoadingDefect['status'],
      units: d.trip_stop.orders.order_units, scannedCount: 0, totalCount: d.trip_stop.orders.order_units,
    }));
  },
  createLoadingDefect: async (payload: { stopId: string; issueType: string; severity: string; notes: string }): Promise<LoadingDefect> => {
    const u = await me();
    const row = check(await supabase.from('loading_defect').insert({ stop_id: payload.stopId, issue_type: payload.issueType, severity: payload.severity.toLowerCase(), notes: payload.notes, created_by: u.id }).select('id').single());
    const all = await api.loadingDefects();
    return all.find((d) => d.id === row.id)!;
  },
  updateLoadingDefect: async (id: string, status: string): Promise<void> => {
    check(await supabase.from('loading_defect').update({ status }).eq('id', id));
  },
  loadingMissing: async (): Promise<LoadingMissingItem[]> => {
    const rows = check(await supabase.from('loading_missing').select('*, trip_stop!inner(trip!inner(vehicle_id), orders!inner(order_ref, order_weight_kg))').order('created_at', { ascending: false }));
    return (rows ?? []).map((m) => ({
      id: m.id, stopId: m.stop_id, packageCode: m.trip_stop.orders.order_ref, orderRef: m.trip_stop.orders.order_ref,
      vehicleId: m.trip_stop.trip.vehicle_id, weight: `${num(m.trip_stop.orders.order_weight_kg)} kg`, status: m.status as LoadingMissingItem['status'],
    }));
  },
  updateLoadingMissing: async (id: string, status: string): Promise<void> => {
    check(await supabase.from('loading_missing').update({ status }).eq('id', id));
  },

  driverTodayRoute: async (): Promise<DriverTodayRoute> => {
    const u = await me();
    if (!u.vehicleId) throw new ApiError('Your account is not assigned to a vehicle.', 404);
    const day = await activePlanDate();
    const rows = check(await supabase.from('trip').select(`id, trip_no, status, est_km, planned_minutes, vehicle_id, district!inner(name, inter_stop_km, inter_stop_freeflow_min, depot_to_district_km, depot_to_district_freeflow_min), dispatch_plan!inner(plan_date, status, depot!inner(name)), trip_stop(${STOP_SELECT})`)
      .eq('vehicle_id', u.vehicleId).eq('dispatch_plan.plan_date', day).not('status', 'in', '(DRAFT,COMPLETED)').order('trip_no').limit(1));
    const t = rows?.[0];
    if (!t) {
      const { data: draft } = await supabase.from('trip').select('id, dispatch_plan!inner(plan_date, status)').eq('vehicle_id', u.vehicleId).eq('dispatch_plan.plan_date', day).eq('dispatch_plan.status', 'DRAFT').limit(1);
      if (draft?.length) throw new ApiError(AWAITING_APPROVAL, 409);
    }
    if (!t) throw new ApiError('No route is assigned to you today.', 404);
    const stops = [...t.trip_stop].sort((a, b) => a.seq - b.seq);
    const done = ['DELIVERED', 'PARTIAL_DELIVERY', 'UNABLE_TO_DELIVER', 'SKIPPED'];
    return {
      routeId: t.id, routeLabel: `${t.vehicle_id} · Trip ${t.trip_no}`, vehicleId: t.vehicle_id,
      depotName: t.dispatch_plan.depot.name, districtName: t.district.name, status: t.status,
      totalStops: stops.length, completedStops: stops.filter((s) => done.includes(s.status)).length,
      plannedDistanceKm: num(t.est_km), plannedMinutes: t.planned_minutes,
      firstWindow: stops[0] ? `${hhmm(stops[0].orders.outlet.window_open)}–${hhmm(stops[0].orders.outlet.window_close)}` : null,
      stops: stops.map((s, i) => ({
        stopId: s.id, sequence: s.seq + 1, orderId: s.order_id, orderRef: s.orders.order_ref, outletId: s.orders.outlet_id,
        outletName: s.orders.outlet.name, address: s.orders.outlet.address, latitude: s.orders.outlet.latitude, longitude: s.orders.outlet.longitude,
        districtName: s.orders.outlet.district.name, category: s.orders.outlet.brand,
        window: `${hhmm(s.orders.outlet.window_open)}–${hhmm(s.orders.outlet.window_close)}`,
        access: s.orders.outlet.parking_constraint === 'VAN_ONLY' ? 'Van only' : s.orders.outlet.dock_type.replace('_', ' ').toLowerCase(),
        packages: s.orders.order_units, weightKg: num(s.orders.order_weight_kg), volumeM3: num(s.orders.order_volume_m3),
        distanceKm: i === 0 ? num(t.district.depot_to_district_km) : num(t.district.inter_stop_km),
        driveMinutes: i === 0 ? t.district.depot_to_district_freeflow_min : t.district.inter_stop_freeflow_min,
        status: s.status,
      })),
    };
  },
  driverStartRoute: async (routeId: string): Promise<void> => {
    check(await supabase.from('trip').update({ status: 'IN_PROGRESS', started_at: new Date().toISOString() }).eq('id', routeId));
    const stops = check(await supabase.from('trip_stop').select('order_id').eq('trip_id', routeId)) ?? [];
    if (stops.length) await supabase.from('orders').update({ status: 'IN_TRANSIT' }).in('id', stops.map((s) => s.order_id));
  },
  driverUpdateStop: async (stopId: string, payload: { status: DriverProofOfDelivery['outcome'] | 'PLANNED' | 'IN_TRANSIT' | 'ARRIVED' | 'SKIPPED'; note?: string }): Promise<void> => {
    check(await supabase.from('trip_stop').update({ status: payload.status, note: payload.note ?? null }).eq('id', stopId));
  },
  driverSubmitProofOfDelivery: async (stopId: string, payload: { receiverName?: string; outcome: DriverProofOfDelivery['outcome']; deliveredUnits?: number; shortUnits?: number; conditionNotes?: string; photoReference?: string; signatureReference?: string; clientEventId?: string; eventTime?: string }): Promise<DriverProofOfDelivery> => {
    const u = await me();
    const row = check(await supabase.from('proof_of_delivery').upsert({
      stop_id: stopId, driver_id: u.id, receiver_name: payload.receiverName ?? null, outcome: payload.outcome,
      delivered_units: payload.deliveredUnits ?? null, short_units: payload.shortUnits ?? null, condition_notes: payload.conditionNotes ?? null,
      photo_reference: payload.photoReference ?? null, signature_reference: payload.signatureReference ?? null,
      client_event_id: payload.clientEventId ?? crypto.randomUUID(), event_time: payload.eventTime ?? new Date().toISOString(),
    }, { onConflict: 'client_event_id' }).select('*').single());
    const stop = check(await supabase.from('trip_stop').update({ status: payload.outcome }).eq('id', stopId).select('order_id, trip_id').single());
    await supabase.from('orders').update({ status: payload.outcome === 'UNABLE_TO_DELIVER' ? 'FAILED' : 'DELIVERED' }).eq('id', stop.order_id);
    const remaining = check(await supabase.from('trip_stop').select('id').eq('trip_id', stop.trip_id).in('status', ['PLANNED', 'IN_TRANSIT', 'ARRIVED'])) ?? [];
    if (remaining.length === 0) await supabase.from('trip').update({ status: 'COMPLETED' }).eq('id', stop.trip_id);
    return {
      id: row.id, stopId: row.stop_id, receiverName: row.receiver_name, outcome: row.outcome as DriverProofOfDelivery['outcome'],
      deliveredUnits: row.delivered_units, shortUnits: row.short_units, conditionNotes: row.condition_notes,
      photoReference: row.photo_reference, signatureReference: row.signature_reference, eventTime: row.event_time, createdAt: row.created_at,
    };
  },
  driverFuelLogs: async (): Promise<DriverFuelLog[]> => {
    const rows = check(await supabase.from('driver_fuel_log').select('*').order('fuel_date', { ascending: false }));
    return (rows ?? []).map((f) => ({ id: f.id, fuelDate: f.fuel_date, odometerKm: num(f.odometer_km), litres: num(f.litres), station: f.station, cost: f.cost == null ? null : num(f.cost), currency: f.currency, receiptReference: f.receipt_reference, createdAt: f.created_at }));
  },
  driverCreateFuelLog: async (payload: { fuelDate: string; odometerKm: number; litres: number; station: string; cost?: number; currency?: string; receiptReference?: string; clientEventId?: string }): Promise<DriverFuelLog> => {
    const u = await me();
    const f = check(await supabase.from('driver_fuel_log').insert({
      driver_id: u.id, vehicle_id: u.vehicleId, fuel_date: payload.fuelDate, odometer_km: payload.odometerKm, litres: payload.litres,
      station: payload.station, cost: payload.cost ?? null, currency: payload.currency ?? 'LKR', receipt_reference: payload.receiptReference ?? null,
      client_event_id: payload.clientEventId ?? null,
    }).select('*').single());
    return { id: f.id, fuelDate: f.fuel_date, odometerKm: num(f.odometer_km), litres: num(f.litres), station: f.station, cost: f.cost == null ? null : num(f.cost), currency: f.currency, receiptReference: f.receipt_reference, createdAt: f.created_at };
  },
  driverCreateFineReport: async (payload: { stopId?: string; amount: number; currency?: string; reason: string; location?: string; ticketReference?: string; issuedAt?: string }): Promise<DriverFineReport> => {
    const u = await me();
    const f = check(await supabase.from('driver_fine_report').insert({
      driver_id: u.id, stop_id: payload.stopId ?? null, amount: payload.amount, currency: payload.currency ?? 'LKR', reason: payload.reason,
      location: payload.location ?? null, ticket_reference: payload.ticketReference ?? null, issued_at: payload.issuedAt ?? new Date().toISOString(),
    }).select('*').single());
    return { id: f.id, stopId: f.stop_id, amount: num(f.amount), currency: f.currency, reason: f.reason, location: f.location, ticketReference: f.ticket_reference, issuedAt: f.issued_at, status: f.status, createdAt: f.created_at };
  },
  driverCreateIncidentReport: async (payload: { stopId?: string; type: string; notes?: string; location?: string; reportedAt?: string }): Promise<DriverIncidentReport> => {
    const u = await me();
    const r = check(await supabase.from('driver_incident_report').insert({
      driver_id: u.id, stop_id: payload.stopId ?? null, type: payload.type, notes: payload.notes ?? null,
      location: payload.location ?? null, reported_at: payload.reportedAt ?? new Date().toISOString(),
    }).select('*').single());
    return { id: r.id, stopId: r.stop_id, type: r.type, notes: r.notes, location: r.location, reportedAt: r.reported_at, status: r.status, createdAt: r.created_at };
  },
  driverHistory: async (periodDays = 30): Promise<DriverHistory> => {
    const u = await me();
    const since = new Date(); since.setUTCDate(since.getUTCDate() - periodDays);
    const sinceDate = since.toISOString().slice(0, 10);
    const [trips, fuelLogs, fines, pods] = await Promise.all([
      u.vehicleId
        ? supabase.from('trip').select('id, trip_no, status, est_km, vehicle_id, dispatch_plan!inner(plan_date), trip_stop(status, orders!inner(order_units))').eq('vehicle_id', u.vehicleId).gte('dispatch_plan.plan_date', sinceDate)
        : Promise.resolve({ data: [], error: null }),
      api.driverFuelLogs(),
      supabase.from('driver_fine_report').select('*').order('issued_at', { ascending: false }),
      supabase.from('proof_of_delivery').select('*').gte('event_time', since.toISOString()).order('event_time', { ascending: false }),
    ]);
    const done = ['DELIVERED', 'PARTIAL_DELIVERY'];
    const tripRows = (check(trips as { data: unknown[] | null; error: null }) ?? []) as Array<{ id: string; trip_no: number; status: string; est_km: number; vehicle_id: string; dispatch_plan: { plan_date: string }; trip_stop: Array<{ status: string; orders: { order_units: number } }> }>;
    const mapped = tripRows.map((t) => {
      const c = t.trip_stop.filter((s) => done.includes(s.status)).length;
      return {
        routeId: t.id, routeLabel: `${t.vehicle_id} · Trip ${t.trip_no}`, planDate: t.dispatch_plan.plan_date, status: t.status,
        stops: t.trip_stop.length, completedStops: c, packages: t.trip_stop.reduce((s, x) => s + x.orders.order_units, 0),
        distanceKm: num(t.est_km), onTimePercent: t.trip_stop.length ? Math.round((c / t.trip_stop.length) * 100) : 0,
      };
    });
    const totalStops = mapped.reduce((s, t) => s + t.stops, 0);
    const completed = mapped.reduce((s, t) => s + t.completedStops, 0);
    return {
      tripCount: mapped.length, completedStops: completed,
      distanceKm: mapped.reduce((s, t) => s + t.distanceKm, 0), packages: mapped.reduce((s, t) => s + t.packages, 0),
      onTimePercent: totalStops ? Math.round((completed / totalStops) * 100) : 0,
      trips: mapped, fuelLogs,
      fineReports: (check(fines) ?? []).map((f) => ({ id: f.id, stopId: f.stop_id, amount: num(f.amount), currency: f.currency, reason: f.reason, location: f.location, ticketReference: f.ticket_reference, issuedAt: f.issued_at, status: f.status, createdAt: f.created_at })),
      proofOfDelivery: (check(pods) ?? []).map((row) => ({ id: row.id, stopId: row.stop_id, receiverName: row.receiver_name, outcome: row.outcome as DriverProofOfDelivery['outcome'], deliveredUnits: row.delivered_units, shortUnits: row.short_units, conditionNotes: row.condition_notes, photoReference: row.photo_reference, signatureReference: row.signature_reference, eventTime: row.event_time, createdAt: row.created_at })),
    };
  },
};