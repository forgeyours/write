// ============================================================
// FILE: src/components/write/toolbar/TablePicker.tsx
// PURPOSE: Hover matrix selector for active table dimension picks
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useEffect, useRef } from 'react';

interface TablePickerProps {
  onPick: (rows: number, cols: number) => void;
  onClose: () => void;
}

export default function TablePicker({ onPick, onClose }: TablePickerProps) {
  const MAX = 8;
  const [hover, setHover] = useState({ r: 0, c: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 400,
        background: 'var(--bg-primary)',
        border: '1px solid var(--bg-tertiary)',
        borderRadius: 8,
        padding: '10px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
        marginTop: 4,
      }}
    >
      <div style={{
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        marginBottom: 8,
        textAlign: 'center',
        minHeight: 14,
      }}>
        {hover.r > 0 && hover.c > 0
          ? `${hover.r} × ${hover.c} table`
          : 'Drag to select size'}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${MAX}, 20px)`,
        gap: 2,
      }}>
        {Array.from({ length: MAX * MAX }).map((_, idx) => {
          const r = Math.floor(idx / MAX) + 1;
          const c = (idx % MAX) + 1;
          const active = r <= hover.r && c <= hover.c;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHover({ r, c })}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(r, c);
                onClose();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                onPick(r, c);
                onClose();
              }}
              style={{
                width: 18,
                height: 18,
                borderRadius: 2,
                background: active ? '#E85D0040' : 'var(--bg-tertiary)',
                border: `1.5px solid ${active ? '#E85D00' : 'var(--bg-tertiary)'}`,
                cursor: 'pointer',
                transition: 'background 0.07s, border-color 0.07s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
