import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  RefreshCw, 
  Trash2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function HistoryPage({ setActivePage, showToast }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageOffset, setPageOffset] = useState(0);
  const pageSize = 15;

  // Modal / Detail state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchHistoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHistory({
        limit: pageSize,
        offset: pageOffset,
        filter: filter !== 'all' ? filter : null,
        q: searchQuery,
      });
      setHistoryItems(data.items || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Unable to load history from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [filter, pageOffset]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPageOffset(0);
    fetchHistoryData();
  };

  const handleOpenDetail = async (id) => {
    setModalLoading(true);
    try {
      const record = await api.getPredictionById(id);
      setSelectedRecord(record);
    } catch (err) {
      console.error('Failed to load full record:', err);
      if (showToast) showToast('Could not fetch full record detail.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (showToast) showToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all prediction records from the database? This cannot be undone.')) {
      return;
    }
    try {
      await api.clearHistory();
      if (showToast) showToast('Prediction history cleared', 'info');
      fetchHistoryData();
    } catch (err) {
      if (showToast) showToast('Failed to clear history', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '36px' }}>
        <div>
          <div className="eyebrow-badge" style={{ marginBottom: '14px' }}>
            <span className="eyebrow-dot" />
            <span>SQLite Prediction Audit Trail</span>
          </div>
          <h1 className="text-editorial-lg">Prediction History</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchHistoryData} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          {totalCount > 0 && (
            <button onClick={handleClearAllHistory} className="btn btn-secondary btn-sm" style={{ color: 'var(--fake-color)' }} title="Clear SQLite Database Records">
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search headline or preview text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-cyan)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={14} color="var(--text-muted)" />
          {['all', 'Likely Real', 'Likely Fake'].map((opt) => {
            const isActive = filter === opt;
            return (
              <button
                key={opt}
                onClick={() => {
                  setFilter(opt);
                  setPageOffset(0);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  background: isActive ? 'var(--cyan-glow)' : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? 'var(--border-cyan)' : 'var(--border-subtle)'}`,
                  color: isActive ? 'var(--cyan-primary)' : 'var(--text-secondary)',
                  transition: 'all 150ms ease',
                }}
              >
                {opt === 'all' ? 'All Predictions' : opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* History Items Table / Card Stream */}
      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--cyan-primary)' }} />
          <div>Querying database...</div>
        </div>
      ) : error ? (
        <div className="editorial-card" style={{ borderColor: 'var(--fake-border)', textAlign: 'center', padding: '48px' }}>
          <AlertCircle size={32} color="var(--fake-color)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      ) : historyItems.length === 0 ? (
        /* Empty State */
        <div
          className="editorial-card"
          style={{
            textAlign: 'center',
            padding: '72px 24px',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <HistoryIcon size={36} color="var(--cyan-dim)" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#fff' }}>No History Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
            {searchQuery || filter !== 'all'
              ? 'No prediction records matched your active filter or search query.'
              : 'The database is currently empty. Analyze an article to populate your persistent log.'}
          </p>
          <button
            onClick={() => {
              setActivePage('analyzer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn btn-primary btn-sm"
          >
            <span>Analyze News Article</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {historyItems.map((item) => {
              const isReal = item.prediction === 'Likely Real';
              return (
                <div
                  key={item.id}
                  className="editorial-card"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className={isReal ? 'badge-real' : 'badge-fake'}>
                        {isReal ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                        {item.prediction}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.id}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#fff', marginBottom: '6px', lineHeight: '1.4' }}>
                      {item.title || item.text_preview.slice(0, 80) + '...'}
                    </h4>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {item.text_preview}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                      <span>{item.word_count} words</span>
                      <span>Logit: {item.raw_score}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleCopyText(item.text_preview, item.id)}
                      className="btn btn-secondary btn-sm"
                      title="Copy preview text"
                    >
                      {copiedId === item.id ? <Check size={14} color="var(--real-color)" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleOpenDetail(item.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <span>Read Full</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalCount > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>
                Showing {pageOffset + 1} to {Math.min(pageOffset + pageSize, totalCount)} of {totalCount} records
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPageOffset(Math.max(0, pageOffset - pageSize))}
                  disabled={pageOffset === 0}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPageOffset(pageOffset + pageSize)}
                  disabled={pageOffset + pageSize >= totalCount}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Full Record Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(4, 6, 9, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="editorial-card"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-prominent)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className={selectedRecord.prediction === 'Likely Real' ? 'badge-real' : 'badge-fake'}>
                  {selectedRecord.prediction} ({(selectedRecord.confidence * 100).toFixed(1)}%)
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  ID: {selectedRecord.id} • {new Date(selectedRecord.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {selectedRecord.title && (
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>
                {selectedRecord.title}
              </h3>
            )}

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Full Submitted Text:
            </div>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px',
                fontSize: '0.88rem',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                maxHeight: '340px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                marginBottom: '20px',
              }}
            >
              {selectedRecord.text}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => handleCopyText(selectedRecord.text, selectedRecord.id)}
                className="btn btn-secondary btn-sm"
              >
                <Copy size={14} />
                <span>Copy Full Text</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="btn btn-primary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
