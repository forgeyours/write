// ============================================================
// FILE: src/components/write/toolbar/ColourPicker.tsx
// PURPOSE: Colour picker popover for foreground text & highlight background colors
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useEffect, useRef } from 'react';

const COLOUR_PALETTE = [
  '#000000','#1A1D23','#374151','#6B7280','#9CA3AF','#D1D5DB','#F3F4F6','#FFFFFF',
  '#7F1D1D','#C62828','#EF4444','#F97316','#F59E0B','#EAB308','#84CC16','#22C55E',
  '#10B981','#14B8A6','#06B6D4','#3B82F6','#6366F1','#8B5CF6','#A855F7','#EC4899',
  '#1E3A5F','#1E40AF','#1D4ED8','#0369A1','#065F46','#14532D','#713F12','#4C1D95',
];

const HIGHLIGHT_PALETTE = [
  '#FFFF00','#ADFF2F','#00FFFF','#FF69B4','#FFA500','#87CEEB',
  '#E6E6FA','#FFB6C1','#90EE90','#FFDEAD','#F0E68C','#DDA0DD',
  'transparent',
];

interface PickerProps {
  onPick: (color: string) => void;
  onClose: () => void;
}

export function TextColourPicker({ onPick, onClose }: PickerProps) {
  return (
    <ColourPopover
      label="Text colour"
      palette={COLOUR_PALETTE}
      onPick={onPick}
      onClose={onClose}
    />
  );
}

export function HighlightPicker({ onPick, onClose }: PickerProps) {
  return (
    <ColourPopover
      label="Highlight colour"
      palette={HIGHLIGHT_PALETTE}
      onPick={onPick}
      onClose={onClose}
    />
  );
}

interface PopoverProps {
  label: string;
  palette: string[];
  onPick: (color: string) => void;
  onClose: () => void;
}

function ColourPopover({ label, palette, onPick, onClose }: PopoverProps) {
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
        padding: '10px 12px',
        boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
        marginTop: 4,
        width: 212,
      }}
    >
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}>
        {label}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 3,
      }}>
        {palette.map((c, i) => (
          <button
            key={i}
            title={c === 'transparent' ? 'Remove colour' : c}
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(c);
              onClose();
            }}
            style={{
              width: 20,
              height: 20,
              borderRadius: 3,
              border: c === '#FFFFFF' ? '1px solid #D1D5DB'
                    : c === 'transparent' ? '1px dashed #9AA0AE'
                    : 'none',
              background: c === 'transparent' ? 'white' : c,
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {c === 'transparent' && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom right, transparent 43%, #C62828 43%, #C62828 57%, transparent 57%)',
                borderRadius: 2,
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
