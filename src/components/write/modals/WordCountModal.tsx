// ============================================================
// FILE: src/components/write/modals/WordCountModal.tsx
// PURPOSE: Modal for full stats (pages, words, characters, paragraph numbers)
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React from 'react';

interface WordCountModalProps {
  content: string;
  onClose: () => void;
}

export default function WordCountModal({ content, onClose }: WordCountModalProps) {
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(/\s+/).length : 0;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const charsWithSpace = text.length;
  const paragraphs = Math.max(1, (content.match(/<p[^>]*>/gi) || []).length);
  const pages = Math.max(1, Math.ceil(words / 250));
  const readingMins = Math.max(1, Math.ceil(words / 200));

  const stats = [
    { label: 'Estimated Pages',         value: pages },
    { label: 'Words Count',             value: words.toLocaleString() },
    { label: 'Characters (no space)',   value: charsNoSpace.toLocaleString() },
    { label: 'Characters (with space)',  value: charsWithSpace.toLocaleString() },
    { label: 'Paragraphs Count',        value: paragraphs },
    { label: 'Average Reading Time',    value: `~${readingMins} min` },
  ];

  return (
    <>
      <div 
        onClick={onClose} 
        style={{
          position: 'fixed', 
          inset: 0,
          background: 'rgba(26,29,35,0.35)', 
          zIndex: 900,
        }} 
      />
      
      <div style={{
        position: 'fixed', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 901,
        background: 'var(--bg-primary)',
        borderRadius: 12, 
        padding: '22px 26px',
        width: '100%', 
        maxWidth: 320,
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
      }}>
        <div style={{
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            Document statistics
          </div>
          <button 
            title="Close statistics modal"
            onClick={onClose} 
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

        {stats.map(s => (
          <div 
            key={s.label} 
            style={{
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '9px 0',
              borderBottom: '1px solid var(--bg-tertiary)',
              fontSize: '0.88rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}
