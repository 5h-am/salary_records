const express = require('express');
const normalize = require('../middleware/normalize');
const validateSchema = require('../middleware/validateSchema');
const validateCalculate = require('../middleware/validateCalculate');
const salaryHandler = require('../handlers/salary.handler');

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/ingest-salary', normalize, validateSchema, asyncHandler(salaryHandler.ingestSalary));
router.post('/calculate-salary', normalize, validateCalculate, asyncHandler(salaryHandler.calculateSalary));
router.post('/recompute-market-scores', asyncHandler(salaryHandler.recomputeMarketScores));
router.get('/salary/:id', asyncHandler(salaryHandler.getSalaryById));
router.get('/salaries', asyncHandler(salaryHandler.listSalaries));
router.get('/compare', asyncHandler(salaryHandler.compareSalaries));

module.exports = router;
