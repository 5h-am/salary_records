const companyRepository = require('../repositories/company.repository');

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function medianTotalCompensation(salaries) {
  const totals = salaries.map((salary) => salary.total_compensation).sort((a, b) => a - b);
  const middle = Math.floor(totals.length / 2);

  if (totals.length % 2 === 1) {
    return totals[middle];
  }

  return Math.round((totals[middle - 1] + totals[middle]) / 2);
}

function levelDistribution(salaries) {
  return salaries.reduce((distribution, salary) => {
    distribution[salary.level] += 1;
    return distribution;
  }, { L3: 0, L4: 0, L5: 0 });
}

async function getSummary(companyParam) {
  const company = companyParam.toLowerCase().trim();
  const salaries = await companyRepository.findSalariesByCompany(company);

  if (salaries.length === 0) {
    throw httpError(404, 'company not found');
  }

  return {
    company,
    median_total_compensation: medianTotalCompensation(salaries),
    level_distribution: levelDistribution(salaries),
    salaries
  };
}

module.exports = {
  getSummary
};
