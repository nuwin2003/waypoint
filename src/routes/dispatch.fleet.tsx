import { createFileRoute } from '@tanstack/react-router';
import { FleetFuelPage } from '../features/dispatcher/pages/FleetFuelPage';

export const Route = createFileRoute('/dispatch/fleet')({
  head: () => ({
    meta: [
      { title: 'Fleet & fuel — Waypoint' },
      { name: 'description', content: 'Vehicle availability and fuel quotas.' },
      { property: 'og:title', content: 'Fleet & fuel — Waypoint' },
      { property: 'og:description', content: 'Vehicle availability and fuel quotas.' },
    ],
  }),
  component: FleetFuelPage,
});
