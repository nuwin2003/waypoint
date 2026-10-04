import { createFileRoute } from '@tanstack/react-router';
import { EmergencyPage } from '../features/dispatcher/pages/EmergencyPage';

export const Route = createFileRoute('/dispatch/alerts')({
  head: () => ({
    meta: [
      { title: 'Emergencies — Waypoint' },
      { name: 'description', content: 'Incidents and alerts needing attention.' },
      { property: 'og:title', content: 'Emergencies — Waypoint' },
      { property: 'og:description', content: 'Incidents and alerts needing attention.' },
    ],
  }),
  component: EmergencyPage,
});
