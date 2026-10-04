export const adminAuditEvents = [
  { id: 'EV-2148', event: 'Order deferred', ref: 'ORD-0832 · EV-2148', person: 'Sunil Perera', role: 'Dispatcher', depot: 'Kandy', eventTime: '07:38 AM', received: '07:38 AM', status: 'Recorded' },
  { id: 'EV-2147', event: 'Offline delivery synced', ref: 'RT-1042 · Stop 4 · EV-2147', person: 'Nuwan Silva', role: 'Driver', depot: 'Kandy', eventTime: '07:12 AM', received: '07:35 AM', status: 'Conflict' },
  { id: 'EV-2146', event: 'Fine approved', ref: 'FN-0082 · EV-2146', person: 'Sunil Perera', role: 'Dispatcher', depot: 'Kandy', eventTime: '07:31 AM', received: '07:31 AM', status: 'Recorded' },
  { id: 'EV-2145', event: 'Receipt confirmed', ref: 'ORD-0824 · EV-2145', person: 'Anoma Jayawardena', role: 'Store Manager', depot: 'Kandy', eventTime: '07:28 AM', received: '07:28 AM', status: 'Recorded' },
  { id: 'EV-2144', event: 'Load shortfall reported', ref: 'RT-1046 · EV-2144', person: 'Kamal Bandara', role: 'Loader', depot: 'Peliyagoda', eventTime: '07:22 AM', received: '07:22 AM', status: 'Recorded' },
  { id: 'EV-2143', event: 'Outlet data corrected', ref: 'OUT-044 · EV-2143', person: 'Dilini Rathnayake', role: 'Admin', depot: 'Peliyagoda', eventTime: '07:18 AM', received: '07:18 AM', status: 'Recorded' },
];

export const adminFineReports = [
  { id: 'FN-0082', driver: 'Nuwan Silva', vehicle: 'WP-024', outlet: 'Fresh · Katugastota', depot: 'Kandy', date: '29 Sep 2026', amount: 'LKR 2,500', status: 'Approved', reason: 'No designated unloading bay. Linked to this delivery stop at the time of reporting.' },
  { id: 'FN-0081', driver: 'Kasun Fernando', vehicle: 'WP-011', outlet: 'Style · Colombo 03', depot: 'Peliyagoda', date: '29 Sep 2026', amount: 'LKR 1,500', status: 'Under review', reason: 'Restricted access at the delivery point.' },
  { id: 'FN-0080', driver: 'Dilan Kumara', vehicle: 'WP-038', outlet: 'Tech · Peradeniya', depot: 'Kandy', date: '28 Sep 2026', amount: 'LKR 2,000', status: 'Reported', reason: 'Delivery window exceeded.' },
  { id: 'FN-0079', driver: 'Amal Perera', vehicle: 'WP-005', outlet: 'Fresh · Wattala', depot: 'Peliyagoda', date: '28 Sep 2026', amount: 'LKR 2,500', status: 'Paid', reason: 'Curbside access was blocked at the scheduled delivery time.' },
  { id: 'FN-0078', driver: 'Saman Jayasekara', vehicle: 'WP-017', outlet: 'Style · Nugegoda', depot: 'Peliyagoda', date: '26 Sep 2026', amount: 'LKR 1,500', status: 'Rejected', reason: 'The report did not include supporting evidence.' },
];

export const adminFuelRecords = [
  { vehicle: 'WP-024', driver: 'Nuwan Silva', depot: 'Kandy', flag: 'Distance variance', route: 'RT-1042', distance: '86 / 108 km', status: 'New' },
  { vehicle: 'WP-011', driver: 'Kasun Fernando', depot: 'Peliyagoda', flag: 'Refuel efficiency', route: 'RT-1036', distance: '64 / 67 km', status: 'Reviewing' },
  { vehicle: 'WP-038', driver: 'Dilan Kumara', depot: 'Kandy', flag: 'Missing odometer photo', route: 'RT-1028', distance: '72 / 72 km', status: 'New' },
  { vehicle: 'WP-005', driver: 'Amal Perera', depot: 'Peliyagoda', flag: 'Distance variance', route: 'RT-1022', distance: '52 / 61 km', status: 'Explained' },
];

export const adminUsers = [
  { name: 'Sunil Perera', email: 'sunil@waypoint.example', role: 'Dispatcher', access: 'Peliyagoda', lastActivity: 'Today, 07:38 AM', status: 'Active', initials: 'SP' },
  { name: 'Kamal Bandara', email: 'kamal@waypoint.example', role: 'Loader', access: 'Peliyagoda', lastActivity: 'Today, 05:42 AM', status: 'Active', initials: 'KB' },
  { name: 'Nuwan Silva', email: 'nuwan@waypoint.example', role: 'Driver', access: 'Kandy', lastActivity: 'Today, 07:30 AM', status: 'Active', initials: 'NS' },
  { name: 'Anoma Jayawardena', email: 'anoma@waypoint.example', role: 'Store Manager', access: 'Fresh · Katugastota', lastActivity: 'Today, 07:12 AM', status: 'Active', initials: 'AJ' },
  { name: 'Dilini Rathnayake', email: 'dilini@waypoint.example', role: 'Admin', access: 'All depots', lastActivity: 'Current session', status: 'Active', initials: 'DR' },
  { name: 'Amal Perera', email: 'amal@waypoint.example', role: 'Driver', access: 'Peliyagoda', lastActivity: '26 Sep, 04:55 PM', status: 'Inactive', initials: 'AP' },
];

export const adminOutlets = [
  { name: 'Fresh · Katugastota', id: 'OUT-081', district: 'Kandy', depot: 'Kandy', window: '05:30–07:45', access: 'Van only', unloading: 'Curbside', brand: 'Fresh' },
  { name: 'Fresh · Wattala', id: 'OUT-044', district: 'Gampaha', depot: 'Peliyagoda', window: '05:00–07:45', access: 'All vehicles', unloading: 'Curbside', brand: 'Fresh' },
  { name: 'Style · Colombo 03', id: 'OUT-094', district: 'Colombo', depot: 'Peliyagoda', window: '09:00–11:00', access: 'All vehicles', unloading: 'Mall loading bay', brand: 'Style' },
  { name: 'Tech · Peradeniya', id: 'OUT-113', district: 'Kandy', depot: 'Kandy', window: '09:00–16:00', access: 'All vehicles', unloading: 'Rear dock', brand: 'Tech' },
  { name: 'Style · Nugegoda', id: 'OUT-099', district: 'Colombo', depot: 'Peliyagoda', window: '10:00–12:00', access: 'Van only', unloading: 'Mall loading bay', brand: 'Style' },
];
