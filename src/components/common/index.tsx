'use client';
import React from 'react';

// ---- Modal ----
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  const maxW = size === 'sm' ? '30rem' : size === 'lg' ? '72rem' : '60rem';
  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: maxW }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__header">
          <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>{title}</span>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

// ---- Status Badge ----
type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted';
export function StatusBadge({ label, variant }: { label: string; variant: StatusVariant }) {
  return <span className={`status status--${variant}`}>{label}</span>;
}

// ---- Empty State ----
export function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="empty-state">
      {icon && <div style={{ fontSize: '2rem', opacity: 0.5 }}>{icon}</div>}
      <p style={{ margin: 0, color: 'var(--color-text-tertiary)' }}>{message}</p>
    </div>
  );
}

// ---- Loading State ----
export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

// ---- Error State ----
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="empty-state">
      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
      <p style={{ margin: 0, color: 'var(--color-danger)' }}>{message}</p>
      {onRetry && <button className="button button--secondary button--sm" onClick={onRetry}>Retry</button>}
    </div>
  );
}

// ---- Confirm Dialog ----
type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
};
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button className="button button--secondary" onClick={onCancel}>Cancel</button>
          <button className={`button ${danger ? 'button--danger' : 'button--primary'}`} onClick={onConfirm}>Confirm</button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
    </Modal>
  );
}

// ---- Data Table ----
type DataTableProps<T> = {
  columns: { key: keyof T | string; label: string; render?: (row: T) => React.ReactNode }[];
  data: T[];
  keyField: keyof T;
};
export function DataTable<T>({ columns, data, keyField }: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={String(c.key)}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[keyField])}>
              {columns.map((c) => (
                <td key={String(c.key)}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[String(c.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Source Tag ----
export function SourceTag({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button className="source-tag" onClick={onClick} type="button">
      {label}
    </button>
  );
}

// ---- Source Tags Group ----
export function SourceTagsGroup({ tags, onTagClick }: { tags: string[]; onTagClick?: (tag: string) => void }) {
  return (
    <div className="source-tags">
      {tags.map((t) => <SourceTag key={t} label={t} onClick={() => onTagClick?.(t)} />)}
    </div>
  );
}
