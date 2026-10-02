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
};
