const salaryService = require('../services/salary.service');

async function ingestSalary(req, res) {
  const result = await salaryService.ingest(req.body);
  res.status(201).json(result);
}

async function calculateSalary(req, res) {
  const result = await salaryService.calculate(req.body);
  res.status(200).json(result);
}

async function recomputeMarketScores(req, res) {
  const result = await salaryService.recomputeAll();
  res.status(200).json(result);
}

async function getSalaryById(req, res) {
  const result = await salaryService.getById(req.params.id);
  res.status(200).json(result);
}

async function listSalaries(req, res) {
  const result = await salaryService.list(req.query);
  res.status(200).json(result);
}

async function compareSalaries(req, res) {
  const result = await salaryService.compare(req.query);
  res.status(200).json(result);
}

module.exports = {
  ingestSalary,
  calculateSalary,
  recomputeMarketScores,
  getSalaryById,
  listSalaries,
  compareSalaries
};
