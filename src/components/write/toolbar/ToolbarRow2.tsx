// ============================================================
// FILE: src/components/write/toolbar/ToolbarRow2.tsx
// PURPOSE: Formatting toolbar row with rich text inputs & style controls
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Heading1, Heading2, Heading3,
  Link, Image, Table, Minus,
  Superscript, Subscript,
  Indent, Outdent,
  Quote, Eraser, Type, Highlighter,
  Undo, Redo, SlidersHorizontal,
} from 'lucide-react';

import { Sep, TBtn, TSelect } from './ToolbarPrimitives';
import FontPicker from './FontPicker';
import { TextColourPicker, HighlightPicker } from './ColourPicker';
import TablePicker from './TablePicker';

const FONT_SIZES = [8,9,10,11,12,14,16,18,20,24,28,32,36,48,72];
const LINE_SPACINGS = [
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
];

interface ToolbarRow2Props {
  fontFamily: string;
  onFontFamily: (val: string) => void;
  fontSize: number;
  onFontSize: (val: number) => void;
  lineSpacing: string;
  onLineSpacing: (val: string) => void;
  onFormat: (command: string, value?: string) => void;
  onTextColour: (colour: string) => void;
  onHighlight: (colour: string) => void;
  onInsertTable: (rows: number, cols: number) => void;
  onInsertLink: () => void;
  onInsertImage: () => void;
  onInsertBlockquote: () => void;
  onInsertHR: () => void;
  onClearFormat: () => void;
  pageSetupOpen: boolean;
  onTogglePageSetup: () => void;
}

