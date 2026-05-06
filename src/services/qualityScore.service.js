const confidenceWeights = {
  A: 1.0,
  B: 0.85,
  C: 0.7,
  D: 0.55,
  E: 0.4,
  F: 0.2
};

const expectedRanges = {
  L3: [0, 3],
  L4: [2, 7],
  L5: [5, 15]
};

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getCompletenessWeight(baseSalary, bonus, stock) {
  if (baseSalary > 0 && bonus > 0 && stock > 0) {
    return 1.0;
  }

  if (baseSalary > 0 && ((bonus === 0 && stock > 0) || (bonus > 0 && stock === 0))) {
    return 0.85;
  }

  return 0.7;
}

function getCoherenceWeight(level, experienceYears) {
  if (experienceYears === 0 && level === 'L3') {
    return 1.0;
  }

  if (experienceYears === 0 && (level === 'L4' || level === 'L5')) {
    return 0.7;
  }

  const [minYears, maxYears] = expectedRanges[level];

  if (experienceYears >= minYears && experienceYears <= maxYears) {
    return 1.0;
  }

  const distance = experienceYears < minYears ? minYears - experienceYears : experienceYears - maxYears;
  return distance <= 2 ? 0.85 : 0.7;
}

function calculateQualityScore(salary) {
  const confidenceWeight = confidenceWeights[salary.confidence_score];
  const completenessWeight = getCompletenessWeight(salary.base_salary, salary.bonus, salary.stock);
  const coherenceWeight = getCoherenceWeight(salary.level, salary.experience_years);

  return round(confidenceWeight * completenessWeight * coherenceWeight, 2);
}

module.exports = {
  calculateQualityScore
};
