import { createFileRoute } from '@tanstack/react-router';
import { PlanningPage } from '../features/dispatcher/pages/PlanningPage';

export const Route = createFileRoute('/dispatch/planning/')({
  head: () => ({
    meta: [
      { title: 'Suggested dispatch plan — Waypoint' },
      { name: 'description', content: 'Review automatic allocations and adjust draft routes.' },
      { property: 'og:title', content: 'Suggested dispatch plan — Waypoint' },
      { property: 'og:description', content: 'Review automatic allocations and adjust draft routes.' },
    ],
  }),
  component: PlanningPage,
});
