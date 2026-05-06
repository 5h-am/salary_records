const salaryRepository = require('../repositories/salary.repository');
const { calculateQualityScore } = require('./qualityScore.service');
const { calculateMarketScore, getInterpretation } = require('./marketScore.service');

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function withComputedFields(input) {
  const salary = {
    ...input,
    bonus: input.bonus ?? 0,
    stock: input.stock ?? 0
  };

  salary.total_compensation = salary.base_salary + salary.bonus + salary.stock;
  salary.quality_score = calculateQualityScore(salary);

  return salary;
}

function toIngestResponse(salary) {
  return {
    id: salary.id,
    total_compensation: salary.total_compensation,
    quality_score: salary.quality_score,
    market_value_score: salary.market_value_score,
    peer_group_size: salary.peer_group_size,
    insufficient_data: salary.insufficient_data
  };
}

async function ingest(input) {
  const salary = withComputedFields(input);
  const duplicate = await salaryRepository.findRecentDuplicate(salary);

  if (duplicate) {
    throw httpError(409, 'duplicate entry detected');
  }

  const created = await salaryRepository.create(salary);
  const peerGroup = await salaryRepository.findPeers(created.level, created.location, created.id);
  const marketScore = calculateMarketScore(created, peerGroup);
  const updated = await salaryRepository.updateMarketScore(created.id, {
    ...marketScore,
    market_score_computed_at: new Date()
  });

  return toIngestResponse(updated);
}

async function calculate(input) {
  const salary = withComputedFields(input);
  const peerGroup = await salaryRepository.findPeers(salary.level, salary.location);
  const marketScore = calculateMarketScore(salary, peerGroup);

  return {
    total_compensation: salary.total_compensation,
    quality_score: salary.quality_score,
    market_value_score: marketScore.market_value_score,
    score_interpretation: getInterpretation(marketScore.market_value_score),
    peer_group_size: marketScore.peer_group_size,
    insufficient_data: marketScore.insufficient_data
  };
}

async function recomputeAll() {
  const records = await salaryRepository.findAll();
  const errors = [];
  let updated = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const peerGroup = records.filter((peer) => (
        peer.id !== record.id &&
        peer.level === record.level &&
        peer.location === record.location
      ));
      const marketScore = calculateMarketScore(record, peerGroup);

      await salaryRepository.updateMarketScore(record.id, {
        ...marketScore,
        market_score_computed_at: new Date()
      });
      updated += 1;
    } catch (error) {
      console.error(error);
      failed += 1;
      errors.push({ id: record.id, error: error.message });
    }
  }

  return { updated, failed, errors };
}

async function getById(id) {
  const salary = await salaryRepository.findById(id);

  if (!salary) {
    throw httpError(404, 'salary not found');
  }

  return salary;
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  if (!/^\d+$/.test(String(value))) {
    return fallback;
  }

  return parseInt(value, 10);
}

async function list(query) {
  const page = parsePositiveInteger(query.page, 1);
  const requestedLimit = parsePositiveInteger(query.limit, 50);
  const limit = Math.min(requestedLimit, 100);
  const filters = {
    company: query.company,
    role: query.role,
    level: query.level,
    location: query.location
  };

  const { data, total } = await salaryRepository.findMany(filters, page, limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

function compareEntry(entry) {
  return {
    id: entry.id,
    company: entry.company,
    role: entry.role,
    level: entry.level,
    location: entry.location,
    base_salary: entry.base_salary,
    bonus: entry.bonus,
    stock: entry.stock,
    total_compensation: entry.total_compensation,
    market_value_score: entry.market_value_score
  };
}

async function compare(query) {
  const { salaryId1, salaryId2 } = query;

  if (!salaryId1 || !salaryId2) {
    throw httpError(400, 'both salaryId1 and salaryId2 are required');
  }

  const entry1 = await salaryRepository.findById(salaryId1);
  if (!entry1) {
    throw httpError(404, `salary ${salaryId1} not found`);
  }

  const entry2 = await salaryRepository.findById(salaryId2);
  if (!entry2) {
    throw httpError(404, `salary ${salaryId2} not found`);
  }

  const levelDifference = entry1.level === entry2.level
    ? `both are ${entry1.level}`
    : `entry1 is ${entry1.level}, entry2 is ${entry2.level}`;

  return {
    entry1: compareEntry(entry1),
    entry2: compareEntry(entry2),
    delta: {
      base_salary: entry2.base_salary - entry1.base_salary,
      bonus: entry2.bonus - entry1.bonus,
      stock: entry2.stock - entry1.stock,
      total_compensation: entry2.total_compensation - entry1.total_compensation,
      level_difference: levelDifference
    }
  };
}

module.exports = {
  ingest,
  calculate,
  recomputeAll,
  getById,
  list,
  compare
};
