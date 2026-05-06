import { useState, useReducer, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatNumber, avatarColor, companyInitial } from '../lib/format';
import { SkeletonCard, SkeletonRow } from '../components/Skeleton/Skeleton';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import { useToast } from '../context/ToastContext';
import './benchmarks.css';

function LevelDistributionChart({ distribution, total }) {
  const [widths, setWidths] = useState({ L3: 0, L4: 0, L5: 0 });

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setWidths({
        L3: total ? (distribution.L3 / total) * 100 : 0,
        L4: total ? (distribution.L4 / total) * 100 : 0,
        L5: total ? (distribution.L5 / total) * 100 : 0,
      });
    });
    return () => cancelAnimationFrame(timer);
  }, [distribution, total]);

  const levels = [
    { label: 'L3', count: distribution.L3, opacity: 0.7 },
    { label: 'L4', count: distribution.L4, opacity: 1.0 },
    { label: 'L5', count: distribution.L5, opacity: 0.85 },
  ];

  return (
    <div className="level-chart">
      {levels.map(({ label, count, opacity }) => (
        <div key={label} className="level-row">
          <div className="level-label">{label}</div>
          <div className="bar-track">
            <div 
              className="bar-fill" 
              style={{ 
                width: `${widths[label]}%`, 
                background: `var(--color-accent)`,
                opacity: opacity
              }} 
            />
          </div>
          <div className="bar-count">{count}</div>
          <div className="bar-pct">{total ? Math.round((count / total) * 100) : 0}%</div>
        </div>
      ))}
    </div>
  );
}

function LevelSelector({ selected, onSelect }) {
  return (
    <div className="level-toggle-group">
      {['L3', 'L4', 'L5'].map(level => (
        <button 
          key={level} 
          className={`level-toggle ${selected === level ? 'active' : ''}`}
          onClick={() => onSelect(level)}
        >
          {level}
        </button>
      ))}
    </div>
  );
}

function HistoricalTrends({ salaries }) {
  const [selectedLevel, setSelectedLevel] = useState('L4');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, month: '', avg: 0, n: 0 });

  const levelSalaries = salaries.filter(s => s.level === selectedLevel);
  const grouped = {};
  for (const s of levelSalaries) {
    const month = new Date(s.created_at).toISOString().slice(0, 7); // "2024-03"
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(s.total_compensation);
  }

  const months = Object.keys(grouped).sort();
  const points = months.map(m => ({
    month: m,
    avg: Math.round(grouped[m].reduce((a, b) => a + b, 0) / grouped[m].length),
    n:   grouped[m].length,
  }));

  const hasEnoughData = points.length >= 3;

  const formatMonth = (m) => {
    const [year, month] = m.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2y' });
  };

  return (
    <div className="trends-container">
      <h3 className="section-title">Historical Trends</h3>
      <LevelSelector selected={selectedLevel} onSelect={setSelectedLevel} />
      
      {levelSalaries.length === 0 ? (
        <div className="empty-trends">No {selectedLevel} entries for this company yet.</div>
      ) : !hasEnoughData ? (
        <div className="warning-panel">
          <div className="warning-icon">⚠</div>
          <div className="warning-content">
            <div className="warning-title">Not enough historical data for {selectedLevel} trends yet.</div>
            <div className="warning-text">
              {levelSalaries.length} {levelSalaries.length === 1 ? 'entry' : 'entries'} found
              across {points.length} {points.length === 1 ? 'month' : 'months'}.
              At least 3 months of data are needed to show a trend.
            </div>
          </div>
        </div>
      ) : (
        <div className="chart-wrapper" style={{ position: 'relative' }}>
          <TrendChart points={points} setTooltip={setTooltip} />
          {tooltip.visible && (
            <div 
              className="chart-tooltip" 
              style={{ 
                position: 'absolute', 
                left: tooltip.x, 
                top: tooltip.y, 
                transform: 'translate(-50%, -120%)',
                pointerEvents: 'none'
              }}
            >
              <div className="tooltip-month">{tooltip.month}</div>
              <div className="tooltip-avg">{formatNumber(tooltip.avg)}</div>
              <div className="tooltip-n">{tooltip.n} entries</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrendChart({ points, setTooltip }) {
  const CHART_W = 600;
  const CHART_H = 200;
  const PAD = { top: 16, right: 16, bottom: 40, left: 64 };
  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top  - PAD.bottom;

  const avgs = points.map(p => p.avg);
  const minVal = Math.min(...avgs);
  const maxVal = Math.max(...avgs);
  const range  = maxVal - minVal || 1;

  const xOf = i => PAD.left + (i / (points.length - 1)) * innerW;
  const yOf = v => PAD.top  + innerH - ((v - minVal) / range) * innerH;

  const linePoints = points.map((p, i) => `${xOf(i)},${yOf(p.avg)}`).join(' ');
  const areaPath = [
    `M ${xOf(0)},${yOf(points[0].avg)}`,
    ...points.slice(1).map((p, i) => `L ${xOf(i + 1)},${yOf(p.avg)}`),
    `L ${xOf(points.length - 1)},${PAD.top + innerH}`,
    `L ${xOf(0)},${PAD.top + innerH}`,
    'Z',
  ].join(' ');

  const formatMonth = (m) => {
    const [year, month] = m.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2y' });
  };

  const yLabels = [minVal, minVal + range / 2, maxVal];

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} width="100%" height="auto">
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--palette-blue)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--palette-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Guide lines */}
      {yLabels.map(val => (
        <line 
          key={val}
          x1={PAD.left} 
          x2={CHART_W - PAD.right} 
          y1={yOf(val)} 
          y2={yOf(val)} 
          stroke="var(--color-border)" 
          strokeWidth="0.5" 
          strokeDasharray="4 4" 
        />
      ))}

      <path d={areaPath} fill="url(#areaGrad)" />
      <polyline points={linePoints} fill="none" stroke="var(--palette-blue)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      
      {points.map((p, i) => (
        <circle 
          key={i} 
          cx={xOf(i)} 
          cy={yOf(p.avg)} 
          r="3" 
          fill="var(--palette-blue)" 
          className="chart-dot"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.closest('svg').getBoundingClientRect();
            setTooltip({
              visible: true,
              x: (xOf(i) / CHART_W) * rect.width,
              y: (yOf(p.avg) / CHART_H) * rect.height,
              month: formatMonth(p.month),
              avg: p.avg,
              n: p.n
            });
          }}
          onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
        />
      ))}

      {/* X-axis labels */}
      {points.map((p, i) => {
        if (points.length > 8 && i % 2 !== 0) return null;
        return (
          <text 
            key={i} 
            x={xOf(i)} 
            y={CHART_H - 8} 
            fontSize="10" 
            textAnchor="middle" 
            fill="var(--color-text-muted)"
          >
            {formatMonth(p.month)}
          </text>
        );
      })}

      {/* Y-axis labels */}
      {yLabels.map(val => (
        <text 
          key={val} 
          x={PAD.left - 8} 
          y={yOf(val) + 3} 
          textAnchor="end" 
          fontSize="10" 
          fill="var(--color-text-muted)"
        >
          {formatNumber(val)}
        </text>
      ))}
    </svg>
  );
}

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

