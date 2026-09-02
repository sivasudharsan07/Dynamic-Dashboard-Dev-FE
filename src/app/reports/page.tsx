'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { reportsApi } from '@/api';
import type { Report } from '@/types';
import { LoadingState, EmptyState, ErrorState, Modal } from '@/components/common';
import { IconFileAnalytics, IconDownload, IconEye } from '@tabler/icons-react';

export default function ReportsPage() {
  useRouteGuard();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<Report | null>(null);

  const load = async () => {
    setLoading(true); setError('');
    try { setReports(await reportsApi.list() as Report[]); }
    catch { setError('Failed to load reports.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Reports</h1>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && reports.length === 0 && (
        <EmptyState message="No reports yet. Generate a report from your Dashboard widgets." icon={<IconFileAnalytics size={32} />} />
      )}
      {!loading && !error && reports.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {reports.map((r) => (
            <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{r.name}</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{r.elements.length} widget(s) · {r.createdAt}</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="button button--secondary button--sm" onClick={() => setPreview(r)}><IconEye size={14} /> Preview</button>
                <a className="button button--secondary button--sm" href={reportsApi.exportPdf(r.id)} download><IconDownload size={14} /> PDF</a>
                <a className="button button--secondary button--sm" href={reportsApi.exportCsv(r.id)} download><IconDownload size={14} /> CSV</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <Modal open={!!preview} onClose={() => setPreview(null)} title={preview.name} size="lg">
          {preview.elements.map((el, i) => (
            <div key={el.widgetId} style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: i < preview.elements.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              {el.nlQuery && <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: 'var(--space-2)' }}>"{el.nlQuery}"</p>}
              <h3 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-lg)' }}>{el.widgetName}</h3>
              <div style={{ background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>[Chart Area]</div>
              {el.insight && <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{el.insight}</p>}
            </div>
          ))}
        </Modal>
      )}
    </AppShell>
  );
}
