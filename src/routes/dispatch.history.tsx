import { createFileRoute } from '@tanstack/react-router';
import { DispatcherHistoryPage } from '../features/dispatcher/pages/DispatcherHistoryPage';

export const Route = createFileRoute('/dispatch/history')({
  head: () => ({
    meta: [
      { title: 'Dispatch history — Waypoint' },
      { name: 'description', content: 'Past plans and their outcomes.' },
      { property: 'og:title', content: 'Dispatch history — Waypoint' },
      { property: 'og:description', content: 'Past plans and their outcomes.' },
    ],
  }),
  component: DispatcherHistoryPage,
});
