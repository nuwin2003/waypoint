export type DispatchStatus = 'in transit' | 'assigned' | 'pending' | 'deferred' | 'delivered';
export type DispatchBrand = 'Fresh' | 'Style' | 'Tech';

export interface DispatchOrder {
  id: string;
  outlet: string;
  brand: DispatchBrand;
  depot: 'Peliyagoda' | 'Kandy';
  temperature: 'ambient' | 'chilled';
  units: number;
  weight: number;
  volume: number;
  cutoff: 'before 4 PM' | 'after 4 PM';
  status: DispatchStatus;
  date: string;
}

export const dispatchOrders: DispatchOrder[] = [
  { id: 'O-1001', outlet: 'Fresh Colombo Central', brand: 'Fresh', depot: 'Peliyagoda', temperature: 'ambient', units: 42, weight: 380, volume: 4.2, cutoff: 'before 4 PM', status: 'in transit', date: '25 Sep' },
  { id: 'O-1002', outlet: 'Fresh Colombo Central', brand: 'Fresh', depot: 'Peliyagoda', temperature: 'chilled', units: 18, weight: 120, volume: 1.8, cutoff: 'before 4 PM', status: 'in transit', date: '25 Sep' },
  { id: 'O-1003', outlet: 'Fresh Kandy City', brand: 'Fresh', depot: 'Kandy', temperature: 'ambient', units: 34, weight: 310, volume: 3.6, cutoff: 'before 4 PM', status: 'in transit', date: '25 Sep' },
  { id: 'O-1004', outlet: 'Fresh Kandy City', brand: 'Fresh', depot: 'Kandy', temperature: 'chilled', units: 20, weight: 150, volume: 2.1, cutoff: 'before 4 PM', status: 'in transit', date: '25 Sep' },
  { id: 'O-1005', outlet: 'Fresh Negombo', brand: 'Fresh', depot: 'Peliyagoda', temperature: 'chilled', units: 14, weight: 95, volume: 1.4, cutoff: 'before 4 PM', status: 'assigned', date: '25 Sep' },
  { id: 'O-1006', outlet: 'Fresh Galle', brand: 'Fresh', depot: 'Peliyagoda', temperature: 'ambient', units: 46, weight: 420, volume: 4.8, cutoff: 'before 4 PM', status: 'in transit', date: '25 Sep' },
  { id: 'O-1007', outlet: 'Fresh Galle', brand: 'Fresh', depot: 'Peliyagoda', temperature: 'chilled', units: 16, weight: 80, volume: 1.2, cutoff: 'before 4 PM', status: 'pending', date: '25 Sep' },
  { id: 'O-1008', outlet: 'Style Kandy City Centre', brand: 'Style', depot: 'Kandy', temperature: 'ambient', units: 22, weight: 240, volume: 3.4, cutoff: 'before 4 PM', status: 'assigned', date: '25 Sep' },
  { id: 'O-1009', outlet: 'Style Colombo City Centre', brand: 'Style', depot: 'Peliyagoda', temperature: 'ambient', units: 30, weight: 300, volume: 4.1, cutoff: 'after 4 PM', status: 'pending', date: '25 Sep' },
  { id: 'O-1010', outlet: 'Tech Colombo Flagship', brand: 'Tech', depot: 'Peliyagoda', temperature: 'ambient', units: 24, weight: 240, volume: 2.6, cutoff: 'before 4 PM', status: 'assigned', date: '25 Sep' },
  { id: 'O-1011', outlet: 'Tech Kandy', brand: 'Tech', depot: 'Kandy', temperature: 'ambient', units: 16, weight: 160, volume: 1.9, cutoff: 'after 4 PM', status: 'pending', date: '25 Sep' },
  { id: 'O-1012', outlet: 'Fresh Colombo South', brand: 'Fresh', depot: 'Peliyagoda', temperature: 'chilled', units: 19, weight: 175, volume: 2.2, cutoff: 'before 4 PM', status: 'deferred', date: '24 Sep' },
];

