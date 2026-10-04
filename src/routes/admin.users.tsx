import { createFileRoute } from '@tanstack/react-router';
import { UsersPage } from '../features/admin/pages/UsersPage';

export const Route = createFileRoute('/admin/users')({
  head: () => ({
    meta: [
      { title: 'Users — Waypoint' },
      { name: 'description', content: 'Manage Waypoint accounts, roles and assignments.' },
      { property: 'og:title', content: 'Users — Waypoint' },
      { property: 'og:description', content: 'Manage Waypoint accounts, roles and assignments.' },
    ],
  }),
  component: UsersPage,
});
