import { createFileRoute } from '@tanstack/react-router';
import { FuelIntegrityPage } from '../features/admin/pages/FuelIntegrityPage';

export const Route = createFileRoute('/admin/fuel')({
  head: () => ({
    meta: [
      { title: 'Fuel integrity — Waypoint' },
      { name: 'description', content: 'Fuel usage against weekly quotas.' },
      { property: 'og:title', content: 'Fuel integrity — Waypoint' },
      { property: 'og:description', content: 'Fuel usage against weekly quotas.' },
    ],
  }),
  component: FuelIntegrityPage,
});
