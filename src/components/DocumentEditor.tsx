// ============================================================
// FILE: src/components/DocumentEditor.tsx
// PURPOSE: Primary coordinator wrapping Canvas, Toolbars, and Modals with scaling and custom setup
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useRef, useState, useEffect } from 'react';
import ToolbarRow1 from './write/toolbar/ToolbarRow1';
import ToolbarRow2 from './write/toolbar/ToolbarRow2';
import EditorCanvas from './write/editor/EditorCanvas';
import ExportModal from './write/modals/ExportModal';
import TemplateModal from './write/modals/TemplateModal';
import IntegrationModal from './write/modals/IntegrationModal';
import { LinkModal, ImageModal } from './write/modals/InsertModals';
import WordCountModal from './write/modals/WordCountModal';
import FindReplacePanel from './write/panels/FindReplacePanel';
import ImageEditPopover from './write/editor/ImageEditPopover';
import { Table } from 'lucide-react';

interface DocumentEditorProps {
  content: string;
  onChange: (html: string) => void;
  documentTitle: string;
  onNew: () => void;
  onOpen: () => void;
  onSaveLocal: () => void;
  onSaveDrive: () => void;
  readonly?: boolean;
  placeholder?: string;
  hideToolbar?: boolean;
  hideTemplates?: boolean;
}

