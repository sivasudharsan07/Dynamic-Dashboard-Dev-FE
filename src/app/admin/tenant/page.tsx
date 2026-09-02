'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { useTenantStore } from '@/stores';
import { tenantApi } from '@/api';
import { LoadingState } from '@/components/common';
import { IconBuildingSkyscraper, IconCheck } from '@tabler/icons-react';

export default function TenantPage() {
  const { tenant } = useAdminGuard();
  const setTenant = useTenantStore((s) => s.setTenant);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (tenant) setName(tenant.tenantName); }, [tenant]);

  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      await tenantApi.update(tenant.tenantId, { tenantName: name });
      setTenant({ ...tenant, tenantName: name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setError('Failed to save tenant name.'); }
    finally { setSaving(false); }
  };

  if (!tenant) return <AppShell><LoadingState /></AppShell>;

  return (
    <AppShell>
      <h1 className="page-title"><IconBuildingSkyscraper size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Tenant Settings</h1>

      <div className="card" style={{ maxWidth: '36rem' }}>
        <h2 className="section-title">General</h2>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="tenant-name-input">Tenant Name</label>
          <input id="tenant-name-input" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter tenant name" />
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>This name appears in the application header and is visible to all users in this tenant.</p>
        </div>
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}
        <button className="button button--primary" onClick={handleSave} disabled={saving || !name.trim()}>
          {saved ? <><IconCheck size={14} /> Saved</> : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {tenant.role === 'SUPER_USER' && (
        <div className="card" style={{ maxWidth: '36rem', marginTop: 'var(--space-6)' }}>
          <h2 className="section-title">Advanced Configuration</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Additional tenant customization options are driven by backend configuration and will appear here when available.</p>
        </div>
      )}
    </AppShell>
  );
}
