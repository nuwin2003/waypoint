import { createFileRoute } from '@tanstack/react-router';
import { ConfigurationPage } from '../features/admin/pages/ConfigurationPage';

export const Route = createFileRoute('/admin/configuration')({
  head: () => ({
    meta: [
      { title: 'Configuration — Waypoint' },
      { name: 'description', content: 'Planning rules and service allowances.' },
      { property: 'og:title', content: 'Configuration — Waypoint' },
      { property: 'og:description', content: 'Planning rules and service allowances.' },
    ],
  }),
  component: ConfigurationPage,
});
