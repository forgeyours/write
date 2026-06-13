// ============================================================
// FILE: src/components/write/modals/ExportModal.tsx
// PURPOSE: Multi-format client-side exporter (DOCX, PDF, Page, HTML, TXT, ODT, RTF)
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState } from 'react';
import { X, FileCode, Printer, FileText, File } from 'lucide-react';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { 
      font-family: Georgia, serif; 
      font-size: 12pt; 
      line-height: 1.8;
      color: #1A1D23; 
      max-width: 760px; 
      margin: 60px auto; 
      padding: 0 48px; 
    }
    h1 { font-size: 2rem; margin: 1.4em 0 0.4em; }
    h2 { font-size: 1.5rem; margin: 1.2em 0 0.3em; }
    h3 { font-size: 1.15rem; margin: 1em 0 0.3em; }
    p  { margin: 0.7em 0; }
    blockquote { 
      border-left: 4px solid #E85D00; 
      margin: 1em 0;
      padding: 0.5em 1em; 
      color: #5B6474; 
      font-style: italic; 
    }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    td, th { border: 1px solid #CBD2DA; padding: 8px 12px; }
    th { background: #F7F8FA; font-weight: 600; }
    hr { border: none; border-top: 2px solid #EFF1F3; margin: 2em 0; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    a { color: #E85D00; }
    @media print {
      body { margin: 0; padding: 20px 40px; }
      @page { margin: 2cm; }
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function htmlToRtf(html: string): string {
  let rtf = html;

  rtf = rtf.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '{\\b $2}');
  rtf = rtf.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '{\\i $2}');
  rtf = rtf.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '{\\ul $2}');
  rtf = rtf.replace(/<(s|strike|del)[^>]*>([\s\S]*?)<\/(s|strike|del)>/gi, '{\\strike $2}');
  rtf = rtf.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\\pard\\sb240\\sa120{\\b\\fs40 $1}\\par\n');
  rtf = rtf.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\\pard\\sb200\\sa100{\\b\\fs32 $1}\\par\n');
  rtf = rtf.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\\pard\\sb160\\sa80{\\b\\fs28 $1}\\par\n');
  rtf = rtf.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\\pard\\sa120 $1\\par\n');
  rtf = rtf.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\\pard\\li360\\bullet\\tab $1\\par\n');
  rtf = rtf.replace(/<br\s*\/?>/gi, '\\line\n');
  rtf = rtf.replace(/<hr\s*\/?>/gi, '\\pard\\brdrb\\brdrs\\brdrw10\\brsp20\\par\n');
  
  rtf = rtf.replace(/<[^>]+>/g, '');
  rtf = rtf
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  rtf = rtf
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');

  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\froman\\fcharset0 Georgia;}{\\f1\\fswiss\\fcharset0 Arial;}}
{\\colortbl;\\red26\\green29\\blue35;}
\\f0\\fs24\\cf1
${rtf}
}`;
}

async function generateOdt(title: string, html: string): Promise<Blob> {
  const plainText = htmlToPlainText(html);

  const mimetypeContent = 'application/vnd.oasis.opendocument.text';

  const manifestContent = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="meta.xml"/>
  <manifest:file-entry manifest:media-type="text/xml" manifest:full-path="styles.xml"/>
</manifest:manifest>`;

  const metaContent = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/" office:version="1.3">
  <office:meta>
    <dc:title>${title}</dc:title>
  </office:meta>
</office:document-meta>`;

  const stylesContent = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  office:version="1.3">
  <office:styles>
    <style:default-style style:family="paragraph">
      <style:paragraph-properties fo:margin-top="0.2cm" fo:margin-bottom="0.2cm" fo:line-height="1.8"/>
      <style:text-properties" fo:font-size="12pt" fo:font-family="Georgia"/>
    </style:default-style>
  </office:styles>
</office:document-styles>`;

  const lines = plainText.split('\n').filter(l => l.trim());
  const paragraphs = lines.map(l =>
    `<text:p xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">${
      l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    }</text:p>`
  ).join('\n');

  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  office:version="1.3">
  <office:body>
    <office:text>
      ${paragraphs}
    </office:text>
  </office:body>
