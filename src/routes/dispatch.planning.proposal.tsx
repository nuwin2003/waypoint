import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@/lib/router-compat';

export const Route = createFileRoute('/dispatch/planning/proposal')({
  head: () => ({
    meta: [
      { title: 'Suggested dispatch plan — Waypoint' },
      { name: 'description', content: 'Review the proposed routes before approval.' },
      { property: 'og:title', content: 'Suggested dispatch plan — Waypoint' },
      { property: 'og:description', content: 'Review the proposed routes before approval.' },
    ],
  }),
  component: () => <Navigate to="/dispatch/planning" replace />,
});
