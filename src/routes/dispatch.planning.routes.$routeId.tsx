import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@/lib/router-compat';

export const Route = createFileRoute('/dispatch/planning/routes/$routeId')({
  head: () => ({
    meta: [
      { title: 'Route review — Waypoint' },
      { name: 'description', content: 'Check a route against vehicle and delivery rules.' },
      { property: 'og:title', content: 'Route review — Waypoint' },
      { property: 'og:description', content: 'Check a route against vehicle and delivery rules.' },
    ],
  }),
  component: () => <Navigate to="/dispatch/planning" replace />,
});
