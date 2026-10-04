import { createFileRoute } from '@tanstack/react-router';
import { MissingItemsPage } from '../features/loader/pages/MissingItemsPage';

export const Route = createFileRoute('/load/missing-items')({
  head: () => ({
    meta: [
      { title: 'Missing items — Waypoint' },
      { name: 'description', content: 'Track packages that could not be found.' },
      { property: 'og:title', content: 'Missing items — Waypoint' },
      { property: 'og:description', content: 'Track packages that could not be found.' },
    ],
  }),
  component: MissingItemsPage,
});
