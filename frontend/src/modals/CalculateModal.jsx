import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatNumber, scoreLabel } from '../lib/format';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import './CalculateModal.css';

export default function CalculateModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    level: 'L3',
    location: '',
    experience_years: 0,
    base_salary: '',
    bonus: '',
    stock: '',
    confidence_score: 'C'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setServerError(null);
    setResult(null);

    const body = {
      company: formData.company,
      role: formData.role,
      level: formData.level,
      location: formData.location,
      experience_years: Number(formData.experience_years),
      base_salary: Number(formData.base_salary),
      confidence_score: formData.confidence_score
    };

    if (formData.bonus !== '') body.bonus = Number(formData.bonus);
    if (formData.stock !== '') body.stock = Number(formData.stock);

    try {
      const data = await api.calculateSalary(body);
      setResult(data);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getInterpretationColor = (label) => {
    if (label.includes('Well above') || label.includes('Above')) return 'var(--color-positive)';
    if (label.includes('Below')) return 'var(--color-negative)';
    if (label.includes('Slightly below') || label.includes('At market')) return 'var(--color-warning)';
    return 'var(--color-text-dim)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Calculate Assessment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Company *</label>
              <input type="text" name="company" required value={formData.company} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <input type="text" name="role" required value={formData.role} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Level *</label>
              <select name="level" required value={formData.level} onChange={handleChange}>
                <option value="L3">L3</option>
                <option value="L4">L4</option>
                <option value="L5">L5</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Experience Years *</label>
              <input type="number" name="experience_years" required min="0" value={formData.experience_years} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Base Salary *</label>
              <input type="number" name="base_salary" required min="1" value={formData.base_salary} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Bonus</label>
              <input type="number" name="bonus" min="0" value={formData.bonus} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" min="0" value={formData.stock} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Confidence *</label>
              <select name="confidence_score" required value={formData.confidence_score} onChange={handleChange}>
                <option value="A">A</option><option value="B">B</option><option value="C">C</option>
                <option value="D">D</option><option value="E">E</option><option value="F">F</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
        </form>

        {serverError && <div className="modal-result-error"><ErrorMessage message={serverError} /></div>}

        {result && (
          <div className="result-section">
            <h3 className="result-title">Market Assessment</h3>
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">Total Compensation</span>
                <span className="result-value accent">{formatNumber(result.total_compensation)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Quality Score</span>
                <span className="result-value">{result.quality_score} / 1.00</span>
              </div>
              <div className="result-item">
                <span className="result-label">Market Value Score</span>
                <span className="result-value">{result.market_value_score ?? "—"}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Peer Group Size</span>
                <span className="result-value">{result.peer_group_size}</span>
              </div>
              <div className="result-item full">
                <span className="result-label">Interpretation</span>
                <span className="result-value" style={{ color: getInterpretationColor(result.score_interpretation) }}>
                  {result.score_interpretation}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Insufficient Data</span>
                <span className="result-value">
                  {result.insufficient_data ? <span style={{ color: 'var(--color-accent-yellow)' }}>Yes ⚠</span> : "No"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
