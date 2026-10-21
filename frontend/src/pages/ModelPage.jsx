import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Binary, 
  FileCheck, 
  Layers, 
  BarChart2, 
  Sparkles,
  Info,
  RefreshCw,
  GitBranch
} from 'lucide-react';
import { api } from '../services/api';

export default function ModelPage({ setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getModelMetrics();
      setData(res);
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError('Could not connect to API to fetch model metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metrics = data?.metrics;

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ maxWidth: '860px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div className="eyebrow-badge" style={{ marginBottom: '14px' }}>
          <span className="eyebrow-dot" />
          <span>Scientific Machine Learning Audit</span>
        </div>
        <h1 className="text-editorial-lg" style={{ marginBottom: '16px' }}>
          Model Intelligence & Performance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Full transparent evaluation of our Support Vector Machine classifier,
          trained on journalistic and deceptive linguistic corpora using zero-leakage test validation.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--cyan-primary)' }} />
          <div>Reading serialized evaluation telemetry...</div>
        </div>
      ) : error ? (
        <div className="editorial-card" style={{ borderColor: 'var(--fake-border)', textAlign: 'center', padding: '48px' }}>
          <AlertCircle size={32} color="var(--fake-color)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      ) : !data?.model_ready ? (
        /* Setup / Uncalibrated state */
        <div className="editorial-card" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '640px', margin: '0 auto' }}>
          <Cpu size={36} color="var(--warn-color)" style={{ margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff' }}>Model Training Required</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Model artifacts have not been serialized yet. Execute the training pipeline in your terminal:
          </p>
          <div style={{ padding: '12px 16px', background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cyan-primary)', border: '1px solid var(--border-cyan)', marginBottom: '20px' }}>
            python -m backend.train
          </div>
        </div>
      ) : metrics ? (
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          {/* Top KPI Metric Cards */}
          <div className="grid-3" style={{ marginBottom: '32px' }}>
            <div className="editorial-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Overall Accuracy
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 800, color: 'var(--cyan-primary)' }}>
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Proportion of correct classifications across test split.
              </p>
            </div>

            <div className="editorial-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Weighted F1-Score
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 800, color: 'var(--violet-primary)' }}>
                {(metrics.f1_score * 100).toFixed(1)}%
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Balanced harmonic mean of precision and recall.
              </p>
            </div>

            <div className="editorial-card">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Dataset Sample Count
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
                {metrics.total_samples}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {metrics.train_samples} Train (80%) • {metrics.test_samples} Unseen Test (20%)
              </p>
            </div>
          </div>

          {/* Confusion Matrix & Class Breakdown Grid */}
          <div className="grid-2" style={{ marginBottom: '32px' }}>
            {/* Confusion Matrix Visualizer */}
            <div className="editorial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>Confusion Matrix</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Evaluated on unseen test split</div>
                </div>
                <Binary size={18} color="var(--cyan-primary)" />
              </div>

              {/* 2x2 Matrix Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '16px',
                }}
              >
                {/* True Negatives (Real as Real) */}
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--real-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--real-color)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    True Negatives (TN)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {metrics.confusion_matrix.true_negatives}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Real correctly identified
                  </div>
                </div>

                {/* False Positives (Real misclassified as Fake) */}
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--warn-color)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    False Positives (FP)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {metrics.confusion_matrix.false_positives}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Real flagged as Fake
                  </div>
                </div>

                {/* False Negatives (Fake misclassified as Real) */}
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--warn-color)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    False Negatives (FN)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {metrics.confusion_matrix.false_negatives}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Fake flagged as Real
                  </div>
                </div>

                {/* True Positives (Fake as Fake) */}
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--fake-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--fake-color)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    True Positives (TP)
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {metrics.confusion_matrix.true_positives}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Fake correctly identified
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Class Evaluation Breakdown */}
            <div className="editorial-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>Class-Wise Metrics</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Precision, Recall & Support</div>
                </div>
                <FileCheck size={18} color="var(--real-color)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Likely Real class stats */}
                <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="badge-real">Class: Likely Real</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Support: {metrics.class_metrics?.likely_real?.support} samples
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>PRECISION</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {(metrics.class_metrics?.likely_real?.precision * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>RECALL</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {(metrics.class_metrics?.likely_real?.recall * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>F1-SCORE</div>
                      <div style={{ color: 'var(--real-color)', fontWeight: 700, fontSize: '1.1rem' }}>
                        {(metrics.class_metrics?.likely_real?.f1_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Likely Fake class stats */}
                <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="badge-fake">Class: Likely Fake</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Support: {metrics.class_metrics?.likely_fake?.support} samples
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>PRECISION</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {(metrics.class_metrics?.likely_fake?.precision * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>RECALL</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {(metrics.class_metrics?.likely_fake?.recall * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>F1-SCORE</div>
                      <div style={{ color: 'var(--fake-color)', fontWeight: 700, fontSize: '1.1rem' }}>
                        {(metrics.class_metrics?.likely_fake?.f1_score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Discriminating Signal Words / N-Grams */}
          {metrics.top_features && (
            <div className="editorial-card" style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '4px' }}>Top Discriminating N-Gram Weights</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Features with the highest LinearSVC coefficients</div>
              </div>

              <div className="grid-2">
                {/* Fake Signals */}
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--fake-color)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Strongest Deception Predictors (+ Weights):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {metrics.top_features.likely_fake_signals?.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--fake-bg)',
                          border: '1px solid var(--fake-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          color: 'var(--fake-color)',
                        }}
                      >
                        {f.feature} <span style={{ opacity: 0.7 }}>({f.weight})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Real Signals */}
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--real-color)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Strongest Journalistic Predictors (- Weights):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {metrics.top_features.likely_real_signals?.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--real-bg)',
                          border: '1px solid var(--real-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          color: 'var(--real-color)',
                        }}
                      >
                        {f.feature} <span style={{ opacity: 0.7 }}>({f.weight})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scientific Disclaimer & Generalization Boundaries */}
          <div
            style={{
              padding: '24px',
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start',
            }}
          >
            <Info size={22} color="var(--warn-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: '6px' }}>
                Scientific Generalization & Test-Set Disclaimer
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.6', margin: 0 }}>
                High evaluation accuracy on the held-out test split demonstrates effective learning within the domain distribution of the training corpus.
                However, <strong>test-set performance does not guarantee infallible classification on unfamiliar, out-of-domain, or novel news events</strong>.
                Stylistic classifiers may encounter distribution shifts when evaluating emerging slang, satire, or nuanced political debates.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
