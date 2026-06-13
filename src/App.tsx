// ============================================================
// FILE: src/App.tsx
// PURPOSE: Primary application container for Write — ForgeYours Document Editor
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Cloud, CloudOff, FileText, Info } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import AIPanel from './components/AIPanel';
import SupportButton from './components/SupportButton';
import DocumentEditor from './components/DocumentEditor';
import FileManager from './components/FileManager';
import { saveFile, generateFileId } from './lib/localStore';
import { saveToDrive, getSavedDriveToken } from './lib/driveConnector';

export default function App() {
  const [docId, setDocId] = useState<string | null>(null);
  const [docName, setDocName] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [saved, setSaved] = useState(true);

  // Embed & iframe configuration state (from URL query string)
  const isEmbedMode = new URLSearchParams(window.location.search).get('embed') === 'true';
  const embedTheme = new URLSearchParams(window.location.search).get('theme');
  const embedHideToolbar = new URLSearchParams(window.location.search).get('hideToolbar') === 'true';
  const embedHideTemplates = new URLSearchParams(window.location.search).get('hideTemplates') === 'true';
  const embedHideAi = new URLSearchParams(window.location.search).get('hideAi') === 'true';
  const [embedReadonly, setEmbedReadonly] = useState(() => new URLSearchParams(window.location.search).get('readonly') === 'true');
  const embedPlaceholder = new URLSearchParams(window.location.search).get('placeholder') || 'Start writing...';
  const embedBranding = new URLSearchParams(window.location.search).get('branding') === 'custom';
  const embedBrandingTitle = new URLSearchParams(window.location.search).get('brandingTitle') || 'My Custom Platform Editor';

  // Toggle header display based on embed & billing states
  const showHeader = !isEmbedMode || embedBranding;
  const showStatus = !isEmbedMode;

  // UI state
  const [aiOpen, setAiOpen] = useState(false);
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [hasDriveToken, setHasDriveToken] = useState(false);

  // Auto-save timer ref
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize themes and window postMessage communication channels
  useEffect(() => {
    // 1. Listen for parent communications
    const handleEmbedMessage = (e: MessageEvent) => {
      const data = e.data;
      if (data && data.source === 'forgeyours-parent') {
        if (data.type === 'forgeyours-load-content' && typeof data.html === 'string') {
          setContent(data.html);
          setSaved(true);
          try {
            // Echo back acknowledgment
            window.parent.postMessage({
              source: 'forgeyours-editor',
              type: 'forgeyours-load-ack',
              status: 'success'
            }, '*');
          } catch (err) {}
        } else if (data.type === 'forgeyours-set-title' && typeof data.title === 'string') {
          setDocName(data.title);
          setSaved(true);
        } else if (data.type === 'forgeyours-set-readonly' && typeof data.readonly === 'boolean') {
          setEmbedReadonly(data.readonly);
        }
      }
    };
    window.addEventListener('message', handleEmbedMessage);

    // 2. Broadcast 'ready' status to signify initialization in container
    try {
      window.parent.postMessage({
        source: 'forgeyours-editor',
        type: 'forgeyours-ready',
        supportedEvents: [
          'forgeyours-load-content',
          'forgeyours-set-title',
          'forgeyours-set-readonly'
        ]
      }, '*');
    } catch (err) {}

    // 3. Handle theme customization parameters
    if (embedTheme === 'dark') {
      document.documentElement.style.setProperty('--bg-primary', '#1A1D23');
      document.documentElement.style.setProperty('--bg-secondary', '#11141A');
      document.documentElement.style.setProperty('--bg-tertiary', '#2D3139');
      document.documentElement.style.setProperty('--text-primary', '#E5E9F0');
      document.documentElement.style.setProperty('--text-secondary', '#8A95A5');
      document.documentElement.style.setProperty('--text-muted', '#5E6773');
      document.body.style.backgroundColor = '#1A1D23';
    } else if (embedTheme === 'ivory') {
      document.documentElement.style.setProperty('--bg-primary', '#FAF6EE');
      document.documentElement.style.setProperty('--bg-secondary', '#F4EDE0');
      document.documentElement.style.setProperty('--bg-tertiary', '#EBE1CE');
      document.documentElement.style.setProperty('--text-primary', '#2C2519');
      document.documentElement.style.setProperty('--text-secondary', '#6C5E47');
      document.documentElement.style.setProperty('--text-muted', '#A6977D');
      document.body.style.backgroundColor = '#FAF6EE';
    }

    return () => {
      window.removeEventListener('message', handleEmbedMessage);
    };
  }, [embedTheme]);

  // Check Drive tokens on mount
  useEffect(() => {
    const token = getSavedDriveToken();
    setHasDriveToken(!!token);
  }, [fileManagerOpen]);

  // Handle standard auto-save every 30 seconds if modifications are unsaved
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    if (!saved && docId) {
      autoSaveRef.current = setTimeout(() => {
        handleLocalSave(true);
      }, 30000);
    }
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [saved, content, docId]);

  function handleContentChange(newContent: string) {
    setContent(newContent);
    setSaved(false);

    // Broadcast content change outward for parent iframe listeners
    try {
      window.parent.postMessage({
        source: 'forgeyours-editor',
        type: 'forgeyours-document-change',
        html: newContent,
        textLength: newContent.replace(/<[^>]+>/g, '').length,
        docName: docName
      }, '*');
    } catch (err) {
      console.warn('postMessage transfer failed', err);
    }
  }

  function handleNew() {
    if (!saved) {
      let ok = true;
      try {
        ok = window.confirm('You have unsaved changes. Start a new document anyway?');
      } catch (e) {
        console.warn('window.confirm blocked or unavailable, proceeding with action', e);
      }
      if (!ok) return;
    }
    const newId = generateFileId('write');
    setDocId(newId);
    setDocName('Untitled Document');
    setContent('<h1>Untitled Document</h1><p>Start writing something amazing...</p>');
    setDriveFileId(null);
    setSaved(true);
    toast.success('Created new canvas');
  }

  // Set default content on initial empty load
  useEffect(() => {
    if (!docId) {
      const initId = generateFileId('write');
      setDocId(initId);
      if (isEmbedMode) {
        // Starts with clean canvas for clean parent loading
        setContent('');
        setSaved(true);
      } else {
        setContent('<h1>My ForgeYours Document</h1><p>This is your local writing workspace. All changes are saved on your own browser session or synchronized directly to your Google Drive folder. Bring your own keys for full private AI writing completions!</p>');
        setSaved(true);
      }
    }
  }, []);

  async function handleLocalSave(isAuto = false) {
    try {
      const id = docId ?? generateFileId('write');
      if (!docId) setDocId(id);

      await saveFile({
        id,
        tool: 'write',
        name: docName,
        content,
      });

      setSaved(true);
      if (!isAuto) {
        toast.success('Document saved locally');
      }
    } catch (e) {
      toast.error('Local IndexedDB storage failure');
    }
  }

  async function handleDriveSave() {
    const token = getSavedDriveToken();
    if (!token) {
      toast.error('Connect your Google Drive token in the file manager tab first!');
      setFileManagerOpen(true);
      return;
    }

    const toastId = toast.loading('Synchronizing with Google Drive...');
    try {
      const newDriveId = await saveToDrive({
        name: `${docName}.html`,
        content,
        mimeType: 'text/html',
        driveFileId,
      });
      setDriveFileId(newDriveId);
      setSaved(true);
      toast.success('Saved to Drive parent /ForgeYours/', { id: toastId });
    } catch (e: any) {
      toast.error(e.message || 'Google Drive synchronization error', { id: toastId });
    }
  }

  function handleRename() {
    const newName = window.prompt('Document title:', docName);
    if (newName?.trim()) {
      setDocName(newName.trim());
      setSaved(false);
    }
  }

  function handleOpenFile(file: { id: string; name: string; content: string }) {
    setDocId(file.id);
    setDocName(file.name);
    setContent(file.content);
    setSaved(true);
    setFileManagerOpen(false);
    toast.success(`Loaded "${file.name}"`);
  }

  return (
    <>
      {/* GLOBAL TOASTER */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            background: 'var(--text-primary)',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />

      {/* FIXED FILE HEADER BRANDBAR */}
      {showHeader && (
        <div className="toolbar" style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
          {embedBranding ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
              <FileText size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {embedBrandingTitle}
              </span>
            </div>
          ) : (
            <a href="https://forgeyours.space" target="_blank" rel="noopener noreferrer" data-tooltip="Go to ForgeYours home" className="toolbar-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <svg viewBox="0 0 512 512" style={{ width: 24, height: 24, borderRadius: 5, flexShrink: 0 }}>
                <rect x="0" y="0" width="512" height="512" rx="120" fill="#E85D00" />
                <g transform="translate(108, 108)">
                  <path d="M256.7 31.3 C244.2 18.8 223.8 18.8 211.3 31.3 L42.3 200.3 C40.3 202.3 38.9 204.8 38.2 207.6 L18.6 286.2 C17.0 292.5 18.8 299.1 23.4 303.7 C27.9 308.2 34.6 310.1 40.9 308.4 L119.5 288.9 C122.3 288.2 124.8 286.8 126.8 284.8 L295.8 115.8 C308.3 103.3 308.3 82.9 295.8 70.4 Z" fill="none" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M190 52.6 L234.4 97" fill="none" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" />
                  <path d="M38.2 207.6 L81.5 250.9" fill="none" stroke="#FFFFFF" strokeWidth="20" strokeLinecap="round" />
                </g>
              </svg>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>ForgeYours <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Write</span></span>
            </a>
          )}

          <div className="toolbar-divider" />

          {/* Rename trigger input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: 6,
            border: '1px solid var(--bg-tertiary)',
            width: '198px',
            height: '26.96875px',
          }} data-tooltip="Click to edit document title">
            <FileText size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <input
              type="text"
              value={docName}
              data-tooltip="Document Title - click/edit to rename"
              onChange={(e) => {
                setDocName(e.target.value);
                setSaved(false);
              }}
              onBlur={() => {
                if (!docName.trim()) {
                  setDocName('Untitled Document');
                }
                handleLocalSave(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Document Name"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                width: '100%',
                padding: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            />
            {!saved && (
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#E85D00',
                flexShrink: 0,
              }} />
            )}
          </div>

          <div className="toolbar-spacer" />

          {/* Voluntary backings - Hide in embed mode */}
          {!isEmbedMode && (
            <>
              <SupportButton />
              <div className="toolbar-divider" />
            </>
          )}

          {/* AI copilot toggler */}
          {!embedHideAi && (
            <>
              <button
                className={`toolbar-btn ${aiOpen ? 'toolbar-btn--active' : ''}`}
                onClick={() => setAiOpen(!aiOpen)}
                data-tooltip="AI Assistant Sidepanel"
                style={{ height: '26px', width: '96.890625px' }}
              >
                <Sparkles size={15} />
                <span style={{ fontWeight: 500 }}>AI Copilot</span>
              </button>
              <div className="toolbar-divider" />
            </>
          )}

          {/* Google drive syncing indicator - Hide in embed mode */}
          {!isEmbedMode && (
            <button
              className="toolbar-btn"
              onClick={() => setFileManagerOpen(true)}
              data-tooltip={hasDriveToken ? 'Google Drive Synced' : 'Google Drive Disconnected'}
              style={{ height: '24px', width: '102px' }}
            >
              {hasDriveToken ? (
                <>
                  <Cloud size={15} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>Synced</span>
                </>
              ) : (
                <>
                  <CloudOff size={15} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Local Only</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* MAIN DOCUMENT ORCHESTRATOR */}
      <div style={{
        marginTop: showHeader ? 52 : 0, // height of toolbar brandbar
        marginRight: (!embedHideAi && aiOpen) ? 300 : 0,
        transition: 'margin-right 0.2s ease',
        minHeight: showStatus ? 'calc(100vh - 84px)' : '100vh', // Account for top toolbar and bottom status bar
      }}>
        <DocumentEditor
          content={content}
          onChange={handleContentChange}
          documentTitle={docName}
          onNew={handleNew}
          onOpen={() => setFileManagerOpen(true)}
          onSaveLocal={() => handleLocalSave(false)}
          onSaveDrive={handleDriveSave}
          readonly={embedReadonly}
          placeholder={embedPlaceholder}
          hideToolbar={embedHideToolbar}
          hideTemplates={embedHideTemplates}
        />
      </div>

      {/* AI PANELS SIDEBAR */}
      {!embedHideAi && (
        <AIPanel
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          toolContext="This is Write, a premium open-source client-side document editor of ForgeYours platform. The user wants to adjust formatting quality, paragraphs, vocabulary, structure, and text drafts elegantly on their canvas."
        />
      )}

      {/* OFFLINE INDEXEDDB LIST AND DRIVE SYNC OVERLAY */}
      {fileManagerOpen && (
        <FileManager
          onClose={() => setFileManagerOpen(false)}
          onOpen={handleOpenFile}
        />
      )}

      {/* STATUS BRANDBAR */}
      {showStatus && (
        <div className="status-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>{saved ? '✓ Document saved on device' : '● Unsaved changes on canvas'}</span>
            {driveFileId && (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 4, height: 4, background: 'var(--success)', borderRadius: '50%' }} />
                Drive backup active
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Info size={11} />
              Pure Client-Side Private PWA Workspace
            </span>
            <span style={{ color: 'var(--text-muted)' }}>ForgeYours Write v2.0</span>
          </div>
        </div>
      )}
    </>
  );
}
