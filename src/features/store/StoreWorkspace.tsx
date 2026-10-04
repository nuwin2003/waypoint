import { Outlet, useOutletContext } from '@/lib/router-compat';
import './store.css';

export function StoreWorkspace() {
  const { searchQuery } = useOutletContext<{ searchQuery?: string }>();
  return <Outlet context={{ searchQuery }} />;
}
