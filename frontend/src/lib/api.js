const BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  // Try parsing JSON, but handle cases where body might be empty or non-JSON
  let json;
  try {
    json = await res.json();
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return null;
  }
  
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export const api = {
  getSalaries:        (params) => request(`/salaries?${new URLSearchParams(params)}`),
  getSalary:          (id)     => request(`/salary/${id}`),
  getCompany:         (name)   => request(`/company/${encodeURIComponent(name)}`),
  compare:            (id1, id2) => request(`/compare?salaryId1=${id1}&salaryId2=${id2}`),
  ingestSalary:       (body)   => request('/ingest-salary',    { method: 'POST', body: JSON.stringify(body) }),
  calculateSalary:    (body)   => request('/calculate-salary', { method: 'POST', body: JSON.stringify(body) }),
  recomputeScores:    ()       => request('/recompute-market-scores', { method: 'POST' }),
};
