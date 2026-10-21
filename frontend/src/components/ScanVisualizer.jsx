import React from 'react';
import { Cpu, Binary, Search, Sparkles } from 'lucide-react';

export default function ScanVisualizer({ stage = 'vectorizing' }) {
  const stages = [
    { id: 'tokenizing', label: 'Cleaning & Normalizing Lexical Tokens', icon: Binary },
    { id: 'vectorizing', label: 'Computing Sublinear TF-IDF N-grams', icon: Cpu },
    { id: 'evaluating', label: 'Evaluating Calibrated LinearSVC Hyperplane', icon: Sparkles },
  ];

  return (
    <div
      style={{
        background: 'rgba(12, 16, 24, 0.95)',
        border: '1px solid var(--border-cyan)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(0, 240, 255, 0.12)',
      }}
    >
      {/* Laser Scanning Line */}
      <div className="scanner-line" />

      {/* Header status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--cyan-primary)',
              boxShadow: '0 0 10px var(--cyan-primary)',
              animation: 'pulse-dot 1.2s infinite ease-in-out',
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', letterSpacing: '0.08em', color: 'var(--cyan-primary)', textTransform: 'uppercase' }}>
            NLP Inference Pipeline Active
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          LinearSVC • Platt Sigmoid
        </div>
      </div>

      {/* Progress Bars and Stages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
        {stages.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Icon size={14} color="var(--cyan-primary)" />
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)' }}>{st.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan-dim)' }}>
                [STEP 0{idx + 1}]
              </span>
            </div>
          );
        })}
      </div>

      {/* Scientific disclaimer badge */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '0.74rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Classifying statistical patterns against benchmark dataset distribution...
      </div>
    </div>
  );
}
