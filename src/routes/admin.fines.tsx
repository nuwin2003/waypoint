import { createFileRoute } from '@tanstack/react-router';
import { FineLedgerPage } from '../features/admin/pages/FineLedgerPage';

export const Route = createFileRoute('/admin/fines')({
  head: () => ({
    meta: [
      { title: 'Fine ledger — Waypoint' },
      { name: 'description', content: 'Traffic and parking fines reported by drivers.' },
      { property: 'og:title', content: 'Fine ledger — Waypoint' },
      { property: 'og:description', content: 'Traffic and parking fines reported by drivers.' },
    ],
  }),
  component: FineLedgerPage,
});
