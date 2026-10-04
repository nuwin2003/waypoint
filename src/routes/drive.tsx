import { createFileRoute } from '@tanstack/react-router';
import { RoleRoute } from '../app/auth/RoleRoute';
import { DriverWorkspace } from '../features/driver/DriverWorkspace';

export const Route = createFileRoute('/drive')({
  ssr: false,
  component: Layout,
});

function Layout() {
  return (
    <RoleRoute role="DRIVER">
      <DriverWorkspace />
    </RoleRoute>
  );
}
