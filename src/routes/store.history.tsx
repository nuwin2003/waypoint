import { createFileRoute } from '@tanstack/react-router';
import { OrderHistoryPage } from '../features/store/pages/OrderHistoryPage';

export const Route = createFileRoute('/store/history')({
  head: () => ({
    meta: [
      { title: 'Order history — Waypoint' },
      { name: 'description', content: 'All past orders for your outlet.' },
      { property: 'og:title', content: 'Order history — Waypoint' },
      { property: 'og:description', content: 'All past orders for your outlet.' },
    ],
  }),
  component: OrderHistoryPage,
});
