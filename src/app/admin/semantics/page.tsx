'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { semanticsApi } from '@/api';
import type { SemanticTerm, SemanticMeasure, SemanticKPI } from '@/types';
import { LoadingState, EmptyState, ErrorState } from '@/components/common';
import { IconPlus, IconTrash, IconPencil } from '@tabler/icons-react';

type Tab = 'terms' | 'measures' | 'kpis' | 'joins';

export default function SemanticsPage() {
  useAdminGuard();
  const [tab, setTab] = useState<Tab>('terms');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [terms, setTerms] = useState<SemanticTerm[]>([]);
  const [measures, setMeasures] = useState<SemanticMeasure[]>([]);
  const [kpis, setKpis] = useState<SemanticKPI[]>([]);

  useEffect(() => {
    semanticsApi.getAll()
      .then((r) => {
        const data = r as { terms?: SemanticTerm[]; measures?: SemanticMeasure[]; kpis?: SemanticKPI[] };
        setTerms(data.terms ?? []);
        setMeasures(data.measures ?? []);
        setKpis(data.kpis ?? []);
      })
      .catch(() => setError('Failed to load semantics.'))
      .finally(() => setLoading(false));
  }, []);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'terms', label: 'Business Terms' },
    { key: 'measures', label: 'Measures' },
    { key: 'kpis', label: 'KPI Formulas' },
    { key: 'joins', label: 'Joins' },
  ];

  return (
    <AppShell>
      <h1 className="page-title">Semantics</h1>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-1)' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: 'var(--space-2) var(--space-4)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: tab === t.key ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)', color: tab === t.key ? 'var(--color-brand-600)' : 'var(--color-text-secondary)', borderBottom: tab === t.key ? '2px solid var(--color-brand-500)' : '2px solid transparent', marginBottom: '-1px', fontSize: 'var(--font-size-md)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} />}

      {!loading && !error && tab === 'terms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
            <button className="button button--primary button--sm"><IconPlus size={14} /> Add Term</button>
          </div>
          {terms.length === 0 ? <EmptyState message="No business terms defined." /> : (
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {terms.map((t) => (
                <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{t.term}</div>
                    {t.synonyms.length > 0 && <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>Synonyms: {t.synonyms.join(', ')}</div>}
                    {t.description && <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{t.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="icon-button" aria-label="Edit"><IconPencil size={15} /></button>
                    <button className="icon-button" aria-label="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => semanticsApi.deleteTerm(t.id).then(() => setTerms((p) => p.filter((x) => x.id !== t.id)))}><IconTrash size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && tab === 'measures' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
            <button className="button button--primary button--sm"><IconPlus size={14} /> Add Measure</button>
          </div>
          {measures.length === 0 ? <EmptyState message="No measures defined." /> : (
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {measures.map((m) => (
                <div key={m.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{m.name}</div>
                    <code style={{ fontSize: 'var(--font-size-sm)', background: 'var(--color-surface-muted)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-brand-600)' }}>{m.formula}</code>
                  </div>
                  <button className="icon-button" aria-label="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => semanticsApi.deleteMeasure(m.id).then(() => setMeasures((p) => p.filter((x) => x.id !== m.id)))}><IconTrash size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && tab === 'kpis' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
            <button className="button button--primary button--sm"><IconPlus size={14} /> Add KPI</button>
          </div>
          {kpis.length === 0 ? <EmptyState message="No KPI formulas defined." /> : (
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {kpis.map((k) => (
                <div key={k.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{k.name}</div>
                    <code style={{ fontSize: 'var(--font-size-sm)', background: 'var(--color-surface-muted)', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-brand-600)' }}>{k.formula}</code>
                    {k.validationRule && <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>Validation: {k.validationRule}</div>}
                  </div>
                  <button className="icon-button" aria-label="Delete" style={{ color: 'var(--color-danger)' }}><IconTrash size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && tab === 'joins' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
            <button className="button button--primary button--sm"><IconPlus size={14} /> Add Join</button>
          </div>
          <EmptyState message="No joins configured. Add joins to enable cross-dataset analysis." />
        </div>
      )}
    </AppShell>
  );
}
