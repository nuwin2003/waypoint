import { createFileRoute } from '@tanstack/react-router';
import { MasterDataPage } from '../features/admin/pages/MasterDataPage';

export const Route = createFileRoute('/admin/master-data')({
  head: () => ({
    meta: [
      { title: 'Master data — Waypoint' },
      { name: 'description', content: 'Outlets, depots and vehicles.' },
      { property: 'og:title', content: 'Master data — Waypoint' },
      { property: 'og:description', content: 'Outlets, depots and vehicles.' },
    ],
  }),
  component: MasterDataPage,
});
