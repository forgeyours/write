// ============================================================
// FILE: src/components/write/toolbar/FontPicker.tsx
// PURPOSE: Dynamic Google Font family selector was loaded on demand
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2, Upload } from 'lucide-react';

interface CustomFont {
  label: string;
  value: string;
  family: string;
  dataUrl: string;
}

function registerCustomFontInDOM(font: CustomFont) {
  const styleId = `style-custom-font-${font.family}`;
  if (document.getElementById(styleId)) return;

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = `
    @font-face {
      font-family: '${font.family}';
      src: url('${font.dataUrl}');
    }
  `;
  document.head.appendChild(styleEl);
}

interface FontItem {
  label: string;
  value: string;
  gfName: string | null;
}

interface FontGroup {
  group: string;
  fonts: FontItem[];
}

export const FONT_GROUPS: FontGroup[] = [
  {
    group: 'Serif',
    fonts: [
      { label: 'Georgia',       value: 'Georgia, serif',              gfName: null },
      { label: 'Times New Roman', value: '"Times New Roman", serif',  gfName: null },
      { label: 'Garamond',      value: 'EB Garamond, serif',          gfName: 'EB+Garamond' },
      { label: 'Palatino',      value: 'Palatino Linotype, serif',    gfName: null },
      { label: 'Playfair',      value: 'Playfair Display, serif',     gfName: 'Playfair+Display' },
      { label: 'Merriweather',  value: 'Merriweather, serif',         gfName: 'Merriweather' },
      { label: 'Lora',          value: 'Lora, serif',                 gfName: 'Lora' },
      { label: 'Libre Baskerville', value: 'Libre Baskerville, serif',gfName: 'Libre+Baskerville' },
      { label: 'Crimson Text',  value: 'Crimson Text, serif',         gfName: 'Crimson+Text' },
      { label: 'Cormorant',     value: 'Cormorant Garamond, serif',   gfName: 'Cormorant+Garamond' },
    ],
  },
  {
    group: 'Sans-serif',
    fonts: [
      { label: 'Arial',         value: 'Arial, sans-serif',           gfName: null },
      { label: 'Helvetica',     value: 'Helvetica Neue, sans-serif',  gfName: null },
      { label: 'Inter',         value: 'Inter, sans-serif',           gfName: 'Inter' },
      { label: 'Roboto',        value: 'Roboto, sans-serif',          gfName: 'Roboto' },
      { label: 'Open Sans',     value: 'Open Sans, sans-serif',       gfName: 'Open+Sans' },
      { label: 'Lato',          value: 'Lato, sans-serif',            gfName: 'Lato' },
      { label: 'Nunito',        value: 'Nunito, sans-serif',          gfName: 'Nunito' },
      { label: 'Source Sans',   value: 'Source Sans 3, sans-serif',   gfName: 'Source+Sans+3' },
      { label: 'Raleway',       value: 'Raleway, sans-serif',         gfName: 'Raleway' },
      { label: 'Poppins',       value: 'Poppins, sans-serif',         gfName: 'Poppins' },
      { label: 'DM Sans',       value: 'DM Sans, sans-serif',          gfName: 'DM+Sans' },
      { label: 'Outfit',        value: 'Outfit, sans-serif',          gfName: 'Outfit' },
    ],
  },
  {
    group: 'Display',
    fonts: [
      { label: 'Oswald',        value: 'Oswald, sans-serif',          gfName: 'Oswald' },
      { label: 'Bebas Neue',    value: 'Bebas Neue, sans-serif',      gfName: 'Bebas+Neue' },
      { label: 'Abril Fatface', value: 'Abril Fatface, serif',        gfName: 'Abril+Fatface' },
      { label: 'Righteous',     value: 'Righteous, sans-serif',       gfName: 'Righteous' },
      { label: 'Lobster',       value: 'Lobster, cursive',            gfName: 'Lobster' },
    ],
  },
  {
    group: 'Handwriting',
    fonts: [
      { label: 'Caveat',        value: 'Caveat, cursive',             gfName: 'Caveat' },
      { label: 'Pacifico',      value: 'Pacifico, cursive',           gfName: 'Pacifico' },
      { label: 'Dancing Script',value: 'Dancing Script, cursive',     gfName: 'Dancing+Script' },
      { label: 'Indie Flower',  value: 'Indie Flower, cursive',       gfName: 'Indie+Flower' },
      { label: 'Shadows Into Light', value: 'Shadows Into Light, cursive', gfName: 'Shadows+Into+Light' },
    ],
  },
  {
    group: 'Monospace',
    fonts: [
      { label: 'Courier New',   value: '"Courier New", monospace',    gfName: null },
      { label: 'Roboto Mono',   value: 'Roboto Mono, monospace',      gfName: 'Roboto+Mono' },
      { label: 'Source Code Pro',value:'Source Code Pro, monospace',  gfName: 'Source+Code+Pro' },
      { label: 'JetBrains Mono',value: 'JetBrains Mono, monospace',   gfName: 'JetBrains+Mono' },
      { label: 'Fira Code',     value: 'Fira Code, monospace',        gfName: 'Fira+Code' },
      { label: 'Space Mono',    value: 'Space Mono, monospace',       gfName: 'Space+Mono' },
    ],
  },
];

export const ALL_FONTS = FONT_GROUPS.flatMap(g => g.fonts);

const loadedFonts = new Set<string>();

