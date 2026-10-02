// Sample data for the driver screens. Mirrors docs/screens/* and the reference
// UI. No backend is wired yet, so these values stand in until the API exists.

export type StopCategory = 'Fresh' | 'Frozen' | 'Dry';

export interface DriverStop {
  /** Route position, 1-based. */
  position: number;
  name: string;
  address: string;
  packages: number;
  category: StopCategory;
  window: string;
  access: string;
  /** Sample driving distance from the previous point, in km. */
  distanceKm: number;
  /** Sample driving time from the previous point, in minutes. */
  driveMin: number;
}

export const ROUTE_ID = 'LP-6387';
export const TRIP_ID = 'WD-R14';
export const VEHICLE = 'V-14';
export const DEPOT = 'Peliyagoda';
export const DESTINATION = 'Colombo';
export const DRIVER_NAME = 'Ravi';
export const DRIVER_INITIALS = 'NS';
export const FIRST_DELIVERY = 'before 8:00 AM';

export const STOPS: DriverStop[] = [
  {
    position: 1,
    name: 'Northgate Market',
    address: '42 Negombo Road, Peliyagoda',
    packages: 5,
    category: 'Fresh',
    window: '6:30–8:00 AM',
    access: 'Rear loading bay · enter from Station Road',
    distanceKm: 2.0,
    driveMin: 5,
  },
  {
    position: 2,
    name: 'Riverside Grocer',
    address: '18 Kelani Mawatha, Colombo 14',
    packages: 4,
    category: 'Fresh',
    window: '6:00–8:00 AM',
    access: 'Curbside unloading · contact receiver on arrival',
    distanceKm: 3.1,
    driveMin: 8,
  },
  {
    position: 3,
    name: 'Harbour Foods',
    address: '5 Port Access Road, Colombo 15',
    packages: 6,
    category: 'Frozen',
    window: '8:00–10:00 AM',
    access: 'Side gate · ask security for the goods-in desk',
    distanceKm: 1.8,
    driveMin: 6,
  },
  {
    position: 4,
    name: 'Pettah Central Mart',
    address: '120 Main Street, Colombo 11',
    packages: 4,
    category: 'Dry',
    window: '9:00–11:00 AM',
    access: 'Short-stay bay on Main Street · max 15 minutes',
    distanceKm: 1.5,
    driveMin: 7,
  },
];

export const CURRENT_STOP_INDEX = 0;
export const TOTAL_PACKAGES = STOPS.reduce((sum, s) => sum + s.packages, 0);
export const PLANNED_DISTANCE_KM = STOPS.reduce((sum, s) => sum + s.distanceKm, 0);
export const PLANNED_MINUTES = STOPS.reduce((sum, s) => sum + s.driveMin, 0);

export const PACKAGES = ['PKG-9040', 'PKG-9041', 'PKG-9042', 'PKG-9043', 'PKG-9044'];

export type DeliveryOutcome = 'Delivered' | 'Partial delivery' | 'Unable to deliver';

export interface Trip {
  id: string;
  daysAgo: number;
  duration: string;
  stops: number;
  km: number;
  packages: number;
  onTime: number;
}

export const TRIPS: Trip[] = [
  { id: 'WD-R13', daysAgo: 1, duration: '6h 12m', stops: 7, km: 142, packages: 48, onTime: 100 },
  { id: 'WD-R11', daysAgo: 3, duration: '4h 48m', stops: 5, km: 98, packages: 34, onTime: 80 },
  { id: 'WD-R08', daysAgo: 9, duration: '7h 30m', stops: 9, km: 176, packages: 61, onTime: 89 },
  { id: 'WD-R05', daysAgo: 20, duration: '5h 10m', stops: 6, km: 121, packages: 41, onTime: 100 },
  { id: 'WD-R02', daysAgo: 41, duration: '5h 46m', stops: 6, km: 133, packages: 39, onTime: 83 },
];

export type HistoryPeriod = '7d' | '30d' | 'all';

export function periodDays(period: HistoryPeriod): number {
  if (period === '7d') return 7;
  if (period === '30d') return 30;
  return Number.POSITIVE_INFINITY;
}

export function tripsForPeriod(period: HistoryPeriod): Trip[] {
  const days = periodDays(period);
  return TRIPS.filter((t) => t.daysAgo <= days);
}

// --- date and time helpers (device clock, like the reference useNow) ---

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function greeting(now: Date): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatLongDate(now: Date): string {
  return `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
}

export function formatClock(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, '0')} ${period}`;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function daysAgoDate(now: Date, daysAgo: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d;
}
