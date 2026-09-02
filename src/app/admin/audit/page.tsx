'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { auditApi } from '@/api';
import type { AuditEvent } from '@/types';
import { LoadingState, EmptyState, ErrorState, Modal, DataTable } from '@/components/common';
import { IconRefresh, IconFilter } from '@tabler/icons-react';

export default function AuditPage() {
  useAdminGuard();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [filterAction, setFilterAction] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setEvents(await auditApi.list() as AuditEvent[]); }
    catch { setError('Failed to load audit log.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filterAction
    ? events.filter((e) => e.action.toLowerCase().includes(filterAction.toLowerCase()))
    : events;

  const columns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'userId', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Resource', render: (e: AuditEvent) => e.resource ?? '—' },
    { key: 'detail', label: '', render: (e: AuditEvent) => <button className="button button--ghost button--sm" onClick={() => setSelected(e)}>View</button> },
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Audit</h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <IconFilter size={15} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
            <input id="audit-filter" className="input" placeholder="Filter by action…" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ paddingLeft: '2rem', width: '14rem' }} />
          </div>
          <button className="button button--secondary button--sm" onClick={load}><IconRefresh size={14} /> Refresh</button>
        </div>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <EmptyState message="No audit events found." />}
      {!loading && !error && filtered.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable columns={columns} data={filtered} keyField="id" />
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Audit Event" size="sm">
        {selected && (
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-2) var(--space-4)', margin: 0 }}>
            {Object.entries(selected).map(([k, v]) => (
              <React.Fragment key={k}>
                <dt style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{k}</dt>
                <dd style={{ margin: 0, wordBreak: 'break-all' }}>{String(v ?? '—')}</dd>
              </React.Fragment>
            ))}
          </dl>
        )}
      </Modal>
    </AppShell>
  );
}