export const fleetVehicles = [
  { id: 'WP CAB-4521', code: 'V-01', type: 'truck', temperature: 'reefer', capacity: '5000 kg · 28 m³', depot: 'Peliyagoda', trips: '1/2', fuel: 90, quota: 280, status: 'on route' },
  { id: 'WP CAB-4522', code: 'V-02', type: 'truck', temperature: 'ambient', capacity: '5000 kg · 28 m³', depot: 'Peliyagoda', trips: '1/2', fuel: 138, quota: 280, status: 'on route' },
  { id: 'WP CAB-4523', code: 'V-03', type: 'truck', temperature: 'ambient', capacity: '5000 kg · 28 m³', depot: 'Peliyagoda', trips: '1/2', fuel: 70, quota: 280, status: 'breakdown' },
  { id: 'WP CAB-4510', code: 'V-04', type: 'truck', temperature: 'reefer', capacity: '5000 kg · 28 m³', depot: 'Kandy', trips: '1/2', fuel: 162, quota: 260, status: 'on route' },
  { id: 'WP CAG-2210', code: 'V-05', type: 'van', temperature: 'reefer', capacity: '900 kg · 6 m³', depot: 'Peliyagoda', trips: '0/2', fuel: 56, quota: 120, status: 'available' },
  { id: 'WP CAG-2211', code: 'V-06', type: 'van', temperature: 'ambient', capacity: '900 kg · 6 m³', depot: 'Peliyagoda', trips: '0/2', fuel: 69, quota: 110, status: 'available' },
  { id: 'WP CAG-2212', code: 'V-07', type: 'van', temperature: 'ambient', capacity: '900 kg · 6 m³', depot: 'Kandy', trips: '1/2', fuel: 55, quota: 110, status: 'loading' },
  { id: 'WP CAB-4530', code: 'V-08', type: 'truck', temperature: 'ambient', capacity: '5000 kg · 28 m³', depot: 'Kandy', trips: '0/2', fuel: 104, quota: 280, status: 'available' },
  { id: 'WP CAB-4531', code: 'V-09', type: 'truck', temperature: 'ambient', capacity: '5000 kg · 28 m³', depot: 'Peliyagoda', trips: '0/2', fuel: 280, quota: 280, status: 'maintenance' },
  { id: 'WP CAG-2213', code: 'V-10', type: 'van', temperature: 'reefer', capacity: '900 kg · 6 m³', depot: 'Kandy', trips: '0/2', fuel: 48, quota: 120, status: 'available' },
];

export const liveTrips = [
  { id: 'PW-3167', route: 'Peliyagoda - Colombo', status: 'on route', remaining: '1 h 36 min left', distance: '30 km', eta: '1 h 27 min', stops: ['18001 Granada', '18600 Motril', '29001 Malaga'], image: 'lorry1' as const },
  { id: 'PW-3168', route: 'Kandy - Gampola', status: 'on route', remaining: '1 h 36 min left', distance: '30 km', eta: '1 h 27 min', stops: ['Kandy City', 'Peradeniya', 'Gampola'], image: 'lorry2' as const },
  { id: 'PW-3169', route: 'Peliyagoda - Colombo', status: 'on route', remaining: '1 h 36 min left', distance: '30 km', eta: '1 h 27 min', stops: ['Peliyagoda', 'Kelaniya', 'Colombo Fort'], image: 'lorry1' as const },
  { id: 'PW-3170', route: 'Kandy - Trinco', status: 'on route', remaining: '1 h 36 min left', distance: '30 km', eta: '1 h 27 min', stops: ['Kandy', 'Habarana', 'Trincomalee'], image: 'lorry3' as const },
  { id: 'PW-3171', route: 'Peliyagoda - Galle', status: 'waiting', remaining: '1 h 52 min left', distance: '116 km', eta: '2 h 08 min', stops: ['Peliyagoda', 'Kalutara', 'Galle'], image: 'lorry2' as const },
  { id: 'PW-3172', route: 'Kandy - Badulla', status: 'on route', remaining: '2 h 16 min left', distance: '104 km', eta: '2 h 24 min', stops: ['Kandy', 'Nuwara Eliya', 'Badulla'], image: 'lorry3' as const },
  { id: 'PW-3173', route: 'Colombo - Negombo', status: 'on route', remaining: '48 min left', distance: '38 km', eta: '52 min', stops: ['Colombo', 'Ja-Ela', 'Negombo'], image: 'lorry1' as const },
  { id: 'PW-3174', route: 'Kandy - Matale', status: 'waiting', remaining: '1 h 12 min left', distance: '26 km', eta: '1 h 18 min', stops: ['Kandy', 'Akurana', 'Matale'], image: 'lorry2' as const },
];

export const planningOrders = [
  { id: 'O-1005', outlet: 'Fresh Negombo', brand: 'Fresh', weight: '95 kg', volume: '1.4 m³', depot: 'Peliyagoda', temperature: 'chilled', note: 'Skipped last run' },
  { id: 'O-1007', outlet: 'Fresh Galle', brand: 'Fresh', weight: '80 kg', volume: '1.2 m³', depot: 'Peliyagoda', temperature: 'chilled' },
  { id: 'O-1009', outlet: 'Style Colombo City Centre', brand: 'Style', weight: '300 kg', volume: '4.1 m³', depot: 'Peliyagoda', temperature: 'ambient' },
  { id: 'O-1011', outlet: 'Tech Kandy', brand: 'Tech', weight: '160 kg', volume: '1.9 m³', depot: 'Kandy', temperature: 'ambient' },
  { id: 'O-1013', outlet: 'Style Galle Fort', brand: 'Style', weight: '190 kg', volume: '2.8 m³', depot: 'Peliyagoda', temperature: 'ambient' },
  { id: 'O-1014', outlet: 'Tech Kurunegala', brand: 'Tech', weight: '310 kg', volume: '3.2 m³', depot: 'Kandy', temperature: 'ambient' },
];

