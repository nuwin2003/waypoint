import { createFileRoute } from '@tanstack/react-router';
import { DriverHomePage } from '../features/driver/pages/DriverHomePage';

export const Route = createFileRoute('/drive/')({
  head: () => ({
    meta: [
      { title: 'Driver home — Waypoint' },
      { name: 'description', content: 'Your route for today.' },
      { property: 'og:title', content: 'Driver home — Waypoint' },
      { property: 'og:description', content: 'Your route for today.' },
    ],
  }),
  component: DriverHomePage,
});