</office:document-content>`;

  const zip = new JSZip();
  zip.file('mimetype', mimetypeContent, { compression: 'STORE' });
  zip.folder('META-INF')?.file('manifest.xml', manifestContent);
  zip.file('meta.xml', metaContent);
  zip.file('styles.xml', stylesContent);
  zip.file('content.xml', contentXml);

  return await zip.generateAsync({ type: 'blob' });
}

async function generateDocx(title: string, html: string): Promise<Blob> {
  const plain = htmlToPlainText(html);
  const lines = plain.split('\n');

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const children: any[] = [];

  function nodeToRuns(el: ChildNode) {
    const runs: TextRun[] = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        if (node.textContent?.trim()) {
          runs.push(new TextRun({ text: node.textContent }));
        }
      } else if (node.nodeType === 1) {
        const elNode = node as HTMLElement;
        const tag = elNode.tagName.toLowerCase();
        const bold = ['b','strong'].includes(tag);
        const italics = ['i','em'].includes(tag);
        const underline = tag === 'u' ? { type: 'single' } : undefined;
        runs.push(new TextRun({
          text: elNode.textContent || '',
          bold,
          italics,
          underline: underline as any,
        }));
      }
    });
    return runs.length ? runs : [new TextRun({ text: el.textContent || '' })];
  }

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType !== 1) return;
    const elNode = node as HTMLElement;
    const tag = elNode.tagName?.toLowerCase();
    if (tag === 'h1') {
      children.push(new Paragraph({ text: elNode.textContent || '', heading: HeadingLevel.HEADING_1 }));
    } else if (tag === 'h2') {
      children.push(new Paragraph({ text: elNode.textContent || '', heading: HeadingLevel.HEADING_2 }));
    } else if (tag === 'h3') {
      children.push(new Paragraph({ text: elNode.textContent || '', heading: HeadingLevel.HEADING_3 }));
    } else if (tag === 'ul') {
      elNode.querySelectorAll('li').forEach(li => {
        children.push(new Paragraph({ text: '• ' + (li.textContent || '') }));
      });
    } else if (tag === 'ol') {
      let i = 0;
      elNode.querySelectorAll('li').forEach(li => {
        i++;
        children.push(new Paragraph({ text: `${i}. ${li.textContent || ''}` }));
      });
    } else {
      const runs = nodeToRuns(elNode);
      if (runs.length) children.push(new Paragraph({ children: runs }));
    }
  });

  if (!children.length) {
    lines.forEach(l => {
      if (l.trim()) children.push(new Paragraph({ text: l }));
    });
  }

  const wordDoc = new Document({
    sections: [{ properties: {}, children }],
  });

  return await Packer.toBlob(wordDoc);
}

// Minimalist pages builder
async function generatePages(title: string, html: string): Promise<Blob> {
  const plain = htmlToPlainText(html);

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>DocumentVersion</key><integer>11</integer>
  <key>CreationDate</key><string>${new Date().toISOString()}</string>
  <key>Author</key><string>ForgeYours Write</string>
</dict>
</plist>`;

  const buildDir = `<?xml version="1.0" encoding="UTF-8"?>
<sl:build xmlns:sl="http://developer.apple.com/namespaces/sl">
  <sl:meta sl:generator="Pages"/>
</sl:build>`;

  const paragraphs = plain.split('\n')
    .filter(l => l.trim())
    .map(l =>
      `<sf:p sf:style="paragraph-style-default">` +
      `<sf:span sf:style="character-style-default">${
        l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      }</sf:span></sf:p>`
    ).join('\n');

  const bodyXml = `<?xml version="1.0" encoding="UTF-8"?>
<sl:document xmlns:sl="http://developer.apple.com/namespaces/sl"
  xmlns:sf="http://developer.apple.com/namespaces/sf"
  sl:version="92748">
  <sl:publication-info sl:app-name="Pages" sl:app-version="12.2"/>
  <sl:metadata>
    <sf:authors><sf:author sf:name="ForgeYours Write"/></sf:authors>
    <sf:title>${title.replace(/&/g,'&amp;')}</sf:title>
  </sl:metadata>
  <sl:section>
    <sl:layout>
      <sf:body>${paragraphs}</sf:body>
    </sl:layout>
  </sl:section>
</sl:document>`;

  const zip = new JSZip();
  zip.file('index.xml', indexXml);
  zip.file('buildVersionHistory.plist', buildDir);
  zip.folder('Data');
  const preview = zip.folder('QuickLook');
  preview?.file('Thumbnail.jpg', '');
  preview?.file('Preview.pdf', '');
  zip.file('document.xml', bodyXml);

  return await zip.generateAsync({ type: 'blob' });
}

