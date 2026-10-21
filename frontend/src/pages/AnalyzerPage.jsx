import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  ShieldAlert, 
  FileText, 
  BookOpen,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { SAMPLE_ARTICLES } from '../services/sampleData';
import ScanVisualizer from '../components/ScanVisualizer';

export default function AnalyzerPage({ setActivePage, showToast }) {
  const [inputText, setInputText] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState('');

  const minChars = 15;
  const maxChars = 50000;
  const currentChars = inputText.trim().length;
  const currentWords = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const isInputValid = currentChars >= minChars && currentChars <= maxChars;

  const handleSelectSample = (sample) => {
    setInputTitle(sample.title);
    setInputText(sample.text);
    setSelectedSampleId(sample.id);
    setErrorMessage(null);
    setResult(null);
    if (showToast) {
      showToast(`Loaded benchmark sample: "${sample.title.slice(0, 36)}..."`, 'info');
    }
  };

  const handleClear = () => {
    setInputText('');
    setInputTitle('');
    setSelectedSampleId('');
    setResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    if (!isInputValid || isAnalyzing) return;

    setErrorMessage(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Direct call to real Flask API
      const response = await api.predict(inputText.trim(), inputTitle.trim());
      setResult(response);
      if (showToast) {
        showToast(
          `Analysis complete: classified as ${response.prediction} (${response.confidence_pct})`,
          response.prediction === 'Likely Real' ? 'success' : 'warning'
        );
      }
    } catch (err) {
      console.error('Prediction failed:', err);
      const msg = err.data?.error || err.message || 'Analysis failed. Please verify API connection.';
      setErrorMessage(msg);
      if (showToast) {
        showToast(msg, 'error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    const textToCopy = `VERITAS AI Classification Report:
Prediction: ${result.prediction}
Confidence: ${result.confidence_pct}
Raw Decision Log-Odds: ${result.raw_score}
Identifier: ${result.id}
Date: ${new Date(result.created_at).toLocaleString()}
Limitation: Model estimates statistical vocabulary patterns; not factual verification.`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (showToast) showToast('Classification summary copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="container" style={{ padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ maxWidth: '860px', margin: '0 auto 36px', textAlign: 'center' }}>
        <div className="eyebrow-badge" style={{ marginBottom: '16px' }}>
          <span className="eyebrow-dot" />
          <span>Supervised Text Intelligence Workspace</span>
        </div>
        <h1 className="text-editorial-lg" style={{ marginBottom: '16px' }}>
          Analyze News Article
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Paste raw news article text or a headline to evaluate linguistic and lexical markers
          using our TF-IDF + Platt-calibrated Support Vector Machine.
        </p>
      </div>

      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        {/* Curated Benchmark Samples Bar */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BookOpen size={16} color="var(--cyan-primary)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff' }}>
              Quick Interactive Benchmark Samples:
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SAMPLE_ARTICLES.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              const isReal = sample.category === 'Real';
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: isSelected
                      ? (isReal ? 'var(--real-bg)' : 'var(--fake-bg)')
                      : 'var(--bg-surface)',
                    border: `1px solid ${
                      isSelected
                        ? (isReal ? 'var(--real-border)' : 'var(--fake-border)')
                        : 'var(--border-subtle)'
                    }`,
                    color: isSelected
                      ? (isReal ? 'var(--real-color)' : 'var(--fake-color)')
                      : 'var(--text-secondary)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isReal ? 'var(--real-color)' : 'var(--fake-color)',
                    }}
                  />
                  <span>{sample.title.slice(0, 32)}...</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* News Text Editor Panel */}
        <div
          className={`editorial-card ${isAnalyzing ? 'card-glowing-cyan scanner-container' : ''}`}
          style={{ padding: '32px', marginBottom: '32px' }}
        >
          {isAnalyzing && <div className="scanner-line" />}

          {/* Optional Headline input */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="news-title-input"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              Headline / Title (Optional)
            </label>
            <input
              id="news-title-input"
              type="text"
              placeholder="e.g. Landmark Renewable Energy Accord Finalized in Geneva..."
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              disabled={isAnalyzing}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-cyan)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {/* Main Article Body Text Area */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="news-body-input"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              <span>Article Text or Full Statement *</span>
              <span>Min {minChars} Chars</span>
            </label>
            <textarea
              id="news-body-input"
              rows={8}
              placeholder="Paste article body text, quotes, or statements here..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isAnalyzing}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--bg-primary)',
                border: `1px solid ${
                  currentChars > 0 && currentChars < minChars
                    ? 'rgba(239, 68, 68, 0.4)'
                    : 'var(--border-subtle)'
                }`,
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-sans)',
                lineHeight: '1.6',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-cyan)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {/* Live Character & Word Count Status */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>
                Characters: <strong style={{ color: currentChars >= minChars ? '#fff' : 'var(--text-muted)' }}>{currentChars.toLocaleString()}</strong> / {maxChars.toLocaleString()}
              </span>
              <span>
                Words: <strong style={{ color: '#fff' }}>{currentWords.toLocaleString()}</strong>
              </span>
            </div>

            {currentChars > 0 && currentChars < minChars && (
              <span style={{ color: 'var(--fake-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} /> Need at least {minChars - currentChars} more characters
              </span>
            )}
          </div>

          {/* Action Buttons Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            <button
              onClick={handleClear}
              disabled={isAnalyzing || (!inputText && !inputTitle)}
              className="btn btn-secondary btn-sm"
              type="button"
            >
              <RotateCcw size={14} />
              <span>Clear Editor</span>
            </button>

            <button
              onClick={handleAnalyze}
              disabled={!isInputValid || isAnalyzing}
              className="btn btn-primary"
              id="btn-analyze-submit"
              type="button"
              style={{ minWidth: '180px' }}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Evaluating Signal...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Analyze News</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* In-Flight Scanning Lifecycle Animation */}
        {isAnalyzing && (
          <div style={{ marginBottom: '32px' }}>
            <ScanVisualizer />
          </div>
        )}

        {/* Error Feedback Display */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: '18px 24px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid var(--fake-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--fake-color)',
              marginBottom: '32px',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                Analysis Request Failed
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {errorMessage}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            RESULT PRESENTATION CARD (SECTION 8)
            ========================================================================= */}
        {result && (
          <div
            className="editorial-card"
            style={{
              border: `1px solid ${
                result.prediction === 'Likely Real' ? 'var(--real-border)' : 'var(--fake-border)'
              }`,
              background: 'var(--bg-secondary)',
              boxShadow: result.prediction === 'Likely Real' ? 'var(--real-glow)' : 'var(--fake-glow)',
              padding: '36px',
              marginBottom: '32px',
              animation: 'resultFadeIn 350ms var(--ease-spring)',
            }}
          >
            <style>{`
              @keyframes resultFadeIn {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* Classification Header */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '28px',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Classification Assessment
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    className={result.prediction === 'Likely Real' ? 'badge-real' : 'badge-fake'}
                    style={{ fontSize: '1.15rem', padding: '6px 18px', fontWeight: 700 }}
                  >
                    {result.prediction === 'Likely Real' ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    {result.prediction}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                    {result.confidence_pct}
                  </span>
                </div>
              </div>

              {/* Action buttons on Result */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCopyResult}
                  className="btn btn-secondary btn-sm"
                  title="Copy result report"
                >
                  {copied ? <Check size={14} color="var(--real-color)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
                <button
                  onClick={() => {
                    setActivePage('history');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={14} />
                  <span>View in History</span>
                </button>
              </div>
            </div>

            {/* Probability Scale Bar */}
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                }}
              >
                <span>Likely Real: {(result.probabilities.likely_real * 100).toFixed(1)}%</span>
                <span>Likely Fake: {(result.probabilities.likely_fake * 100).toFixed(1)}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  display: 'flex',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: `${result.probabilities.likely_real * 100}%`,
                    background: 'var(--real-color)',
                    transition: 'width 600ms ease',
                  }}
                />
                <div
                  style={{
                    width: `${result.probabilities.likely_fake * 100}%`,
                    background: 'var(--fake-color)',
                    transition: 'width 600ms ease',
                  }}
                />
              </div>
            </div>

            {/* Decision Metrics Detail Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  RAW LOG-ODDS SCORE
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  {result.raw_score > 0 ? `+${result.raw_score}` : result.raw_score}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Signed hyperplane distance (Platt calibrated)
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  PREDICTION IDENTIFIER
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
                  {result.id}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Persistent SQLite audit record
                </div>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  DOCUMENT STATS
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  {result.word_count} words
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {result.char_count} normalized characters
                </div>
              </div>
            </div>

            {/* Salient Distinguishing Terms */}
            {result.salient_terms && result.salient_terms.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Top Discriminating Lexical Features (TF-IDF Weight):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.salient_terms.map((termObj, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(0, 240, 255, 0.06)',
                        border: '1px solid var(--border-cyan)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.76rem',
                        color: 'var(--cyan-primary)',
                      }}
                    >
                      {termObj.term} <span style={{ color: 'var(--text-muted)' }}>({termObj.tfidf_score})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Scientific Disclaimer Notice */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
              }}
            >
              <Info size={16} color="var(--cyan-dim)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#fff' }}>Probabilistic Estimation Notice:</strong> {result.limitation_notice}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
