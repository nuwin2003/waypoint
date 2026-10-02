import { Outlet, useOutletContext } from 'react-router-dom';
import './admin.css';

export function AdminWorkspace(){
  const { searchQuery } = useOutletContext<{searchQuery?:string}>();
  return <Outlet context={{searchQuery}}/>;
}
