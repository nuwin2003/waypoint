import { createFileRoute } from '@tanstack/react-router';
import { AuditTrailPage } from '../features/admin/pages/AuditTrailPage';

export const Route = createFileRoute('/admin/audit')({
  head: () => ({
    meta: [
      { title: 'Audit trail — Waypoint' },
      { name: 'description', content: 'Every change across Waypoint, traceable.' },
      { property: 'og:title', content: 'Audit trail — Waypoint' },
      { property: 'og:description', content: 'Every change across Waypoint, traceable.' },
    ],
  }),
  component: AuditTrailPage,
});
