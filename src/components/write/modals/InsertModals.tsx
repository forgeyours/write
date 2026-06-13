// ============================================================
// FILE: src/components/write/modals/InsertModals.tsx
// PURPOSE: Modal popups for hyperlinking and inserting images (from URL/Device)
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { inputStyle, btnPrimary, btnSecondary } from '../toolbar/ToolbarPrimitives';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

function ModalShell({ title, onClose, children, maxWidth = 380 }: ModalShellProps) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,29,35,0.4)',
        zIndex: 900,
        backdropFilter: 'blur(1px)',
      }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 901,
        background: 'var(--bg-primary)',
        borderRadius: 12,
        padding: '22px 24px',
        width: '100%',
        maxWidth,
        boxShadow: '0 8px 36px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: '1rem',
          color: 'var(--text-primary)',
          marginBottom: 18,
        }}>
          {title}
        </div>
        {children}
      </div>
    </>
  );
}

interface LinkModalProps {
  isOpen: boolean;
  onInsert: (url: string, text: string) => void;
  onClose: () => void;
}

export function LinkModal({ isOpen, onInsert, onClose }: LinkModalProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleInsert() {
    if (!url.trim()) return;
    const href = url.startsWith('http') ? url : 'https://' + url;
    onInsert(href, text.trim() || href);
    onClose();
  }

  return (
    <ModalShell title="Insert Link" onClose={onClose}>
      <Field label="URL">
        <input
          autoFocus
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
          placeholder="https://example.com"
          style={inputStyle}
        />
      </Field>
      <Field label="Display text (optional)" mb={20}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
          placeholder="Link text"
          style={inputStyle}
        />
      </Field>
      <Row>
        <button title="Cancel link insertion" onClick={onClose} style={btnSecondary}>Cancel</button>
        <button title="Insert hyperlink into selection" onClick={handleInsert} style={btnPrimary}>Insert</button>
      </Row>
    </ModalShell>
  );
}

interface ImageModalProps {
  isOpen: boolean;
  onInsert: (src: string, alt: string) => void;
  onClose: () => void;
}

export function ImageModal({ isOpen, onInsert, onClose }: ImageModalProps) {
  const [tab, setTab] = useState<'url' | 'device'>('url');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setAlt('');
      setTab('url');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleUrl() {
    if (!url.trim()) return;
    onInsert(url.trim(), alt.trim() || 'inserted-image');
    onClose();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        onInsert(ev.target.result as string, file.name);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <ModalShell title="Insert Image" onClose={onClose}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        marginBottom: 16,
        border: '1px solid var(--bg-tertiary)',
        borderRadius: 7,
        overflow: 'hidden',
      }}>
        {(['url', 'device'] as const).map(t => (
          <button
            key={t}
            title={`Switch to image from ${t === 'url' ? 'URL' : 'Device'} tab`}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '7px 0',
              border: 'none',
              cursor: 'pointer',
              background: tab === t ? '#E85D00' : 'var(--bg-secondary)',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
              fontWeight: tab === t ? 600 : 400,
              fontSize: '0.82rem',
              transition: 'all 0.12s',
            }}
          >
            {t === 'url' ? 'From URL' : 'From Device'}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <>
          <Field label="Image URL">
            <input
              autoFocus
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={inputStyle}
            />
          </Field>
          <Field label="Alt text (optional)" mb={20}>
            <input
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="Describe the image"
              style={inputStyle}
            />
          </Field>
          <Row>
            <button title="Cancel image insertion" onClick={onClose} style={btnSecondary}>Cancel</button>
            <button title="Insert image from web URL into document" onClick={handleUrl} style={btnPrimary}>Insert</button>
          </Row>
        </>
      ) : (
        <>
          <div
            title="Select an image file from your device"
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--bg-tertiary)',
              borderRadius: 8,
              padding: '32px 20px',
              textAlign: 'center',
              marginBottom: 18,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}
          >
            Drag or Tap to Upload Image
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <Row>
            <button title="Cancel image insertion" onClick={onClose} style={btnSecondary}>Cancel</button>
          </Row>
        </>
      )}
    </ModalShell>
  );
}

// Micro help components
interface FieldProps {
  label: string;
  children: React.ReactNode;
  mb?: number;
}

function Field({ label, children, mb = 12 }: FieldProps) {
  return (
    <div style={{ marginBottom: mb }}>
      <div style={{
        fontSize: '0.79rem',
        color: 'var(--text-secondary)',
        marginBottom: 5,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      {children}
    </div>
  );
}
