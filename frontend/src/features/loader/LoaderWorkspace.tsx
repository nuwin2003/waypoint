import { Outlet, useOutletContext } from 'react-router-dom';
import './loader.css';
import './scanPage.css';

export function LoaderWorkspace() {
  const { searchQuery } = useOutletContext<{ searchQuery?: string }>();
  return <Outlet context={{ searchQuery }} />;
}
