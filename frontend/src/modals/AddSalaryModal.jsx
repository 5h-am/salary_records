import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';
import './AddSalaryModal.css';

export default function AddSalaryModal({ isOpen, onClose, onSuccess }) {
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

  // Focus trap and escape key
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
      await api.ingestSalary(body);
      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Salary</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input 
                type="text" 
                id="company" 
                name="company" 
                required 
                value={formData.company} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <input 
                type="text" 
                id="role" 
                name="role" 
                required 
                value={formData.role} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="level">Level *</label>
              <select 
                id="level" 
                name="level" 
                required 
                value={formData.level} 
                onChange={handleChange}
              >
                <option value="L3">L3</option>
                <option value="L4">L4</option>
                <option value="L5">L5</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input 
                type="text" 
                id="location" 
                name="location" 
                required 
                value={formData.location} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience_years">Years of Experience *</label>
              <input 
                type="number" 
                id="experience_years" 
                name="experience_years" 
                required 
                min="0" 
                value={formData.experience_years} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="confidence_score">Confidence Score *</label>
              <select 
                id="confidence_score" 
                name="confidence_score" 
                required 
                value={formData.confidence_score} 
                onChange={handleChange}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="base_salary">Base Salary *</label>
              <input 
                type="number" 
                id="base_salary" 
                name="base_salary" 
                required 
                min="1" 
                value={formData.base_salary} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="bonus">Bonus</label>
              <input 
                type="number" 
                id="bonus" 
                name="bonus" 
                min="0" 
                value={formData.bonus} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock</label>
              <input 
                type="number" 
                id="stock" 
                name="stock" 
                min="0" 
                value={formData.stock} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {serverError && (
            <div className="modal-error">
              <ErrorMessage message={serverError} />
            </div>
          )}

          <div className="modal-footer">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
