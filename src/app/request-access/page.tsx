'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/api';
import { Logo } from '@/components/common/Logo';
import { IconLayoutDashboard } from '@tabler/icons-react';

export default function RequestAccessPage() {
  const [form, setForm] = useState({ username: '', email: '', reason: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.requestAccess(form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-6)' }}>
      <div style={{ textAlign: 'center', maxWidth: '26rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>📬</div>
        <h2 style={{ margin: '0 0 var(--space-3)' }}>Request submitted</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>Your access request has been submitted. An administrator will review it and notify you.</p>
        <Link href="/login" className="button button--primary">Back to Sign In</Link>
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
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: '0 0 var(--space-2)' }}>Request Access</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Submit a request for workspace access</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label htmlFor="ra-username">Username</label><input id="ra-username" className="input" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Your name or username" /></div>
          <div><label htmlFor="ra-email">Email</label><input id="ra-email" className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" /></div>
          <div><label htmlFor="ra-reason">Reason for access</label><textarea id="ra-reason" className="textarea" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Briefly describe your team and use case…" style={{ minHeight: '6rem' }} /></div>
          {error && <div style={{ color: 'var(--color-danger)', background: 'var(--color-danger-bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>{error}</div>}
          <button className="button button--primary" type="submit" disabled={loading} style={{ width: '100%', minHeight: '2.75rem' }}>
            {loading ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--color-brand-600)', fontWeight: 'var(--font-weight-medium)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
