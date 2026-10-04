import { Outlet, useOutletContext } from '@/lib/router-compat';
import './dispatcher.css';
import './dispatcherScreens.css';

export function DispatcherWorkspace() {
  const { searchQuery } = useOutletContext<{ searchQuery?: string }>();
  return <Outlet context={{ searchQuery }} />;
}
