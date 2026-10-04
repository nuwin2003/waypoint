import { createFileRoute } from '@tanstack/react-router';
import { DriverProfilePage } from '../features/driver/pages/DriverProfilePage';

export const Route = createFileRoute('/drive/profile')({
  head: () => ({
    meta: [
      { title: 'Profile — Waypoint' },
      { name: 'description', content: 'Your driver profile and settings.' },
      { property: 'og:title', content: 'Profile — Waypoint' },
      { property: 'og:description', content: 'Your driver profile and settings.' },
    ],
  }),
  component: DriverProfilePage,
});
