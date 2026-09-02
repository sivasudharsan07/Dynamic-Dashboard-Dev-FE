'use client';
import React, { useEffect, useState, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { sourcesApi } from '@/api';
import type { SourceLimits } from '@/types';
import { LoadingState, ErrorState } from '@/components/common';
import { IconUpload, IconDatabase } from '@tabler/icons-react';

export default function SourcesPage() {
  useAdminGuard();
  const [limits, setLimits] = useState<SourceLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const dbmlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sourcesApi.getLimits()
      .then((r) => setLimits(r as SourceLimits))
      .catch(() => setError('Failed to load limits.'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isDbml = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { setUploadMsg('File exceeds 15 MB limit.'); return; }
    setUploading(true); setUploadMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      await (isDbml ? sourcesApi.uploadDbml(fd) : sourcesApi.upload(fd));
      setUploadMsg(`"${file.name}" uploaded successfully.`);
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : 'Upload failed.');
    }
    setUploading(false);
  };

  if (loading) return <AppShell><LoadingState /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;

  return (
    <AppShell>
      <h1 className="page-title">Sources</h1>

      {/* Limits */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'CSV Sources', used: limits?.currentCsvCount ?? 0, max: limits?.csvMax ?? 8 },
          { label: 'DBML Sources', used: limits?.currentDbmlCount ?? 0, max: limits?.dbmlMax ?? 1 },
          { label: 'Max File Size', used: null, max: 15, unit: 'MB' },
        ].map((item) => (
          <div key={item.label} className="card">
            <div style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>{item.label}</div>
            {item.used !== null ? (
              <>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: item.used >= item.max ? 'var(--color-danger)' : 'var(--color-brand-500)' }}>{item.used}/{item.max}</div>
                <div className="progress-track" style={{ marginTop: 'var(--space-3)' }}>
                  <div className="progress-bar" style={{ width: `${Math.min(100, (item.used / item.max) * 100)}%`, background: item.used >= item.max ? 'var(--color-danger)' : undefined }} />
                </div>
              </>
            ) : (
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>{item.max} {item.unit}</div>
            )}
          </div>
        ))}
      </div>

      {uploadMsg && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: uploadMsg.includes('success') ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: uploadMsg.includes('success') ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {uploadMsg}
        </div>
      )}

      <div className="grid-2">
        {/* CSV/Excel Upload */}
        <div className="card">
          <h2 className="section-title"><IconUpload size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Upload Dataset</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>CSV or Excel files (max 15 MB). Up to 8 CSV sources per tenant.</p>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} id="source-file-input" onChange={(e) => handleUpload(e, false)} />
          <button className="button button--primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : <><IconUpload size={14} /> Choose File</>}
          </button>
        </div>

        {/* DBML Upload */}
        <div className="card">
          <h2 className="section-title"><IconDatabase size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />Upload DBML Schema</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>One DBML file per tenant. Defines your relational schema for AI-powered joins.</p>
          <input ref={dbmlRef} type="file" accept=".dbml" style={{ display: 'none' }} id="dbml-file-input" onChange={(e) => handleUpload(e, true)} />
          <button className="button button--secondary" onClick={() => dbmlRef.current?.click()} disabled={uploading || (limits?.currentDbmlCount ?? 0) >= (limits?.dbmlMax ?? 1)}>
            {uploading ? 'Uploading…' : <><IconUpload size={14} /> Choose DBML</>}
          </button>
          {(limits?.currentDbmlCount ?? 0) >= (limits?.dbmlMax ?? 1) && (
            <p style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>DBML limit reached. Delete existing to replace.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
