import type { Order, ProductBrandCode, TempRequirement } from '../api';

export type OfflineOrderPayload = {
  productBrand: ProductBrandCode;
  itemDescription: string;
  deliveryDate: string;
  tempRequirement: TempRequirement;
  units: number;
  weightKg: number;
  volumeM3: number;
};

const STORAGE_KEY = 'waypoint.pending-orders';
const CHANGE_EVENT = 'waypoint:pending-sync-changed';

function readQueue(): OfflineOrderPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as OfflineOrderPayload[] : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineOrderPayload[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function pendingOrderCount() {
  return readQueue().length;
}

export function subscribePendingOrderChanges(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

export function enqueueOfflineOrder(payload: OfflineOrderPayload) {
  writeQueue([...readQueue(), payload]);
}

export async function syncPendingOrders(
  createOrder: (payload: OfflineOrderPayload) => Promise<Order>,
) {
  const queue = readQueue();
  if (queue.length === 0) return;

  const remaining: OfflineOrderPayload[] = [];
  for (let index = 0; index < queue.length; index += 1) {
    try {
      await createOrder(queue[index]);
    } catch {
      remaining.push(...queue.slice(index));
      break;
    }
  }
  writeQueue(remaining);
}
