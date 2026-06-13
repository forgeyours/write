// ============================================================
// FILE: src/components/write/toolbar/ToolbarRow1.tsx
// PURPOSE: Top toolbar row - Document and main menu actions
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React from 'react';
import { Download, Search, Layout, Code2 } from 'lucide-react';
import { Sep, TBtn } from './ToolbarPrimitives';

interface ToolbarRow1Props {
  onNew: () => void;
  onOpen: () => void;
  onSaveLocal: () => void;
  onSaveDrive: () => void;
  onExport: () => void;
  onToggleFindReplace: () => void;
  findReplaceOpen: boolean;
  onWordCount: () => void;
  wordCount: number;
  onOpenTemplates: () => void;
  zoom: number;
  setZoom: (v: number) => void;
  autoFit: boolean;
  setAutoFit: (v: boolean) => void;
  scale: number;
  onOpenIntegration?: () => void;
  hideTemplates?: boolean;
}

export default function ToolbarRow1({
  onNew,
  onOpen,
  onSaveLocal,
  onSaveDrive,
  onExport,
  onToggleFindReplace,
  findReplaceOpen,
  onWordCount,
  wordCount,
  onOpenTemplates,
  zoom,
  setZoom,
  autoFit,
  setAutoFit,
  scale,
  onOpenIntegration,
  hideTemplates = false,
}: ToolbarRow1Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
      padding: '6px 16px',
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--bg-tertiary)',
    }}>
      <TBtn label="New"    title="New document"          onActivate={onNew}       icon={null} style={{ height: '25px', width: '40.46875px' }} />
      <TBtn label="Open"   title="Open saved document"   onActivate={onOpen}      icon={null} style={{ height: '25px', width: '40.46875px' }} />
      <TBtn label="Save"   title="Save locally (Ctrl+S)" onActivate={onSaveLocal} icon={null} style={{ width: '40.46875px', height: '25px' }} />
      <TBtn label="Drive"  title="Save to Google Drive"  onActivate={onSaveDrive} icon={null} style={{ height: '25px', width: '40.46875px' }} />

      {/* Templates trigger button */}
      {!hideTemplates && (
        <>
          <button
            data-tooltip="Browse document template catalog"
            onMouseDown={(e) => {
              e.preventDefault();
              onOpenTemplates();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              height: 26,
              padding: '0 10px',
              border: '1px solid var(--bg-tertiary)',
              borderRadius: 5,
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 500,
              flexShrink: 0,
              transition: 'all 0.12s',
              marginLeft: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E85D00';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#E85D00';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--bg-tertiary)';
            }}
          >
            <Layout size={13} />
            Templates
          </button>
          <Sep />
        </>
      )}

      <button
        data-tooltip="Export document (Ctrl+E)"
        onMouseDown={(e) => {
          e.preventDefault();
          onExport();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          height: 26,
          padding: '0 10px',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 5,
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
          cursor: 'pointer',
          fontWeight: 500,
          flexShrink: 0,
          transition: 'all 0.12s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#E85D00';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = '#E85D00';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--bg-tertiary)';
        }}
      >
        <Download size={13} />
        Export
      </button>

      <Sep />

      {/* Embed & API generator trigger */}
      <button
        data-tooltip="Iframe Embed & API Integrations for platforms"
        onMouseDown={(e) => {
          e.preventDefault();
          onOpenIntegration?.();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          height: 26,
          padding: '0 10px',
          border: '1px solid #E85D00',
          borderRadius: 5,
          background: 'rgba(232, 93, 0, 0.08)',
          color: '#E85D00',
          fontSize: '0.78rem',
          cursor: 'pointer',
          fontWeight: 650,
          flexShrink: 0,
          transition: 'all 0.12s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#E85D00';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(232, 93, 0, 0.08)';
          e.currentTarget.style.color = '#E85D00';
        }}
      >
        <Code2 size={13} />
        Embed & API
      </button>

      <Sep />

      <TBtn
        icon={Search}
        title="Find & Replace (Ctrl+H)"
        onActivate={onToggleFindReplace}
        active={findReplaceOpen}
      />

      {/* Integrated A4 Viewport Zooming controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 8px',
        height: 26,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--bg-tertiary)',
        borderRadius: 5,
        fontSize: '0.74rem',
        color: 'var(--text-secondary)',
        userSelect: 'none',
        marginLeft: 'auto',
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>A4 Viewport:</span>
        <button
          title="Zoom out"
          onClick={(e) => {
            e.preventDefault();
            setAutoFit(false);
            setZoom(Math.max(50, zoom - 10));
          }}
          disabled={autoFit}
          style={{
            border: '1px solid var(--bg-tertiary)',
            background: 'var(--bg-primary)',
            color: autoFit ? 'var(--text-muted)' : 'var(--text-primary)',
            borderRadius: 3,
            width: 18,
            height: 18,
            cursor: autoFit ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
        >
          -
        </button>
        <span style={{ fontSize: '0.74rem', fontWeight: 600, minWidth: 50, textAlign: 'center', color: 'var(--text-primary)' }}>
          {autoFit ? `${Math.round(scale * 100)}% (Fit)` : `${zoom}%`}
        </span>
        <button
          title="Zoom in"
          onClick={(e) => {
            e.preventDefault();
            setAutoFit(false);
            setZoom(Math.min(150, zoom + 10));
          }}
          disabled={autoFit}
          style={{
            border: '1px solid var(--bg-tertiary)',
            background: 'var(--bg-primary)',
            color: autoFit ? 'var(--text-muted)' : 'var(--text-primary)',
            borderRadius: 3,
            width: 18,
            height: 18,
            cursor: autoFit ? 'not-allowed' : 'pointer',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
          }}
        >
          +
        </button>

        <div style={{ width: 1, height: 12, background: 'var(--bg-tertiary)' }} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={autoFit}
            onChange={(e) => setAutoFit(e.target.checked)}
            style={{ accentColor: '#E85D00', cursor: 'pointer', width: 12, height: 12, margin: 0 }}
          />
          Auto-Fit
        </label>
      </div>

      <button
        data-tooltip="Document statistics"
        onMouseDown={(e) => {
          e.preventDefault();
          onWordCount();
        }}
        style={{
          height: 26,
          padding: '0 8px',
          border: 'none',
          borderRadius: 5,
          background: 'transparent',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        {wordCount} words
      </button>
    </div>
  );
}
