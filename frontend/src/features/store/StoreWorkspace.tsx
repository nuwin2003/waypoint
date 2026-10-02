import { Outlet, useOutletContext } from 'react-router-dom';
import './store.css';

export function StoreWorkspace() {
  const { searchQuery } = useOutletContext<{ searchQuery?: string }>();
  return <Outlet context={{ searchQuery }} />;
}
