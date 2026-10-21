import React from 'react';
import { Shield, ExternalLink, Terminal, Database, Cpu, Lock } from 'lucide-react';

export default function Footer({ setActivePage }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'var(--bg-void)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '64px 0 40px',
        marginTop: '80px',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand & Purpose */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid var(--border-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan-primary)',
                }}
              >
                <Shield size={16} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                VERITAS <span style={{ color: 'var(--cyan-primary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>AI</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '16px' }}>
              An intelligent natural language processing platform developed to explore textual signals, syntactic patterns, and stylistic markers associated with online misinformation.
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cyan-dim)' }}>
              "See Beyond the Headline."
            </div>
          </div>

          {/* Quick Platform Navigation */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: '18px', fontFamily: 'var(--font-mono)' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'landing', label: 'Platform Overview' },
                { id: 'analyzer', label: 'News Text Analyzer' },
                { id: 'dashboard', label: 'Prediction Analytics' },
                { id: 'history', label: 'Persistent Database Log' },
                { id: 'model', label: 'Model Evaluation Metrics' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      setActivePage(link.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left',
                      transition: 'color 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.color = 'var(--cyan-primary)')}
                    onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology Specifications */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: '18px', fontFamily: 'var(--font-mono)' }}>
              Architecture & Stack
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={14} color="var(--cyan-primary)" />
                <span>TF-IDF N-grams & Calibrated LinearSVC</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={14} color="var(--violet-primary)" />
                <span>Python Flask REST Service</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={14} color="var(--real-color)" />
                <span>SQLite Parameterized Storage</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={14} color="var(--cyan-primary)" />
                <span>Vite React & Recharts Engine</span>
              </li>
            </ul>
          </div>

          {/* Scientific Disclaimer & Model Limitations */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--warn-color)', marginBottom: '18px', fontFamily: 'var(--font-mono)' }}>
              Model Limitations Notice
            </h4>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}
            >
              VERITAS AI provides statistical estimates of linguistic similarity based on its training distribution. Predictions do not constitute proof of factual veracity or replace independent journalistic research and source corroboration.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            &copy; {currentYear} VERITAS AI Research. Supervised NLP Text Classification Architecture.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Reproducible Seed: 42</span>
            <span>Platt Sigmoid Calibration</span>
            <span>Zero Data Leakage Validation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
