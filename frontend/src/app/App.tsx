import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, roleHomePath, useAuth } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { RoleRoute } from './auth/RoleRoute';
import { AppShell } from './layout/AppShell';
import { LoginPage } from '../features/auth/LoginPage';
import { DispatcherWorkspace } from '../features/dispatcher/DispatcherWorkspace';
import { LoaderWorkspace } from '../features/loader/LoaderWorkspace';
import { StoreWorkspace } from '../features/store/StoreWorkspace';
import { StoreDashboardPage } from '../features/store/pages/StoreDashboardPage';
import { PlaceOrderPage } from '../features/store/pages/PlaceOrderPage';
import { TrackOrdersPage } from '../features/store/pages/TrackOrdersPage';
import { ReceiveConfirmPage } from '../features/store/pages/ReceiveConfirmPage';
import { OrderHistoryPage } from '../features/store/pages/OrderHistoryPage';
import { DriverWorkspace } from '../features/driver/DriverWorkspace';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={roleHomePath(user.role)} replace />;
}

function LoginRoute() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={roleHomePath(user.role)} replace />;
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
          <Route path="/dispatch" element={<RoleRoute role="DISPATCHER"><DispatcherWorkspace /></RoleRoute>} />
          <Route path="/dispatch/*" element={<RoleRoute role="DISPATCHER"><DispatcherWorkspace /></RoleRoute>} />

          {/* Loader */}
          <Route path="/load" element={<RoleRoute role="LOADER"><LoaderWorkspace /></RoleRoute>} />
          <Route path="/load/*" element={<RoleRoute role="LOADER"><LoaderWorkspace /></RoleRoute>} />

          {/* Store Manager */}
          <Route path="/store" element={<RoleRoute role="STOREKEEPER"><StoreWorkspace /></RoleRoute>}>
            <Route index element={<StoreDashboardPage />} />
            <Route path="place-order" element={<PlaceOrderPage />} />
            <Route path="track" element={<TrackOrdersPage />} />
            <Route path="receive" element={<ReceiveConfirmPage />} />
            <Route path="history" element={<OrderHistoryPage />} />
          </Route>

          {/* Driver */}
          <Route path="/drive" element={<RoleRoute role="DRIVER"><DriverWorkspace /></RoleRoute>} />
          <Route path="/drive/*" element={<RoleRoute role="DRIVER"><DriverWorkspace /></RoleRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </AuthProvider>
  );
}