function ensureFontLoaded(gfName: string | null) {
  if (!gfName || loadedFonts.has(gfName)) return;
  loadedFonts.add(gfName);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${gfName}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

interface FontPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  const currentFont = [...customFonts, ...ALL_FONTS.map(f => ({ label: f.label, value: f.value }))].find(f => f.value === value) ?? ALL_FONTS[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('forgeyours_custom_fonts');
      if (saved) {
        const parsed: CustomFont[] = JSON.parse(saved);
        parsed.forEach(registerCustomFontInDOM);
        setCustomFonts(parsed);
      }
    } catch (err) {
      console.error('Failed to load custom fonts', err);
    }
  }, []);

  useEffect(() => {
    if (open) {
      ALL_FONTS.forEach(f => {
        if (f.gfName) ensureFontLoaded(f.gfName);
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  // Unified pick signature that operates on any item
  function pick(font: { label: string; value: string; gfName?: string | null }) {
    if (font.gfName) ensureFontLoaded(font.gfName);
    onChange(font.value);
    setOpen(false);
  }

  async function handleFontUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['ttf', 'otf', 'woff', 'woff2'];
    if (!extension || !allowed.includes(extension)) {
      alert(`Unsupported file type (.${extension || 'unknown'}). Please upload a valid font file: .woff2, .woff, .ttf, or .otf`);
      return;
    }

    if (file.size > 2000000) {
      alert('Font file too large! Please choose an optimized font file under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanFamily = originalName.replace(/[^a-zA-Z0-9-]/g, '').trim() || 'CustomFont';
      const uniqueFamily = `${cleanFamily}-${Date.now()}`;
      const fontLabel = originalName.replace(/[-_]/g, ' ');

      const newFont: CustomFont = {
        label: fontLabel,
        value: `"${uniqueFamily}", sans-serif`,
        family: uniqueFamily,
        dataUrl: dataUrl,
      };

      registerCustomFontInDOM(newFont);

      const updated = [...customFonts, newFont];
      setCustomFonts(updated);
      try {
        localStorage.setItem('forgeyours_custom_fonts', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist custom font list', err);
        alert('Could not save font persistently. Local Storage may be full.');
      }

      pick({ label: newFont.label, value: newFont.value, gfName: null });
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleDeleteCustomFont(fontValue: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const updated = customFonts.filter(cf => cf.value !== fontValue);
    setCustomFonts(updated);
    try {
      localStorage.setItem('forgeyours_custom_fonts', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    const font = customFonts.find(cf => cf.value === fontValue);
    if (font) {
      const styleId = `style-custom-font-${font.family}`;
      const el = document.getElementById(styleId);
      if (el) el.remove();
    }

    if (value === fontValue) {
      onChange('Arial, sans-serif');
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen(v => !v);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          height: '22px',
          padding: '0 8px',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 5,
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.78rem',
          fontFamily: value,
          width: '110px',
          justifyContent: 'space-between',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: value,
        }}>
          {currentFont.label}
        </span>
        <ChevronDown size={11} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 400,
          background: 'var(--bg-primary)',
          border: '1px solid var(--bg-tertiary)',
          borderRadius: 8,
          boxShadow: '0 6px 28px rgba(0,0,0,0.16)',
          marginTop: 4,
          width: 220,
          maxHeight: 320,
          overflowY: 'auto',
          padding: '6px 0',
        }}>
          {/* Upload Button Section */}
          <div style={{
            borderBottom: '1px solid var(--bg-tertiary)',
            padding: '6px 10px',
            background: 'var(--bg-secondary)',
          }}>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                background: '#E85D00',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F97316'}
              onMouseLeave={e => e.currentTarget.style.background = '#E85D00'}
            >
              <Upload size={14} />
              Upload Font
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFontUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Custom Uploaded Fonts Area */}
          {customFonts.length > 0 && (
            <div style={{ borderBottom: '1px solid var(--bg-tertiary)' }}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '8px 14px 4px',
              }}>
                Custom Uploads
              </div>
              {customFonts.map(font => (
                <div
                  key={font.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    paddingRight: 10,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick({ label: font.label, value: font.value, gfName: null });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      padding: '7px 14px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: 10,
                    }}
                  >
                    <span style={{
                      fontFamily: font.value,
                      fontSize: '0.92rem',
                      color: 'var(--text-primary)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {font.label}
                    </span>
                    {font.value === value && (
                      <span style={{ color: '#E85D00', fontSize: '0.7rem' }}>✓</span>
                    )}
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleDeleteCustomFont(font.value, e);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 4,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--danger)';
                      e.currentTarget.style.background = 'rgba(255,0,0,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    title="Delete custom font file"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {FONT_GROUPS.map(group => (
            <div key={group.group}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '8px 14px 4px',
              }}>
                {group.group}
              </div>
              {group.fonts.map(font => (
                <button
                  key={font.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(font);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '7px 14px',
                    border: 'none',
                    background: font.value === value ? 'var(--bg-secondary)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: 10,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = font.value === value ? 'var(--bg-secondary)' : 'transparent'}
                >
                  <span style={{
                    fontFamily: font.value,
                    fontSize: '0.92rem',
                    color: 'var(--text-primary)',
                    flex: 1,
                  }}>
                    {font.label}
                  </span>
                  {font.value === value && (
                    <span style={{ color: '#E85D00', fontSize: '0.7rem' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
