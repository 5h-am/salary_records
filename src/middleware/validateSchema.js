const LEVELS = ['L3', 'L4', 'L5'];
const CONFIDENCE_SCORES = ['A', 'B', 'C', 'D', 'E', 'F'];

function reject(res, reason) {
  return res.status(400).json({ error: reason });
}

function validateSalaryPayload(req, res, next) {
  const body = req.body || {};

  if (typeof body.company !== 'string' || body.company.length === 0) {
    return reject(res, 'company is required');
  }

  if (typeof body.role !== 'string' || body.role.length === 0) {
    return reject(res, 'role is required');
  }

  if (!LEVELS.includes(body.level)) {
    return reject(res, 'level must be one of L3, L4, L5');
  }

  if (typeof body.location !== 'string' || body.location.length === 0) {
    return reject(res, 'location is required');
  }

  if (!Number.isInteger(body.experience_years) || body.experience_years < 0) {
    return reject(res, 'experience_years must be a non-negative integer');
  }

  if (!Number.isInteger(body.base_salary) || body.base_salary <= 0) {
    return reject(res, 'base_salary must be a positive integer');
  }

  if (body.bonus !== undefined && (!Number.isInteger(body.bonus) || body.bonus < 0)) {
    return reject(res, 'bonus must be a non-negative integer');
  }

  if (body.stock !== undefined && (!Number.isInteger(body.stock) || body.stock < 0)) {
    return reject(res, 'stock must be a non-negative integer');
  }

  if (!CONFIDENCE_SCORES.includes(body.confidence_score)) {
    return reject(res, 'confidence_score must be one of A, B, C, D, E, F');
  }

  if (body.bonus === undefined) {
    body.bonus = 0;
  }

  if (body.stock === undefined) {
    body.stock = 0;
  }

  next();
}

module.exports = validateSalaryPayload;
