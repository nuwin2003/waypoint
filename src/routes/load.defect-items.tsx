import { createFileRoute } from '@tanstack/react-router';
import { DefectItemsPage } from '../features/loader/pages/DefectItemsPage';

export const Route = createFileRoute('/load/defect-items')({
  head: () => ({
    meta: [
      { title: 'Defect items — Waypoint' },
      { name: 'description', content: 'Flag and resolve damaged packages.' },
      { property: 'og:title', content: 'Defect items — Waypoint' },
      { property: 'og:description', content: 'Flag and resolve damaged packages.' },
    ],
  }),
  component: DefectItemsPage,
});
