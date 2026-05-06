require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { calculateQualityScore } = require('../src/services/qualityScore.service');
const { calculateMarketScore } = require('../src/services/marketScore.service');

const prisma = new PrismaClient();

const seedData = [
  {
    company: 'google',
    role: 'Software Engineer',
    level: 'L4',
    location: 'Bangalore',
    experience_years: 4,
    base_salary: 3500000,
    bonus: 800000,
    stock: 1500000,
    confidence_score: 'A'
  },
  {
    company: 'microsoft',
    role: 'Software Engineer',
    level: 'L4',
    location: 'Hyderabad',
    experience_years: 3,
    base_salary: 2800000,
    bonus: 500000,
    stock: 1000000,
    confidence_score: 'B'
  },
  {
    company: 'amazon',
    role: 'Software Development Engineer',
    level: 'L3',
    location: 'Bangalore',
    experience_years: 1,
    base_salary: 2200000,
    bonus: 300000,
    stock: 800000,
    confidence_score: 'A'
  },
  {
    company: 'flipkart',
    role: 'Senior Software Engineer',
    level: 'L5',
    location: 'Bangalore',
    experience_years: 7,
    base_salary: 4500000,
    bonus: 1200000,
    stock: 2000000,
    confidence_score: 'B'
  },
  {
    company: 'swiggy',
    role: 'Software Engineer',
    level: 'L4',
    location: 'Mumbai',
    experience_years: 3,
    base_salary: 2500000,
    bonus: 400000,
    stock: 0,
    confidence_score: 'D'
  }
];

async function main() {
  const inserted = [];

  for (const entry of seedData) {
    const salary = {
      ...entry,
      total_compensation: entry.base_salary + entry.bonus + entry.stock
    };
    salary.quality_score = calculateQualityScore(salary);

    inserted.push(await prisma.salary.create({ data: salary }));
  }

  for (const record of inserted) {
    const peerGroup = await prisma.salary.findMany({
      where: {
        level: record.level,
        location: record.location,
        id: {
          not: record.id
        }
      }
    });
    const marketScore = calculateMarketScore(record, peerGroup);

    await prisma.salary.update({
      where: { id: record.id },
      data: {
        ...marketScore,
        market_score_computed_at: new Date()
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
