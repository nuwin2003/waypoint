export type TempRequirement = 'CHILLED' | 'AMBIENT';

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
  role: 'STOREKEEPER' | 'DISPATCHER' | 'LOADER' | 'DRIVER';
  displayName: string;
};

const apiBase = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit, authenticated = true): Promise<T> {
  const token = authenticated ? localStorage.getItem('waypoint.token') : null;
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers ?? {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  login: (email: string, password: string) => request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false),
  signup: (payload: {
    email: string;
    password: string;
    role: 'STOREKEEPER' | 'DISPATCHER' | 'LOADER' | 'DRIVER';
    outletId?: string;
    depotId?: string;
    vehicleId?: string;
  }) => request<LoginResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false),
  outlets: (depotId?: string) => request<Outlet[]>(`/outlets${depotId ? `?depotId=${depotId}` : ''}`),
  vehicles: (depotId?: string) => request<Vehicle[]>(`/vehicles/availability${depotId ? `?depotId=${depotId}` : ''}`),
  orders: (outletId: string, orderDate: string) => request<Order[]>(`/orders?outletId=${outletId}&orderDate=${orderDate}`),
  createOrder: (payload: {
    outletId: string;
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
