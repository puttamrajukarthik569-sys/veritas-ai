import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} color="var(--real-color)" />,
    error: <AlertCircle size={18} color="var(--fake-color)" />,
    warning: <AlertTriangle size={18} color="var(--warn-color)" />,
    info: <Info size={18} color="var(--cyan-primary)" />,
  };

  const borderMap = {
    success: 'var(--real-border)',
    error: 'var(--fake-border)',
    warning: 'rgba(245, 158, 11, 0.35)',
    info: 'var(--border-cyan)',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: 'var(--bg-secondary)',
        border: `1px solid ${borderMap[type] || borderMap.info}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-prominent)',
        color: 'var(--text-primary)',
        fontSize: '0.88rem',
        maxWidth: '420px',
        animation: 'slideUp 250ms var(--ease-spring)',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{ flexShrink: 0 }}>{iconMap[type] || iconMap.info}</div>
      <div style={{ flex: 1, lineHeight: '1.4' }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Dismiss Notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
