// ============================================================
// FILE: src/components/write/editor/ImageEditPopover.tsx
// PURPOSE: Floating edit controls for images (Resize, Align, Replace, Delete)
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Check, RefreshCw, X } from 'lucide-react';

interface ImageEditPopoverProps {
  imgEl: HTMLImageElement;
  onUpdate: (width?: string, align?: 'left' | 'center' | 'right', src?: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ImageEditPopover({
  imgEl,
  onUpdate,
  onDelete,
  onClose,
}: ImageEditPopoverProps) {
  const [srcInput, setSrcInput] = useState(imgEl.src);
  const [showReplace, setShowReplace] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Position adjacent to the image elements
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'absolute',
    zIndex: 500,
    background: 'var(--bg-primary)',
    border: '1px solid var(--bg-tertiary)',
    borderRadius: 8,
    padding: '10px 12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: 270,
    fontFamily: 'Inter, sans-serif',
  });

  useEffect(() => {
    function positionPopover() {
      const rect = imgEl.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let top = rect.bottom + scrollTop + 8;
      let left = rect.left + scrollLeft + (rect.width / 2) - 135;

      // Ensure inside viewport bounds
      if (left < 16) left = 16;
      if (left + 280 > window.innerWidth) {
        left = window.innerWidth - 290;
      }

      setStyle((prev) => ({
        ...prev,
        top,
        left,
      }));
    }

    positionPopover();
    window.addEventListener('resize', positionPopover);
    window.addEventListener('scroll', positionPopover);

    return () => {
      window.removeEventListener('resize', positionPopover);
      window.removeEventListener('scroll', positionPopover);
    };
  }, [imgEl]);

  // Click outside close
  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        e.target !== imgEl
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [imgEl, onClose]);

  // Get current active state presets
  const currentWidthStyle = imgEl.style.width || '100%';

  return (
    <div ref={popoverRef} style={style}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--bg-tertiary)',
        paddingBottom: 6,
        marginBottom: 2,
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Image Options
        </span>
        <button
          title="Close image options"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Resize presets */}
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          Resize Width
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['25%', '50%', '75%', '100%'].map((w) => {
            const isActive = currentWidthStyle === w;
            return (
              <button
                key={w}
                title={`Set image size width to ${w}`}
                onClick={() => onUpdate(w)}
                style={{
                  flex: 1,
                  fontSize: '0.75rem',
                  padding: '4px 0',
                  borderRadius: 4,
                  border: `1px solid ${isActive ? '#E85D00' : 'var(--bg-tertiary)'}`,
                  background: isActive ? '#FFF3EB' : 'var(--bg-secondary)',
                  color: isActive ? '#E85D00' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {w}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alignments & Replace / Delete */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            title="Align Left"
            onClick={() => onUpdate(undefined, 'left')}
            style={{
              padding: '5px 7px',
              borderRadius: 4,
              border: '1px solid var(--bg-tertiary)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <AlignLeft size={13} />
          </button>
          <button
            title="Align Center"
            onClick={() => onUpdate(undefined, 'center')}
            style={{
              padding: '5px 7px',
              borderRadius: 4,
              border: '1px solid var(--bg-tertiary)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <AlignCenter size={13} />
          </button>
          <button
            title="Align Right"
            onClick={() => onUpdate(undefined, 'right')}
            style={{
              padding: '5px 7px',
              borderRadius: 4,
              border: '1px solid var(--bg-tertiary)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <AlignRight size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            title="Replace source URL"
            onClick={() => setShowReplace(!showReplace)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.74rem',
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid var(--bg-tertiary)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <RefreshCw size={11} />
            Replace
          </button>

          <button
            title="Delete Image"
            onClick={onDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.74rem',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: '#FEE2E2',
              color: '#C62828',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={11} />
            Delete
          </button>
        </div>
      </div>

      {/* Src replace input box */}
      {showReplace && (
        <div style={{
          borderTop: '1px solid var(--bg-tertiary)',
          paddingTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Replace Image URL
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="text"
              value={srcInput}
              onChange={(e) => setSrcInput(e.target.value)}
              placeholder="https://..."
              style={{
                flex: 1,
                fontSize: '0.75rem',
                padding: '4px 6px',
                borderRadius: 4,
                border: '1px solid var(--bg-tertiary)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              title="Confirm URL replacement"
              onClick={() => {
                if (srcInput.trim()) {
                  onUpdate(undefined, undefined, srcInput.trim());
                  setShowReplace(false);
                }
              }}
              style={{
                padding: '4px 8px',
                background: '#E85D00',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Check size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
