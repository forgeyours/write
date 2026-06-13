// ============================================================
// FILE: src/components/AIPanel.tsx
// PURPOSE: Built-in AI Writing Assistant sidepanel (with selectable API providers)
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Key, Trash2, AlertCircle, Settings, HelpCircle } from 'lucide-react';
import {
  sendMessage,
  getAiSettings,
  saveAiSettings,
  clearAiSettings,
  hasApiKey,
  DEFAULT_MODELS,
  AiProvider,
} from '../lib/aiClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIPanelProps {
  open: boolean;
  onClose: () => void;
  toolContext: string;
}

export default function AIPanel({ open, onClose, toolContext }: AIPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<AiProvider>('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = getAiSettings();
    setProvider(s.provider);
    setApiKey(s.apiKey);
    setModel(s.model);
    setApiKeySaved(hasApiKey());
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSaveSettings() {
    if (!apiKey.trim()) {
      setError('Please provide an API Key');
      return;
    }
    const targetModel = model.trim() || DEFAULT_MODELS[provider];
    saveAiSettings({
      provider,
      apiKey: apiKey.trim(),
      model: targetModel,
    });
    setApiKeySaved(true);
    setShowSettings(false);
    setError(null);
  }

  function handleClearSettings() {
    clearAiSettings();
    setApiKey('');
    setModel('');
    setApiKeySaved(false);
    setMessages([]);
    setError(null);
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    if (!apiKeySaved) {
      setError('Add your API key below or in AI settings first!');
      setShowSettings(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const reply = await sendMessage({
        messages: newMessages,
        toolContext,
      });
      setMessages([
        ...newMessages,
        { role: 'assistant', content: reply },
      ]);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'NO_API_KEY') {
        setError('No API key found. Add your credentials in settings.');
        setShowSettings(true);
      } else if (err.message === 'INVALID_API_KEY') {
        setError('Invalid API key for selected provider. Verify and try again.');
        setShowSettings(true);
      } else if (err.message === 'RATE_LIMITED') {
        setError('Rate limit hit. Wait a second and try again.');
      } else {
        setError(err.message || 'Error executing AI block. Re-check credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={`ai-panel ${open ? 'ai-panel--open' : ''}`}>
      {/* HEADER */}
      <div className="ai-panel-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-tertiary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', marginRight: 2 }}>✦</span>
          <span>AI Assistant</span>
          <span style={{ fontSize: '9px', bg: 'var(--accent-primary)', background: '#E85D00', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, marginLeft: 4 }}>ACTIVE</span>
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Configure AI API credentials (Anthropic, Gemini, OpenAI)"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: apiKeySaved ? 'var(--success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Settings size={15} />
          </button>

          {apiKeySaved && (
            <button
              onClick={handleClearSettings}
              title="Remove credentials"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={14} />
            </button>
          )}

          <button
            title="Close AI Assistant sidepanel"
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
            <X size={16} />
          </button>
        </div>
      </div>

      {/* CREDENTIALS SETTINGS OVERLAY */}
      {showSettings && (
        <div style={{
          padding: '14px',
          borderBottom: '1px solid var(--bg-tertiary)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div>
            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const prov = e.target.value as AiProvider;
                setProvider(prov);
                setModel(DEFAULT_MODELS[prov]);
              }}
              style={{
                width: '100%',
                height: 30,
                borderRadius: 5,
                border: '1px solid var(--bg-tertiary)',
                background: '#fff',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            >
              <option value="anthropic">Anthropic Claude</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>API Secret Key</label>
              <a
                href={provider === 'anthropic' ? 'https://console.anthropic.com' : provider === 'openai' ? 'https://platform.openai.com' : 'https://aistudio.google.com'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textDecoration: 'none' }}
              >
                Get Key ↗
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Paste secret API key...`}
              style={{
                width: '100%',
                height: 30,
                borderRadius: 5,
                border: '1px solid var(--bg-tertiary)',
                background: '#fff',
                padding: '0 8px',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Model Override (Optional)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={DEFAULT_MODELS[provider]}
              style={{
                width: '100%',
                height: 30,
                borderRadius: 5,
                border: '1px solid var(--bg-tertiary)',
                background: '#fff',
                padding: '0 8px',
                fontSize: '0.8125rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, justify: 'flex-end', marginTop: 4 }}>
            <button
              title="Cancel credential editing"
              onClick={() => setShowSettings(false)}
              className="toolbar-btn"
              style={{ height: 26, fontSize: '0.75rem' }}
            >
              Cancel
            </button>
            <button
              title="Save API credentials and close settings"
              onClick={handleSaveSettings}
              className="toolbar-btn toolbar-btn--primary"
              style={{ height: 26, fontSize: '0.75rem', padding: '0 12px' }}
            >
              Save Credentials
            </button>
          </div>
        </div>
      )}

      {/* MESSAGES VIEW */}
      <div className="ai-panel-messages">
        {messages.length === 0 && !error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 10,
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 8,
              border: '1px solid var(--bg-tertiary)',
              padding: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}>
              "I can analyze your writer canvas layout. Would you like me to suggest a stronger closing statement or check for consistency in your text arguments?"
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Refine professional tone',
                'Generate paragraph summary',
                'Suggest H3 headers',
              ].map(prompt => (
                <button
                  key={prompt}
                  title={`Load "${prompt}" template query`}
                  onClick={() => {
                    setInput(prompt);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--bg-tertiary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--accent-light)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                    e.currentTarget.style.borderColor = 'rgba(232, 93, 0, 0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderColor = 'var(--bg-tertiary)';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {!apiKeySaved && (
              <div style={{
                marginTop: 8,
                padding: '12px',
                background: 'var(--accent-light)',
                borderRadius: 8,
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
                onClick={() => setShowSettings(true)}
              >
                Click here to configure API Credentials
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            padding: '10px 12px',
            background: '#FEF2F2',
            borderRadius: 8,
            color: 'var(--danger)',
            fontSize: '0.8125rem',
          }}>
            <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '8px 12px',
              borderRadius: msg.role === 'user'
                ? '12px 12px 2px 12px'
                : '12px 12px 12px 2px',
              background: msg.role === 'user'
                ? 'var(--accent-primary)'
                : 'var(--bg-secondary)',
              color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '8px 12px',
              borderRadius: '12px 12px 12px 2px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
            }}>
              ✦ thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT ROW */}
      <div className="ai-panel-input-row">
        <textarea
          className="ai-panel-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Copilot anything... (Enter to send)"
          rows={2}
        />
        <button
          title="Send message to AI assistant"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="toolbar-btn toolbar-btn--primary"
          style={{ alignSelf: 'flex-end', padding: '8px' }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
