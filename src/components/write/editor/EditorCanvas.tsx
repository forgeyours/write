// ============================================================
// FILE: src/components/write/editor/EditorCanvas.tsx
// PURPOSE: ContentEditable flowing canvas mimicking A4 page layout with zoom/scale viewports
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';

const PAGE_HEIGHT_PX = 1122;
const PAGE_PADDING_V = 72;
const PAGE_GAP = 24;
const PAGE_MAX_WIDTH = 760;

interface EditorCanvasProps {
  content: string;
  onChange: (html: string) => void;
  fontFamily: string;
  lineSpacing: string;
  pageMargin: number;
  zoom: number;
  setZoom: (v: number) => void;
  autoFit: boolean;
  setAutoFit: (v: boolean) => void;
  onScaleChange?: (scale: number) => void;
  readonly?: boolean;
  placeholder?: string;
}

const EditorCanvas = forwardRef<HTMLDivElement, EditorCanvasProps>(function EditorCanvas(
  { content, onChange, fontFamily, lineSpacing, pageMargin, zoom, setZoom, autoFit, setAutoFit, onScaleChange, readonly = false, placeholder = 'Start writing...' },
  ref
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [containerWidth, setContainerWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(PAGE_HEIGHT_PX);

  // Expose the inner element to forwarded ref
  useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

  // Sync internal content editable html value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content ?? '';
    }
  }, [content]);

  // Monitor editor outer container box size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Monitor inner scrollheight growing dynamically
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setCanvasHeight(el.scrollHeight || PAGE_HEIGHT_PX);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [content]);

  function handleInput() {
    onChange(editorRef.current?.innerHTML ?? '');
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  // Calculate scales
  const A4_WIDTH_PX = 790;
  const scale = (containerWidth < A4_WIDTH_PX && autoFit)
    ? (containerWidth - 24) / A4_WIDTH_PX
    : (zoom / 100);

  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: 'var(--bg-tertiary)',
        padding: `${PAGE_GAP}px 12px ${PAGE_GAP * 3}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        overflowX: 'auto',
      }}
    >
      {/* Outer sizing box that takes exact scaled dimensions in document flow */}
      <div style={{
        width: `${A4_WIDTH_PX * scale}px`,
        height: `${canvasHeight * scale + 48}px`,
        position: 'relative',
        transition: 'width 0.15s ease-out, height 0.15s ease-out',
      }}>
        {/* Inner actual A4 canvas at full unscaled resolution */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${A4_WIDTH_PX}px`,
          height: `${canvasHeight + 48}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          transition: 'transform 0.15s ease-out',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: PAGE_MAX_WIDTH,
            zIndex: 2,
          }}
            onClick={(e) => {
              // Prevent editor focus if clicked on empty bounds outside editor
              if (e.target === e.currentTarget) {
                editorRef.current?.focus();
              }
            }}
          >
            {/* The flowing papier */}
            <div
              id="editor-canvas"
              ref={editorRef}
              contentEditable={!readonly}
              placeholder={placeholder}
              suppressContentEditableWarning
              onInput={handleInput}
              onPaste={handlePaste}
              spellCheck
              style={{
                width: '100%',
                minHeight: PAGE_HEIGHT_PX,
                background: '#fff',
                borderRadius: 4,
                padding: `${PAGE_PADDING_V}px ${pageMargin}px`,
                boxShadow: '0 20px 25px -5px rgba(154, 160, 174, 0.25), 0 8px 10px -6px rgba(154, 160, 174, 0.25), 0 0 0 1px rgba(154, 160, 174, 0.15)',
                outline: 'none',
                fontFamily: fontFamily ?? 'Georgia, serif',
                fontSize: '12pt',
                lineHeight: lineSpacing ?? '1.8',
                color: '#1A1D23',
                position: 'relative',
                zIndex: 2,
                backgroundImage: `
                  repeating-linear-gradient(
                    to bottom,
                    transparent 0px,
                    transparent calc(${PAGE_HEIGHT_PX}px - 1px),
                    #CBD2DA calc(${PAGE_HEIGHT_PX}px - 1px),
                    #CBD2DA ${PAGE_HEIGHT_PX}px
                  )
                `,
                backgroundAttachment: 'local',
              }}
            />

            {/* Page breaks */}
            <PageBreakLabels pageHeight={PAGE_HEIGHT_PX} canvasHeight={canvasHeight} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default EditorCanvas;

interface PageBreakProps {
  pageHeight: number;
  canvasHeight: number;
}

function PageBreakLabels({ pageHeight, canvasHeight }: PageBreakProps) {
  // Support up to 20 A4 pages dynamically by rendering only the required partition labels
  const totalPages = Math.max(1, Math.ceil(canvasHeight / pageHeight));
  const labelCount = Math.max(0, totalPages - 1);
  const activeLabelIndices = Array.from({ length: labelCount }, (_, i) => i + 1);

  return (
    <>
      {activeLabelIndices.map(pageNum => (
        <div
          key={pageNum}
          style={{
            position: 'absolute',
            top: pageHeight * pageNum,
            left: -80,
            width: 70,
            textAlign: 'right',
            fontSize: '0.68rem',
            color: '#9AA0AE',
            fontFamily: 'Inter, Arial, sans-serif',
            lineHeight: '1px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {pageNum + 1}
        </div>
      ))}
    </>
  );
}
