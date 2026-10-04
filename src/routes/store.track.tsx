import { createFileRoute } from '@tanstack/react-router';
import { TrackOrdersPage } from '../features/store/pages/TrackOrdersPage';

export const Route = createFileRoute('/store/track')({
  head: () => ({
    meta: [
      { title: 'Track orders — Waypoint' },
      { name: 'description', content: 'Follow your deliveries.' },
      { property: 'og:title', content: 'Track orders — Waypoint' },
      { property: 'og:description', content: 'Follow your deliveries.' },
    ],
  }),
  component: TrackOrdersPage,
});
