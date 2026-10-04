import { createFileRoute } from '@tanstack/react-router';
import { LiveMonitoringPage } from '../features/dispatcher/pages/LiveMonitoringPage';

export const Route = createFileRoute('/dispatch/live')({
  head: () => ({
    meta: [
      { title: 'Live monitoring — Waypoint' },
      { name: 'description', content: 'Track routes in progress.' },
      { property: 'og:title', content: 'Live monitoring — Waypoint' },
      { property: 'og:description', content: 'Track routes in progress.' },
    ],
  }),
  component: LiveMonitoringPage,
});
