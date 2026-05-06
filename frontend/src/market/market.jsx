import { useState, useReducer, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { formatNumber, avatarColor, companyInitial } from '../lib/format';
import { SkeletonRow } from '../components/Skeleton/Skeleton';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import { useToast } from '../context/ToastContext';
import './market.css';

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

export default function Market() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const showToast = useToast();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({
    role: '',
    level: '',
    location: '',
    page: 1,
    limit: 50
  });

  const [roleInput, setRoleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, role: roleInput, location: locationInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [roleInput, locationInput]);

  const fetchSalaries = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const params = {
        page: filters.page,
        limit: filters.limit
      };
      if (filters.role) params.role = filters.role;
      if (filters.level) params.level = filters.level;
      if (filters.location) params.location = filters.location;
      
      const data = await api.getSalaries(params);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSalaries();
    }, 400); // Simple debounce
    return () => clearTimeout(timeout);
  }, [fetchSalaries]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'level') {
      setFilters(prev => ({ ...prev, level: value, page: 1 }));
    } else if (name === 'role') {
      setRoleInput(value);
    } else if (name === 'location') {
      setLocationInput(value);
    }
  };

  const clearFilters = () => {
    setRoleInput('');
    setLocationInput('');
    setFilters({ role: '', level: '', location: '', page: 1, limit: 50 });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('ID copied to clipboard');
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      navigate(`/compare?id1=${selectedIds[0]}&id2=${selectedIds[1]}`);
    }
  };

  return (
    <div className="market-page">
      <div className="page-header">
        <h1 className="page-title">Market Data</h1>
      </div>

      <div className="market-filters">
        <div className="filter-group">
          <label>Role</label>
          <div className="input-with-indicator">
            <input 
              type="text" 
              name="role" 
              placeholder="e.g. Software Engineer" 
              value={roleInput} 
              onChange={handleFilterChange} 
            />
            {state.loading && roleInput && <div className="input-searching"></div>}
          </div>
        </div>
        <div className="filter-group">
          <label>Level</label>
          <select name="level" value={filters.level} onChange={handleFilterChange}>
            <option value="">All Levels</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
            <option value="L5">L5</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Location</label>
          <div className="input-with-indicator">
            <input 
              type="text" 
              name="location" 
              placeholder="e.g. Remote" 
              value={locationInput} 
              onChange={handleFilterChange} 
            />
            {state.loading && locationInput && <div className="input-searching"></div>}
          </div>
        </div>
        <button className="btn-ghost" onClick={clearFilters}>Clear</button>
      </div>

      <div className="table-container">
        <table className="salary-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Role</th>
              <th>Level</th>
              <th>Company</th>
              <th className="mobile-hide">Location</th>
              <th>Total Comp</th>
            </tr>
          </thead>
          <tbody>
            {state.loading && Array.from({ length: 7 }).map((_, i) => (
              <SkeletonRow key={i} cols={6} />
            ))}
            
            {!state.loading && state.error && (
              <tr>
                <td colSpan="6">
                  <ErrorMessage message={state.error} onRetry={fetchSalaries} />
                </td>
              </tr>
            )}

            {!state.loading && !state.error && state.data?.data.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">No entries found matching your filters.</td>
              </tr>
            )}

            {!state.loading && !state.error && state.data?.data.map(salary => (
              <tr key={salary.id} className={selectedIds.includes(salary.id) ? 'selected-row' : ''}>
                <td>
                  <input 
                    type="checkbox" 
                    className="salary-checkbox"
                    checked={selectedIds.includes(salary.id)} 
                    onChange={() => handleSelect(salary.id)} 
                  />
                </td>
                <td className="role-cell">
                  <div className="role-name">{salary.role}</div>
                  <div className="id-container">
                    <span className="salary-id">{salary.id}</span>
                    <button className="copy-btn" title="Copy ID" onClick={() => copyToClipboard(salary.id)}>📋</button>
                  </div>
                </td>
                <td><span className="level-badge">{salary.level}</span></td>
                <td>
                  <Link to={`/benchmarks?company=${encodeURIComponent(salary.company)}`} className="company-info-link">
                    <div className="company-info">
                      <div className="company-avatar" style={{ backgroundColor: avatarColor(salary.company) }}>
                        {companyInitial(salary.company)}
                      </div>
                      <span className="company-name">{salary.company}</span>
                    </div>
                  </Link>
                </td>
                <td className="mobile-hide">{salary.location}</td>
                <td className="tc-cell tc-figure">{formatNumber(salary.total_compensation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.data?.pagination && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((filters.page - 1) * filters.limit) + 1}–{Math.min(filters.page * filters.limit, state.data.pagination.total)} of {state.data.pagination.total} entries
          </div>
          <div className="pagination-controls">
            {filters.page > 1 && (
              <button 
                className="btn-ghost" 
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Prev
              </button>
            )}
            {filters.page < state.data.pagination.totalPages && (
              <button 
                className="btn-ghost" 
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-info">
            <span className="selection-count">{selectedIds.length} selected</span>
            {selectedIds.length < 2 && <span className="selection-hint">Select one more to compare</span>}
          </div>
          <div className="compare-bar-actions">
            <button className="btn-ghost" onClick={() => setSelectedIds([])}>Clear</button>
            <button 
              className="btn-primary" 
              disabled={selectedIds.length !== 2}
              onClick={handleCompare}
            >
              Compare Salaries
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
