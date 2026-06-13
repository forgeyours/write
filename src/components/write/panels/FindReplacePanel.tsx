// ============================================================
// FILE: src/components/write/panels/FindReplacePanel.tsx
// PURPOSE: Sticky find and replace utility panel
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useCallback } from 'react';
import { inputStyle, btnSecondary } from '../toolbar/ToolbarPrimitives';

interface FindReplacePanelProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export default function FindReplacePanel({ editorRef, onClose }: FindReplacePanelProps) {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  function removeHighlights() {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll('mark[data-fr]').forEach(el => {
      const textNode = document.createTextNode(el.textContent || '');
      el.replaceWith(textNode);
    });
    editorRef.current.normalize();
  }

  const highlightMatches = useCallback((term: string) => {
    if (!editorRef.current) return 0;
    removeHighlights();
    if (!term.trim()) {
      setMatchCount(0);
      return 0;
    }

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const count = (editorRef.current.innerHTML.match(regex) || []).length;

    editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
      regex,
      '<mark data-fr style="background:#FFF59D;color:inherit;border-radius:2px;">$1</mark>'
    );
    setMatchCount(count);
    return count;
  }, [editorRef]);

  function handleFindChange(val: string) {
    setFind(val);
    highlightMatches(val);
  }

  function handleReplaceOne() {
    if (!find.trim() || !editorRef.current) return;
    const first = editorRef.current.querySelector('mark[data-fr]');
    if (first) {
      first.replaceWith(document.createTextNode(replace));
      editorRef.current.normalize();
      highlightMatches(find);
    }
  }

  function handleReplaceAll() {
    if (!find.trim() || !editorRef.current) return;
    removeHighlights();
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    editorRef.current.innerHTML = editorRef.current.innerHTML.replace(
      new RegExp(escaped, 'gi'),
      replace
    );
    setMatchCount(0);
  }

  function handleClose() {
    removeHighlights();
    onClose();
  }

  return (
    <div style={{
      position: 'fixed',
      top: 60, 
      right: 16,
      zIndex: 500,
      background: 'var(--bg-primary)',
      border: '1px solid var(--bg-tertiary)',
      borderRadius: 10,
      padding: '14px 16px',
      width: 300,
      boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        marginBottom: 12,
      }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
          Find & Replace
        </span>
        <button 
          title="Close Find & Replace panel"
          onClick={handleClose} 
          style={{
            border: 'none', 
            background: 'none',
            cursor: 'pointer', 
            color: 'var(--text-muted)',
            fontSize: '1rem', 
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Find */}
      <div style={{ marginBottom: 8 }}>
        <input
          autoFocus
          placeholder="Find text..."
          value={find}
          onChange={e => handleFindChange(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
        {find && (
          <div style={{
            fontSize: '0.72rem', 
            color: 'var(--text-muted)',
            marginTop: 4, 
            textAlign: 'right',
          }}>
            {matchCount} match{matchCount !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* Replace */}
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Replace with..."
          value={replace}
          onChange={e => setReplace(e.target.value)}
          style={{ ...inputStyle, marginBottom: 0 }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          title="Replace current highlighted word match"
          onClick={handleReplaceOne}
          style={{ ...btnSecondary, flex: 1, fontSize: '0.78rem' }}
        >
          Replace
        </button>
        <button
          title="Replace all document occurrences of this word"
          onClick={handleReplaceAll}
          style={{ ...btnSecondary, flex: 1, fontSize: '0.78rem' }}
        >
          Replace All
        </button>
      </div>
    </div>
  );
}
