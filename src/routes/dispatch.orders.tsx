import { createFileRoute } from '@tanstack/react-router';
import { OrderQueuePage } from '../features/dispatcher/pages/OrderQueuePage';

export const Route = createFileRoute('/dispatch/orders')({
  head: () => ({
    meta: [
      { title: 'Order queue — Waypoint' },
      { name: 'description', content: 'Orders waiting to be planned.' },
      { property: 'og:title', content: 'Order queue — Waypoint' },
      { property: 'og:description', content: 'Orders waiting to be planned.' },
    ],
  }),
  component: OrderQueuePage,
});
