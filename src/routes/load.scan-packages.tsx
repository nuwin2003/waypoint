import { createFileRoute } from '@tanstack/react-router';
import { ScanPackagesPage } from '../features/loader/pages/ScanPackagesPage';

export const Route = createFileRoute('/load/scan-packages')({
  head: () => ({
    meta: [
      { title: 'Scan packages — Waypoint' },
      { name: 'description', content: 'Scan and verify packages onto vehicles.' },
      { property: 'og:title', content: 'Scan packages — Waypoint' },
      { property: 'og:description', content: 'Scan and verify packages onto vehicles.' },
    ],
  }),
  component: ScanPackagesPage,
});
