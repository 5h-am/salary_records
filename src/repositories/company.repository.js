const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function findSalariesByCompany(company) {
  return prisma.salary.findMany({
    where: { company },
    orderBy: {
      total_compensation: 'desc'
    }
  });
}

module.exports = {
  findSalariesByCompany
};
