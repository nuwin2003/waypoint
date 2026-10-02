import { Outlet, useOutletContext } from 'react-router-dom';
import './dispatcher.css';
import './dispatcherScreens.css';

export function DispatcherWorkspace() {
  const { searchQuery } = useOutletContext<{ searchQuery?: string }>();
  return <Outlet context={{ searchQuery }} />;
}
