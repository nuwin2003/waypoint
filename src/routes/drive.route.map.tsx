import { createFileRoute } from '@tanstack/react-router';
import { NavigationPage } from '../features/driver/pages/NavigationPage';

export const Route = createFileRoute('/drive/route/map')({
  head: () => ({
    meta: [
      { title: 'Navigation — Waypoint' },
      { name: 'description', content: 'Directions to your next stop.' },
      { property: 'og:title', content: 'Navigation — Waypoint' },
      { property: 'og:description', content: 'Directions to your next stop.' },
    ],
  }),
  component: NavigationPage,
});