export default function ToolbarRow2({
  fontFamily, onFontFamily,
  fontSize,   onFontSize,
  lineSpacing, onLineSpacing,
  onFormat,
  onTextColour,
  onHighlight,
  onInsertTable,
  onInsertLink,
  onInsertImage,
  onInsertBlockquote,
  onInsertHR,
  onClearFormat,
  pageSetupOpen,
  onTogglePageSetup,
}: ToolbarRow2Props) {
  const [showTextColour, setShowTextColour] = useState(false);
  const [showHighlight,  setShowHighlight]  = useState(false);
  const [showTable,      setShowTable]      = useState(false);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
      padding: '6px 16px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--bg-tertiary)',
    }}>
      {/* Undo & Redo */}
      <TBtn icon={Undo} title="Undo (Ctrl+Z)" onActivate={() => onFormat('undo')} />
      <TBtn icon={Redo} title="Redo (Ctrl+Y)" onActivate={() => onFormat('redo')} />

      <Sep />

      {/* Font family */}
      <FontPicker value={fontFamily} onChange={onFontFamily} />

      {/* Font size */}
      <TSelect
        title="Font size"
        value={fontSize}
        onChange={(v) => onFontSize(Number(v))}
        options={FONT_SIZES.map(s => ({ label: `${s}pt`, value: s }))}
        width={66}
        style={{ height: '22px' }}
      />

      <Sep />

      {/* Text style */}
      <TBtn icon={Bold}          title="Bold (Ctrl+B)"      onActivate={() => onFormat('bold')} />
      <TBtn icon={Italic}        title="Italic (Ctrl+I)"    onActivate={() => onFormat('italic')} />
      <TBtn icon={Underline}     title="Underline (Ctrl+U)" onActivate={() => onFormat('underline')} />
      <TBtn icon={Strikethrough} title="Strikethrough"      onActivate={() => onFormat('strikeThrough')} />
      <TBtn icon={Superscript}   title="Superscript"        onActivate={() => onFormat('superscript')} />
      <TBtn icon={Subscript}     title="Subscript"          onActivate={() => onFormat('subscript')} />

      <Sep />

      {/* Text colour */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          data-tooltip="Text color picker"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTextColour(v => !v);
            setShowHighlight(false);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 5,
            background: 'transparent',
            cursor: 'pointer',
            gap: 1,
          }}
        >
          <Type size={12} color="var(--text-secondary)" />
          <div style={{ width: 16, height: 3, borderRadius: 1, background: '#E85D00' }} />
        </button>
        {showTextColour && (
          <TextColourPicker
            onPick={onTextColour}
            onClose={() => setShowTextColour(false)}
          />
        )}
      </div>

      {/* Highlight */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          data-tooltip="Highlight picker"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHighlight(v => !v);
            setShowTextColour(false);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 5,
            background: 'transparent',
            cursor: 'pointer',
            gap: 1,
          }}
        >
          <Highlighter size={12} color="var(--text-secondary)" />
          <div style={{ width: 16, height: 3, borderRadius: 1, background: '#FFFF00' }} />
        </button>
        {showHighlight && (
          <HighlightPicker
            onPick={onHighlight}
            onClose={() => setShowHighlight(false)}
          />
        )}
      </div>

      <Sep />

      {/* Headings */}
      <TBtn icon={Heading1} title="Heading 1" onActivate={() => onFormat('formatBlock', 'h1')} />
      <TBtn icon={Heading2} title="Heading 2" onActivate={() => onFormat('formatBlock', 'h2')} />
      <TBtn icon={Heading3} title="Heading 3" onActivate={() => onFormat('formatBlock', 'h3')} />
      <TBtn
        title="Normal paragraph"
        icon={() => <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>¶</span>}
        onActivate={() => onFormat('formatBlock', 'p')}
      />

      <Sep />

      {/* Lists */}
      <TBtn icon={List}        title="Bullet list"   onActivate={() => onFormat('insertUnorderedList')} />
      <TBtn icon={ListOrdered} title="Numbered list" onActivate={() => onFormat('insertOrderedList')} />

      <Sep />

      {/* Alignment */}
      <TBtn icon={AlignLeft}    title="Align left"    onActivate={() => onFormat('justifyLeft')} />
      <TBtn icon={AlignCenter}  title="Align centre"  onActivate={() => onFormat('justifyCenter')} />
      <TBtn icon={AlignRight}   title="Align right"   onActivate={() => onFormat('justifyRight')} />
      <TBtn icon={AlignJustify} title="Justify"       onActivate={() => onFormat('justifyFull')} />

      <Sep />

      {/* Indent */}
      <TBtn icon={Indent}  title="Increase indent" onActivate={() => onFormat('indent')} />
      <TBtn icon={Outdent} title="Decrease indent" onActivate={() => onFormat('outdent')} />

      <Sep />

      {/* Line spacing */}
      <TSelect
        title="Line spacing"
        value={lineSpacing}
        onChange={onLineSpacing}
        options={LINE_SPACINGS}
        width={60}
      />

      <Sep />

      {/* Insert */}
      <TBtn icon={Link}  title="Insert link"        onActivate={onInsertLink} />
      <TBtn icon={Image} title="Insert image"       onActivate={onInsertImage} />
      <TBtn icon={Quote} title="Blockquote"         onActivate={onInsertBlockquote} />
      <TBtn icon={Minus} title="Horizontal rule"    onActivate={onInsertHR} />

      {/* Table picker */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <TBtn
          icon={Table}
          title="Insert table"
          onActivate={() => setShowTable(v => !v)}
          active={showTable}
        />
        {showTable && (
          <TablePicker
            onPick={onInsertTable}
            onClose={() => setShowTable(false)}
          />
        )}
      </div>

      <Sep />

      {/* Clear formatting */}
      <TBtn icon={Eraser} title="Clear formatting" danger onActivate={onClearFormat} />

      <Sep />

      {/* Page Setup */}
      <TBtn
        icon={SlidersHorizontal}
        title="Page Setup & Spacings"
        onActivate={onTogglePageSetup}
        active={pageSetupOpen}
        label="Page Setup"
      />
    </div>
  );
}
