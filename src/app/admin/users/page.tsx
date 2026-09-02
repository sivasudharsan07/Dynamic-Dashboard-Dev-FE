'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { usersApi } from '@/api';
import type { User } from '@/types';
import { LoadingState, EmptyState, ErrorState, StatusBadge, DataTable } from '@/components/common';
import { IconRefresh, IconLock, IconLockOpen } from '@tabler/icons-react';

export default function UsersPage() {
  useAdminGuard();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setUsers(await usersApi.list() as User[]); }
    catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (user: User) => {
    try {
      if (user.status === 'BLOCKED') await usersApi.unblock(user.id);
      else await usersApi.block(user.id);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' } : u));
    } catch { /* ignore */ }
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status', render: (u: User) => <StatusBadge label={u.status} variant={u.status === 'ACTIVE' ? 'success' : u.status === 'BLOCKED' ? 'danger' : 'warning'} /> },
    { key: 'lastLoginAt', label: 'Last Login', render: (u: User) => u.lastLoginAt ?? '—' },
    {
      key: 'actions', label: '', render: (u: User) => (
        <button className="button button--ghost button--sm" onClick={() => toggle(u)}>
          {u.status === 'BLOCKED' ? <><IconLockOpen size={13} /> Unblock</> : <><IconLock size={13} /> Block</>}
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Users</h1>
        <button className="button button--secondary button--sm" onClick={load}><IconRefresh size={14} /> Refresh</button>
      </div>
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && users.length === 0 && <EmptyState message="No users found." />}
      {!loading && !error && users.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable columns={columns} data={users} keyField="id" />
        </div>
      )}
    </AppShell>
  );
}
