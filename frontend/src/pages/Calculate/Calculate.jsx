import { Form, useActionData, useNavigation } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatNumber } from '../../lib/format';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './Calculate.css';

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const body = {
    company: data.company,
    role: data.role,
    level: data.level,
    location: data.location,
    experience_years: Number(data.experience_years),
    base_salary: Number(data.base_salary),
    confidence_score: data.confidence_score
  };

  if (data.bonus) body.bonus = Number(data.bonus);
  if (data.stock) body.stock = Number(data.stock);

  try {
    const result = await api.calculateSalary(body);
    return { result };
  } catch (err) {
    return { error: err.message };
  }
}

export default function Calculate() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const submitting = navigation.state === 'submitting';

  const getInterpretationColor = (label) => {
    if (!label) return 'var(--color-text-primary)';
    if (label.includes('Well above') || label.includes('Above')) return 'var(--color-positive)';
    if (label.includes('Below')) return 'var(--color-negative)';
    if (label.includes('Slightly below') || label.includes('At market')) return 'var(--color-warning)';
    return 'var(--color-text-dim)';
  };

  return (
    <div className="calculate-page">
      <div className="page-header">
        <h1 className="page-title">Salary Calculator</h1>
        <p className="page-subtitle">Get an ephemeral market assessment of your compensation.</p>
      </div>

      <div className="calculate-container">
        <div className="calculate-card">
          <Form method="post" className="calculate-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="company">Company *</label>
                <input type="text" id="company" name="company" required placeholder="e.g. Google" />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <input type="text" id="role" name="role" required placeholder="e.g. Software Engineer" />
              </div>
              <div className="form-group">
                <label htmlFor="level">Level *</label>
                <select id="level" name="level" required>
                  <option value="L3">L3</option>
                  <option value="L4">L4</option>
                  <option value="L5">L5</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input type="text" id="location" name="location" required placeholder="e.g. Remote" />
              </div>
              <div className="form-group">
                <label htmlFor="experience_years">Years of Experience *</label>
                <input type="number" id="experience_years" name="experience_years" required min="0" defaultValue="0" />
              </div>
              <div className="form-group">
                <label htmlFor="confidence_score">Confidence Score *</label>
                <select id="confidence_score" name="confidence_score" required defaultValue="C">
                  <option value="A">A (Verified)</option>
                  <option value="B">B</option>
                  <option value="C">C (Standard)</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F (Speculative)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="base_salary">Base Salary *</label>
                <input type="number" id="base_salary" name="base_salary" required min="1" placeholder="0" />
              </div>
              <div className="form-group">
                <label htmlFor="bonus">Annual Bonus</label>
                <input type="number" id="bonus" name="bonus" min="0" placeholder="0" />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Annual Stock / Equity</label>
                <input type="number" id="stock" name="stock" min="0" placeholder="0" />
              </div>
            </div>

            {actionData?.error && (
              <div className="form-error">
                <ErrorMessage message={actionData.error} />
              </div>
            )}

            <div className="form-footer">
              <button type="submit" className="btn-primary calculate-submit" disabled={submitting}>
                {submitting ? 'Calculating...' : 'Generate Assessment'}
              </button>
            </div>
          </Form>
        </div>

        {actionData?.result && (
          <div className="result-card">
            <h2 className="result-title">Market Assessment</h2>
            <div className="result-grid">
              <div className="result-item">
                <span className="result-label">Total Compensation</span>
                <span className="result-value accent tc-figure">{formatNumber(actionData.result.total_compensation)}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Quality Score</span>
                <span className="result-value tc-figure">{actionData.result.quality_score} / 1.00</span>
              </div>
              <div className="result-item">
                <span className="result-label">Market Value Score</span>
                <span className="result-value tc-figure">{actionData.result.market_value_score ?? "—"}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Peer Group Size</span>
                <span className="result-value tc-figure">{actionData.result.peer_group_size}</span>
              </div>
              <div className="result-item full">
                <span className="result-label">Interpretation</span>
                <span className="result-value" style={{ color: getInterpretationColor(actionData.result.score_interpretation) }}>
                  {actionData.result.score_interpretation}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Insufficient Data</span>
                <span className="result-value">
                  {actionData.result.insufficient_data ? <span style={{ color: 'var(--color-accent-yellow)' }}>Yes ⚠</span> : "No"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
