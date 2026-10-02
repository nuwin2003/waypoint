import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, roleHomePath, useAuth } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { RoleRoute } from './auth/RoleRoute';
import { AppShell } from './layout/AppShell';
import { LoginPage } from '../features/auth/LoginPage';
import { DispatcherWorkspace } from '../features/dispatcher/DispatcherWorkspace';
import { DispatcherDashboardPage } from '../features/dispatcher/pages/DispatcherDashboardPage';
import { OrderQueuePage } from '../features/dispatcher/pages/OrderQueuePage';
import { PlanningPage } from '../features/dispatcher/pages/PlanningPage';
import { SuggestedDispatchPlanPage } from '../features/dispatcher/pages/SuggestedDispatchPlanPage';
import { RouteReviewPage } from '../features/dispatcher/pages/RouteReviewPage';
import { FleetFuelPage } from '../features/dispatcher/pages/FleetFuelPage';
import { LiveMonitoringPage } from '../features/dispatcher/pages/LiveMonitoringPage';
import { EmergencyPage } from '../features/dispatcher/pages/EmergencyPage';
import { DispatcherHistoryPage } from '../features/dispatcher/pages/DispatcherHistoryPage';
import { LoaderWorkspace } from '../features/loader/LoaderWorkspace';
import { LoaderDashboardPage } from '../features/loader/pages/LoaderDashboardPage';
import { ScanPackagesPage } from '../features/loader/pages/ScanPackagesPage';
import { DefectItemsPage } from '../features/loader/pages/DefectItemsPage';
import { MissingItemsPage } from '../features/loader/pages/MissingItemsPage';
import { StoreWorkspace } from '../features/store/StoreWorkspace';
import { StoreDashboardPage } from '../features/store/pages/StoreDashboardPage';
import { PlaceOrderPage } from '../features/store/pages/PlaceOrderPage';
import { TrackOrdersPage } from '../features/store/pages/TrackOrdersPage';
import { ReceiveConfirmPage } from '../features/store/pages/ReceiveConfirmPage';
import { OrderHistoryPage } from '../features/store/pages/OrderHistoryPage';
import { DriverWorkspace } from '../features/driver/DriverWorkspace';
import { AdminWorkspace } from '../features/admin/AdminWorkspace';
import { AdminOverviewPage } from '../features/admin/pages/AdminOverviewPage';
import { AuditTrailPage } from '../features/admin/pages/AuditTrailPage';
import { ForecastPage } from '../features/admin/pages/ForecastPage';
import { FineLedgerPage } from '../features/admin/pages/FineLedgerPage';
import { FuelIntegrityPage } from '../features/admin/pages/FuelIntegrityPage';
import { UsersPage } from '../features/admin/pages/UsersPage';
import { MasterDataPage } from '../features/admin/pages/MasterDataPage';
import { ConfigurationPage } from '../features/admin/pages/ConfigurationPage';

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
          <Route path="/admin" element={<RoleRoute role="ADMIN"><AdminWorkspace /></RoleRoute>}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="audit" element={<AuditTrailPage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="fines" element={<FineLedgerPage />} />
            <Route path="fuel" element={<FuelIntegrityPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="master-data" element={<MasterDataPage />} />
            <Route path="configuration" element={<ConfigurationPage />} />
          </Route>

          {/* Dispatcher */}
          <Route path="/dispatch" element={<RoleRoute role="DISPATCHER"><DispatcherWorkspace /></RoleRoute>}>
            <Route index element={<DispatcherDashboardPage />} />
            <Route path="orders" element={<OrderQueuePage />} />
            <Route path="planning" element={<PlanningPage />} />
            <Route path="planning/proposal" element={<SuggestedDispatchPlanPage />} />
            <Route path="planning/routes/:routeId" element={<RouteReviewPage />} />
            <Route path="fleet" element={<FleetFuelPage />} />
            <Route path="live" element={<LiveMonitoringPage />} />
            <Route path="alerts" element={<EmergencyPage />} />
            <Route path="history" element={<DispatcherHistoryPage />} />
          </Route>

          {/* Loader */}
          <Route path="/load" element={<RoleRoute role="LOADER"><LoaderWorkspace /></RoleRoute>}>
            <Route index element={<LoaderDashboardPage />} />
            <Route path="scan-packages" element={<ScanPackagesPage />} />
            <Route path="defect-items" element={<DefectItemsPage />} />
            <Route path="missing-items" element={<MissingItemsPage />} />
          </Route>

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