export const candidateVehicles = [
  { id: 'WP CAB-4521', type: 'truck · reefer', depot: 'Peliyagoda', quota: '90 L quota left', clear: 0, selected: true },
  { id: 'WP CAB-4522', type: 'truck · ambient', depot: 'Peliyagoda', quota: '138 L quota left', clear: 1 },
  { id: 'WP CAB-4523', type: 'truck · ambient', depot: 'Peliyagoda', quota: '70 L quota left', clear: 1 },
  { id: 'WP CAB-4510', type: 'truck · reefer', depot: 'Kandy', quota: '162 L quota left', clear: 1 },
  { id: 'WP CAG-2210', type: 'van · reefer', depot: 'Peliyagoda', quota: '56 L quota left', clear: 0 },
  { id: 'WP CAG-2211', type: 'van · ambient', depot: 'Peliyagoda', quota: '69 L quota left', clear: 1 },
  { id: 'WP CAG-2212', type: 'van · ambient', depot: 'Kandy', quota: '55 L quota left', clear: 2 },
  { id: 'WP CAB-4530', type: 'truck · ambient', depot: 'Kandy', quota: '104 L quota left', clear: 2 },
  { id: 'WP CAB-4531', type: 'truck · ambient', depot: 'Peliyagoda', quota: '280 L quota left', clear: 1 },
  { id: 'WP CAG-2213', type: 'van · reefer', depot: 'Kandy', quota: '48 L quota left', clear: 1 },
];

export const incidents = [
  { id: 'EM-2048', priority: 'critical', title: 'Driver safety alert', description: 'SOS triggered from cab — driver is responsive.', driver: 'Arun Perera', route: 'Kandy → Colombo', vehicle: 'PW-3167 · Van', location: 'A1, Kadugannawa · 2 min ago', status: 'Support en route', meta: 'Unit RS-04 · ETA 12 min', time: '10:42 AM' },
  { id: 'EM-2047', priority: 'high', title: 'Vehicle breakdown', description: 'Engine power loss reported; vehicle secured off-road.', driver: 'Maya Silva', route: 'Galle → Matara', vehicle: 'WP-CAB-4821 · Truck', location: 'E01, Pinnaduwa · 8 min ago', status: 'Awaiting support', meta: 'Nearest unit 18 km away', time: '10:36 AM' },
  { id: 'EM-2044', priority: 'elevated', title: 'Route obstruction', description: 'Road closure requires a safe diversion and new ETA.', driver: 'Nimal Fernando', route: 'Badulla → Kandy', vehicle: 'CP-4589 · Van', location: 'A5, Nuwara Eliya · 21 min ago', status: 'Driver contacted', meta: 'Reroute review in progress', time: '10:23 AM' },
];

export const dispatchHistory = [
  { time: '10:18 AM', date: '29 Sep', type: 'delivery', event: 'Delivery completed', detail: 'Proof of delivery recorded', vehicle: 'PW-3167 · Arun Perera', route: 'Kandy → Colombo', outcome: 'Completed', owner: 'Auto update' },
  { time: '10:04 AM', date: '29 Sep', type: 'incident', event: 'Driver safety alert resolved', detail: 'Driver confirmed safe after check-in', vehicle: 'WP-CAB-1204 · K. Dias', route: 'Negombo → Colombo', outcome: 'Resolved in 9 min', owner: 'N. Silva' },
  { time: '9:46 AM', date: '29 Sep', type: 'intervention', event: 'Support unit assigned', detail: 'Roadside unit RS-02 dispatched', vehicle: 'CP-4589 · N. Fernando', route: 'Badulla → Kandy', outcome: 'Support completed', owner: 'D. Jayasinghe' },
  { time: '9:12 AM', date: '29 Sep', type: 'trip', event: 'Trip completed', detail: 'All three route stops confirmed', vehicle: 'WP-LD-7712 · M. Silva', route: 'Galle → Matara', outcome: '2h 14m · On time', owner: 'Auto update' },
  { time: '8:38 AM', date: '29 Sep', type: 'delivery', event: 'Delivery exception cleared', detail: 'Recipient contact verified', vehicle: 'PW-9041 · S. Kumara', route: 'Colombo → Kalutara', outcome: 'Completed', owner: 'N. Silva' },
  { time: '5:54 PM', date: '28 Sep', type: 'intervention', event: 'Route diversion approved', detail: 'Flooded segment avoided via B84', vehicle: 'NW-2238 · R. Peris', route: 'Kurunegala → Dambulla', outcome: '+18 min to ETA', owner: 'D. Jayasinghe' },
  { time: '4:21 PM', date: '28 Sep', type: 'incident', event: 'Vehicle fault closed', detail: 'Battery terminal repaired roadside', vehicle: 'SP-6610 · T. Iqbal', route: 'Matara → Hambantota', outcome: 'Resolved in 34 min', owner: 'N. Silva' },
];
