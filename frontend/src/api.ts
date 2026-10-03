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
    deferredYesterday: boolean;
    status: string;
  }>;
  vehicles: Vehicle[];
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

const apiBase = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiErrorBody = {
  detail?: string;
  message?: string;
  code?: string;
};

async function request<T>(path: string, options?: RequestInit, authenticated = true): Promise<T> {
  const token = authenticated ? localStorage.getItem('waypoint.token') : null;
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      ...options,
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError('Could not reach Waypoint. Check your connection and try again.', 0, 'NETWORK_ERROR');
  }
  if (!response.ok) {
    const raw = await response.text();
    let body: ApiErrorBody | null = null;
    try { body = JSON.parse(raw) as ApiErrorBody; } catch { /* Non-JSON proxy errors are intentionally not shown verbatim. */ }
    const statusMessage = response.status === 401
      ? 'Your session has expired. Please sign in again.'
      : response.status === 403
        ? 'You do not have permission to do that.'
        : response.status >= 500
          ? 'Waypoint could not complete the request. Please try again.'
          : `Request failed (${response.status}).`;
    throw new ApiError(body?.detail || body?.message || statusMessage, response.status, body?.code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function queryString(values: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const encoded = query.toString();
  return encoded ? `?${encoded}` : '';
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  login: (email: string, password: string) => request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false),
  createUser: (payload: {
    email: string;
    password: string;
    role: LoginResponse['role'];
    outletId?: string;
    depotId?: string;
    vehicleId?: string;
  }) => request<CreatedUserResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  adminUsers: () => request<AdminUser[]>('/admin/users'),
  adminCreateUser: (payload: {
    email: string;
    password: string;
    role: LoginResponse['role'];
    outletId?: string;
    depotId?: string;
    vehicleId?: string;
  }) => request<AdminUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  adminSetUserStatus: (id: string, active: boolean) => request<AdminUser>(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  }),
  adminSetUserAssignment: (id: string, payload: { depotId?: string; vehicleId?: string }) =>
    request<AdminUser>(`/admin/users/${id}/assignment`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminOverview: (params?: { date?: string; depotId?: string; brand?: string; periodDays?: number }) => request<AdminOverview>(`/admin/overview${queryString({
    date: params?.date,
    depotId: params?.depotId,
    brand: params?.brand,
    periodDays: params?.periodDays?.toString(),
  })}`),
  outlets: (depotId?: string) => request<Outlet[]>(`/outlets${queryString({ depotId })}`),
  vehicles: (depotId?: string) => request<Vehicle[]>(`/vehicles/availability${queryString({ depotId })}`),
  orders: (outletId?: string, orderDate?: string) => request<Order[]>(`/orders${queryString({ outletId, orderDate })}`),
  createOrder: (payload: {
    productBrand: ProductBrandCode;
    itemDescription: string;
    deliveryDate: string;
    tempRequirement: TempRequirement;
    units: number;
    weightKg: number;
    volumeM3: number;
  }) => request<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  runPlan: (depotId: string, planDate: string) => request<PlanRunResult>('/plans/run', {
    method: 'POST',
    body: JSON.stringify({ depotId, planDate }),
  }),
  planningContext: (depotId: string, planDate: string) => request<PlanningContext>(`/plans/context${queryString({ depotId, planDate })}`),
  loadingQueue: (planDate?: string) => request<LoadingTrip[]>(`/loading/queue${queryString({ planDate })}`),
  loadingTrip: (tripId: string) => request<LoadingTripDetails>(`/loading/trips/${tripId}`),
  updateLoadingStop: (stopId: string, status: string) => request<void>(`/loading/stops/${stopId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  updateLoadingTrip: (tripId: string, status: string) => request<void>(`/loading/trips/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  loadingDefects: () => request<LoadingDefect[]>('/loading/defects'),
  createLoadingDefect: (payload: { stopId: string; issueType: string; severity: string; notes: string }) =>
    request<LoadingDefect>('/loading/defects', { method: 'POST', body: JSON.stringify(payload) }),
  updateLoadingDefect: (id: string, status: string) => request<void>(`/loading/defects/${id}`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }),
  loadingMissing: () => request<LoadingMissingItem[]>('/loading/missing'),
  updateLoadingMissing: (id: string, status: string) => request<void>(`/loading/missing/${id}`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }),
  driverTodayRoute: () => request<DriverTodayRoute>('/driver/route/today'),
  driverStartRoute: (routeId: string) => request<void>(`/driver/routes/${routeId}/start`, { method: 'POST' }),
  driverUpdateStop: (stopId: string, payload: { status: DriverProofOfDelivery['outcome'] | 'PLANNED' | 'IN_TRANSIT' | 'ARRIVED' | 'SKIPPED'; note?: string }) =>
    request<void>(`/driver/stops/${stopId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  driverSubmitProofOfDelivery: (stopId: string, payload: {
    receiverName?: string;
    outcome: DriverProofOfDelivery['outcome'];
    deliveredUnits?: number;
    shortUnits?: number;
    conditionNotes?: string;
    photoReference?: string;
    signatureReference?: string;
    clientEventId?: string;
    eventTime?: string;
  }) => request<DriverProofOfDelivery>(`/driver/stops/${stopId}/proof-of-delivery`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  driverFuelLogs: () => request<DriverFuelLog[]>('/driver/fuel'),
  driverCreateFuelLog: (payload: {
    fuelDate: string;
    odometerKm: number;
    litres: number;
    station: string;
    cost?: number;
    currency?: string;
    receiptReference?: string;
    clientEventId?: string;
  }) => request<DriverFuelLog>('/driver/fuel', {
    method: 'POST',
    body: JSON.stringify({ currency: 'LKR', ...payload }),
  }),
  driverCreateFineReport: (payload: {
    stopId?: string;
    amount: number;
    currency?: string;
    reason: string;
    location?: string;
    ticketReference?: string;
    issuedAt?: string;
  }) => request<DriverFineReport>('/driver/fines', {
    method: 'POST',
    body: JSON.stringify({ currency: 'LKR', ...payload }),
  }),
  driverCreateIncidentReport: (payload: {
    stopId?: string;
    type: string;
    notes?: string;
    location?: string;
    reportedAt?: string;
  }) => request<DriverIncidentReport>('/driver/incidents', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  driverHistory: (periodDays = 30) => request<DriverHistory>(`/driver/history${queryString({ periodDays: String(periodDays) })}`),
};
