'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { catalogApi } from '@/api';
import type { Dataset } from '@/types';
import { LoadingState, EmptyState, ErrorState, StatusBadge } from '@/components/common';
import { IconSearch } from '@tabler/icons-react';

function statusVariant(s: Dataset['status']) {
  if (s === 'READY') return 'success';
  if (s === 'FAILED') return 'danger';
  if (s === 'INGESTING') return 'info';
  if (s === 'PARTIAL') return 'warning';
  return 'muted';
}

export default function CatalogPage() {
  const { tenant } = useRouteGuard();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const isAdmin = tenant?.role === 'DB_ADMIN' || tenant?.role === 'SUPER_USER';

  const load = async () => {
    setLoading(true); setError('');
    try { setDatasets((await catalogApi.list() as Dataset[])); }
    catch { setError('Failed to load catalog.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = datasets.filter((d) =>
    d.displayName.toLowerCase().includes(search.toLowerCase()) ||
    d.uniqueId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Catalog</h1>
        <div style={{ position: 'relative', width: '18rem' }}>
          <IconSearch size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          <input id="catalog-search" className="input" placeholder="Search datasets…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <EmptyState message="No datasets found." icon="🗄️" />}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))', gap: 'var(--space-4)' }}>
          {filtered.map((d) => (
            <div key={d.uniqueId} className="dataset-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>{d.displayName}</div>
                  <div style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>{d.uniqueId}</div>
                </div>
                <StatusBadge label={d.status} variant={statusVariant(d.status)} />
              </div>
              <div className="dataset-card__meta">
                <span className="chip">{d.type}</span>
                {d.owner && <span>Owner: {d.owner}</span>}
                {d.rowCount !== undefined && <span>{d.rowCount.toLocaleString()} rows</span>}
                {d.sizeBytes !== undefined && <span>{(d.sizeBytes / 1024).toFixed(1)} KB</span>}
              </div>
              {isAdmin && (
                <div className="dataset-card__meta" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                  {d.modifiedAt && <span>Modified: {d.modifiedAt}</span>}
                  {d.sensitivity && <span>Sensitivity: {d.sensitivity}</span>}
                  {d.qualityStatus && <span>Quality: {d.qualityStatus}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
