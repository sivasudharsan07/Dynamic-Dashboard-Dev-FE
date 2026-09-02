'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api';
import { useSessionStore, useTenantStore } from '@/stores';
import type { Session, TenantContext, TenantRole } from '@/types';
import { IconLayoutDashboard, IconFlask } from '@tabler/icons-react';
import { Logo } from '@/components/common/Logo';

// ---- Dev test presets (no backend required) ----
const TEST_USERS: { label: string; role: TenantRole; color: string }[] = [
  { label: 'Normal User',  role: 'NORMAL_USER', color: 'var(--color-info)' },
  { label: 'DB Admin',     role: 'DB_ADMIN',    color: 'var(--color-warning)' },
  { label: 'Super User',   role: 'SUPER_USER',  color: 'var(--color-success)' },
];

function seedTestUser(role: TenantRole, setSession: (s: Session) => void, setTenant: (t: TenantContext) => void) {
  const userId = `test-${role.toLowerCase().replace('_', '-')}`;
  setSession({ authenticated: true, userId, tenantId: 'tenant-dev', tenantName: 'Dev Tenant', role, token: 'mock-token' });
  setTenant({ tenantId: 'tenant-dev', tenantName: 'Dev Tenant', role, userId });
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const setTenant = useTenantStore((s) => s.setTenant);

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form) as { session: Session; tenant: TenantContext };
      setSession(res.session);
      setTenant(res.tenant);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-6)' }}>
      <div style={{ width: '100%', maxWidth: '26rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <Logo variant="full" theme="auto" height={44} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: '0 0 var(--space-2)' }}>Sign in</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Access your analytics workspace</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="login-username">Username or email</label>
            <input id="login-username" className="input" type="text" autoComplete="username" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Enter your username" />
          </div>
          <div>
            <label htmlFor="login-password">Password</label>
            <input id="login-password" className="input" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
          </div>
          {error && <div style={{ color: 'var(--color-danger)', background: 'var(--color-danger-bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}
          <button className="button button--primary" type="submit" disabled={loading} style={{ width: '100%', minHeight: '2.75rem', justifyContent: 'center' }}>
            {loading ? <><span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} /> Signing in…</> : 'Sign in'}
          </button>
        </form>

        {/* ---- Dev Test Users (no backend required) ---- */}
        <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', background: 'var(--color-surface-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <IconFlask size={13} /> Dev — Quick Login (no backend)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {TEST_USERS.map((u) => (
              <button
                key={u.role}
                id={`test-login-${u.role.toLowerCase()}`}
                className="button button--secondary button--sm"
                style={{ justifyContent: 'space-between', width: '100%', borderColor: u.color, color: u.color }}
                onClick={() => { seedTestUser(u.role, setSession, setTenant); router.push('/dashboard'); }}
              >
                <span>{u.label}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <span>No account? <Link href="/register" style={{ color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-medium)' }}>Register</Link></span>
          <span>Need access? <Link href="/request-access" style={{ color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-medium)' }}>Request Access</Link></span>
          <Link href="/" style={{ color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
