import React, { useState, useEffect } from 'react';
import { Shield, Activity, BarChart3, History, Cpu, Menu, X, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, isApiOnline }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Shield },
    { id: 'analyzer', label: 'Analyze News', icon: Activity },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'model', label: 'Model Intelligence', icon: Cpu },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all 300ms ease',
        background: isScrolled ? 'rgba(7, 9, 14, 0.88)' : 'rgba(7, 9, 14, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${isScrolled ? 'rgba(255, 255, 255, 0.08)' : 'transparent'}`,
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
          aria-label="VERITAS AI Home"
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(139, 92, 246, 0.25))',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan-primary)',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
            }}
          >
            <Shield size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#fff' }}>
                VERITAS
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--cyan-primary)', fontWeight: 600, letterSpacing: '0.08em' }}>
                AI
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              See Beyond the Headline
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', gap: '8px', alignItems: 'center' }} className="desktop-nav">
          <style>{`
            @media (min-width: 900px) {
              .desktop-nav { display: flex !important; }
              .mobile-toggle { display: none !important; }
            }
          `}</style>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--cyan-primary)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action & API Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* API Status Pill */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: isApiOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${isApiOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: isApiOnline ? 'var(--real-color)' : 'var(--warn-color)',
            }}
            className="desktop-status"
          >
            <style>{`
              @media (min-width: 640px) {
                .desktop-status { display: inline-flex !important; }
              }
            `}</style>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isApiOnline ? 'var(--real-color)' : 'var(--warn-color)',
                boxShadow: isApiOnline ? '0 0 6px var(--real-color)' : 'none',
              }}
            />
            {isApiOnline ? 'SYSTEM READY' : 'API CHECKING'}
          </div>

          {/* Quick CTA button */}
          {activePage !== 'analyzer' && (
            <button
              onClick={() => handleNavClick('analyzer')}
              className="btn btn-primary btn-sm"
              style={{ display: 'none' }}
              id="cta-nav-analyze"
            >
              <style>{`
                @media (min-width: 768px) {
                  #cta-nav-analyze { display: inline-flex !important; }
                }
              `}</style>
              <span>Analyze News</span>
              <ArrowUpRight size={14} />
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle btn btn-secondary btn-sm"
            style={{ padding: '8px' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '20px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '1rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--cyan-primary)' : 'var(--text-primary)',
                  background: isActive ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? 'var(--border-cyan)' : 'var(--border-subtle)'}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
