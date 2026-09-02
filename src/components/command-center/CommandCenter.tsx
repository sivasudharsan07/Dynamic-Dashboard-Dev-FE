'use client';
import React, { useState, useRef } from 'react';
import { useDashboardStore } from '@/stores';
import { chatApi } from '@/api';
import type { CommandCenterState, AnalysisMode } from '@/types';
import { IconSend, IconPlayerStop, IconChevronDown } from '@tabler/icons-react';

type Props = {
  datasetIds?: string[];
  threadId?: string;
  mode: AnalysisMode;
  onModeChange: (m: AnalysisMode) => void;
};

export function CommandCenter({ datasetIds = [], threadId, mode, onModeChange }: Props) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<CommandCenterState>('IDLE');
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!query.trim() || state === 'RUNNING') return;
    setState('RUNNING');
    const msg = query.trim();
    setQuery('');
    try {
      await chatApi.sendMessage(threadId ?? 'default', msg, datasetIds);
      setState('COMPLETED');
    } catch {
      setState('FAILED');
    }
    setTimeout(() => setState('IDLE'), 1500);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setState('IDLE');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="command-center" data-state={state === 'RUNNING' ? 'processing' : 'idle'}>
      <textarea
        ref={textareaRef}
        className="command-center__input"
        placeholder="Ask a question, describe a chart, or use /commands and @files…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={state === 'RUNNING'}
        aria-label="AI command input"
        id="ai-command-input"
      />
      <div className="command-center__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--color-border)' }}>
            {(['auto', 'manual'] as AnalysisMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                style={{
                  padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: mode === m ? 'var(--color-brand-600)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer', transition: 'background 140ms',
                  textTransform: 'capitalize',
                }}
              >{m}</button>
            ))}
          </div>
          {state === 'RUNNING' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-brand-500)', fontSize: 'var(--font-size-sm)' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--color-brand-500)' }} />
              Processing…
            </div>
          )}
          {state === 'COMPLETED' && <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>✓ Done</span>}
          {state === 'FAILED' && <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>Request failed</span>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {state === 'RUNNING' ? (
            <button className="button button--danger button--sm" onClick={handleStop} id="cmd-stop-btn">
              <IconPlayerStop size={14} /> Stop
            </button>
          ) : (
            <button className="button button--primary button--sm" onClick={handleSend} disabled={!query.trim()} id="cmd-send-btn">
              <IconSend size={14} /> Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
