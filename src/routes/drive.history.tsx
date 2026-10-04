import { createFileRoute } from '@tanstack/react-router';
import { DriverHistoryPage } from '../features/driver/pages/DriverHistoryPage';

export const Route = createFileRoute('/drive/history')({
  head: () => ({
    meta: [
      { title: 'Driver history — Waypoint' },
      { name: 'description', content: 'Your past trips, fuel and fines.' },
      { property: 'og:title', content: 'Driver history — Waypoint' },
      { property: 'og:description', content: 'Your past trips, fuel and fines.' },
    ],
  }),
  component: DriverHistoryPage,
});
