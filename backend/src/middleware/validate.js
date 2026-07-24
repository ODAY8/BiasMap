const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details: errors.array() } });
  next();
};

module.exports = validate;
