const { body, validationResult } = require('express-validator');

const createFilmValidationRules = () => {
  return [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 255 })
      .withMessage('Title must be at most 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be at most 1000 characters'),
    body('duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    body('published')
      .optional()
      .isBoolean()
      .withMessage('Published must be a boolean'),
    body('artistIds')
      .optional()
      .custom((value) => {
        if (!Array.isArray(value) && typeof value !== 'string') {
          throw new Error('artistIds must be an array or JSON string');
        }
        return true;
      }),
    body('genreIds')
      .optional()
      .custom((value) => {
        if (!Array.isArray(value) && typeof value !== 'string') {
          throw new Error('genreIds must be an array or JSON string');
        }
        return true;
      }),
  ];
};

const updateFilmValidationRules = () => {
  return [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 255 })
      .withMessage('Title must be at most 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be at most 1000 characters'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    body('published')
      .optional()
      .isBoolean()
      .withMessage('Published must be a boolean'),
    body('artistIds')
      .optional()
      .custom((value) => {
        if (!Array.isArray(value) && typeof value !== 'string') {
          throw new Error('artistIds must be an array or JSON string');
        }
        return true;
      }),
    body('genreIds')
      .optional()
      .custom((value) => {
        if (!Array.isArray(value) && typeof value !== 'string') {
          throw new Error('genreIds must be an array or JSON string');
        }
        return true;
      }),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  createFilmValidationRules,
  updateFilmValidationRules,
  validate,
};
