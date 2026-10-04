import { Outlet, useOutletContext } from '@/lib/router-compat';
import './loader.css';
import './scanPage.css';

export function LoaderWorkspace() {
  const { searchQuery } = useOutletContext<{ searchQuery?: string }>();
  return <Outlet context={{ searchQuery }} />;
}
