import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import LandingPage from './pages/LandingPage';
import AnalyzerPage from './pages/AnalyzerPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ModelPage from './pages/ModelPage';
import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.message === message ? null : curr));
    }, 4000);
  };

  // Poll backend health status
  useEffect(() => {
    let isMounted = true;

    async function checkBackend() {
      try {
        const health = await api.checkHealth();
        if (isMounted) {
          setIsApiOnline(health && health.status === 'ok');
        }
      } catch (err) {
        if (isMounted) {
          setIsApiOnline(false);
        }
      }
    }

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Cinematic Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isApiOnline={isApiOnline}
      />

      {/* Main Page Content */}
      <main style={{ flex: 1 }}>
        {activePage === 'landing' && <LandingPage setActivePage={setActivePage} />}
        {activePage === 'analyzer' && <AnalyzerPage setActivePage={setActivePage} showToast={showToast} />}
        {activePage === 'dashboard' && <DashboardPage setActivePage={setActivePage} />}
        {activePage === 'history' && <HistoryPage setActivePage={setActivePage} showToast={showToast} />}
        {activePage === 'model' && <ModelPage setActivePage={setActivePage} />}
      </main>

      {/* Editorial Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Accessible Floating Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
