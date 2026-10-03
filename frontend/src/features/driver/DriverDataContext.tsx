import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type DriverHistory, type DriverTodayRoute } from '../../api';

type DriverDataContextValue = {
  route: DriverTodayRoute | null;
  routeLoading: boolean;
  routeError: string | null;
  refreshRoute: () => Promise<void>;
  history: DriverHistory | null;
  historyLoading: boolean;
  historyError: string | null;
  loadHistory: (periodDays: number) => Promise<void>;
};

const DriverDataContext = createContext<DriverDataContextValue | null>(null);

export function DriverDataProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<DriverTodayRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [history, setHistory] = useState<DriverHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const refreshRoute = async () => {
    setRouteLoading(true);
    setRouteError(null);
    try {
      setRoute(await api.driverTodayRoute());
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : 'Could not load your route.');
    } finally {
      setRouteLoading(false);
    }
  };

  const loadHistory = async (periodDays: number) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      setHistory(await api.driverHistory(periodDays));
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Could not load trip history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    void refreshRoute();
  }, []);

  const value = useMemo(() => ({
    route, routeLoading, routeError, refreshRoute,
    history, historyLoading, historyError, loadHistory,
  }), [route, routeLoading, routeError, history, historyLoading, historyError]);

  return <DriverDataContext.Provider value={value}>{children}</DriverDataContext.Provider>;
}

export function useDriverData() {
  const context = useContext(DriverDataContext);
  if (!context) throw new Error('useDriverData must be inside DriverDataProvider');
  return context;
}
