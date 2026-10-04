import { createFileRoute } from '@tanstack/react-router';
import { RoleRoute } from '../app/auth/RoleRoute';
import { AppShell } from '../app/layout/AppShell';
import '../features/admin/admin.css';

export const Route = createFileRoute('/admin')({
  ssr: false,
  component: Layout,
});

function Layout() {
  return (
    <RoleRoute role="ADMIN">
      <AppShell />
    </RoleRoute>
  );
}
