import { createFileRoute } from '@tanstack/react-router';
import { RoutePage } from '../features/driver/pages/RoutePage';

export const Route = createFileRoute('/drive/route/')({
  head: () => ({
    meta: [
      { title: 'Route — Waypoint' },
      { name: 'description', content: 'Stops on your route today.' },
      { property: 'og:title', content: 'Route — Waypoint' },
      { property: 'og:description', content: 'Stops on your route today.' },
    ],
  }),
  component: RoutePage,
});
