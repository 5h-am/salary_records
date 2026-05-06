function normalize(req, res, next) {
  if (req.body && typeof req.body.company === 'string') {
    req.body.company = req.body.company.toLowerCase().trim();
  }

  if (req.body && typeof req.body.role === 'string') {
    req.body.role = req.body.role.trim();
  }

  if (req.body && typeof req.body.location === 'string') {
    req.body.location = req.body.location.trim();
  }

  next();
}

module.exports = normalize;
