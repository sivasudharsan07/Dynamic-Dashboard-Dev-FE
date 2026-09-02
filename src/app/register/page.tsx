'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api';
import { Logo } from '@/components/common/Logo';
import { IconLayoutDashboard } from '@tabler/icons-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authApi.register({ username: form.username, email: form.email, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-6)' }}>
      <div style={{ textAlign: 'center', maxWidth: '26rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>✅</div>
        <h2 style={{ margin: '0 0 var(--space-3)' }}>Registration submitted</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>Your account request has been submitted. You will receive access once an administrator approves it.</p>
        <button className="button button--primary" onClick={() => router.push('/login')}>Go to Sign In</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-6)' }}>
      <div style={{ width: '100%', maxWidth: '26rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <Logo variant="full" theme="auto" height={44} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: '0 0 var(--space-2)' }}>Create account</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Register for your analytics workspace</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label htmlFor="reg-username">Username</label><input id="reg-username" className="input" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Choose a username" /></div>
          <div><label htmlFor="reg-email">Email</label><input id="reg-email" className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
          <div><label htmlFor="reg-password">Password</label><input id="reg-password" className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a password" /></div>
          <div><label htmlFor="reg-confirm">Confirm password</label><input id="reg-confirm" className="input" type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat your password" /></div>
          {error && <div style={{ color: 'var(--color-danger)', background: 'var(--color-danger-bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}
          <button className="button button--primary" type="submit" disabled={loading} style={{ width: '100%', minHeight: '2.75rem' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-medium)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
