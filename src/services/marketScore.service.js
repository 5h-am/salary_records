const expectedMidpoints = {
  L3: 1.5,
  L4: 4.0,
  L5: 9.0
};

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getPeerGroupMinSize() {
  return parseInt(process.env.PEER_GROUP_MIN_SIZE, 10) || 5;
}

function getTargetN() {
  return parseInt(process.env.N_TARGET, 10) || 30;
}

function calculateExperienceEdge(level, experienceYears) {
  let rawEdge;

  if (experienceYears === 0) {
    rawEdge = level === 'L3' ? 1.5 : 0.6;
  } else {
    rawEdge = expectedMidpoints[level] / experienceYears;
    rawEdge = Math.min(1.5, Math.max(0.6, rawEdge));
  }

  return (rawEdge - 0.6) / (1.5 - 0.6);
}

function getInterpretation(marketValueScore) {
  if (marketValueScore === null) {
    return 'Insufficient peer data';
  }

  if (marketValueScore < 0.35) {
    return 'Below market';
  }

  if (marketValueScore < 0.5) {
    return 'Slightly below market';
  }

  if (marketValueScore < 0.65) {
    return 'At market';
  }

  if (marketValueScore < 0.8) {
    return 'Above market';
  }

  return 'Well above market';
}

function calculateMarketScore(salary, peerGroup) {
  const n = peerGroup.length;
  const peerGroupMinSize = getPeerGroupMinSize();

  if (n === 0) {
    return {
      market_value_score: null,
      peer_group_size: 0,
      insufficient_data: true
    };
  }

  const peerPercentile = n === 1
    ? 0.5
    : peerGroup.filter((peer) => peer.total_compensation < salary.total_compensation).length / n;

  const experienceEdge = calculateExperienceEdge(salary.level, salary.experience_years);
  const guaranteed = salary.base_salary + salary.bonus;
  const stabilityRaw = guaranteed / salary.total_compensation;
  const stabilityRatio = Math.max(0.0, Math.min(1.0, (stabilityRaw - 0.3) / 0.7));
  const rawScore = (peerPercentile * 0.6) + (experienceEdge * 0.25) + (stabilityRatio * 0.15);
  const nTarget = getTargetN();
  const confidenceN = Math.min(1.0, Math.log(n + 1) / Math.log(nTarget + 1));

  return {
    market_value_score: round(0.5 + ((rawScore - 0.5) * confidenceN), 2),
    peer_group_size: n,
    insufficient_data: n < peerGroupMinSize
  };
}

module.exports = {
  calculateMarketScore,
  getInterpretation
};