function triggerDownload(filename: string, blobOrContent: Blob | string, mimeType: string) {
  const blob = blobOrContent instanceof Blob
    ? blobOrContent
    : new Blob([blobOrContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const FORMATS = [
  {
    id: 'docx',
    label: 'Word Document',
    ext: '.docx',
    description: 'Microsoft Word — industry standard editing layout',
    icon: File,
    color: '#2B5CA8',
    badge: 'Highly portable',
  },
  {
    id: 'pdf',
    label: 'PDF Document',
    ext: '.pdf',
    description: 'Preserves design structure — ideal for contracts and printing',
    icon: Printer,
    color: '#C62828',
    badge: null,
  },
  {
    id: 'html',
    label: 'Web Archive',
    ext: '.html',
    description: 'Pure web page preserving exact custom CSS formatting',
    icon: FileCode,
    color: '#E85D00',
    badge: null,
  },
  {
    id: 'txt',
    label: 'Plain Text',
    ext: '.txt',
    description: 'Strips out all styling — perfect offline compatibility',
    icon: FileText,
    color: '#6B7280',
    badge: null,
  },
  {
    id: 'odt',
    label: 'OpenDocument Text',
    ext: '.odt',
    description: 'Compatible with LibreOffice, OpenOffice & Google Docs',
    icon: File,
    color: '#059669',
    badge: null,
  },
  {
    id: 'rtf',
    label: 'Rich Text Format',
    ext: '.rtf',
    description: 'Maintains simple sizing and format attributes',
    icon: FileText,
    color: '#7C3AED',
    badge: null,
  },
  {
    id: 'pages',
    label: 'Apple Pages',
    ext: '.pages',
    description: 'Optimized for Apple Pages, iPad, & iOS ecosystems',
    icon: File,
    color: '#F59E0B',
    badge: null,
  },
];

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  documentTitle: string;
}

export default function ExportModal({ isOpen, onClose, content, documentTitle }: ExportModalProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const safeTitle = documentTitle?.trim() || 'document';
  const safeFilename = safeTitle.replace(/[^a-z0-9_\-\s]/gi, '').trim() || 'document';

  async function handleExport(formatId: string) {
    setExporting(formatId);
    try {
      if (formatId === 'html') {
        triggerDownload(`${safeFilename}.html`, wrapHtml(safeTitle, content), 'text/html');
        onClose();
      } else if (formatId === 'txt') {
        triggerDownload(`${safeFilename}.txt`, htmlToPlainText(content), 'text/plain');
        onClose();
      } else if (formatId === 'rtf') {
        triggerDownload(`${safeFilename}.rtf`, htmlToRtf(content), 'application/rtf');
        onClose();
      } else if (formatId === 'pdf') {
        const pw = window.open('', '_blank');
        if (pw) {
          pw.document.write(wrapHtml(safeTitle, content));
          pw.document.close();
          pw.focus();
          setTimeout(() => {
            pw.print();
          }, 300);
        }
        onClose();
      } else if (formatId === 'docx') {
        const blob = await generateDocx(safeTitle, content);
        triggerDownload(`${safeFilename}.docx`, blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        onClose();
      } else if (formatId === 'odt') {
        const blob = await generateOdt(safeTitle, content);
        triggerDownload(`${safeFilename}.odt`, blob, 'application/vnd.oasis.opendocument.text');
        onClose();
      } else if (formatId === 'pages') {
        const blob = await generatePages(safeTitle, content);
        triggerDownload(`${safeFilename}.pages`, blob, 'application/x-iwork-pages-sffpages');
        onClose();
      }
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <>
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

      <div style={{
        position: 'fixed', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 1001,
        background: 'var(--bg-primary)',
        borderRadius: 14, 
        padding: '24px 24px 20px',
        width: '100%', 
        maxWidth: 440,
        boxShadow: '0 10px 48px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', 
          alignItems: 'flex-start',
          justifyContent: 'space-between', 
          marginBottom: 16,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Export document
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {safeTitle}
            </div>
          </div>
          <button 
            title="Close export modal"
            onClick={onClose} 
            style={{
              width: 28, 
              height: 28, 
              border: 'none', 
              borderRadius: 6,
              background: 'var(--bg-secondary)', 
              cursor: 'pointer',
              color: 'var(--text-muted)', 
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Format list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '350px', overflowY: 'auto' }}>
          {FORMATS.map(fmt => {
            const Icon = fmt.icon;
            const loading = exporting === fmt.id;
            return (
              <button
                key={fmt.id}
                title={`Export document as ${fmt.label} (${fmt.ext})`}
                onClick={() => handleExport(fmt.id)}
                disabled={!!exporting}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  padding: '11px 14px',
                  border: '1.5px solid var(--bg-tertiary)',
                  borderRadius: 9,
                  background: 'var(--bg-primary)',
                  cursor: exporting ? 'wait' : 'pointer',
                  textAlign: 'left',
                  opacity: exporting && !loading ? 0.5 : 1,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!exporting) {
                    e.currentTarget.style.borderColor = fmt.color;
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.background = 'var(--bg-primary)';
                }}
              >
                <div style={{
                  width: 34, 
                  height: 34, 
                  borderRadius: 8, 
                  flexShrink: 0,
                  background: fmt.color + '18',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                }}>
                  {loading
                    ? <span style={{ fontSize: '0.7rem', color: fmt.color }}>…</span>
                    : <Icon size={16} color={fmt.color} />
                  }
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontWeight: 600, 
                      fontSize: '0.88rem',
                      color: 'var(--text-primary)',
                    }}>
                      {fmt.label}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', 
                      color: 'var(--text-muted)',
                    }}>
                      {fmt.ext}
                    </span>
                    {fmt.badge && (
                      <span style={{
                        fontSize: '0.65rem', 
                        fontWeight: 700,
                        background: fmt.color + '22', 
                        color: fmt.color,
                        padding: '1px 6px', 
                        borderRadius: 20,
                      }}>
                        {fmt.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                    {fmt.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 14, 
          fontSize: '0.73rem',
          color: 'var(--text-muted)', 
          textAlign: 'center',
        }}>
          PDF will open your browser's print dialog — choose "Save as PDF"
        </div>
      </div>
    </>
  );
}
