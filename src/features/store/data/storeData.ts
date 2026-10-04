export type ProductBrand = 'Fresh dry' | 'Fresh chilled' | 'Style' | 'Tech';
export type OrderCondition = 'received' | 'damaged' | 'missing';
export type ScheduleStatus = 'Active' | 'Paused';

export interface StoreOrder {
  id: string;
  brand: ProductBrand;
  date: string;
  units: number;
  status: 'confirmed' | 'deferred' | 'departed' | 'arriving soon' | 'loading' | 'delivered';
  eta: string;
  windowCloses: string;
  itemSummary: string;
  vehicle: string;
  driver: string;
  risk?: string;
  timeline: { title: string; time: string; detail?: string; complete?: boolean }[];
  breakdown: { item: string; units: number }[];
}

export interface OrderSchedule {
  id: string;
  item: string;
  brand: ProductBrand;
  quantity: number;
  frequency: string;
  firstRun: string;
  nextRun: string;
  status: ScheduleStatus;
}

export const initialSchedules: OrderSchedule[] = [
  { id: 'SCH-01', item: 'Dry grocery cartons', brand: 'Fresh dry', quantity: 30, frequency: 'Every Monday', firstRun: '2026-09-28', nextRun: 'Mon 28 Sep', status: 'Active' },
  { id: 'SCH-02', item: 'Chilled crates', brand: 'Fresh chilled', quantity: 12, frequency: 'Every Thursday', firstRun: '2026-10-01', nextRun: 'Thu 1 Oct', status: 'Paused' },
];

export const storeOrders: StoreOrder[] = [
  {
    id: 'F-28491', brand: 'Fresh dry', date: 'Tue, Sep 28', units: 20, status: 'confirmed', eta: '6:45 AM', windowCloses: '8:00 AM',
    itemSummary: '12 cases dairy, 8 cases frozen', vehicle: 'VH-04', driver: 'Kasun P.',
    timeline: [
      { title: 'Order placed', time: 'Sep 27, 3:42 PM', complete: true },
      { title: 'Confirmed by dispatch', time: 'Sep 27, 4:15 PM', detail: 'By S. Perera · Dispatch #104', complete: true },
      { title: 'Assigned to vehicle and loaded', time: 'Sep 28, 5:10 AM', detail: 'VH-04 · Bay 3 · Kasun P.', complete: true },
      { title: 'Departed depot', time: 'Pending departure' },
      { title: 'En route', time: 'Live · ETA 6:45 AM' },
      { title: 'Arrived and unloading', time: 'Awaiting arrival' },
      { title: 'Delivered + confirmation', time: 'Awaiting outlet confirmation' },
    ],
    breakdown: [{ item: 'Dairy - Fresh Milk Cases', units: 12 }, { item: 'Frozen - Mixed Veg', units: 8 }],
  },
  {
    id: 'F-28492', brand: 'Fresh chilled', date: 'Tue, Sep 28', units: 14, status: 'deferred', eta: '9:30 AM', windowCloses: '10:00 AM',
    itemSummary: '6 cases yogurt, 8 cases fresh milk', vehicle: 'VH-11', driver: 'Nimal R.', risk: 'Vehicle maintenance delay · 30m buffer',
    timeline: [
      { title: 'Order placed', time: 'Sep 27, 3:55 PM', complete: true },
      { title: 'Confirmed by dispatch', time: 'Sep 27, 4:20 PM', complete: true },
      { title: 'Vehicle maintenance delay', time: 'Sep 28, 5:45 AM', detail: 'ETA updated to 9:30 AM' },
      { title: 'En route', time: 'Awaiting departure' },
      { title: 'Delivered + confirmation', time: 'Awaiting outlet confirmation' },
    ],
    breakdown: [{ item: 'Yogurt crates', units: 6 }, { item: 'Fresh milk cases', units: 8 }],
  },
  {
    id: 'F-28488', brand: 'Fresh dry', date: 'Tue, Sep 28', units: 24, status: 'departed', eta: '7:15 AM', windowCloses: '8:30 AM',
    itemSummary: '18 cases beverages, 6 cases snacks', vehicle: 'VH-07', driver: 'Amila D.', risk: '18m buffer',
    timeline: [{ title: 'Order placed', time: 'Sep 27, 2:52 PM', complete: true }, { title: 'Confirmed by dispatch', time: 'Sep 27, 4:12 PM', complete: true }, { title: 'Departed depot', time: 'Sep 28, 5:40 AM', complete: true }, { title: 'En route', time: 'Live · ETA 7:15 AM' }, { title: 'Delivered + confirmation', time: 'Awaiting outlet confirmation' }],
    breakdown: [{ item: 'Beverage cases', units: 18 }, { item: 'Snack cases', units: 6 }],
  },
  {
    id: 'F-28487', brand: 'Fresh chilled', date: 'Tue, Sep 28', units: 16, status: 'arriving soon', eta: '6:50 AM', windowCloses: '8:00 AM',
    itemSummary: '10 cases cheese, 6 cases butter', vehicle: 'VH-02', driver: 'Lakshman F.',
    timeline: [{ title: 'Order placed', time: 'Sep 27, 2:30 PM', complete: true }, { title: 'Confirmed by dispatch', time: 'Sep 27, 4:02 PM', complete: true }, { title: 'Departed depot', time: 'Sep 28, 5:30 AM', complete: true }, { title: 'En route', time: 'Live · ETA 6:50 AM' }, { title: 'Delivered + confirmation', time: 'Awaiting outlet confirmation' }],
    breakdown: [{ item: 'Cheese cases', units: 10 }, { item: 'Butter cases', units: 6 }],
  },
  {
    id: 'F-28501', brand: 'Fresh dry', date: 'Wed, Sep 29', units: 18, status: 'loading', eta: '6:00 AM', windowCloses: '7:30 AM',
    itemSummary: '10 cases rice, 8 cases oil', vehicle: 'VH-09', driver: 'TBD',
    timeline: [{ title: 'Order placed', time: 'Sep 28, 2:10 PM', complete: true }, { title: 'Confirmed by dispatch', time: 'Sep 28, 3:50 PM', complete: true }, { title: 'Loading', time: 'At Peliyagoda depot' }, { title: 'Departed depot', time: 'Awaiting departure' }, { title: 'Delivered + confirmation', time: 'Awaiting outlet confirmation' }],
    breakdown: [{ item: 'Rice cases', units: 10 }, { item: 'Cooking oil cases', units: 8 }],
  },
];

export const historyRecords = [
  { id: 'O-0988', brand: 'Fresh dry' as ProductBrand, date: '25 Sep 2026', units: 34, status: 'delivered', receipt: 'All items received', invoice: 'INV-2210', feedback: '5/5' },
  { id: 'O-0989', brand: 'Fresh chilled' as ProductBrand, date: '25 Sep 2026', units: 12, status: 'deferred', receipt: 'Not dispatched', invoice: '—', feedback: 'Not submitted' },
  { id: 'O-0954', brand: 'Style' as ProductBrand, date: '24 Sep 2026', units: 30, status: 'delivered', receipt: '2 cartons damaged · photo attached', invoice: 'INV-2198', feedback: '3/5' },
  { id: 'O-0955', brand: 'Tech' as ProductBrand, date: '18 Sep 2026', units: 15, status: 'delivered', receipt: '1 cable carton missing', invoice: 'INV-2199', feedback: '4/5' },
];
