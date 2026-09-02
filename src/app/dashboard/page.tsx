'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { useDashboardStore } from '@/stores';
import { dashboardApi, widgetsApi } from '@/api';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { CommandCenter } from '@/components/command-center/CommandCenter';
import { LoadingState, EmptyState, ErrorState } from '@/components/common';
import type { AnalysisMode, DashboardWidget } from '@/types';
import { IconPencil, IconRefresh, IconFilter } from '@tabler/icons-react';

export default function DashboardPage() {
  useRouteGuard();
  const { dashboardName, setDashboardName, widgets, setWidgets } = useDashboardStore();
  const [mode, setMode] = useState<AnalysisMode>('auto');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renamingDash, setRenamingDash] = useState(false);
  const [tempName, setTempName] = useState(dashboardName);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [dash, wList] = await Promise.all([dashboardApi.get(), widgetsApi.list()]);
      const d = dash as { name?: string };
      const w = wList as DashboardWidget[];
      if (d?.name) setDashboardName(d.name);
      setWidgets(w ?? []);
    } catch { setError('Failed to load dashboard.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRenameDash = async () => {
    try { await dashboardApi.rename(tempName); } catch { /* ignore */ }
    setDashboardName(tempName); setRenamingDash(false);
  };

  return (
    <AppShell>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {renamingDash ? (
            <>
              <input className="input" value={tempName} onChange={(e) => setTempName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameDash(); if (e.key === 'Escape') setRenamingDash(false); }} style={{ minHeight: '2rem', padding: '0 var(--space-3)', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', width: '18rem' }} autoFocus />
              <button className="button button--primary button--sm" onClick={handleRenameDash}>Save</button>
              <button className="button button--secondary button--sm" onClick={() => setRenamingDash(false)}>Cancel</button>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>{dashboardName}</h1>
              <button className="icon-button" onClick={() => { setTempName(dashboardName); setRenamingDash(true); }} aria-label="Rename dashboard"><IconPencil size={16} /></button>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="button button--secondary button--sm" onClick={load}><IconRefresh size={14} /> Refresh</button>
          <button className="button button--secondary button--sm"><IconFilter size={14} /> Filter</button>
        </div>
      </div>

      {/* AI Command Center */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <CommandCenter mode={mode} onModeChange={setMode} />
      </div>

      {/* Widget Grid */}
      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && widgets.length === 0 && (
        <EmptyState message="No widgets yet. Use the AI Command Center above to generate your first visualization." icon="📊" />
      )}
      {!loading && !error && widgets.length > 0 && (
        <div className="dashboard-grid">
          {widgets.map((w) => (
            <div key={w.id} className="widget" data-span={w.span} style={{ gridColumn: `span ${w.span}` }}>
              <WidgetShell widget={w} />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
