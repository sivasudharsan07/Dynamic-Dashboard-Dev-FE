'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { ingestionApi, datasetsApi } from '@/api';
import type { Dataset } from '@/types';
import { LoadingState, EmptyState, ErrorState, StatusBadge, ConfirmDialog } from '@/components/common';
import { IconRefresh, IconTrash, IconPencil } from '@tabler/icons-react';

function statusVariant(s: Dataset['status']) {
  if (s === 'READY') return 'success';
  if (s === 'FAILED') return 'danger';
  if (s === 'INGESTING') return 'info';
  if (s === 'PARTIAL') return 'warning';
  return 'muted';
}

export default function IngestionPage() {
  useAdminGuard();
  const [items, setItems] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<Dataset | null>(null);
  const [newName, setNewName] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await ingestionApi.list() as Dataset[]); }
    catch { setError('Failed to load ingestion status.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRetry = async (uid: string) => {
    try { await ingestionApi.retry(uid); load(); } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await ingestionApi.delete(deleteTarget); setItems((prev) => prev.filter((d) => d.uniqueId !== deleteTarget)); }
    catch { /* ignore */ }
    setDeleteTarget(null);
  };

  const handleRename = async () => {
    if (!renameTarget) return;
    try { await datasetsApi.rename(renameTarget.uniqueId, newName); setItems((prev) => prev.map((d) => d.uniqueId === renameTarget.uniqueId ? { ...d, displayName: newName } : d)); }
    catch { /* ignore */ }
    setRenameTarget(null);
  };

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Ingestion</h1>
        <button className="button button--secondary button--sm" onClick={load}><IconRefresh size={14} /> Refresh</button>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && items.length === 0 && <EmptyState message="No ingestion jobs yet. Upload sources to begin." icon="📥" />}
      {!loading && !error && items.length > 0 && (
        <div className="ingestion-list">
          {items.map((item) => (
            <div key={item.uniqueId} className="ingestion-item">
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{item.displayName}</div>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-2)' }}>{item.uniqueId} · {item.type}</div>
                {item.status === 'INGESTING' && (
                  <div className="progress-track"><div className="progress-bar" style={{ width: '60%', animation: 'none', background: 'var(--color-info)' }} /></div>
                )}
                {item.sizeBytes !== undefined && <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>{(item.sizeBytes / 1024).toFixed(1)} KB{item.rowCount !== undefined ? ` · ${item.rowCount.toLocaleString()} rows` : ''}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                <StatusBadge label={item.status} variant={statusVariant(item.status)} />
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="button button--ghost button--sm" onClick={() => { setRenameTarget(item); setNewName(item.displayName); }}><IconPencil size={13} /> Rename</button>
                  {item.status === 'FAILED' && <button className="button button--secondary button--sm" onClick={() => handleRetry(item.uniqueId)}><IconRefresh size={13} /> Retry</button>}
                  <button className="button button--danger button--sm" onClick={() => setDeleteTarget(item.uniqueId)}><IconTrash size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Dataset" message="Delete this dataset? This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />

      {renameTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'grid', placeItems: 'center', background: 'var(--color-overlay)' }} onClick={(e) => { if (e.target === e.currentTarget) setRenameTarget(null); }}>
          <div className="card" style={{ width: 'min(28rem, 90vw)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ margin: '0 0 var(--space-4)' }}>Rename Dataset</h3>
            <label htmlFor="rename-input">New name</label>
            <input id="rename-input" className="input" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus style={{ marginBottom: 'var(--space-4)' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="button button--secondary" onClick={() => setRenameTarget(null)}>Cancel</button>
              <button className="button button--primary" onClick={handleRename}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
