import { createFileRoute } from '@tanstack/react-router';
import { StoreDashboardPage } from '../features/store/pages/StoreDashboardPage';

export const Route = createFileRoute('/store/')({
  head: () => ({
    meta: [
      { title: 'Store dashboard — Waypoint' },
      { name: 'description', content: 'Orders and deliveries for your outlet.' },
      { property: 'og:title', content: 'Store dashboard — Waypoint' },
      { property: 'og:description', content: 'Orders and deliveries for your outlet.' },
    ],
  }),
  component: StoreDashboardPage,
});
