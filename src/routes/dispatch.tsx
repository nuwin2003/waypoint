import { createFileRoute } from '@tanstack/react-router';
import { RoleRoute } from '../app/auth/RoleRoute';
import { AppShell } from '../app/layout/AppShell';
import '../features/dispatcher/dispatcher.css';
import '../features/dispatcher/dispatcherScreens.css';

export const Route = createFileRoute('/dispatch')({
  ssr: false,
  component: Layout,
});

function Layout() {
  return (
    <RoleRoute role="DISPATCHER">
      <AppShell />
    </RoleRoute>
  );
}
