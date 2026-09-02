'use client';
import React, { useState } from 'react';
import type { DashboardWidget } from '@/types';
import { useDashboardStore } from '@/stores';
import { widgetsApi } from '@/api';
import { Modal, SourceTagsGroup, ConfirmDialog, EmptyState } from '@/components/common';
import {
  IconDotsVertical, IconMaximize, IconTrash, IconCopy,
  IconPencil, IconSparkles, IconInfoCircle,
} from '@tabler/icons-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';

// ---- Helper: get CSS var value ----
function cssVar(name: string): string {
  if (typeof window === 'undefined') return '#3b6ff5';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function chartColors() {
  return [1,2,3,4,5,6,7,8].map((i) => cssVar(`--chart-${i}`));
}

// ---- Widget Progress ----
const STEPS = ['THINKING', 'ANALYZING', 'RENDERING', 'COMPLETED'] as const;

function WidgetProgress({ status }: { status: DashboardWidget['status'] }) {
  const stepIdx = STEPS.indexOf(status as typeof STEPS[number]);
  return (
    <div className="widget-progress">
      <div className="spinner" />
      <div className="widget-progress__steps">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className="widget-progress__step"
            data-active={i === stepIdx ? 'true' : 'false'}
            data-complete={i < stepIdx ? 'true' : 'false'}
          >{s}</span>
        ))}
      </div>
      <span style={{ fontSize: 'var(--font-size-sm)' }}>{status}…</span>
    </div>
  );
}

// ---- Widget Chart Renderers ----
function KpiContent({ data }: { data: unknown }) {
  const d = data as { value?: string | number; label?: string; change?: number } | null;
  const positive = (d?.change ?? 0) > 0;
  const negative = (d?.change ?? 0) < 0;
  return (
    <div>
      {d?.label && <div className="kpi-label">{d.label}</div>}
      <div className="kpi-value">{d?.value ?? '—'}</div>
      {d?.change !== undefined && (
        <div className="kpi-change" data-positive={positive ? 'true' : undefined} data-negative={negative ? 'true' : undefined} style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
          {positive ? '▲' : negative ? '▼' : '●'} {Math.abs(d.change)}%
        </div>
      )}
    </div>
  );
}

