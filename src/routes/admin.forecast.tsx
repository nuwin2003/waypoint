import { createFileRoute } from '@tanstack/react-router';
import { ForecastPage } from '../features/admin/pages/ForecastPage';

export const Route = createFileRoute('/admin/forecast')({
  head: () => ({
    meta: [
      { title: 'Demand forecast — Waypoint' },
      { name: 'description', content: 'Upcoming demand by depot and brand.' },
      { property: 'og:title', content: 'Demand forecast — Waypoint' },
      { property: 'og:description', content: 'Upcoming demand by depot and brand.' },
    ],
  }),
  component: ForecastPage,
});
