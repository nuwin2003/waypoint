import { useEffect, useMemo, useState } from 'react';
import { api, type Outlet } from '../../../api';
import { AdminBadge, AdminDrawer, AdminHeader, AdminIcon, AdminPanel, AdminSelect, AdminStat } from '../components/AdminUI';

export function MasterDataPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [vehicles, setVehicles] = useState<Awaited<ReturnType<typeof api.vehicles>>>([]);
  const [depot, setDepot] = useState('All depots');
  const [selected, setSelected] = useState<Outlet | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.outlets(), api.vehicles()])
      .then(([loadedOutlets, loadedVehicles]) => {
        setOutlets(loadedOutlets);
        setVehicles(loadedVehicles);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load master data.'));
  }, []);

  const rows = useMemo(() => outlets.filter((outlet) => depot === 'All depots' || outlet.depotId === depot), [outlets, depot]);
  const depotIds = Array.from(new Set(outlets.map((outlet) => outlet.depotId)));
  const chilledVehicles = vehicles.filter((vehicle) => vehicle.temperature === 'REEFER').length;

  return <div className="admin-page">
    <AdminHeader title="Master Data" subtitle="The shared information behind every delivery." />
    <div className="admin-toolbar"><div className="admin-toolbar-filters"><AdminSelect value={depot} values={['All depots', ...depotIds]} onChange={setDepot} /></div><AdminBadge tone="neutral">Live data</AdminBadge></div>
    {error && <div className="admin-toast" role="alert">{error}<button onClick={() => setError('')} type="button">×</button></div>}
    <div className="admin-stats-grid four"><AdminStat label="Outlets in network" value={String(outlets.length)} note="Active outlets returned by the API" icon={<AdminIcon name="warehouse" />} /><AdminStat label="Fleet vehicles" value={String(vehicles.length)} note="Vehicles in the master data store" icon={<AdminIcon name="truck" />} /><AdminStat label="Chilled-capable" value={String(chilledVehicles)} note="Vehicles with reefer temperature class" icon={<AdminIcon name="alert" />} /><AdminStat label="Operating depots" value={String(depotIds.length).padStart(2, '0')} note="Depots represented by active outlets" icon={<AdminIcon name="pin" />} /></div>
    <AdminPanel title="Outlet directory" className="admin-data-panel"><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Outlet</th><th>Depot</th><th>Brand</th><th>Vehicle access</th><th>Unloading</th><th /></tr></thead><tbody>{rows.map((outlet) => <tr key={outlet.id}><td><strong>{outlet.name}</strong><small>{outlet.id} · {outlet.districtId}</small></td><td><b>{outlet.depotId}</b></td><td>{outlet.brand}</td><td><AdminBadge tone={outlet.parkingConstraint === 'VAN_ONLY' ? 'amber' : 'neutral'}>{outlet.parkingConstraint}</AdminBadge></td><td><b>{outlet.dockType}</b></td><td><button className="admin-text-link" type="button" onClick={() => setSelected(outlet)}>View <AdminIcon name="chevron" /></button></td></tr>)}</tbody></table></div><footer className="admin-table-footer"><span>{rows.length} records</span><span>Read-only operational master data</span></footer></AdminPanel>
    {selected && <AdminDrawer title={selected.name} subtitle="Outlet information from the API" onClose={() => setSelected(null)}><dl className="admin-detail-grid"><div><dt>Outlet ID</dt><dd>{selected.id}</dd></div><div><dt>Brand</dt><dd>{selected.brand}</dd></div><div><dt>Depot</dt><dd>{selected.depotId}</dd></div><div><dt>District</dt><dd>{selected.districtId}</dd></div><div><dt>Vehicle access</dt><dd>{selected.parkingConstraint}</dd></div><div><dt>Unloading</dt><dd>{selected.dockType}</dd></div></dl><p className="admin-drawer-note">Outlet editing is not enabled because the current API exposes this master data as read-only.</p></AdminDrawer>}
  </div>;
}
