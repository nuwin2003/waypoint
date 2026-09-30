export type StopState = 'PENDING' | 'ARRIVED' | 'DELIVERED' | 'PARTIAL' | 'FAILED';
export type Stop = { id: string; outlet: string; district: string; dock: string; cold: boolean; eta: string; state: StopState };
export const demoStops: Stop[] = [
  { id: 'stop-01', outlet: 'Fresh Gampaha', district: 'GAMPAHA', dock: 'REAR DOCK', cold: true, eta: '06:10', state: 'PENDING' },
  { id: 'stop-02', outlet: 'Fresh Gampaha Street', district: 'GAMPAHA', dock: 'STREET', cold: true, eta: '06:35', state: 'PENDING' },
  { id: 'stop-03', outlet: 'Style Colombo Mall', district: 'COLOMBO', dock: 'MALL', cold: false, eta: '10:20', state: 'PENDING' },
];
