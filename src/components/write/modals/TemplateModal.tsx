// ============================================================
// FILE: src/components/write/modals/TemplateModal.tsx
// PURPOSE: Interactive Document Template Catalog & Live Previewer
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { X, Layout, Check, FileText, Trash2, Plus, Pencil } from 'lucide-react';
import { DOCUMENT_TEMPLATES, DocumentTemplate } from '../../../data/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (html: string, fontFamily: string, lineSpacing: string) => void;
  currentContent: string;
  currentFontFamily: string;
  currentLineSpacing: string;
}

export default function TemplateModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentContent,
  currentFontFamily,
  currentLineSpacing
}: TemplateModalProps) {
  const [customTemplates, setCustomTemplates] = useState<DocumentTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('forgeyours_custom_templates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const allTemplates = [...DOCUMENT_TEMPLATES, ...customTemplates];
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(DOCUMENT_TEMPLATES[0]);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // States for Editing Custom Templates
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateDesc, setEditTemplateDesc] = useState('');
  const [editOverwriteWithCurrentDoc, setEditOverwriteWithCurrentDoc] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Sync selected template if it is deleted or when custom list updates
  useEffect(() => {
    if (isOpen && allTemplates.length > 0) {
      const stillExists = allTemplates.find(t => t.name === selectedTemplate?.name);
      if (!stillExists) {
        setSelectedTemplate(allTemplates[0]);
      }
    }
  }, [isOpen, customTemplates]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  function handleApply() {
    const textOnly = currentContent.replace(/<[^>]+>/g, '').trim();
    if (textOnly.length > 50) {
      setShowConfirmOverwrite(true);
      return;
    }
    onSelect(selectedTemplate.content, selectedTemplate.fontFamily, selectedTemplate.lineSpacing);
    onClose();
  }

  function saveCustomTemplate() {
    const trimmedName = newTemplateName.trim();
    if (!trimmedName) return;

    if (allTemplates.some(t => t.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('A template with this name already exists. Please choose a unique name.');
      return;
    }

    const newTmpl: DocumentTemplate = {
      name: trimmedName,
      description: 'Custom user outline saved from active editor content.',
      content: currentContent,
      fontFamily: currentFontFamily || 'Inter, sans-serif',
      lineSpacing: currentLineSpacing || '1.5',
      isCustom: true,
    };

    const updatedList = [...customTemplates, newTmpl];
    setCustomTemplates(updatedList);
    try {
      localStorage.setItem('forgeyours_custom_templates', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    
    setSelectedTemplate(newTmpl);
    setIsCreatingCustom(false);
    setNewTemplateName('');
  }

  function deleteCustomTemplate(name: string) {
    const updatedList = customTemplates.filter(t => t.name !== name);
    setCustomTemplates(updatedList);
    try {
      localStorage.setItem('forgeyours_custom_templates', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    
    if (selectedTemplate.name === name) {
      setSelectedTemplate(DOCUMENT_TEMPLATES[0]);
    }
  }

  function saveEditedTemplate() {
    if (!editingTemplate) return;
    const trimmedName = editTemplateName.trim();
    if (!trimmedName) {
      alert('Please enter a valid template name.');
      return;
    }

    const nameConflict = allTemplates.some(
      t => t.name.toLowerCase() === trimmedName.toLowerCase() && t.name !== editingTemplate.name
    );
    if (nameConflict) {
      alert('A template with this name already exists. Please choose a unique name.');
      return;
    }

    const updatedList = customTemplates.map((t) => {
      if (t.name === editingTemplate.name) {
        return {
          ...t,
          name: trimmedName,
          description: editTemplateDesc.trim() || 'Custom user outline saved from active editor content.',
          content: editOverwriteWithCurrentDoc ? currentContent : t.content,
          fontFamily: editOverwriteWithCurrentDoc ? (currentFontFamily || 'Inter, sans-serif') : t.fontFamily,
          lineSpacing: editOverwriteWithCurrentDoc ? (currentLineSpacing || '1.5') : t.lineSpacing,
        };
      }
      return t;
    });

    setCustomTemplates(updatedList);
    try {
      localStorage.setItem('forgeyours_custom_templates', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }

    const revised = updatedList.find(t => t.name === trimmedName);
    if (revised) {
      setSelectedTemplate(revised);
    }

    setEditingTemplate(null);
  }

  return (
    <>
      {/* Background Overlay */}
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

      {/* Main Modal Chamber */}
      <div style={{
        position: 'fixed', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 1001,
        background: 'var(--bg-primary)',
        borderRadius: 14, 
        padding: '24px',
        width: '90%', 
        maxWidth: 780,
        height: '80vh',
        maxHeight: 640,
        boxShadow: '0 12px 60px rgba(0,0,0,0.22)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Custom OVERWRITE Warning Dialog Overlay */}
        {showConfirmOverwrite && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(26,29,35,0.7)',
            zIndex: 1002,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(2px)',
          }}>
            <div style={{
              background: 'var(--bg-primary)',
              padding: '24px',
              borderRadius: 12,
              maxWidth: 400,
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
              border: '1px solid var(--bg-tertiary)',
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
                Overwrite Document?
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: '1.5' }}>
                Loading "<strong>{selectedTemplate.name}</strong>" will completely overwrite your current document content. This action cannot be undone. Are you sure you want to proceed?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => setShowConfirmOverwrite(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSelect(selectedTemplate.content, selectedTemplate.fontFamily, selectedTemplate.lineSpacing);
                    setShowConfirmOverwrite(false);
                    onClose();
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#E85D00',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  Yes, Overwrite
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom EDIT Template Dialog Overlay */}
        {editingTemplate && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(26,29,35,0.7)',
            zIndex: 1002,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(2px)',
          }}>
            <div style={{
              background: 'var(--bg-primary)',
              padding: '24px',
              borderRadius: 12,
              maxWidth: 450,
              width: '100%',
              boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
              border: '1px solid var(--bg-tertiary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: 10, textAlign: 'left' }}>
                Edit Custom Template
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  value={editTemplateName}
                  onChange={e => setEditTemplateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Template name"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Description
                </label>
                <textarea
                  value={editTemplateDesc}
                  onChange={e => setEditTemplateDesc(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: 6,
                    color: 'var(--text-primary)',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Brief description of when to use this template outline..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, textAlign: 'left', background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--bg-tertiary)' }}>
                <input
                  type="checkbox"
                  id="update-content-checkbox"
                  checked={editOverwriteWithCurrentDoc}
                  onChange={e => setEditOverwriteWithCurrentDoc(e.target.checked)}
                  style={{ marginTop: 3, cursor: 'pointer' }}
                />
                <label htmlFor="update-content-checkbox" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                  <strong>Update structure & styles:</strong> Replace this template's draft structure and font configurations with the active document's current content and layout styles.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
                <button
                  onClick={() => setEditingTemplate(null)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedTemplate}
                  style={{
                    padding: '8px 20px',
                    background: '#E85D00',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(232, 93, 0, 0.25)',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div style={{
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between', 
          marginBottom: 20,
          borderBottom: '1px solid var(--bg-tertiary)',
          paddingBottom: 14,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layout size={20} color="#E85D00" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Template Catalog
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select a pre-formatted structure to accelerate your work
              </div>
            </div>
          </div>
          <button 
            title="Close template catalog"
            onClick={onClose} 
            style={{
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              border: 'none', 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
          >
            <X size={15} />
          </button>
        </div>

        {/* Catalog Body Block */}
        <div style={{
          display: 'flex',
          flex: 1,
          gap: 20,
          minHeight: 0, // critical for nested flex scrolls
        }}>
          {/* Left Navigation Tabs: Template options */}
          <div style={{
            width: '180px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--bg-tertiary)',
          }}>
            {/* Scrollable List Container */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              paddingRight: 8,
              marginBottom: 10,
            }}>
              {allTemplates.map((tmpl) => {
                const isSelected = selectedTemplate.name === tmpl.name;
                return (
                  <div
                    key={tmpl.name}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'stretch',
                      width: '100%',
                    }}
                  >
                    <button
                      title={`Preview "${tmpl.name}" document outline`}
                      onClick={() => setSelectedTemplate(tmpl)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        padding: '12px',
                        paddingRight: tmpl.isCustom ? '54px' : '12px',
                        borderRadius: 8,
                        border: isSelected ? '1px solid #E85D00' : '1px solid var(--bg-tertiary)',
                        background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                    >
                      <span style={{ 
                        fontWeight: 600, 
                        fontSize: '0.82rem', 
                        color: isSelected ? '#E85D00' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        wordBreak: 'break-word',
                      }}>
                        <FileText size={14} style={{ flexShrink: 0 }} />
                        {tmpl.name}
                      </span>
                      <span style={{ 
                        fontSize: '0.72rem', 
                        color: 'var(--text-muted)', 
                        marginTop: 4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {tmpl.description}
                      </span>
                    </button>

                    {tmpl.isCustom && (
                      <div style={{
                        position: 'absolute',
                        right: 6,
                        top: '10px',
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        zIndex: 2,
                      }}>
                        {/* Edit Button */}
                        <button
                          title="Edit this custom template"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate(tmpl);
                            setEditTemplateName(tmpl.name);
                            setEditTemplateDesc(tmpl.description || '');
                            setEditOverwriteWithCurrentDoc(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s, background 0.15s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#E85D00';
                            e.currentTarget.style.background = 'rgba(232, 93, 0, 0.08)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <Pencil size={12} />
                        </button>

                        {/* Delete Button */}
                        <button
                          title="Delete this custom template"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomTemplate(tmpl.name);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s, background 0.15s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom Template feature button */}
            {isCreatingCustom ? (
              <div style={{
                padding: '10px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--bg-tertiary)',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0,
                marginRight: 8,
                boxSizing: 'border-box',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Name Custom Template
                </div>
                <input
                  type="text"
                  placeholder="e.g. My Letterhead"
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '0.75rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--bg-tertiary)',
                    borderRadius: 4,
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => {
                      setIsCreatingCustom(false);
                      setNewTemplateName('');
                    }}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      fontSize: '0.7rem',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--bg-tertiary)',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustomTemplate}
                    style={{
                      flex: 1,
                      padding: '4px 0',
                      fontSize: '0.7rem',
                      background: '#E85D00',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                title="Save current editor content and formatting as a custom template"
                onClick={() => setIsCreatingCustom(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px dashed #E85D00',
                  background: 'transparent',
                  color: '#E85D00',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  marginRight: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 93, 0, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={14} />
                Custom Template
              </button>
            )}
          </div>

          {/* Right Preview Side - Maximized to fill 100% of remaining height */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}>
            {/* Micro A4 Paper Preview Container */}
            <div 
              ref={containerRef}
              style={{
                flex: 1,
                background: 'var(--bg-tertiary)',
                borderRadius: 8,
                border: '1px solid var(--bg-tertiary)',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {containerSize.width > 0 && (() => {
                const PAGE_WIDTH = 794;
                const PAGE_HEIGHT = 1123;
                const padding = 20;
                const targetWidth = containerSize.width > padding ? containerSize.width - padding : 300;
                const targetHeight = containerSize.height > padding ? containerSize.height - padding : 400;
                const scale = Math.min(targetWidth / PAGE_WIDTH, targetHeight / PAGE_HEIGHT) || 0.35;

                return (
                  <div style={{
                    position: 'absolute',
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    background: '#ffffff',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    borderRadius: 6,
                    padding: '60px 48px', // beautiful standard margins
                    color: '#2b2d31', // elegant readable slate-charcoal text
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    fontFamily: selectedTemplate.fontFamily,
                    lineHeight: selectedTemplate.lineSpacing === '2.0' ? '2.0' : '1.4',
                    textAlign: 'left',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    overflow: 'hidden',
                  }}
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                  />
                );
              })()}
            </div>
          </div>
        </div>

        {/* Action controls footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginTop: 18,
          borderTop: '1px solid var(--bg-tertiary)',
          paddingTop: 14,
          flexShrink: 0,
        }}>
          {/* Font Details in the Left Corner */}
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div>
              <strong>Font Style:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedTemplate.fontFamily.split(',')[0].replace(/"/g, '')}</span>
            </div>
            <div style={{ width: 1, height: 12, background: 'var(--bg-tertiary)' }} />
            <div>
              <strong>Line Spacing:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedTemplate.lineSpacing}x</span>
            </div>
            <div style={{ width: 1, height: 12, background: 'var(--bg-tertiary)' }} />
            <div style={{ fontSize: '0.7rem', color: '#E85D00', fontWeight: 600 }}>
              A4 View
            </div>
          </div>

          {/* Action buttons in Right Corner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              title="Cancel template catalog"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--bg-tertiary)',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.82rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              Cancel
            </button>
            
            <button
              title="Apply template content, layout and base typography to document"
              onClick={handleApply}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                background: '#E85D00',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                boxShadow: '0 2px 8px rgba(232, 93, 0, 0.25)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1.0'}
            >
              <Check size={14} />
              Apply Template & Styles
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
