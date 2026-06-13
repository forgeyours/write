// ============================================================
// FILE: src/components/SupportButton.tsx
// PURPOSE: Support button giving voluntary options to tip ForgeYours
// LAST CHANGED: 13 Jun 2026
// ============================================================
import React, { useState } from 'react';
import { Heart, X, ExternalLink } from 'lucide-react';

const PAYMENT_OPTIONS = [
  {
    label: 'UPI (India)',
    description: 'Pay instantly via any UPI app',
    url: 'upi://pay?pa=forgeyours@upi&pn=ForgeYours&cu=INR',
    emoji: '🇮🇳',
  },
  {
    label: 'Card / International',
    description: 'Pay with any card or currency safely',
    url: 'https://forgeyours.space/support',
    emoji: '🌍',
  },
  {
    label: 'Crypto Wallet',
    description: 'Support using any cryptocurrency',
    url: 'https://forgeyours.space/crypto',
    emoji: '₿',
  },
];

export default function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="toolbar-btn"
        onClick={() => setOpen(true)}
        title="Support ForgeYours — absolute voluntary backing, zero paywalls"
        style={{ color: 'var(--accent-primary)', height: '25px', width: '88.296875px' }}
      >
        <Heart size={15} fill="currentColor" style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontWeight: 600 }}>Support</span>
      </button>

      {open && (
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
            paddingTop: 68,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 16,
              padding: 0,
              maxWidth: 400,
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 12px 50px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '24px 24px 0 24px',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: 6, color: '#E85D00' }}>♥</div>
                  <h2 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--text-primary)',
                    margin: '0 0 6px 0',
                  }}>
                    Support ForgeYours
                  </h2>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    Free, open source, offline-first. No paywalls, no subscriptions.
                    Support Sushant and keep tools a human right.
                  </p>
                </div>

                <button
                  title="Close support dialog"
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    marginLeft: 12,
                    padding: 4,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scroll view */}
            <div style={{
              overflowY: 'auto',
              padding: '12px 24px 24px 24px',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                marginBottom: 16,
              }}>
                {PAYMENT_OPTIONS.map((option) => (
                  <a
                    key={option.label}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--bg-tertiary)',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-secondary)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>
                      {option.emoji}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        marginBottom: 2,
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {option.label}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {option.description}
                      </div>
                    </div>
                    <ExternalLink
                      size={14}
                      style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                    />
                  </a>
                ))}
              </div>

              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: 0,
                textAlign: 'center',
                lineHeight: 1.5,
              }}>
                100% of contributions are listed transparently on our public books.{' '}
                <a
                  href="https://forgeyours.space/finances"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-primary)', fontWeight: 500 }}
                >
                  View full budget breakdown →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
