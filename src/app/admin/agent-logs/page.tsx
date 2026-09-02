'use client';
import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAdminGuard } from '@/hooks/useRouteGuard';
import { agentLogsApi } from '@/api';
import { useAgentLogsStore } from '@/stores';
import type { AgentLogEntry } from '@/types';
import { LoadingState, EmptyState, ErrorState } from '@/components/common';
import { IconRefresh } from '@tabler/icons-react';

function stepColor(step: string) {
  if (step === 'COMPLETED') return 'var(--color-success)';
  if (step === 'FAILED') return 'var(--color-danger)';
  if (step === 'THINKING') return 'var(--color-info)';
  if (step === 'ANALYZING') return 'var(--color-warning)';
  if (step === 'RENDERING') return 'var(--color-brand-500)';
  return 'var(--color-text-secondary)';
}

export default function AgentLogsPage() {
  useAdminGuard();
  const { logs, addLog, clearLogs } = useAgentLogsStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await agentLogsApi.list() as AgentLogEntry[];
      clearLogs();
      data.forEach((e) => addLog(e));
    } catch { setError('Failed to load agent logs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Agent Logs</h1>
        <button className="button button--secondary button--sm" onClick={load}><IconRefresh size={14} /> Refresh</button>
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && logs.length === 0 && <EmptyState message="No agent logs yet. Logs stream here as widgets are generated." icon="📋" />}
      {!loading && !error && logs.length > 0 && (
        <div className="agent-log">
          {[...logs].reverse().map((entry) => (
            <div key={entry.id} className="agent-log__entry">
              <span style={{ color: 'var(--color-text-tertiary)' }}>{entry.timestamp}</span>
              <span style={{ fontWeight: 'var(--font-weight-semibold)', color: stepColor(entry.step) }}>{entry.step}</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
