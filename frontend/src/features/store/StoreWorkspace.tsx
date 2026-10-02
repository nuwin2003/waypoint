import { Outlet, useOutletContext } from 'react-router-dom';

export function StoreWorkspace() {
  const { searchQuery } = useOutletContext<{ searchQuery?: string }>();
  return <Outlet context={{ searchQuery }} />;
}
