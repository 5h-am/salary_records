const companyService = require('../services/company.service');

async function getCompanySummary(req, res) {
  const result = await companyService.getSummary(req.params.company);
  res.status(200).json(result);
}

module.exports = {
  getCompanySummary
};
