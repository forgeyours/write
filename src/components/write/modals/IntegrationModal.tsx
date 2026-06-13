// ============================================================
// FILE: src/components/write/modals/IntegrationModal.tsx
// PURPOSE: Interactive Developer Portal, Dynamic Embed IFrame builder, Content API and message router SDK
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useEffect } from 'react';
import { X, Code2, Copy, Check, Info, Sliders, ExternalLink, Terminal, Eye, Settings, HelpCircle } from 'lucide-react';

interface IntegrationModalProps {
  onClose: () => void;
  currentHtml: string;
}

export default function IntegrationModal({ onClose, currentHtml }: IntegrationModalProps) {
  // Config state
  const [theme, setTheme] = useState<'light' | 'dark' | 'ivory'>('light');
  const [hideToolbar, setHideToolbar] = useState<boolean>(false);
  const [hideTemplates, setHideTemplates] = useState<boolean>(false);
  const [hideAi, setHideAi] = useState<boolean>(false);
  const [readonly, setReadonly] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>('Write chapters and submit...');
  const [customBranding, setCustomBranding] = useState<boolean>(false);
  const [brandingTitle, setBrandingTitle] = useState<string>('My Custom Platform Editor');
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'customizer' | 'codes' | 'debugger'>('customizer');
  
  // Copy state feedbacks
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Incoming event mock trace list (captured from actual editor changes while modal is open)
  const [simulatedEvents, setSimulatedEvents] = useState<Array<{ time: string; type: string; details: string }>>([]);

  // Base URL of the app (derive from window.location)
  const baseAppUrl = window.location.origin + window.location.pathname;

  // Build the embed query parameter list
  const queryParams = new URLSearchParams();
  queryParams.set('embed', 'true');
  if (theme !== 'light') queryParams.set('theme', theme);
  if (hideToolbar) queryParams.set('hideToolbar', 'true');
  if (hideTemplates) queryParams.set('hideTemplates', 'true');
  if (hideAi) queryParams.set('hideAi', 'true');
  if (readonly) queryParams.set('readonly', 'true');
  if (placeholder) queryParams.set('placeholder', placeholder);
  if (customBranding) {
    queryParams.set('branding', 'custom');
    queryParams.set('brandingTitle', brandingTitle);
  }

  const embedUrl = `${baseAppUrl}?${queryParams.toString()}`;

  // Iframe code block
  const iframeCode = `<iframe
  id="forgeyours-editor"
  src="${embedUrl}"
  style="width: 100%; height: 750px; border: 1px solid #CBD2DA; border-radius: 8px; overflow: hidden;"
  allow="clipboard-write"
></iframe>`;

  // Listener code block
  const listenerCode = `<script>
  // 1. Listen to real-time events published by the ForgeYours editor
  window.addEventListener('message', (event) => {
    // Safety check (recommended): if (event.origin !== "${window.location.origin}") return;
    
    const packet = event.data;
    if (packet && packet.source === 'forgeyours-editor') {
      
      switch(packet.type) {
        case 'forgeyours-document-change':
          console.log("Document content changed!", packet.html);
          console.log("Plain character count:", packet.textLength);
          // TODO: Send this to your server to auto-save chapters/books!
          // fetch('/api/save-chapter', { method: 'POST', body: JSON.stringify({ body: packet.html }) });
          break;
          
        case 'forgeyours-ready':
          console.log("The embedded editor was successfully established & is ready!");
          break;
          
        default:
          break;
      }
    }
  });
</script>`;

  // Inject content code block
  const injectCode = `<script>
  // 2. Programmatically load previous chapters or templates into the editor
  function loadChapterData(htmlString) {
    const iframe = document.getElementById('forgeyours-editor');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        source: 'forgeyours-parent',
        type: 'forgeyours-load-content',
        html: htmlString
      }, '*');
    }
  }
</script>`;

  // Capture real content changes of parent window and show them in developer console
  useEffect(() => {
    // Seed debugger with welcoming log
    setSimulatedEvents([
      {
        time: new Date().toLocaleTimeString(),
        type: 'SDK_INITIALIZED',
        details: 'Listening to outgoing iframe messages in sandbox context',
      }
    ]);

    const handleMessagePack = (e: MessageEvent) => {
      const p = e.data;
      if (p && p.source === 'forgeyours-editor') {
        setSimulatedEvents(prev => [
          {
            time: new Date().toLocaleTimeString(),
            type: p.type,
            details: p.type === 'forgeyours-document-change' 
              ? `Length: ${p.textLength} chars | HTML characters: ${p.html.substring(0, 70)}...`
              : JSON.stringify(p),
          },
          ...prev.slice(0, 19)
        ]);
        
        // Also flash badge indicator if in another tab
        if (activeTab !== 'debugger') {
          // Minor alert
        }
      }
    };

    window.addEventListener('message', handleMessagePack);
    return () => window.removeEventListener('message', handleMessagePack);
  }, [activeTab]);

  const triggerCopy = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopyFeedback(key);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 1800);
  };

  return (
    <>
      {/* OVERLAY BACKDROP */}
      <div 
        onClick={onClose} 
        style={{
          position: 'fixed', 
          inset: 0,
          background: 'rgba(26,29,35,0.45)', 
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }} 
      />

      {/* CORE BUILDER PORTAL */}
      <div style={{
        position: 'fixed', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 1001,
        background: 'var(--bg-primary)',
        borderRadius: 12, 
        padding: 0,
        width: '95%', 
        maxWidth: 820,
        height: '90vh',
        maxHeight: 700,
        boxShadow: '0 20px 50px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--bg-tertiary)',
        fontFamily: 'Inter, sans-serif',
      }}>
        {/* BANNER HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #E85D00, #EF2D56)',
          padding: '18px 24px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={20} />
              <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>Developer Portal & API SDK</span>
              <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.24)', padding: '2px 8px', borderRadius: 10, fontWeight: 650 }}>IFRAME / PWA EMBED</span>
            </div>
            <p style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: 4, margin: 0 }}>
              Instantly generate widgets. Insert this beautiful word processor directly into your marketplace, CMS, or authors' hub.
            </p>
          </div>
          <button 
            title="Close developer portal"
            onClick={onClose} 
            style={{
              border: 'none', 
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              cursor: 'pointer', 
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={15} />
          </button>
        </div>

        {/* CONTROLLER SHELF NAVIGATION */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--bg-tertiary)',
          padding: '10px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button 
              onClick={() => setActiveTab('customizer')}
              style={{
                border: 'none',
                background: activeTab === 'customizer' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'customizer' ? '#E85D00' : 'var(--text-secondary)',
                fontWeight: activeTab === 'customizer' ? 600 : 500,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: 5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: activeTab === 'customizer' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Sliders size={13} />
              1. Customizer Settings
            </button>
            <button 
              onClick={() => setActiveTab('codes')}
              style={{
                border: 'none',
                background: activeTab === 'codes' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'codes' ? '#E85D00' : 'var(--text-secondary)',
                fontWeight: activeTab === 'codes' ? 600 : 500,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: 5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: activeTab === 'codes' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Code2 size={13} />
              2. Inject / Listener SDK Codes
            </button>
            <button 
              onClick={() => setActiveTab('debugger')}
              style={{
                border: 'none',
                background: activeTab === 'debugger' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'debugger' ? '#E85D00' : 'var(--text-secondary)',
                fontWeight: activeTab === 'debugger' ? 600 : 500,
                fontSize: '0.8rem',
                padding: '6px 14px',
                borderRadius: 5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: activeTab === 'debugger' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <Terminal size={13} />
              3. Live Event Monitor
              {simulatedEvents.length > 1 && (
                <span style={{
                  background: '#E85D00',
                  color: '#fff',
                  fontSize: '0.62rem',
                  borderRadius: 10,
                  padding: '1px 5px',
                  fontWeight: 700,
                }}>{simulatedEvents.length - 1}</span>
              )}
            </button>
          </div>

          <a 
            href={embedUrl}
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.74rem',
              color: '#E85D00',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            <Eye size={13} />
            Test Embed Standalone
            <ExternalLink size={11} />
          </a>
        </div>

        {/* WORKSTAGE VIEWPORT */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
          background: 'var(--bg-primary)',
        }}>
          {activeTab === 'customizer' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 280px', gap: 24 }}>
              
              {/* ACCORDION FORM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Sliders size={14} style={{ color: '#E85D00' }} />
                    Widget Customizations
                  </h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Choose what buttons, palettes, and interactions are exposed when developers inject Write inside their online application.
                  </p>
                </div>

                {/* THEME SELECTION */}
                <div style={{ padding: 14, border: '1px solid var(--bg-tertiary)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                    🎨 Widget Color Theme
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {(['light', 'dark', 'ivory'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        style={{
                          border: theme === t ? '2px solid #E85D00' : '1px solid var(--text-muted)',
                          background: t === 'dark' ? '#1A1D23' : t === 'ivory' ? '#FBF9F4' : '#FFF',
                          color: t === 'dark' ? '#FFF' : '#1A1D23',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '8px 4px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* VISIBILITY CONTROLS */}
                <div style={{ padding: 14, border: '1px solid var(--bg-tertiary)', borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 3 }}>
                    🛠️ Component Toggles
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={hideToolbar} 
                      onChange={e => setHideToolbar(e.target.checked)} 
                      style={{ accentColor: '#E85D00' }}
                    />
                    <div>
                      <strong>Hide Bottom Toolbar Row</strong>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Disable fonts, highlighters, link and image insertion</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={hideTemplates} 
                      onChange={e => setHideTemplates(e.target.checked)} 
                      style={{ accentColor: '#E85D00' }}
                    />
                    <div>
                      <strong>Deactivate Templates Catalog</strong>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hide pre-made document styles and headers from toolbar</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={hideAi} 
                      onChange={e => setHideAi(e.target.checked)} 
                      style={{ accentColor: '#E85D00' }}
                    />
                    <div>
                      <strong>Deactivate AI Copilot Panel</strong>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Disable writing completions assistant, grammar, and summary aids</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={readonly} 
                      onChange={e => setReadonly(e.target.checked)} 
                      style={{ accentColor: '#E85D00' }}
                    />
                    <div>
                      <strong>Read-Only Display Mode</strong>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Use editor purely as a high-fidelity manuscript/PDF reader</span>
                    </div>
                  </label>
                </div>

                {/* WRITING COMPANIONS & CUSTOM BRANDING */}
                <div style={{ padding: 14, border: '1px solid var(--bg-tertiary)', borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    🏢 Custom Brand Identity
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default Placeholder message on black page:</span>
                    <input 
                      type="text" 
                      value={placeholder} 
                      onChange={e => setPlaceholder(e.target.value)} 
                      style={{ padding: '6px 10px', fontSize: '0.76rem', borderRadius: 4, border: '1px solid var(--bg-tertiary)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    <input 
                      type="checkbox" 
                      checked={customBranding} 
                      onChange={e => setCustomBranding(e.target.checked)} 
                      style={{ accentColor: '#E85D00' }}
                    />
                    <div>
                      <strong>Apply Custom Marketplace Branding Header</strong>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Replace "ForgeYours Write" branding text and links with your own title</span>
                    </div>
                  </label>

                  {customBranding && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.2s' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Custom Marketplace Header title:</span>
                      <input 
                        type="text" 
                        value={brandingTitle} 
                        onChange={e => setBrandingTitle(e.target.value)} 
                        style={{ padding: '6px 10px', fontSize: '0.76rem', borderRadius: 4, border: '1px solid var(--bg-tertiary)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* CODES & PREVIEW RIGHT HAND RAIL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                    📋 Dynamic IFrame Code Tag
                  </h4>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0, marginBottom: 8 }}>
                    Copy this tag and paste it into any HTML/WordPress/React project:
                  </p>
                  
                  <div style={{ position: 'relative' }}>
                    <textarea 
                      readOnly
                      value={iframeCode}
                      style={{
                        width: '100%',
                        height: '140px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.7rem',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid var(--bg-tertiary)',
                        background: '#1A1D23',
                        color: '#A2E3C4',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                    <button
                      onClick={() => triggerCopy(iframeCode, 'iframe')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        bottom: 12,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {copyFeedback === 'iframe' ? <Check size={11} style={{ color: 'var(--success)' }} /> : <Copy size={11} />}
                      {copyFeedback === 'iframe' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div style={{ padding: 14, border: '1px solid var(--bg-tertiary)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 6px 0' }}>
                    <Terminal size={12} style={{ color: '#E85D00' }} />
                    PostMessage Hook Setup
                  </h4>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3, margin: '0 0 10px 0' }}>
                    By implementing the events listener, any user edits inside ForgeYours are instantly synchronized to your marketplace web host!
                  </p>
                  <button
                    onClick={() => setActiveTab('codes')}
                    style={{
                      width: '100%',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--bg-tertiary)',
                      borderRadius: 4,
                      padding: '6px 0',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: 650,
                      color: '#E85D00',
                    }}
                  >
                    View JavaScript SDK Instructions
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#eef2f6', borderRadius: 8, border: '1px solid #d0d7de' }}>
                  <Info size={28} style={{ color: '#2463eb', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.66rem', color: '#24292f', margin: 0, lineHeight: 1.3 }}>
                    <strong>Developer Tip:</strong> Under tab 3 (Event Monitor), watch the real-time events fire when typing on the writing page back there!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'codes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  🔌 JavaScript SDK Integration & Message Passing Guides
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                  Control load states and capture document updates using Standard HTML5 Window messaging.
                </p>
              </div>

              {/* LISTENER CODE BLOCK */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)' }}>1. Capture Document Updates (Auto-Save to your Database)</span>
                  <button 
                    onClick={() => triggerCopy(listenerCode, 'listener')}
                    style={{ fontSize: '0.72rem', background: 'transparent', border: 'none', color: '#E85D00', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontWeight: 600 }}
                  >
                    {copyFeedback === 'listener' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                    {copyFeedback === 'listener' ? 'Copied' : 'Copy Snippet'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '12px 16px', background: '#1A1D23', color: '#E5E9F0', borderRadius: 8, fontSize: '0.72rem', overflowX: 'auto', fontFamily: 'var(--font-mono, monospace)', border: '1px solid var(--bg-tertiary)' }}>
                  {listenerCode}
                </pre>
              </div>

              {/* INJECTION CODE BLOCK */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)' }}>2. Inject Chapter/Article content programmatically</span>
                  <button 
                    onClick={() => triggerCopy(injectCode, 'inject')}
                    style={{ fontSize: '0.72rem', background: 'transparent', border: 'none', color: '#E85D00', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontWeight: 600 }}
                  >
                    {copyFeedback === 'inject' ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                    {copyFeedback === 'inject' ? 'Copied' : 'Copy Snippet'}
                  </button>
                </div>
                <pre style={{ margin: 0, padding: '12px 16px', background: '#1A1D23', color: '#E5E9F0', borderRadius: 8, fontSize: '0.72rem', overflowX: 'auto', fontFamily: 'var(--font-mono, monospace)', border: '1px solid var(--bg-tertiary)' }}>
                  {injectCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'debugger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    📟 Live Event Console (Iframe Outward Monitor)
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                    This console displays real-time messages that the ForgeYours Write framework is broadcasting. Drag this window aside or keep it open and write on the canvas to see live outputs!
                  </p>
                </div>
                <button
                  onClick={() => setSimulatedEvents([{
                    time: new Date().toLocaleTimeString(),
                    type: 'CONSOLE_CLEARED',
                    details: 'Log refreshed'
                  }])}
                  style={{
                    fontSize: '0.7rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: 4,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                  }}
                >
                  Clear Console Clear
                </button>
              </div>

              <div style={{
                background: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: 8,
                padding: '16px 20px',
                height: '350px',
                overflowY: 'auto',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.74rem',
                color: '#C9D1D9',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                {simulatedEvents.map((ev, index) => (
                  <div key={index} style={{ borderBottom: '1px solid #21262D', paddingBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', opacity: 0.7, color: '#8B949E' }}>
                      <span>[{ev.time}]</span>
                      <span style={{ color: ev.type.startsWith('forgeyours') ? '#58A6FF' : '#7EE787', fontWeight: 'bold' }}>{ev.type}</span>
                    </div>
                    <div style={{ marginTop: 2, color: ev.type.includes('change') ? '#85E3B2' : '#E6EDF2', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {ev.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BRIGHT CTA FOOTER */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--bg-tertiary)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Developed strictly according to Standard W3C postMessage Frame specs. Works in React, Angular, Vue, PHP, and static HTML templates!
          </span>
          <button
            onClick={onClose}
            style={{
              background: '#1A1D23',
              color: '#fff',
              border: 'none',
              padding: '6px 16px',
              borderRadius: 6,
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
