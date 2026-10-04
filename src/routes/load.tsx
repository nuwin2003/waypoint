import { createFileRoute } from '@tanstack/react-router';
import { RoleRoute } from '../app/auth/RoleRoute';
import { AppShell } from '../app/layout/AppShell';
import '../features/loader/loader.css';
import '../features/loader/scanPage.css';

export const Route = createFileRoute('/load')({
  ssr: false,
  component: Layout,
});

function Layout() {
  return (
    <RoleRoute role="LOADER">
      <AppShell />
    </RoleRoute>
  );
}
