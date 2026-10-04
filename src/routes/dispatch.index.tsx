import { createFileRoute } from '@tanstack/react-router';
import { DispatcherDashboardPage } from '../features/dispatcher/pages/DispatcherDashboardPage';

export const Route = createFileRoute('/dispatch/')({
  head: () => ({
    meta: [
      { title: 'Dispatch dashboard — Waypoint' },
      { name: 'description', content: 'Dispatch status for your depot today.' },
      { property: 'og:title', content: 'Dispatch dashboard — Waypoint' },
      { property: 'og:description', content: 'Dispatch status for your depot today.' },
    ],
  }),
  component: DispatcherDashboardPage,
});
