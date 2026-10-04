import { createFileRoute } from '@tanstack/react-router';
import { AdminOverviewPage } from '../features/admin/pages/AdminOverviewPage';

export const Route = createFileRoute('/admin/')({
  head: () => ({
    meta: [
      { title: 'Admin overview — Waypoint' },
      { name: 'description', content: 'Network-wide delivery performance at a glance.' },
      { property: 'og:title', content: 'Admin overview — Waypoint' },
      { property: 'og:description', content: 'Network-wide delivery performance at a glance.' },
    ],
  }),
  component: AdminOverviewPage,
});
