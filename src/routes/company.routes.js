const express = require('express');
const companyHandler = require('../handlers/company.handler');

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/company/:company', asyncHandler(companyHandler.getCompanySummary));

module.exports = router;
