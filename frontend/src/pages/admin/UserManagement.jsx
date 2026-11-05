import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/api';
import useFetch from '../../hooks/useFetch';
import { useConfirm } from '../../context/confirmContext';
import { Alert, Avatar, Badge, EmptyState, PageHeader, PageLoader, SearchInput } from '../../components/ui';
import { errorMessage, formatDate } from '../../utils/format';

const UserManagement = () => {
  const { data: users, loading, error, setData } = useFetch('/api/admin/users', { initialData: [] });
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) => (!status || u.status === status) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [users, search, status]);

  const changeStatus = async (user) => {
    const next = user.status === 'active' ? 'blocked' : 'active';
    const ok = await confirm(
      next === 'blocked'
        ? {
            title: `Block ${user.name}?`,
            message: 'They will be signed out immediately and won’t be able to sign in until unblocked.',
            confirmText: 'Block user',
            tone: 'danger',
          }
        : { title: `Unblock ${user.name}?`, message: 'They will be able to sign in again.', confirmText: 'Unblock' }
    );
    if (!ok) return;

    setBusyId(user._id);
    try {
      await api.put(`/api/admin/users/${user._id}/status`, { status: next });
      setData((prev) => prev.map((u) => (u._id === user._id ? { ...u, status: next } : u)));
      toast.success(next === 'blocked' ? 'User blocked' : 'User unblocked');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Users"
        description={`${users.length} registered users · ${users.filter((u) => u.status === 'blocked').length} blocked`}
      />
      {error && <Alert tone="red" className="mb-6">{error}</Alert>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or email…" className="sm:max-w-sm sm:flex-1" />
        <select className="input sm:w-40" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {visible.length === 0 ? (
          <EmptyState icon="users" title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th className="!text-right">Vehicles</th>
                  <th>2FA</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="truncate text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{u.vehicleCount ?? 0}</td>
                    <td>{u.isTwoFactorEnabled ? <Badge tone="green">On</Badge> : <span className="text-slate-400">Off</span>}</td>
                    <td className="whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td>
                      <Badge tone={u.status === 'active' ? 'green' : 'red'} dot>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        disabled={busyId === u._id}
                        onClick={() => changeStatus(u)}
                        className={`btn btn-sm ${u.status === 'active' ? 'btn-danger-ghost' : 'btn-secondary'}`}
                      >
                        {u.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;
