import { createFileRoute } from '@tanstack/react-router';
import { DeliveryPage } from '../features/driver/pages/DeliveryPage';

export const Route = createFileRoute('/drive/delivery')({
  head: () => ({
    meta: [
      { title: 'Delivery — Waypoint' },
      { name: 'description', content: 'Record proof of delivery.' },
      { property: 'og:title', content: 'Delivery — Waypoint' },
      { property: 'og:description', content: 'Record proof of delivery.' },
    ],
  }),
  component: DeliveryPage,
});
