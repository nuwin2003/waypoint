import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@/lib/router-compat';
import { roleHomePath, useAuth } from '../app/auth/AuthContext';

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Waypoint — Distribution Management' },
      { name: 'description', content: 'Waypoint is a distribution management platform for dispatchers, loaders, store managers and drivers.' },
      { property: 'og:title', content: 'Waypoint — Distribution Management' },
      { property: 'og:description', content: 'Plan, load, deliver and confirm orders across every depot and outlet.' },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="wp-boot" aria-busy="true" />;
  return <Navigate to={user ? roleHomePath(user.role) : '/login'} replace />;
}
