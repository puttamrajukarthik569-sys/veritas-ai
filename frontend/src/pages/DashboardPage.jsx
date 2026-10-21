import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowUpRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend 
} from 'recharts';
import { api } from '../services/api';

export default function DashboardPage({ setActivePage }) {
  const [analytics, setAnalytics] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, metricsData] = await Promise.all([
        api.getAnalytics(),
        api.getModelMetrics().catch(() => null),
      ]);
      setAnalytics(analyticsData);
      if (metricsData && metricsData.metrics) {
        setModelMetrics(metricsData.metrics);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Could not retrieve analytics from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pieData = analytics ? [
    { name: 'Likely Real', value: analytics.likely_real_count, color: '#10B981' },
    { name: 'Likely Fake', value: analytics.likely_fake_count, color: '#EF4444' },
  ].filter(d => d.value > 0) : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            boxShadow: 'var(--shadow-prominent)',
          }}
        >
          <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ color: entry.color, fontWeight: 600 }}>
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '36px' }}>
        <div>
          <div className="eyebrow-badge" style={{ marginBottom: '14px' }}>
            <span className="eyebrow-dot" />
            <span>Real-Time Operational Telemetry</span>
          </div>
          <h1 className="text-editorial-lg">Intelligence Dashboard</h1>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--cyan-primary)' }} />
          <div>Aggregating real-time SQLite statistics...</div>
        </div>
      ) : error ? (
        <div className="editorial-card" style={{ borderColor: 'var(--fake-border)', textAlign: 'center', padding: '48px' }}>
          <AlertCircle size={32} color="var(--fake-color)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>Dashboard Connection Failed</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary btn-sm">Try Again</button>
        </div>
      ) : analytics && analytics.total_predictions === 0 ? (
        /* Empty State */
        <div
          className="editorial-card"
          style={{
            textAlign: 'center',
            padding: '72px 24px',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid var(--border-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'var(--cyan-primary)',
            }}
          >
            <BarChart3 size={32} />
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#fff' }}>No Analysis Records Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '28px' }}>
            The persistent SQLite database contains zero predictions. Run your first news article through the analyzer to generate live distribution charts and timeline telemetry.
          </p>
          <button
            onClick={() => {
              setActivePage('analyzer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn btn-primary"
          >
            <span>Analyze Your First Article</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      ) : analytics ? (
        <>
          {/* Key Metric KPI Cards */}
          <div className="grid-3" style={{ marginBottom: '32px' }}>
            {/* Total Predictions */}
            <div className="editorial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Articles Evaluated
                </span>
                <Layers size={18} color="var(--cyan-primary)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: 800, color: '#fff' }}>
                {analytics.total_predictions.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Stored in persistent SQLite database
              </div>
            </div>

            {/* Likely Real Breakdown */}
            <div className="editorial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Likely Real Articles
                </span>
                <CheckCircle2 size={18} color="var(--real-color)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: 800, color: 'var(--real-color)' }}>
                {analytics.likely_real_count.toLocaleString()}{' '}
                <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  ({analytics.likely_real_percentage}%)
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Classified within authentic journalistic cluster
              </div>
            </div>

            {/* Likely Fake Breakdown */}
            <div className="editorial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Likely Fake Articles
                </span>
                <AlertCircle size={18} color="var(--fake-color)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: 800, color: 'var(--fake-color)' }}>
                {analytics.likely_fake_count.toLocaleString()}{' '}
                <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  ({analytics.likely_fake_percentage}%)
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Classified within deceptive rhetoric cluster
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid-2" style={{ marginBottom: '32px' }}>
            {/* Trend Chart */}
            <div className="editorial-card" style={{ minHeight: '340px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>Analysis Volume Over Time</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Daily prediction volume</div>
                </div>
                <TrendingUp size={18} color="var(--cyan-primary)" />
              </div>

              <div style={{ height: '240px', width: '100%' }}>
                {analytics.trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="total" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#totalGradient)" name="Total Analyses" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Insufficient trend data points
                  </div>
                )}
              </div>
            </div>

            {/* Class Distribution Donut Chart */}
            <div className="editorial-card" style={{ minHeight: '340px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>Class Distribution</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Proportion of Real vs Fake</div>
                </div>
                <PieIcon size={18} color="var(--violet-primary)" />
              </div>

              <div style={{ height: '240px', width: '100%' }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        formatter={(value) => <span style={{ color: '#fff', fontSize: '0.82rem', fontFamily: 'var(--font-sans)' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No class distributions available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Activity & Model Summary */}
          <div className="grid-2">
            {/* Recent Activity Stream */}
            <div className="editorial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Recent Activity</h3>
                <button
                  onClick={() => {
                    setActivePage('history');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--cyan-primary)' }}
                >
                  View All History →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.recent_activity.length > 0 ? (
                  analytics.recent_activity.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title || item.text_preview}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.id} • {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={item.prediction === 'Likely Real' ? 'badge-real' : 'badge-fake'} style={{ flexShrink: 0 }}>
                        {item.prediction} ({(item.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0' }}>
                    No recent activities recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Model Architecture Summary */}
            <div className="editorial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>Underlying Classifier</h3>
                <Cpu size={18} color="var(--cyan-primary)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Classifier Algorithm:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>LinearSVC (C=1.0)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Feature Transformer:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>TF-IDF (1-2 N-Grams)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Calibration Mechanism:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-primary)' }}>Platt Sigmoid (cv=3)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Evaluation Test Accuracy:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--real-color)', fontWeight: 700 }}>
                    {modelMetrics ? `${(modelMetrics.accuracy * 100).toFixed(1)}%` : 'Active'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Zero Data Leakage:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--real-color)' }}>Enforced</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
