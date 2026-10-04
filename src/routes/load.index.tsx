import { createFileRoute } from '@tanstack/react-router';
import { LoaderDashboardPage } from '../features/loader/pages/LoaderDashboardPage';

export const Route = createFileRoute('/load/')({
  head: () => ({
    meta: [
      { title: 'Loading dashboard — Waypoint' },
      { name: 'description', content: 'Vehicles queued for loading today.' },
      { property: 'og:title', content: 'Loading dashboard — Waypoint' },
      { property: 'og:description', content: 'Vehicles queued for loading today.' },
    ],
  }),
  component: LoaderDashboardPage,
});
