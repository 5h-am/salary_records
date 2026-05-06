import { useState, useReducer, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatNumber, scoreLabel, avatarColor, companyInitial } from '../lib/format';
import { SkeletonCard } from '../components/Skeleton/Skeleton';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import { useToast } from '../context/ToastContext';
import './compare.css';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS': return { data: action.payload, loading: false, error: null };
    case 'FETCH_ERROR': return { ...state, loading: false, error: action.payload };
    default: return state;
  }
}

const DeltaBadge = ({ value }) => {
  if (value === 0 || value === null) return <span className="delta zero">—</span>;
  const isPositive = value > 0;
  return (
    <span className={`delta ${isPositive ? 'positive' : 'negative'}`}>
      {isPositive ? '+' : '−'}{formatNumber(Math.abs(value))}
    </span>
  );
};

const ComparePanel = ({ side, entry, delta, onCopy }) => {
  if (!entry) return null;

  const getScoreInterpretation = (score) => scoreLabel(score);
  
  const getInterpretationColor = (score) => {
    const label = scoreLabel(score);
    if (label.includes('Well above') || label.includes('Above')) return 'var(--color-positive)';
    if (label.includes('Below')) return 'var(--color-negative)';
    if (label.includes('Slightly below') || label.includes('At market')) return 'var(--color-warning)';
    return 'var(--color-text-dim)';
  };

  return (
    <div className={`compare-panel ${side}`}>
      <div className="panel-header">
        <div className="company-info-row">
          <div className="company-info">
            <div className="company-avatar" style={{ backgroundColor: avatarColor(entry.company) }}>
              {companyInitial(entry.company)}
            </div>
            <div className="header-text">
              <Link to={`/benchmarks?company=${encodeURIComponent(entry.company)}`} className="company-link">
                <h3 className="company-name">{entry.company}</h3>
              </Link>
              <p className="role-text">{entry.role} • <span className="level-badge">{entry.level}</span></p>
            </div>
          </div>
          <div className="id-badge">
            <span className="id-text">{entry.id}</span>
            <button className="copy-btn" onClick={() => onCopy(entry.id)}>📋</button>
          </div>
        </div>
        <p className="location-text">{entry.location}</p>
      </div>

      <div className="metric-cards">
        <MetricCard 
          label="Base Salary" 
          value={entry.base_salary} 
          delta={side === 'entry2' ? delta?.base_salary : null}
          progress={delta?.max_base ? (entry.base_salary / delta.max_base) * 100 : 100}
          side={side}
        />
        <MetricCard 
          label="Bonus" 
          value={entry.bonus} 
          delta={side === 'entry2' ? delta?.bonus : null}
          progress={delta?.max_bonus ? (entry.bonus / delta.max_bonus) * 100 : 100}
          side={side}
        />
        <MetricCard 
          label="Stock" 
          value={entry.stock} 
          delta={side === 'entry2' ? delta?.stock : null}
          progress={delta?.max_stock ? (entry.stock / delta.max_stock) * 100 : 100}
          side={side}
        />
        <MetricCard 
          label="Total Compensation" 
          value={entry.total_compensation} 
          delta={side === 'entry2' ? delta?.total_compensation : null}
          progress={delta?.max_total ? (entry.total_compensation / delta.max_total) * 100 : 100}
          side={side}
          isTotal
        />
      </div>

      <div className="panel-footer">
        <div className="market-assessment">
          <span className="label">Market Assessment</span>
          <p className="interpretation" style={{ color: getInterpretationColor(entry.market_value_score) }}>
            {getScoreInterpretation(entry.market_value_score)}
          </p>
          {entry.market_value_score !== null && (
            <p className="score-val">Score: {entry.market_value_score.toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, delta, progress, side, isTotal }) => (
  <div className={`metric-card ${isTotal ? 'total' : ''}`}>
    <div className="metric-header">
      <span className="metric-label">{label}</span>
      {delta !== null && <DeltaBadge value={delta} />}
    </div>
    <div className="metric-value-row">
      <span className={`metric-value tc-figure ${isTotal ? 'accent' : ''}`}>{formatNumber(value)}</span>
    </div>
    <div className="progress-container">
      <div 
        className="progress-bar" 
        style={{ 
          width: `${progress}%`, 
          backgroundColor: side === 'entry1' ? 'var(--color-accent)' : 'var(--color-surface-2)',
          border: side === 'entry2' ? '1px solid var(--color-border)' : 'none'
        }} 
      />
    </div>
  </div>
);

export default function Compare() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();
  const showToast = useToast();

  const [id1, setId1] = useState(searchParams.get('id1') || sessionStorage.getItem('compare_id1') || '');
  const [id2, setId2] = useState(searchParams.get('id2') || sessionStorage.getItem('compare_id2') || '');
  const [submittedIds, setSubmittedIds] = useState(null);

  useEffect(() => {
    const q1 = searchParams.get('id1');
    const q2 = searchParams.get('id2');
    if (q1 && q2) {
      setId1(q1);
      setId2(q2);
      setSubmittedIds({ id1: q1, id2: q2 });
    } else if (id1 && id2 && !submittedIds) {
      setSubmittedIds({ id1, id2 });
    }
  }, [searchParams]);

  useEffect(() => {
    sessionStorage.setItem('compare_id1', id1);
    sessionStorage.setItem('compare_id2', id2);
  }, [id1, id2]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('ID copied to clipboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!id1.trim() || !id2.trim()) return;
    setSearchParams({ id1: id1.trim(), id2: id2.trim() });
    setSubmittedIds({ id1: id1.trim(), id2: id2.trim() });
  };

  useEffect(() => {
    if (!submittedIds) return;
    dispatch({ type: 'FETCH_START' });
    api.compare(submittedIds.id1, submittedIds.id2)
      .then(data => {
        const maxBase = Math.max(data.entry1.base_salary, data.entry2.base_salary);
        const maxBonus = Math.max(data.entry1.bonus, data.entry2.bonus);
        const maxStock = Math.max(data.entry1.stock, data.entry2.stock);
        const maxTotal = Math.max(data.entry1.total_compensation, data.entry2.total_compensation);
        
        const enhancedData = {
          ...data,
          delta: {
            ...data.delta,
            max_base: maxBase,
            max_bonus: maxBonus,
            max_stock: maxStock,
            max_total: maxTotal
          }
        };
        dispatch({ type: 'FETCH_SUCCESS', payload: enhancedData });
      })
      .catch(err => dispatch({ type: 'FETCH_ERROR', payload: err.message }));
  }, [submittedIds]);

  return (
    <div className="compare-page">
      <div className="page-header">
        <h1 className="page-title">Compare Compensation</h1>
        <form className="id-input-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" placeholder="Salary ID 1" value={id1} onChange={(e) => setId1(e.target.value)} />
            <input type="text" placeholder="Salary ID 2" value={id2} onChange={(e) => setId2(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">Compare</button>
        </form>
      </div>

      {!submittedIds && !state.loading && (
        <div className="search-placeholder">
          Enter two Salary IDs or select them from the Market page to compare.
        </div>
      )}

      {state.loading && (
        <div className="compare-loading">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {state.error && <ErrorMessage message={state.error} onRetry={handleSubmit} />}

      {!state.loading && state.data && (
        <div className="compare-container">
          <div className="level-diff-banner">
            {state.data.delta.level_difference}
          </div>
          <div className="compare-grid">
            <ComparePanel side="entry1" entry={state.data.entry1} delta={state.data.delta} onCopy={copyToClipboard} />
            <ComparePanel side="entry2" entry={state.data.entry2} delta={state.data.delta} onCopy={copyToClipboard} />
          </div>
        </div>
      )}
    </div>
  );
}
