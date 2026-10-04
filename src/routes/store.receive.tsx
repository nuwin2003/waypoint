import { createFileRoute } from '@tanstack/react-router';
import { ReceiveConfirmPage } from '../features/store/pages/ReceiveConfirmPage';

export const Route = createFileRoute('/store/receive')({
  head: () => ({
    meta: [
      { title: 'Receive & confirm — Waypoint' },
      { name: 'description', content: 'Confirm delivered orders.' },
      { property: 'og:title', content: 'Receive & confirm — Waypoint' },
      { property: 'og:description', content: 'Confirm delivered orders.' },
    ],
  }),
  component: ReceiveConfirmPage,
});
