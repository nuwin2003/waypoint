import { createFileRoute } from '@tanstack/react-router';
import { RoleRoute } from '../app/auth/RoleRoute';
import { AppShell } from '../app/layout/AppShell';
import '../features/store/store.css';

export const Route = createFileRoute('/store')({
  ssr: false,
  component: Layout,
});

function Layout() {
  return (
    <RoleRoute role="STOREKEEPER">
      <AppShell />
    </RoleRoute>
  );
}