export default function Benchmarks() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const showToast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyFromQuery = searchParams.get('company') || '';
  const [companyInput, setCompanyInput] = useState(companyFromQuery);
  const [submittedName, setSubmittedName] = useState(companyFromQuery);

  useEffect(() => {
    const fromQuery = searchParams.get('company');
    if (fromQuery) {
      setSubmittedName(fromQuery);
      setCompanyInput(fromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!submittedName) return;
    
    dispatch({ type: 'FETCH_START' });
    api.getCompany(submittedName)
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(err => {
        if (err.message.toLowerCase().includes('not found')) {
          dispatch({ type: 'FETCH_SUCCESS', payload: { company: null } });
        } else {
          dispatch({ type: 'FETCH_ERROR', payload: err.message });
        }
      });
  }, [submittedName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyInput.trim()) return;
    setSearchParams({ company: companyInput.trim() });
    setSubmittedName(companyInput.trim());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('ID copied to clipboard');
  };

  return (
    <div className="benchmarks-page">
      <div className="page-header">
        <h1 className="page-title">Company Benchmarks</h1>
        <form className="company-search" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Search company..." 
            value={companyInput} 
            onChange={(e) => setCompanyInput(e.target.value)} 
          />
          <button type="submit" className="btn-primary">Look Up</button>
        </form>
      </div>

      {!submittedName && !state.loading && (
        <div className="search-placeholder">
          Enter a company name to see compensation benchmarks.
        </div>
      )}

      {state.loading && (
        <div className="benchmarks-loading">
          <div className="stat-cards">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="table-container">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>Role</th><th>Level</th><th>Base</th><th>Bonus</th><th>Stock</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {state.error && <ErrorMessage message={state.error} onRetry={() => setSubmittedName(submittedName)} />}

      {!state.loading && state.data && !state.data.company && (
        <div className="empty-state">No data for this company yet.</div>
      )}

      {!state.loading && state.data && state.data.company && (
        <div className="benchmarks-content">
          <div className="company-hero">
            <div className="company-avatar large" style={{ backgroundColor: avatarColor(state.data.company) }}>
              {companyInitial(state.data.company)}
            </div>
            <h2 className="company-name-display">{state.data.company}</h2>
            {state.data.insufficient_data && (
              <span className="low-data-badge">Low data</span>
            )}
          </div>

          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-label">Median Total Compensation</span>
              <span className="stat-value accent tc-figure">{formatNumber(state.data.median_total_compensation)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Level Distribution</span>
              <LevelDistributionChart distribution={state.data.level_distribution} total={state.data.salaries.length} />
            </div>
          </div>

          <HistoricalTrends salaries={state.data.salaries} />

          <div className="table-container">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Level</th>
                  <th>YOE</th>
                  <th>Base</th>
                  <th>Bonus</th>
                  <th>Stock</th>
                  <th>Total</th>
                  <th>Score</th>
                  <th>Peers</th>
                </tr>
              </thead>
              <tbody>
                {state.data.salaries.map(salary => (
                  <tr key={salary.id}>
                    <td>
                      <div className="role-name">{salary.role}</div>
                      <div className="id-container">
                        <span className="salary-id">{salary.id}</span>
                        <button className="copy-btn" title="Copy ID" onClick={() => copyToClipboard(salary.id)}>📋</button>
                      </div>
                    </td>
                    <td><span className="level-badge">{salary.level}</span></td>
                    <td className="tc-figure">{salary.experience_years}y</td>
                    <td className="tc-figure">{formatNumber(salary.base_salary)}</td>
                    <td className="tc-figure">{formatNumber(salary.bonus)}</td>
                    <td className="tc-figure">{formatNumber(salary.stock)}</td>
                    <td className="tc-cell tc-figure">{formatNumber(salary.total_compensation)}</td>
                    <td className="score-cell tc-figure">{salary.market_value_score?.toFixed(2) || '—'}</td>
                    <td className="tc-figure">{salary.peer_group_size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
