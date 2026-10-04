import { createFileRoute } from '@tanstack/react-router';
import { PlaceOrderPage } from '../features/store/pages/PlaceOrderPage';

export const Route = createFileRoute('/store/place-order')({
  head: () => ({
    meta: [
      { title: 'Place order — Waypoint' },
      { name: 'description', content: 'Order stock for your outlet.' },
      { property: 'og:title', content: 'Place order — Waypoint' },
      { property: 'og:description', content: 'Order stock for your outlet.' },
    ],
  }),
  component: PlaceOrderPage,
});
