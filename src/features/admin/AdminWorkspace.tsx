import { Outlet, useOutletContext } from '@/lib/router-compat';
import './admin.css';

export function AdminWorkspace(){
  const { searchQuery } = useOutletContext<{searchQuery?:string}>();
  return <Outlet context={{searchQuery}}/>;
}
