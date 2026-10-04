import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@/lib/router-compat';
import { roleHomePath, useAuth } from '../app/auth/AuthContext';
import { LoginPage } from '../features/auth/LoginPage';

export const Route = createFileRoute('/login')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Sign in — Waypoint' },
      { name: 'description', content: 'Sign in to your Waypoint workspace.' },
      { property: 'og:title', content: 'Sign in — Waypoint' },
      { property: 'og:description', content: 'Sign in to your Waypoint workspace.' },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="wp-boot" aria-busy="true" />;
  if (user) return <Navigate to={roleHomePath(user.role)} replace />;
  return <LoginPage />;
}
