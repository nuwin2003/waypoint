import type { Order } from '../../api';
import type { ProductBrand, StoreOrder } from './data/storeData';

export function storeOrderFromApi(order: Order): StoreOrder {
  const brand: ProductBrand = order.productBrand === 'FRESH'
    ? (order.tempRequirement === 'CHILLED' ? 'Fresh chilled' : 'Fresh dry')
    : order.productBrand === 'STYLE' ? 'Style' : 'Tech';
  const status = order.status.toUpperCase();
  const displayStatus: StoreOrder['status'] = status.includes('DELIVER') || status.includes('RECEIV') ? 'delivered'
    : status.includes('TRANSIT') || status.includes('DEPART') ? 'departed'
      : status.includes('LOAD') || status.includes('PLAN') ? 'loading'
        : status.includes('DEFER') || status.includes('NEXT_RUN') ? 'deferred' : 'confirmed';
  const date = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' }) : 'Date unavailable';
  return {
    id: order.orderRef || order.id,
    brand,
    date,
    units: order.units,
    status: displayStatus,
    eta: 'Not available',
    windowCloses: 'Not available',
    itemSummary: order.itemDescription,
    vehicle: 'Not assigned',
    driver: 'Not assigned',
    timeline: [{ title: 'Order received', time: date, complete: true }, { title: 'Dispatch and delivery updates', time: 'Not available from the current API' }],
    breakdown: [{ item: order.itemDescription, units: order.units }],
  };
}
