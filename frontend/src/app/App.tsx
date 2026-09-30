import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { AppShell } from './layout/AppShell';
import { LoginPage } from '../features/auth/LoginPage';
import { DispatcherWorkspace } from '../features/dispatcher/DispatcherWorkspace';
import { LoaderWorkspace } from '../features/loader/LoaderWorkspace';
import { StoreWorkspace } from '../features/store/StoreWorkspace';
import { DriverWorkspace } from '../features/driver/DriverWorkspace';

function roleDashboardPath(role?: string): string {
  switch (role) {
    case 'STOREKEEPER':
      return '/store';
    case 'LOADER':
      return '/load';
    case 'DRIVER':
      return '/drive';
    case 'DISPATCHER':
    default:
      return '/dispatch';
  }
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={roleDashboardPath(user.role)} replace />;
}

function LoginRoute() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={roleDashboardPath(user.role)} replace />;
  }
  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public / Login Route */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Default root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Workspace routes requiring authentication */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          {/* Dispatcher */}
          <Route path="/dispatch" element={<DispatcherWorkspace />} />
          <Route path="/dispatch/*" element={<DispatcherWorkspace />} />

          {/* Loader */}
          <Route path="/load" element={<LoaderWorkspace />} />
          <Route path="/load/*" element={<LoaderWorkspace />} />

          {/* Storekeeper */}
          <Route path="/store" element={<StoreWorkspace />} />
          <Route path="/store/*" element={<StoreWorkspace />} />

          {/* Driver */}
          <Route path="/drive" element={<DriverWorkspace />} />
          <Route path="/drive/*" element={<DriverWorkspace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </AuthProvider>
  );
}
