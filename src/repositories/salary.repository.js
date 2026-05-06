const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function create(data) {
  return prisma.salary.create({ data });
}

function findRecentDuplicate(salary) {
  const since = new Date(Date.now() - (24 * 60 * 60 * 1000));

  return prisma.salary.findFirst({
    where: {
      company: salary.company,
      role: salary.role,
      level: salary.level,
      location: salary.location,
      base_salary: salary.base_salary,
      created_at: {
        gte: since
      }
    }
  });
}

function findPeers(level, location, excludeId) {
  const where = { level, location };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  return prisma.salary.findMany({ where });
}

function updateMarketScore(id, data) {
  return prisma.salary.update({
    where: { id },
    data
  });
}

function findAll() {
  return prisma.salary.findMany();
}

function findById(id) {
  return prisma.salary.findUnique({
    where: { id }
  });
}

function findMany(filters, page, limit) {
  const where = {};

  if (filters.company) {
    where.company = String(filters.company).toLowerCase().trim();
  }

  if (filters.role) {
    where.role = String(filters.role).trim();
  }

  if (filters.level) {
    where.level = filters.level;
  }

  if (filters.location) {
    where.location = String(filters.location).trim();
  }

  return Promise.all([
    prisma.salary.findMany({
      where,
      orderBy: {
        total_compensation: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.salary.count({ where })
  ]).then(([data, total]) => ({ data, total }));
}

module.exports = {
  create,
  findRecentDuplicate,
  findPeers,
  updateMarketScore,
  findAll,
  findById,
  findMany
};
