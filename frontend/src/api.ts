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

const apiBase = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit, authenticated = true): Promise<T> {
  const token = authenticated ? localStorage.getItem('waypoint.token') : null;
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string; message?: string } | null;
    throw new Error(body?.detail || body?.message || `Request failed with ${response.status}`);
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
    role: 'STOREKEEPER' | 'DISPATCHER' | 'LOADER' | 'DRIVER';
    outletId?: string;
    depotId?: string;
    vehicleId?: string;
  }) => request<CreatedUserResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  outlets: (depotId?: string) => request<Outlet[]>(`/outlets${queryString({ depotId })}`),
  vehicles: (depotId?: string) => request<Vehicle[]>(`/vehicles/availability${queryString({ depotId })}`),
  orders: (outletId: string | undefined, orderDate: string) => request<Order[]>(`/orders${queryString({ outletId, orderDate })}`),
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