export default function DocumentEditor({
  content,
  onChange,
  documentTitle,
  onNew,
  onOpen,
  onSaveLocal,
  onSaveDrive,
  readonly = false,
  placeholder = 'Start writing something amazing...',
  hideToolbar = false,
  hideTemplates = false,
}: DocumentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [docBaseFont, setDocBaseFont] = useState('Georgia, serif');
  const [fontSize, setFontSize] = useState(12);
  const [lineSpacing, setLineSpacing] = useState('1.8');

  // Scaling Viewports states (Manual & Responsive fit)
  const [zoom, setZoom] = useState(100);
  const [autoFit, setAutoFit] = useState(true);
  const [calculatedScale, setCalculatedScale] = useState(1);

  // Dynamic layout setup sliders
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [paraMargin, setParaMargin] = useState(12);
  const [hMarginTop, setHMarginTop] = useState(20);
  const [hMarginBottom, setHMarginBottom] = useState(10);
  const [pageMargin, setPageMargin] = useState(80);

  // Active clicked image element for resizing / deletion
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);

  // Active focused table cell element for table actions
  const [focusedCell, setFocusedCell] = useState<HTMLTableCellElement | null>(null);

  // Maintain Selection Range across blur/focus events
  const lastSelectionRangeRef = useRef<Range | null>(null);
  const lastCaretOffsetRef = useRef<number>(0);

  const [showExport, setShowExport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showIntegration, setShowIntegration] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showWordCount, setShowWordCount] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);

  const [wordCount, setWordCount] = useState(0);

  // Custom Undo/Redo historical entries tracker
  const historyRef = useRef<{ html: string; caretOffset: number }[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Table modification action helpers
  function handleTableInsertRow(above: boolean) {
    if (!focusedCell) return;
    const row = focusedCell.parentElement as HTMLTableRowElement;
    const tableEl = row?.closest('table') as HTMLTableElement;
    if (!row || !tableEl) return;

    const colCount = row.cells.length;
    const rowIndex = row.rowIndex;
    const targetIndex = above ? rowIndex : rowIndex + 1;

    const newRow = tableEl.insertRow(targetIndex);
    for (let i = 0; i < colCount; i++) {
      const isHeader = row.cells[i]?.tagName.toUpperCase() === 'TH';
      const cellType = isHeader ? 'th' : 'td';
      const newCell = document.createElement(cellType) as HTMLTableCellElement;
      newCell.innerHTML = '&nbsp;';
      newCell.style.cssText = 'border: 1px solid #CBD2DA; padding: 10px 12px; min-width: 60px;';
      if (isHeader) {
        newCell.style.background = '#F2F4F7';
        newCell.style.fontWeight = '600';
      }
      newRow.appendChild(newCell);
    }

    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
    
    // Auto shift focus to newly created row
    try {
      const nextCell = newRow.cells[focusedCell.cellIndex];
      if (nextCell) {
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(nextCell);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          lastSelectionRangeRef.current = range;
          setFocusedCell(nextCell);
        }
      }
    } catch (_) {}
  }

  function handleTableInsertCol(right: boolean) {
    if (!focusedCell) return;
    const row = focusedCell.parentElement as HTMLTableRowElement;
    const tableEl = row?.closest('table') as HTMLTableElement;
    if (!row || !tableEl) return;

    const cellIndex = focusedCell.cellIndex;
    const targetIndex = right ? cellIndex + 1 : cellIndex;

    Array.from(tableEl.rows).forEach((r) => {
      const isHeader = (r.cells[cellIndex]?.tagName.toUpperCase() === 'TH') || (r.rowIndex === 0);
      const cellType = isHeader ? 'th' : 'td';
      const newCell = document.createElement(cellType) as HTMLTableCellElement;
      newCell.innerHTML = '&nbsp;';
      newCell.style.cssText = 'border: 1px solid #CBD2DA; padding: 10px 12px; min-width: 60px;';
      if (isHeader) {
        newCell.style.background = '#F2F4F7';
        newCell.style.fontWeight = '600';
      }
      
      if (targetIndex >= r.cells.length) {
        r.appendChild(newCell);
      } else {
        r.insertBefore(newCell, r.cells[targetIndex]);
      }
    });

    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleTableDeleteRow() {
    if (!focusedCell) return;
    const row = focusedCell.parentElement as HTMLTableRowElement;
    const tableEl = row?.closest('table') as HTMLTableElement;
    if (!row || !tableEl) return;

    const rowIndex = row.rowIndex;
    tableEl.deleteRow(rowIndex);
    setFocusedCell(null);

    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleTableDeleteCol() {
    if (!focusedCell) return;
    const row = focusedCell.parentElement as HTMLTableRowElement;
    const tableEl = row?.closest('table') as HTMLTableElement;
    if (!row || !tableEl) return;

    const cellIndex = focusedCell.cellIndex;
    Array.from(tableEl.rows).forEach((r) => {
      if (r.cells.length > cellIndex) {
        r.deleteCell(cellIndex);
      }
    });
    setFocusedCell(null);

    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleTableDeleteTable() {
    if (!focusedCell) return;
    const tableEl = focusedCell.closest('table');
    if (tableEl) {
      tableEl.remove();
      setFocusedCell(null);
    }

    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleTableCellBg(color: string) {
    if (!focusedCell) return;
    focusedCell.style.background = color;
    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  // Synchronize count of words
  useEffect(() => {
    countWords(content ?? '');
  }, [content]);

  // Synchronize initial content loaded into custom history stack
  useEffect(() => {
    if (content && historyRef.current.length === 0) {
      historyRef.current = [{ html: content, caretOffset: 0 }];
      historyIndexRef.current = 0;
    }
  }, [content]);

  // Cleanup typing timeline on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  // Monitor document wide selection changes inside canvas
  useEffect(() => {
    function handleSelectionChange() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const editor = editorRef.current;
        if (editor && editor.contains(range.commonAncestorContainer)) {
          lastSelectionRangeRef.current = range;
          try {
            lastCaretOffsetRef.current = getCaretOffset(editor);
          } catch (_) {}

          // 1. Detect font family formatted under caret
          const font = document.queryCommandValue('fontName');
          if (font) {
            const cleanFont = font.replace(/["']/g, '').trim();
            setFontFamily(cleanFont);
          }

          // 2. Detect font size formatted under caret
          let parentEl = range.commonAncestorContainer as HTMLElement;
          if (parentEl.nodeType === Node.TEXT_NODE) {
            parentEl = parentEl.parentElement as HTMLElement;
          }
          if (parentEl && editor.contains(parentEl)) {
            const compStyle = window.getComputedStyle(parentEl);
            const fs = compStyle.fontSize;
            if (fs) {
              const px = parseFloat(fs);
              const pt = Math.round(px * 0.75);
              if (pt > 0) setFontSize(pt);
            }
          }

          // 3. Detect focused table cell
          let cellNode: HTMLTableCellElement | null = null;
          let tempCell: Node | null = range.startContainer;
          while (tempCell && tempCell !== editor) {
            if (tempCell.nodeType === Node.ELEMENT_NODE) {
              const tn = (tempCell as HTMLElement).tagName.toUpperCase();
              if (tn === 'TD' || tn === 'TH') {
                cellNode = tempCell as HTMLTableCellElement;
                break;
              }
            }
            tempCell = tempCell.parentNode;
          }
          setFocusedCell(cellNode);
        }
      }
    }
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Monitor image clicks, cell focuses, and Tab interactions inside Canvas
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    function handleEditorClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        setActiveImage(target as HTMLImageElement);
      } else {
        setActiveImage(null);
      }

      // Check cell focus on click
      let tempCell: Node | null = target;
      let cellNode: HTMLTableCellElement | null = null;
      while (tempCell && tempCell !== editor) {
        if (tempCell.nodeType === Node.ELEMENT_NODE) {
          const tn = (tempCell as HTMLElement).tagName.toUpperCase();
          if (tn === 'TD' || tn === 'TH') {
            cellNode = tempCell as HTMLTableCellElement;
            break;
          }
        }
        tempCell = tempCell.parentNode;
      }
      setFocusedCell(cellNode);
    }

    function handleEditorKeyUp(e: KeyboardEvent) {
      // Check cell focus on typing/caret move
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        let tempCell: Node | null = range.startContainer;
        let cellNode: HTMLTableCellElement | null = null;
        while (tempCell && tempCell !== editor) {
          if (tempCell.nodeType === Node.ELEMENT_NODE) {
            const tn = (tempCell as HTMLElement).tagName.toUpperCase();
            if (tn === 'TD' || tn === 'TH') {
              cellNode = tempCell as HTMLTableCellElement;
              break;
            }
          }
          tempCell = tempCell.parentNode;
        }
        setFocusedCell(cellNode);
      }
    }

    function handleTabKey(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (focusedCell) {
          const row = focusedCell.parentElement as HTMLTableRowElement;
          const table = row?.closest('table') as HTMLTableElement;
          if (!row || !table) return;

          const allCells = Array.from(table.querySelectorAll('td, th')) as HTMLTableCellElement[];
          const currentIndex = allCells.indexOf(focusedCell);

          if (e.shiftKey) {
            // Move backward
            const prevCell = allCells[currentIndex - 1];
            if (prevCell) {
              focusCell(prevCell);
            }
          } else {
            // Move forward
            const nextCell = allCells[currentIndex + 1];
            if (nextCell) {
              focusCell(nextCell);
            } else {
              // Last cell! Insert row below automatically
              handleTableInsertRow(false);
            }
          }
        } else {
          // If not in a table cell, insert non-breaking spaces for tab-indentation and prevent focus theft
          insertHtmlAtCaret('&nbsp;&nbsp;&nbsp;&nbsp;');
          const html = editorRef.current?.innerHTML ?? '';
          handleContentChange(html, false);
          saveHistoryStateImmediate(html);
        }
      }
    }

    function focusCell(cell: HTMLTableCellElement) {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(cell);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        lastSelectionRangeRef.current = range;
        setFocusedCell(cell);
      }
    }

    editor.addEventListener('click', handleEditorClick);
    editor.addEventListener('keyup', handleEditorKeyUp);
    editor.addEventListener('keydown', handleTabKey);

    return () => {
      editor.removeEventListener('click', handleEditorClick);
      editor.removeEventListener('keyup', handleEditorKeyUp);
      editor.removeEventListener('keydown', handleTabKey);
    };
  }, [content, focusedCell]);

  // Caret offset trackers for custom history restores
  function getCaretOffset(element: HTMLElement): number {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    return preCaretRange.toString().length;
  }

  function setCaretOffset(element: HTMLElement, offset: number) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(true);

    const nodeStack: Node[] = [element];
    let found = false;
    let charCount = 0;

    while (nodeStack.length > 0 && !found) {
      const node = nodeStack.pop()!;
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCount = charCount + (node.textContent?.length ?? 0);
        if (offset >= charCount && offset <= nextCount) {
          range.setStart(node, offset - charCount);
          range.setEnd(node, offset - charCount);
          found = true;
        }
        charCount = nextCount;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    if (!found) {
      range.selectNodeContents(element);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  function saveHistoryState(html: string) {
    const offset = editorRef.current ? getCaretOffset(editorRef.current) : 0;
    
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    const lastState = historyRef.current[historyRef.current.length - 1];
    if (lastState && lastState.html === html) {
      return;
    }

    historyRef.current.push({ html, caretOffset: offset });
    if (historyRef.current.length > 100) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }

  function saveHistoryStateImmediate(html: string) {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    saveHistoryState(html);
  }

  function handleUndo() {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const entry = historyRef.current[historyIndexRef.current];
      if (editorRef.current) {
        editorRef.current.innerHTML = entry.html;
        setCaretOffset(editorRef.current, entry.caretOffset);
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          lastSelectionRangeRef.current = sel.getRangeAt(0);
        }
      }
      handleContentChange(entry.html, false);
    }
  }

  function handleRedo() {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const entry = historyRef.current[historyIndexRef.current];
      if (editorRef.current) {
        editorRef.current.innerHTML = entry.html;
        setCaretOffset(editorRef.current, entry.caretOffset);
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          lastSelectionRangeRef.current = sel.getRangeAt(0);
        }
      }
      handleContentChange(entry.html, false);
    }
  }

  // Keyboard shortcut listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 's') {
        e.preventDefault();
        onSaveLocal?.();
      }
      if (mod && e.key === 'h') {
        e.preventDefault();
        setShowFindReplace(v => !v);
      }
      if (mod && e.key === 'e') {
        e.preventDefault();
        setShowExport(true);
      }
      // Intercept Ctrl+Z and Ctrl+Y key events
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onSaveLocal, historyIndexRef.current]);

  function countWords(html: string) {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    setWordCount(text ? text.split(/\s+/).length : 0);
  }

  function handleContentChange(html: string, scheduleHistorySave: boolean = true) {
    onChange(html);
    countWords(html);

    if (scheduleHistorySave) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        saveHistoryState(html);
      }, 800);
    }
  }

  function restoreSelection() {
    if (editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        if (lastSelectionRangeRef.current && editorRef.current.contains(lastSelectionRangeRef.current.commonAncestorContainer)) {
          try {
            sel.removeAllRanges();
            sel.addRange(lastSelectionRangeRef.current);
          } catch (_) {
            try {
              setCaretOffset(editorRef.current, lastCaretOffsetRef.current);
            } catch (_) {}
          }
        } else {
          try {
            setCaretOffset(editorRef.current, lastCaretOffsetRef.current);
          } catch (_) {}
        }
      }
    }
  }

  function exec(command: string, value: string | null = null) {
    editorRef.current?.focus();
    restoreSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch (_) {}
    document.execCommand(command, false, value ?? undefined);

    // Save range updated
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      lastSelectionRangeRef.current = sel.getRangeAt(0);
      try {
        lastCaretOffsetRef.current = getCaretOffset(editorRef.current);
      } catch (_) {}
    }
    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function insertHtmlAtCaret(html: string) {
    if (!editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();

    let sel = window.getSelection();
    if (!sel) return;

    let range: Range;
    if (sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    } else {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Verify boundary inside editorRef.current
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const isBlockElement = html.trim().startsWith('<table') || html.trim().startsWith('<blockquote') || html.trim().startsWith('<hr');

    // Try executing native browser insertHTML first - this is standard, handles undo stack,
    // and correctly splits parent tags in all modern layout engines (Blink, WebKit, Gecko)
    let nativeSuccess = false;
    if (!isBlockElement) {
      try {
        nativeSuccess = document.execCommand('insertHTML', false, html);
      } catch (_) {}
    }

    if (nativeSuccess) {
      // Native succeeded! Sync selection ranges and return
      const postSel = window.getSelection();
      if (postSel && postSel.rangeCount > 0) {
        lastSelectionRangeRef.current = postSel.getRangeAt(0);
      }
    } else {
      // Fallback: Safe Manual DOM manipulation

      // Create fragment of the new HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const frag = document.createDocumentFragment();
      const insertedNodes: Node[] = [];
      while (tempDiv.firstChild) {
        const child = tempDiv.firstChild;
        insertedNodes.push(child);
        frag.appendChild(child);
      }

      if (isBlockElement) {
        // Find the closest wrapped block level container inside editorRef
        let blockNode: HTMLElement | null = null;
        let node: Node | null = range.startContainer;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = (node as HTMLElement).tagName.toUpperCase();
            if (['P', 'DIV', 'H1', 'H2', 'H3', 'LI', 'BLOCKQUOTE', 'PRE', 'TD', 'TH'].includes(tag)) {
              blockNode = node as HTMLElement;
              break;
            }
          }
          node = node.parentNode;
        }

        // Trace up to make it a direct child of the editorRef for true block level sibling placement
        let rootBlockNode: HTMLElement | null = null;
        let temp: Node | null = blockNode || range.startContainer;
        while (temp && temp !== editorRef.current) {
          if (temp.parentNode === editorRef.current) {
            rootBlockNode = temp as HTMLElement;
            break;
          }
          temp = temp.parentNode;
        }

        if (rootBlockNode) {
          const isEmpty = rootBlockNode.textContent?.trim() === '' &&
            (rootBlockNode.querySelectorAll ? rootBlockNode.querySelectorAll('img, table, iframe').length === 0 : true);

          if (isEmpty) {
            // Replace empty root blocks with our table
            editorRef.current.insertBefore(frag, rootBlockNode);
            editorRef.current.removeChild(rootBlockNode);
          } else {
            // Sibling insertion
            editorRef.current.insertBefore(frag, rootBlockNode.nextSibling);
          }
        } else {
          // Absolute fallback
          try {
            range.insertNode(frag);
          } catch (_) {
            editorRef.current.appendChild(frag);
          }
        }
      } else {
        // Inline element insertion (links, images, inline tags)
        try {
          range.deleteContents();
        } catch (_) {}

        try {
          range.insertNode(frag);
        } catch (_) {
          // Inline insertion failure fallback, append
          editorRef.current.appendChild(frag);
        }
      }

      // Sync caret and focus selection back inside the first nested cells when table is appended
      if (insertedNodes.length > 0) {
        const firstNode = insertedNodes[0] as HTMLElement;
        const firstCell = (firstNode && firstNode.querySelector) ? (firstNode.querySelector('td, th') as HTMLElement) : null;
        try {
          const newRange = document.createRange();
          if (firstCell) {
            newRange.selectNodeContents(firstCell);
            newRange.collapse(true);
          } else {
            const lastNode = insertedNodes[insertedNodes.length - 1];
            newRange.setStartAfter(lastNode);
            newRange.collapse(true);
          }
          sel.removeAllRanges();
          sel.addRange(newRange);
          lastSelectionRangeRef.current = newRange;
        } catch (_) {
          try {
            const fallbackRange = document.createRange();
            fallbackRange.selectNodeContents(editorRef.current);
            fallbackRange.collapse(false);
            sel.removeAllRanges();
            sel.addRange(fallbackRange);
            lastSelectionRangeRef.current = fallbackRange;
          } catch (_) {}
        }
      }
    }

    try {
      lastCaretOffsetRef.current = getCaretOffset(editorRef.current);
    } catch (_) {}
  }

  function handleFormat(command: string, value?: string) {
    if (command === 'undo') {
      handleUndo();
      return;
    }
    if (command === 'redo') {
      handleRedo();
      return;
    }
    exec(command, value ?? null);
  }

  function handleFontFamily(val: string) {
    setFontFamily(val);
    editorRef.current?.focus();
    restoreSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch (_) {}
    const baseFamily = val.split(',')[0].replace(/["']/g, '').trim();
    document.execCommand('fontName', false, baseFamily);
    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleFontSize(val: number) {
    setFontSize(val);
    editorRef.current?.focus();
    restoreSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch (_) {}

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // Fallback if no specific selection exists
      document.execCommand('fontSize', false, '3');
      const html = editorRef.current?.innerHTML ?? '';
      handleContentChange(html, false);
      saveHistoryStateImmediate(html);
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = val + 'pt';
    try {
      range.surroundContents(span);
    } catch (_) {
      document.execCommand('fontSize', false, '3');
    }
    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleLineSpacing(val: string) {
    setLineSpacing(val);
  }

  function handleTextColour(colour: string) {
    editorRef.current?.focus();
    restoreSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch (_) {}
    document.execCommand('foreColor', false, colour);
    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleHighlight(colour: string) {
    editorRef.current?.focus();
    restoreSelection();
    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch (_) {}
    let ok = document.execCommand('hiliteColor', false, colour);
    if (!ok) {
      document.execCommand('backColor', false, colour);
    }
    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleInsertTable(rows: number, cols: number) {
    let html = '<table style="border-collapse:collapse; width:100%; margin:12px 0; border: 1px solid #CBD2DA;">';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        const borderStyle = 'border: 1px solid #CBD2DA; padding: 10px 12px;';
        if (r === 0) {
          html += `<th style="${borderStyle} background: #F2F4F7; font-weight: 600; min-width: 60px;">&nbsp;</th>`;
        } else {
          html += `<td style="${borderStyle} min-width: 60px;">&nbsp;</td>`;
        }
      }
      html += '</tr>';
    }
    html += '</table><p><br></p>';
    insertHtmlAtCaret(html);
    const updatedHtml = editorRef.current?.innerHTML ?? '';
    handleContentChange(updatedHtml, false);
    saveHistoryStateImmediate(updatedHtml);
  }

  function handleInsertLink(href: string, label: string) {
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      try {
        document.execCommand('createLink', false, href);
        const range = sel.getRangeAt(0);
        let container = range.commonAncestorContainer as HTMLElement;
        if (container.nodeType === Node.TEXT_NODE) {
          container = container.parentElement as HTMLElement;
        }
        if (container && container.tagName === 'A') {
          container.setAttribute('target', '_blank');
          container.setAttribute('rel', 'noopener noreferrer');
        } else {
          const links = (container as HTMLElement).querySelectorAll?.('a') || [];
          links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          });
        }
      } catch (_) {
        const text = sel.toString();
        insertHtmlAtCaret(`<a href="${href}" target="_blank" rel="noopener noreferrer">${text || label}</a>`);
      }
    } else {
      insertHtmlAtCaret(`<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    }
    const updatedHtml = editorRef.current?.innerHTML ?? '';
    handleContentChange(updatedHtml, false);
    saveHistoryStateImmediate(updatedHtml);
  }

  function handleInsertImage(src: string, alt: string) {
    insertHtmlAtCaret(`<img src="${src}" alt="${alt}" style="max-width:100%; height:auto; border-radius:4px; display:block; margin:8px auto; width:100%;"/>`);
    const updatedHtml = editorRef.current?.innerHTML ?? '';
    handleContentChange(updatedHtml, false);
    saveHistoryStateImmediate(updatedHtml);
  }

  function handleInsertBlockquote() {
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    const text = sel && !sel.isCollapsed ? sel.toString() : 'Blockquote text here...';
    insertHtmlAtCaret(`<blockquote style="border-left:4px solid #E85D00; margin:12px 0; padding:8px 16px; color:#5B6474; font-style:italic; background:#FFF3EB;">${text}</blockquote><p><br></p>`);
    const updatedHtml = editorRef.current?.innerHTML ?? '';
    handleContentChange(updatedHtml, false);
    saveHistoryStateImmediate(updatedHtml);
  }

  function handleInsertHR() {
    insertHtmlAtCaret('<hr style="border:none; border-top:2px solid #EFF1F3; margin:24px 0;"/><p><br></p>');
    const updatedHtml = editorRef.current?.innerHTML ?? '';
    handleContentChange(updatedHtml, false);
    saveHistoryStateImmediate(updatedHtml);
  }

  function handleClearFormat() {
    editorRef.current?.focus();
    restoreSelection();

    // 1. Run basic standard clear formatting
    try {
      document.execCommand('removeFormat', false, undefined);
    } catch (_) {}

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (!range.collapsed) {
        // We have a selection! Let's find all element nodes within the common ancestor container.
        const container = range.commonAncestorContainer;
        const root = container.nodeType === Node.ELEMENT_NODE ? (container as HTMLElement) : container.parentElement;
        
        if (root) {
          const els = Array.from(root.querySelectorAll('*'));
          // Always include the root element if it intersects with selection
          if (root !== editorRef.current) {
            els.push(root);
          }
          
          els.forEach(el => {
            if (sel.containsNode(el, true)) {
              const tagName = el.tagName.toLowerCase();
              // Remove formatting styling and elements
              if (['span', 'font', 'b', 'strong', 'i', 'em', 'u', 'strike', 's', 'del', 'mark'].includes(tagName)) {
                el.removeAttribute('style');
                el.removeAttribute('class');
                // Clean the inline wrappers by unwrapping them if they have no other roles
                const pNode = el.parentNode;
                if (pNode && pNode !== el) {
                  const r = document.createRange();
                  r.selectNode(el);
                  if (range.intersectsNode(el)) {
                    while (el.firstChild) {
                      pNode.insertBefore(el.firstChild, el);
                    }
                    pNode.removeChild(el);
                  }
                }
              } else if (!['table', 'tr', 'td', 'th', 'img'].includes(tagName)) {
                // Strip styling on custom blocks (headings, paragraphs, blockquotes)
                el.removeAttribute('style');
                el.removeAttribute('class');
              } else if (tagName === 'td' || tagName === 'th') {
                // Keep clean simple table borders
                el.setAttribute('style', 'border: 1px solid #CBD2DA; padding: 10px 12px;');
              }
            }
          });
        }
      } else {
        // Collapsed selection: clear formatting of the current paragraph block
        let node = sel.anchorNode;
        if (node) {
          let el: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
          while (el && el !== editorRef.current && !['p', 'div', 'h1', 'h2', 'h3', 'li', 'td', 'th', 'blockquote', 'pre'].includes(el.tagName.toLowerCase())) {
            el = el.parentElement;
          }
          if (el && el !== editorRef.current) {
            el.removeAttribute('style');
            el.removeAttribute('class');
            
            const subEls = Array.from(el.querySelectorAll('*'));
            subEls.forEach(sub => {
              const subTagName = sub.tagName.toLowerCase();
              if (['span', 'font', 'b', 'strong', 'i', 'em', 'u', 'strike', 's', 'del', 'mark'].includes(subTagName)) {
                sub.removeAttribute('style');
                sub.removeAttribute('class');
                // Unwrap
                const pNode = sub.parentNode;
                if (pNode) {
                  while (sub.firstChild) {
                    pNode.insertBefore(sub.firstChild, sub);
                  }
                  pNode.removeChild(sub);
                }
              } else {
                sub.removeAttribute('style');
                sub.removeAttribute('class');
              }
            });
            
            // If it is H1/H2/H3, transition it to a clean paragraph block
            const tName = el.tagName.toLowerCase();
            if (['h1', 'h2', 'h3'].includes(tName)) {
              const p = document.createElement('p');
              while (el.firstChild) {
                p.appendChild(el.firstChild);
              }
              el.parentNode?.replaceChild(p, el);
            }
          }
        }
      }
    }

    const html = editorRef.current?.innerHTML ?? '';
    handleContentChange(html, false);
    saveHistoryStateImmediate(html);
  }

  function handleSelectTemplate(html: string, font: string, spacing: string) {
    setDocBaseFont(font);
    setFontFamily(font);
    setLineSpacing(spacing);
    handleContentChange(html, false);
    historyRef.current = [{ html, caretOffset: 0 }];
    historyIndexRef.current = 0;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Dynamic margins styling overrides for the editor elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        #editor-canvas h1 { margin-top: ${hMarginTop}px !important; margin-bottom: ${hMarginBottom}px !important; }
        #editor-canvas h2 { margin-top: ${hMarginTop}px !important; margin-bottom: ${hMarginBottom}px !important; }
        #editor-canvas h3 { margin-top: ${hMarginTop}px !important; margin-bottom: ${hMarginBottom}px !important; }
        #editor-canvas p { margin-bottom: ${paraMargin}px !important; }
        #editor-canvas td, #editor-canvas th { padding: 10px 12px !important; }
      `}} />

      {/* Dynamic format row toolbars */}
      <div style={{
        position: 'sticky',
        top: 52,
        zIndex: 100,
        background: 'var(--bg-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <ToolbarRow1
          onNew={onNew}
          onOpen={onOpen}
          onSaveLocal={onSaveLocal}
          onSaveDrive={onSaveDrive}
          onExport={() => setShowExport(true)}
          onToggleFindReplace={() => setShowFindReplace(v => !v)}
          findReplaceOpen={showFindReplace}
          onWordCount={() => setShowWordCount(true)}
          wordCount={wordCount}
          onOpenTemplates={() => setShowTemplates(true)}
          zoom={zoom}
          setZoom={setZoom}
          autoFit={autoFit}
          setAutoFit={setAutoFit}
          scale={calculatedScale}
          onOpenIntegration={() => setShowIntegration(true)}
          hideTemplates={hideTemplates}
        />
        {!hideToolbar && (
          <ToolbarRow2
            fontFamily={fontFamily}
            onFontFamily={handleFontFamily}
            fontSize={fontSize}
            onFontSize={handleFontSize}
            lineSpacing={lineSpacing}
            onLineSpacing={handleLineSpacing}
            onFormat={handleFormat}
            onTextColour={handleTextColour}
            onHighlight={handleHighlight}
            onInsertTable={handleInsertTable}
            onInsertLink={() => setShowLink(true)}
            onInsertImage={() => setShowImage(true)}
            onInsertBlockquote={handleInsertBlockquote}
            onInsertHR={handleInsertHR}
            onClearFormat={handleClearFormat}
            pageSetupOpen={showPageSetup}
            onTogglePageSetup={() => setShowPageSetup(v => !v)}
          />
        )}
        {focusedCell && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '8px 16px',
            background: 'var(--accent-light)',
            borderBottom: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px', color: '#B34700' }}>
              <Table size={16} />
              Table Selected:
            </span>
            <button
              onClick={() => handleTableInsertRow(true)}
              style={{
                background: '#ffffff',
                border: '1px solid currentColor',
                color: 'var(--accent-primary)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.12s',
              }}
              title="Insert row directly above current cell"
            >
              + Row Above
            </button>
            <button
              onClick={() => handleTableInsertRow(false)}
              style={{
                background: '#ffffff',
                border: '1px solid currentColor',
                color: 'var(--accent-primary)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.12s',
              }}
              title="Insert row directly below current cell"
            >
              + Row Below
            </button>
            <button
              onClick={() => handleTableInsertCol(false)}
              style={{
                background: '#ffffff',
                border: '1px solid currentColor',
                color: 'var(--accent-primary)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.12s',
              }}
              title="Insert column directly left of current cell"
            >
              + Col Left
            </button>
            <button
              onClick={() => handleTableInsertCol(true)}
              style={{
                background: '#ffffff',
                border: '1px solid currentColor',
                color: 'var(--accent-primary)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.12s',
              }}
              title="Insert column directly right of current cell"
            >
              + Col Right
            </button>
  
            <div style={{ width: '1px', height: '16px', background: '#E85D0030', margin: '0 4px' }} />
  
            <button
              onClick={handleTableDeleteRow}
              style={{
                background: '#FFF0F0',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.12s',
              }}
              title="Delete currently focused table row"
            >
              Delete Row
            </button>
            <button
              onClick={handleTableDeleteCol}
              style={{
                background: '#FFF0F0',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.12s',
              }}
              title="Delete currently focused table column"
            >
              Delete Col
            </button>
            <button
              onClick={handleTableDeleteTable}
              style={{
                background: '#FFF0F0',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all 0.12s',
              }}
              title="Delete the entire table"
            >
              Delete Table
            </button>
  
            <div style={{ width: '1px', height: '16px', background: '#E85D0030', margin: '0 4px' }} />
  
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cell BG:</span>
              {['#FFFFFF', '#F2F4F7', '#FFEFE6', '#E6F4EA', '#FCE8E6', '#FEF7E0', '#E8F0FE'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleTableCellBg(c)}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: c,
                    border: focusedCell.style.background === c || (c === '#FFFFFF' && !focusedCell.style.background) ? '2px solid var(--accent-primary)' : '1px solid #CBD2DA',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'transform 0.1s hover',
                  }}
                  title={`Set cell background to ${c}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spacing & Page layout controller bar */}
      {showPageSetup && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          padding: '12px 18px',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--bg-tertiary)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {/* Paragraph spacing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '30px', width: '140.953125px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', height: '32px', width: '130.265625px' }}>
                Paragraph Spacing: <span style={{ color: '#E85D00' }}>{paraMargin}px</span>
              </label>
              <input
                type="range"
                min="4"
                max="32"
                value={paraMargin}
                onChange={(e) => setParaMargin(Number(e.target.value))}
                style={{ width: 130, accentColor: '#E85D00', cursor: 'ew-resize' }}
              />
            </div>

            {/* Header top spacing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '32px', width: '130.265625px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', height: '32px' }}>
                Headers Top Space: <span style={{ color: '#E85D00' }}>{hMarginTop}px</span>
              </label>
              <input
                type="range"
                min="8"
                max="48"
                value={hMarginTop}
                onChange={(e) => setHMarginTop(Number(e.target.value))}
                style={{ width: 130, accentColor: '#E85D00', cursor: 'ew-resize' }}
              />
            </div>

            {/* Header bottom spacing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: '130.265625px', height: '32px' }}>
                Headers Bottom Space: <span style={{ color: '#E85D00' }}>{hMarginBottom}px</span>
              </label>
              <input
                type="range"
                min="4"
                max="32"
                value={hMarginBottom}
                onChange={(e) => setHMarginBottom(Number(e.target.value))}
                style={{ width: 130, accentColor: '#E85D00', cursor: 'ew-resize' }}
              />
            </div>

            {/* Page side margins */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', width: '130.265625px', height: '32px' }}>
                Page Side Margins (A4): <span style={{ color: '#E85D00' }}>{pageMargin}px</span>
              </label>
              <input
                type="range"
                min="40"
                max="140"
                value={pageMargin}
                onChange={(e) => setPageMargin(Number(e.target.value))}
                style={{ width: '130px', accentColor: '#E85D00', cursor: 'ew-resize' }}
              />
            </div>
          </div>

          <button
            title="Reset paragraph, header, and page margins to standard A4 defaults"
            onClick={() => {
              setParaMargin(12);
              setHMarginTop(20);
              setHMarginBottom(10);
              setPageMargin(80);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--bg-tertiary)',
              borderRadius: 6,
              cursor: 'pointer',
              width: '113.171875px',
              height: '32px',
            }}
          >
            Reset Defaults
          </button>
        </div>
      )}

      {/* Surface edit canvas */}
      <EditorCanvas
        ref={editorRef}
        content={content}
        onChange={(html) => handleContentChange(html, true)}
        fontFamily={docBaseFont}
        lineSpacing={lineSpacing}
        pageMargin={pageMargin}
        zoom={zoom}
        setZoom={setZoom}
        autoFit={autoFit}
        setAutoFit={setAutoFit}
        onScaleChange={setCalculatedScale}
        readonly={readonly}
        placeholder={placeholder}
      />

      {/* Interactivity overlay popover for clicked images */}
      {activeImage && (
        <ImageEditPopover
          imgEl={activeImage}
          onUpdate={(width, align, src) => {
            if (width) activeImage.style.width = width;
            if (align) {
              if (align === 'center') {
                activeImage.style.display = 'block';
                activeImage.style.marginLeft = 'auto';
                activeImage.style.marginRight = 'auto';
              } else if (align === 'left') {
                activeImage.style.display = 'block';
                activeImage.style.marginLeft = '0';
                activeImage.style.marginRight = 'auto';
              } else if (align === 'right') {
                activeImage.style.display = 'block';
                activeImage.style.marginLeft = 'auto';
                activeImage.style.marginRight = '0';
              }
            }
            if (src) activeImage.src = src;
            handleContentChange(editorRef.current?.innerHTML ?? '', false);
            saveHistoryStateImmediate(editorRef.current?.innerHTML ?? '');
          }}
          onDelete={() => {
            activeImage.remove();
            setActiveImage(null);
            handleContentChange(editorRef.current?.innerHTML ?? '', false);
            saveHistoryStateImmediate(editorRef.current?.innerHTML ?? '');
          }}
          onClose={() => setActiveImage(null)}
        />
      )}

      {/* Overlay Dialogs */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        content={content}
        documentTitle={documentTitle}
      />
      {showIntegration && (
        <IntegrationModal
          currentHtml={content}
          onClose={() => setShowIntegration(false)}
        />
      )}
      <TemplateModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleSelectTemplate}
        currentContent={content}
        currentFontFamily={fontFamily}
        currentLineSpacing={lineSpacing}
      />
      <LinkModal
        isOpen={showLink}
        onInsert={handleInsertLink}
        onClose={() => setShowLink(false)}
      />
      <ImageModal
        isOpen={showImage}
        onInsert={handleInsertImage}
        onClose={() => setShowImage(false)}
      />
      {showWordCount && (
        <WordCountModal
          content={content}
          onClose={() => setShowWordCount(false)}
        />
      )}
      {showFindReplace && (
        <FindReplacePanel
          editorRef={editorRef}
          onClose={() => setShowFindReplace(false)}
        />
      )}
    </div>
  );
}
