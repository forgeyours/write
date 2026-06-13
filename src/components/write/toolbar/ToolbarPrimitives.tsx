// ============================================================
// FILE: src/components/write/toolbar/ToolbarPrimitives.tsx
// PURPOSE: Shared atomic style primitives for editor toolbars
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React from 'react';

export function Sep() {
  return (
    <div style={{
      width: 1,
      height: 18,
      backgroundColor: 'var(--bg-tertiary)',
      margin: '0 3px',
      flexShrink: 0,
    }} />
  );
}

interface TBtnProps {
  icon?: React.ComponentType<{ size: number; color?: string }> | null;
  title: string;
  onActivate: () => void;
  active?: boolean;
  danger?: boolean;
  label?: string;
  small?: boolean;
  style?: React.CSSProperties;
}

export function TBtn({ icon: Icon, title, onActivate, active, danger, label, small, style }: TBtnProps) {
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: small ? 24 : 28,
    padding: label ? '0 8px' : '0 6px',
    minWidth: label ? 'auto' : (small ? 24 : 28),
    border: 'none',
    borderRadius: 5,
    flexShrink: 0,
    background: active ? 'var(--bg-tertiary)' : 'transparent',
    color: danger ? '#C62828' : active ? 'var(--text-primary)' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 500,
    transition: 'background 0.12s, color 0.12s',
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <button
      data-tooltip={title}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onActivate();
      }}
      style={base}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-secondary)';
        e.currentTarget.style.color = danger ? '#C62828' : 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? 'var(--bg-tertiary)' : 'transparent';
        e.currentTarget.style.color = danger ? '#C62828' : active ? 'var(--text-primary)' : 'var(--text-secondary)';
      }}
    >
      {Icon && <Icon size={small ? 12 : 14} />}
      {label && <span>{label}</span>}
    </button>
  );
}

interface TSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: { label: string; value: string | number }[] | string[] | number[];
  width?: number;
  title?: string;
  style?: React.CSSProperties;
}

export function TSelect({ value, onChange, options, width = 90, title, style }: TSelectProps) {
  return (
    <div data-tooltip={title} style={{ display: 'inline-block', flexShrink: 0 }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          height: 26,
          width,
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 5,
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontSize: '0.78rem',
          padding: '0 4px',
          cursor: 'pointer',
          outline: 'none',
          ...style,
        }}
      >
        {options.map((o) => {
          const val = typeof o === 'object' && o !== null ? o.value : o;
          const lbl = typeof o === 'object' && o !== null ? o.label : o;
          return (
            <option key={String(val)} value={String(val)}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 36,
  border: '1px solid var(--bg-tertiary)',
  borderRadius: 7,
  padding: '0 10px',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
  background: 'var(--bg-secondary)',
  outline: 'none',
  boxSizing: 'border-box',
};

export const btnPrimary: React.CSSProperties = {
  padding: '7px 18px',
  background: '#E85D00',
  color: '#fff',
  border: 'none',
  borderRadius: 7,
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

export const btnSecondary: React.CSSProperties = {
  padding: '7px 16px',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--bg-tertiary)',
  borderRadius: 7,
  fontWeight: 500,
  fontSize: '0.85rem',
  cursor: 'pointer',
};
