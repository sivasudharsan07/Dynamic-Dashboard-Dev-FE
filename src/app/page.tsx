'use client';
import Link from 'next/link';
import { useThemeStore } from '@/stores';
import { Logo } from '@/components/common/Logo';
import {
  IconBrain, IconChartBar, IconDatabase, IconFileAnalytics,
  IconMoon, IconSun, IconMessage,
} from '@tabler/icons-react';

const CAPABILITIES = [
  { icon: <IconMessage size={28} />, title: 'AI Chat', desc: 'Ask natural-language questions against your governed datasets and get cited, explainable answers.' },
  { icon: <IconChartBar size={28} />, title: 'Dynamic Widgets', desc: 'Auto-generated charts, KPIs, tables, and gauges that update with your data in real time.' },
  { icon: <IconBrain size={28} />, title: 'Auto & Manual Analysis', desc: 'Let the AI propose key insights or take full control with precision filters and dimensions.' },
  { icon: <IconDatabase size={28} />, title: 'Governed Data', desc: 'Upload CSV, Excel, and DBML sources with ingestion tracking, semantic layers, and audit trails.' },
  { icon: <IconLayoutDashboard size={28} />, title: 'Dashboards', desc: 'Arrange, resize, and save widgets into shareable dashboards tailored to each team.' },
  { icon: <IconFileAnalytics size={28} />, title: 'Reports & Export', desc: 'Generate PDF and CSV reports directly from your dashboard widgets with AI-written summaries.' },
];

export default function LandingPage() {
  const { theme, toggle } = useThemeStore();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 100, height: 'var(--header-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-8)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo variant="full" theme="auto" height={36} />
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="icon-button" onClick={toggle} aria-label="Toggle theme">
            {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
          </button>
          <Link href="/login" className="button button--secondary button--sm">Sign In</Link>
          <Link href="/register" className="button button--primary button--sm">Get Started</Link>
        </nav>
      </header>

      <section style={{ maxWidth: '56rem', margin: '0 auto', padding: 'var(--space-12) var(--space-8)', textAlign: 'center' }}>
        {/* Prominent logo in hero */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <Logo variant="full" theme="auto" height={56} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-brand-50)', color: 'var(--color-brand-600)', border: '1px solid var(--color-brand-200)', borderRadius: 'var(--radius-pill)', padding: '0.25rem 0.875rem', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-6)' }}>
          <IconBrain size={14} /> Enterprise AI Analytics Platform
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'var(--font-weight-bold)', lineHeight: 1.12, letterSpacing: '-0.03em', margin: '0 0 var(--space-5)' }}>
          Turn Data Into <span style={{ color: 'var(--color-brand-500)' }}>Instant Insight</span>
        </h1>
        <p style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-secondary)', maxWidth: '38rem', margin: '0 auto var(--space-8)', lineHeight: 1.65 }}>
          Dynamic Dashboard connects your governed datasets to an AI layer that answers questions, auto-generates visualizations, and surfaces trends — all in one secure, multi-tenant workspace.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link href="/login" className="button button--primary" style={{ minHeight: '2.75rem', padding: '0 var(--space-6)', fontSize: 'var(--font-size-lg)' }}>Sign In</Link>
          <Link href="/register" className="button button--secondary" style={{ minHeight: '2.75rem', padding: '0 var(--space-6)', fontSize: 'var(--font-size-lg)' }}>Request Access</Link>
        </div>
      </section>

      <div style={{ borderTop: '1px solid var(--color-border)', margin: '0 var(--space-8)' }} />

      <section style={{ maxWidth: '72rem', margin: '0 auto', padding: 'var(--space-12) var(--space-8)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', margin: '0 0 var(--space-8)' }}>Built for Enterprise Analytics Teams</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: 'var(--space-4)' }}>
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ color: 'var(--color-brand-500)' }}>{c.icon}</div>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>{c.title}</h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ margin: '0 var(--space-8) var(--space-12)', background: 'var(--color-brand-600)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-10) var(--space-8)', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: '#fff' }}>Ready to get started?</h2>
        <p style={{ margin: '0 0 var(--space-6)', color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-lg)' }}>Sign in or request access for your team today.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
          <Link href="/login" className="button" style={{ background: '#fff', color: 'var(--color-brand-700)', minHeight: '2.75rem', padding: '0 var(--space-6)' }}>Sign In</Link>
          <Link href="/request-access" className="button" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', minHeight: '2.75rem', padding: '0 var(--space-6)' }}>Request Access</Link>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: 'var(--space-6)', borderTop: '1px solid var(--color-border)', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
        © {new Date().getFullYear()} Dynamic Dashboard — Enterprise Analytics Platform
      </footer>
    </div>
  );
}
