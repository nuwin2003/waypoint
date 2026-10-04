import { useEffect, useMemo, useState } from 'react';
import { api, type AdminUser, type LoginResponse, type Outlet, type Vehicle } from '../../../api';
import { AdminBadge, AdminDrawer, AdminHeader, AdminIcon, AdminPanel, AdminSearch, AdminSelect, AdminStat } from '../components/AdminUI';

const roles: LoginResponse['role'][] = ['ADMIN', 'DISPATCHER', 'LOADER', 'DRIVER', 'STOREKEEPER'];

function roleLabel(role: LoginResponse['role']) {
  return role === 'STOREKEEPER' ? 'Store Manager' : role.charAt(0) + role.slice(1).toLowerCase();
}

function displayName(email: string) {
  return email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [query, setQuery] = useState('');
  const [depot, setDepot] = useState('All depots');
  const [status, setStatus] = useState('All statuses');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<LoginResponse['role']>('DISPATCHER');
  const [depotId, setDepotId] = useState('');
  const [outletId, setOutletId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [assignmentDepotId, setAssignmentDepotId] = useState('');
  const [assignmentVehicleId, setAssignmentVehicleId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.adminUsers(), api.outlets(), api.vehicles()])
      .then(([loadedUsers, loadedOutlets, loadedVehicles]) => {
        setUsers(loadedUsers);
        setOutlets(loadedOutlets);
        setVehicles(loadedVehicles);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load users.'));
  }, []);

  const depotOptions = useMemo(() => Array.from(new Map(outlets.map((outlet) => [outlet.depotId, outlet.depotId])).entries()), [outlets]);
  const rows = useMemo(() => users.filter((user) => {
    const search = `${user.email} ${user.outletName ?? ''} ${user.depotName ?? ''} ${roleLabel(user.role)}`.toLowerCase();
    return (!query || search.includes(query.toLowerCase()))
      && (depot === 'All depots' || user.depotName === depot || user.depotId === depot)
      && (status === 'All statuses' || (user.active ? 'Active' : 'Inactive') === status);
  }), [users, query, depot, status]);

  const resetForm = () => {
    setCreating(false);
    setEmail('');
    setPassword('');
    setRole('DISPATCHER');
    setDepotId('');
    setOutletId('');
    setVehicleId('');
  };

  const saveUser = async () => {
    setError('');
    try {
      const created = await api.adminCreateUser({
        email,
        password,
        role,
        ...(outletId ? { outletId } : {}),
        ...(depotId ? { depotId } : {}),
        ...(vehicleId ? { vehicleId } : {}),
      });
      setUsers((current) => [created, ...current]);
      resetForm();
      setNotice('User created successfully.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create user.');
    }
  };

  const openUser = (user: AdminUser) => {
    setSelected(user);
    setAssignmentDepotId(user.depotId ?? '');
    setAssignmentVehicleId(user.vehicleId ?? '');
  };

  const saveAssignment = async () => {
    if (!selected) return;
    setError('');
    try {
      const updated = await api.adminSetUserAssignment(selected.id, {
        depotId: assignmentDepotId || undefined,
        vehicleId: assignmentVehicleId || undefined,
      });
      setUsers((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      setSelected(updated);
      setNotice('Account assignment updated.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update assignment.');
    }
  };

  const toggleUser = async (user: AdminUser) => {
    setError('');
    try {
      const updated = await api.adminSetUserStatus(user.id, !user.active);
      setUsers((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      setSelected(updated);
      setNotice(updated.active ? 'Account reactivated.' : 'Account deactivated.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update account status.');
    }
  };

  return <div className="admin-page">
    <AdminHeader title="Users" subtitle="Manage people and their access to Waypoint." action={<button className="admin-button primary" onClick={() => setCreating(true)} type="button"><span>＋</span>Add user</button>} />
    <div className="admin-toolbar"><div className="admin-toolbar-filters"><AdminSelect value={depot} values={['All depots', ...Array.from(new Set(outlets.map((outlet) => outlet.depotId)))]} onChange={setDepot} /><AdminSelect value={status} values={['All statuses', 'Active', 'Inactive']} onChange={setStatus} /></div><AdminBadge tone="neutral">Live data</AdminBadge></div>
    {error && <div className="admin-toast" role="alert">{error}<button onClick={() => setError('')} type="button">×</button></div>}
    <div className="admin-stats-grid four"><AdminStat label="Workspace users" value={String(users.length).padStart(2, '0')} note="Accounts returned by the API" icon={<AdminIcon name="users" />} /><AdminStat label="Active accounts" value={String(users.filter((user) => user.active).length).padStart(2, '0')} note="Can access assigned work" icon={<AdminIcon name="check" />} tone="green" /><AdminStat label="User roles" value={String(new Set(users.map((user) => user.role)).size).padStart(2, '0')} note="Roles currently assigned" icon={<AdminIcon name="shield" />} /><AdminStat label="Inactive accounts" value={String(users.filter((user) => !user.active).length).padStart(2, '0')} note="Access disabled; history retained" icon={<AdminIcon name="users" />} tone="amber" /></div>
    <AdminPanel title="People & access" action={<AdminSearch value={query} onChange={setQuery} />} className="admin-data-panel"><div className="admin-table-scroll"><table className="admin-table admin-users-table"><thead><tr><th>Name</th><th>Role</th><th>Assigned access</th><th>Status</th><th /></tr></thead><tbody>{rows.map((user) => <tr key={user.id}><td><div className="admin-user-cell"><i>{displayName(user.email).split(' ').map((part) => part[0]).join('').slice(0, 2)}</i><span><strong>{displayName(user.email)}</strong><small>{user.email}</small></span></div></td><td><AdminBadge tone={user.role === 'ADMIN' ? 'purple' : 'neutral'}>{roleLabel(user.role)}</AdminBadge></td><td><b>{user.outletName ?? user.depotName ?? 'All depots'}</b>{user.role === 'DRIVER' && <small>{user.vehicleId ?? 'No vehicle'}</small>}</td><td><AdminBadge tone={user.active ? 'green' : 'neutral'}>{user.active ? 'Active' : 'Inactive'}</AdminBadge></td><td><button type="button" className="admin-text-link" onClick={() => openUser(user)}>Manage <AdminIcon name="chevron" /></button></td></tr>)}</tbody></table></div><footer className="admin-table-footer">{rows.length} accounts <span>Account changes are recorded in the audit trail.</span></footer></AdminPanel>
    {creating && <AdminDrawer title="Add user" subtitle="Create a workspace account" onClose={resetForm}><div className="admin-form"><label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@waypoint.example" /></label><label>Temporary password<input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Role<select value={role} onChange={(event) => { setRole(event.target.value as LoginResponse['role']); if (event.target.value !== 'DRIVER') setVehicleId(''); }}>{roles.map((value) => <option key={value} value={value}>{roleLabel(value)}</option>)}</select></label><label>Assigned depot<select value={depotId} onChange={(event) => { setDepotId(event.target.value); setVehicleId(''); }}><option value="">All depots</option>{depotOptions.map(([id]) => <option key={id} value={id}>{id}</option>)}</select></label>{role === 'DRIVER' && <label>Assigned vehicle<select required value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}><option value="">Select vehicle</option>{vehicles.filter((vehicle) => !depotId || vehicle.depotId === depotId).map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.id} · {vehicle.type} · {vehicle.temperature}</option>)}</select></label>}<label>Assigned outlet<select value={outletId} onChange={(event) => setOutletId(event.target.value)}><option value="">No outlet assignment</option>{outlets.filter((outlet) => !depotId || outlet.depotId === depotId).map((outlet) => <option key={outlet.id} value={outlet.id}>{outlet.name}</option>)}</select></label><button className="admin-button primary full" type="button" onClick={saveUser}>Create user</button></div></AdminDrawer>}
    {selected && !creating && <AdminDrawer title={displayName(selected.email)} subtitle={selected.email} onClose={() => setSelected(null)}><AdminBadge tone={selected.active ? 'green' : 'neutral'}>{selected.active ? 'Active' : 'Inactive'}</AdminBadge><dl className="admin-detail-grid"><div><dt>Role</dt><dd>{roleLabel(selected.role)}</dd></div><div><dt>Assigned access</dt><dd>{selected.outletName ?? selected.depotName ?? 'All depots'}</dd></div><div><dt>Vehicle</dt><dd>{selected.vehicleId ?? 'Not assigned'}</dd></div><div><dt>Account</dt><dd>{selected.email}</dd></div></dl><section className="admin-drawer-section"><h3>Work assignment</h3><div className="admin-form"><label>Assigned depot<select value={assignmentDepotId} onChange={(event) => setAssignmentDepotId(event.target.value)}><option value="">Select depot</option>{depotOptions.map(([id]) => <option key={id} value={id}>{id}</option>)}</select></label>{selected.role === 'DRIVER' && <label>Assigned vehicle<select value={assignmentVehicleId} onChange={(event) => setAssignmentVehicleId(event.target.value)}><option value="">Select vehicle</option>{vehicles.filter((vehicle) => !assignmentDepotId || vehicle.depotId === assignmentDepotId).map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.id} · {vehicle.type} · {vehicle.temperature}</option>)}</select></label>}<button className="admin-button primary full" type="button" onClick={() => void saveAssignment()}>Save assignment</button></div></section><section className="admin-drawer-section"><h3>Access status</h3><p className="admin-drawer-note">Account status is stored by the API and applies immediately to future logins.</p></section><button className={`admin-button ${selected.active ? 'danger' : 'primary'} full`} type="button" onClick={() => toggleUser(selected)}>{selected.active ? 'Deactivate account' : 'Reactivate account'}</button></AdminDrawer>}
    {notice && <div className="admin-toast" role="status">{notice}<button onClick={() => setNotice('')} type="button">×</button></div>}
  </div>;
}