function ChartContent({ type, data }: { type: DashboardWidget['type']; data: unknown }) {
  const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [];
  const colors = chartColors();

  if (type === 'TABLE') {
    if (!rows.length) return <EmptyState message="No data" />;
    const cols = Object.keys(rows[0]);
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{cols.map((c) => <td key={c}>{String(r[c] ?? '')}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }

  if (type === 'LINE') {
    const keys = rows.length ? Object.keys(rows[0]).filter((k) => k !== 'name') : [];
    return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-text)', border: 'none', borderRadius: '6px' }} />
          <Legend />
          {keys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={colors[i % 8]} dot={false} />)}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'BAR') {
    const keys = rows.length ? Object.keys(rows[0]).filter((k) => k !== 'name') : [];
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-text)', border: 'none', borderRadius: '6px' }} />
          <Legend />
          {keys.map((k, i) => <Bar key={k} dataKey={k} fill={colors[i % 8]} />)}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'PIE' || type === 'DONUT') {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={type === 'DONUT' ? 45 : 0} outerRadius={70} paddingAngle={2}>
            {rows.map((_, i) => <Cell key={i} fill={colors[i % 8]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: 'var(--chart-tooltip-bg)', color: 'var(--chart-tooltip-text)', border: 'none', borderRadius: '6px' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <EmptyState message="Unsupported chart type" />;
}

// ---- Widget Shell ----
type WidgetShellProps = { widget: DashboardWidget; };

export function WidgetShell({ widget }: WidgetShellProps) {
  const { updateWidget, removeWidget } = useDashboardStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandOpen, setExpandOpen] = useState(false);
  const [insightOpen, setInsightOpen] = useState(false);
  const [insightText, setInsightText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(widget.name);

  const isProcessing = ['THINKING', 'ANALYZING', 'RENDERING'].includes(widget.status);

  const handleRename = async () => {
    try { await widgetsApi.rename(widget.id, newName); } catch { /* ignore */ }
    updateWidget(widget.id, { name: newName });
    setRenaming(false);
  };

  const handleDuplicate = async () => {
    setMenuOpen(false);
    try { await widgetsApi.duplicate(widget.id); } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    try { await widgetsApi.delete(widget.id); } catch { /* ignore */ }
    removeWidget(widget.id);
  };

  const handleInsight = async () => {
    setMenuOpen(false);
    setInsightOpen(true);
    if (widget.insight) { setInsightText(widget.insight); return; }
    try {
      const res = await widgetsApi.getInsight(widget.id) as { insight: string };
      setInsightText(res.insight);
      updateWidget(widget.id, { insight: res.insight });
    } catch { setInsightText('Unable to load insight.'); }
  };

  return (
    <>
      <div className="widget-shell" data-span={widget.span} style={{ gridColumn: `span ${widget.span}` }}>
        <div className="widget-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            {renaming ? (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }} style={{ minHeight: '1.75rem', padding: '0 var(--space-2)' }} autoFocus />
                <button className="button button--primary button--sm" onClick={handleRename}>Save</button>
                <button className="button button--secondary button--sm" onClick={() => setRenaming(false)}>Cancel</button>
              </div>
            ) : (
              <h3 className="widget-title">{widget.name}</h3>
            )}
            {widget.sourceTags && <SourceTagsGroup tags={widget.sourceTags} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
            <button className="icon-button" style={{ width: '1.75rem', height: '1.75rem' }} onClick={() => setExpandOpen(true)} aria-label="Expand widget"><IconMaximize size={15} /></button>
            <div style={{ position: 'relative' }}>
              <button className="icon-button" style={{ width: '1.75rem', height: '1.75rem' }} onClick={() => setMenuOpen((o) => !o)} aria-label="Widget actions"><IconDotsVertical size={15} /></button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 200, minWidth: '10rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 'var(--space-1)' }}>
                  {[
                    { icon: <IconPencil size={14} />, label: 'Rename', action: () => { setRenaming(true); setMenuOpen(false); } },
                    { icon: <IconCopy size={14} />, label: 'Duplicate', action: handleDuplicate },
                    { icon: <IconSparkles size={14} />, label: 'AI Insight', action: handleInsight },
                    { icon: <IconInfoCircle size={14} />, label: 'Explainability', action: () => setMenuOpen(false) },
                    { icon: <IconTrash size={14} />, label: 'Delete', action: () => { setMenuOpen(false); setConfirmDelete(true); }, danger: true },
                  ].map((item) => (
                    <button key={item.label} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', color: item.danger ? 'var(--color-danger)' : 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)' }}>
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="widget-content">
          {isProcessing && <WidgetProgress status={widget.status} />}
          {widget.status === 'FAILED' && <div style={{ color: 'var(--color-danger)', padding: 'var(--space-4)' }}>Widget failed to generate. <button className="button button--secondary button--sm" style={{ marginLeft: 'var(--space-2)' }}>Retry</button></div>}
          {widget.status === 'COMPLETED' && (
            widget.type === 'KPI'
              ? <KpiContent data={widget.data} />
              : <ChartContent type={widget.type} data={widget.data} />
          )}
        </div>
      </div>

      {/* Expand Modal */}
      <Modal open={expandOpen} onClose={() => setExpandOpen(false)} title={widget.name} size="lg">
        {widget.status === 'COMPLETED' && (widget.type === 'KPI' ? <KpiContent data={widget.data} /> : <ChartContent type={widget.type} data={widget.data} />)}
      </Modal>

      {/* AI Insight Modal */}
      <Modal open={insightOpen} onClose={() => setInsightOpen(false)} title="AI Insight" size="md">
        <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--color-text-primary)' }}>{insightText || <span className="spinner" />}</p>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog open={confirmDelete} title="Delete Widget" message={`Delete "${widget.name}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} danger />
    </>
  );
}
