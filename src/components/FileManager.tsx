// ============================================================
// FILE: src/components/FileManager.tsx
// PURPOSE: Modal to browse, delete, open files from local IndexedDB and Google Drive syncs
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useEffect } from 'react';
import { X, FileText, Cloud, Trash2, Clock, Loader, Key } from 'lucide-react';
import { listFiles, getFile, deleteFile, SavedFile } from '../lib/localStore';
import {
  listDriveFiles,
  readDriveFile,
  getSavedDriveToken,
  saveDriveToken,
  removeDriveToken,
  DriveDoc,
} from '../lib/driveConnector';
import toast from 'react-hot-toast';

interface FileManagerProps {
  onClose: () => void;
  onOpen: (file: { id: string; name: string; content: string }) => void;
}

export default function FileManager({ onClose, onOpen }: FileManagerProps) {
  const [tab, setTab] = useState<'local' | 'drive'>('local');
  const [localFiles, setLocalFiles] = useState<SavedFile[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveDoc[]>([]);
  const [loading, setLoading] = useState(false);

  // Active document deletion confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Drive sign-in state
  const [driveToken, setDriveToken] = useState<string>('');
  const [hasToken, setHasToken] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    loadLocalFiles();
    const token = getSavedDriveToken();
    setHasToken(!!token);
    if (token) {
      setDriveToken(token);
    }
  }, []);

  useEffect(() => {
    if (tab === 'drive' && hasToken && driveFiles.length === 0) {
      loadDriveFiles();
    }
  }, [tab, hasToken]);

  async function loadLocalFiles() {
    try {
      const files = await listFiles('write');
      setLocalFiles(files);
    } catch (e) {
      toast.error('Could not load local files');
    }
  }

  async function loadDriveFiles() {
    setLoading(true);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (e) {
      toast.error('Could not load Google Drive items. Check token validity.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenLocal(fileId: string) {
    try {
      const full = await getFile(fileId);
      onOpen({ id: full.id, name: full.name, content: full.content });
    } catch {
      toast.error('Failed to load file content');
    }
  }

  async function handleOpenDrive(file: DriveDoc) {
    setLoading(true);
    try {
      const content = await readDriveFile(file.id);
      onOpen({
        id: `drive-${file.id}`,
        name: file.name.replace('.html', ''),
        content,
      });
    } catch (e) {
      toast.error('Could not read Google Drive item');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteLocal(file: SavedFile, e: React.MouseEvent) {
    e.stopPropagation();
    let isOk = true;
    try {
      isOk = window.confirm(`Delete "${file.name}"? This action cannot be reversed.`);
    } catch (err) {
      console.warn('window.confirm blocked or unavailable, proceeding with operation', err);
    }
    if (!isOk) return;
    try {
      await deleteFile(file.id);
      await loadLocalFiles();
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  function handleSaveToken() {
    if (!driveToken.trim()) return;
    saveDriveToken(driveToken.trim());
    setHasToken(true);
    setShowTokenInput(false);
    loadDriveFiles();
    toast.success('Google Drive key stored');
  }

  function handleRemoveToken() {
    removeDriveToken();
    setDriveToken('');
    setHasToken(false);
    setDriveFiles([]);
    toast.success('Google Drive session logged out');
  }

  function formatDate(iso: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 520,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
          }}>
            Open Document
          </h2>
          <button
            title="Close file manager dialog"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--bg-tertiary)',
          padding: '0 20px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex' }}>
            {[
              { key: 'local', label: 'Local Files', icon: FileText },
              { key: 'drive', label: 'Google Drive', icon: Cloud },
            ].map((t) => (
              <button
                key={t.key}
                title={`Switch to ${t.label} tab`}
                onClick={() => setTab(t.key as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: tab === t.key
                    ? '2px solid var(--accent-primary)'
                    : '2px solid transparent',
                  background: 'none',
                  color: tab === t.key
                    ? 'var(--accent-primary)'
                    : 'var(--text-muted)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: tab === t.key ? 600 : 400,
                  cursor: 'pointer',
                  marginBottom: -1,
                  transition: 'all 0.12s',
                }}
              >
                <t.icon size={14} />
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'drive' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                title="Manage Google Drive authentication settings"
                onClick={() => setShowTokenInput(!showTokenInput)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Key size={12} />
                <span>Token Settings</span>
              </button>
              {hasToken && (
                <button
                  title="Disconnect Google Drive syncing token and logout"
                  onClick={handleRemoveToken}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                  }}
                >
                  Disconnect
                </button>
              )}
            </div>
          )}
        </div>

        {/* DRIVE ACCESS TOKEN INPUT */}
        {tab === 'drive' && (showTokenInput || !hasToken) && (
          <div style={{
            padding: '14px 20px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--bg-tertiary)',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
              Enter your Google OAuth Access Token here. Stored locally in your browser.
              Allows instant client-side read/write syncing to your personal 'ForgeYours' directory!
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                value={driveToken}
                onChange={e => setDriveToken(e.target.value)}
                placeholder="ya29.a0Acv..."
                style={{
                  flex: 1,
                  border: '1px solid var(--bg-tertiary)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <button
                title="Validate and save Google Drive OAuth token"
                onClick={handleSaveToken}
                className="toolbar-btn toolbar-btn--primary"
                style={{ height: 32, padding: '0 12px' }}
              >
                Connect Drive
              </button>
            </div>
          </div>
        )}

        {/* LIST COMPONENT */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
        }}>
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              color: 'var(--text-muted)',
              gap: 8,
            }}>
              <Loader size={16} className="animate-spin" />
              <span style={{ fontSize: '0.875rem' }}>Synchronizing...</span>
            </div>
          )}

          {tab === 'drive' && !hasToken && !loading && (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}>
              Provide your Google Drive OAuth access token above to list your cloud documents synchronously.
            </div>
          )}

          {!loading && tab === 'local' && localFiles.length === 0 && (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}>
              No saved documents found on this device.<br />
              Start typing on the canvas and click "Save"!
            </div>
          )}

          {/* Render local IndexedDB documents */}
          {!loading && tab === 'local' && localFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleOpenLocal(file.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <FileText
                size={18}
                style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {file.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}>
                  <Clock size={11} />
                  <span>{formatDate(file.updatedAt)}</span>
                </div>
              </div>
              {confirmDeleteId === file.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    title="Confirm deletion"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await deleteFile(file.id);
                        setConfirmDeleteId(null);
                        await loadLocalFiles();
                        toast.success('Document deleted');
                      } catch {
                        toast.error('Failed to delete document');
                      }
                    }}
                    style={{
                      background: 'var(--danger, #dc2626)',
                      color: '#fff',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    title="Cancel deletion"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(null);
                    }}
                    style={{
                      background: 'var(--bg-tertiary, #eaeaea)',
                      color: 'var(--text-primary, #111)',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(file.id);
                  }}
                  title="Delete document"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--danger)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          {/* Render Drive sync documents */}
          {!loading && tab === 'drive' && hasToken && driveFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleOpenDrive(file)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Cloud
                size={18}
                style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {file.name.replace('.html', '')}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}>
                  <Clock size={11} />
                  <span>{formatDate(file.modifiedTime)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
