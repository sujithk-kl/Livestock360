const { body } = require('express-validator');

// Validation for customer registration
const registerCustomerValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number'),

    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),



    body('preferences.preferredProducts')
        .optional({ checkFalsy: true })
        .isArray().withMessage('Preferred products must be an array of strings'),

    body('preferences.preferredProducts.*')
        .optional()
        .isString().withMessage('Each preferred product must be a string')
        .trim().notEmpty().withMessage('Preferred product name cannot be empty'),

    body('preferences.budgetRange.min')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum budget cannot be negative'),

    body('preferences.budgetRange.max')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum budget cannot be negative')
        .custom((value, { req }) => {
            if (req.body.preferences?.budgetRange?.min && value < req.body.preferences.budgetRange.min) {
                throw new Error('Maximum budget must be greater than or equal to minimum budget');
            }
            return true;
        }),

    body('preferences.notifications.email')
        .optional()
        .isBoolean().withMessage('Email notification preference must be true or false'),

    body('preferences.notifications.sms')
        .optional()
        .isBoolean().withMessage('SMS notification preference must be true or false')
];

// Validation for profile update
const updateProfileValidation = [
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),



    body('preferences.preferredProducts')
        .optional({ checkFalsy: true })
        .isArray().withMessage('Preferred products must be an array of strings'),

    body('preferences.preferredProducts.*')
        .optional()
        .isString().withMessage('Each preferred product must be a string')
        .trim().notEmpty().withMessage('Preferred product name cannot be empty'),

    body('preferences.budgetRange.min')
        .optional()
        .isFloat({ min: 0 }).withMessage('Minimum budget cannot be negative'),

    body('preferences.budgetRange.max')
        .optional()
        .isFloat({ min: 0 }).withMessage('Maximum budget cannot be negative')
        .custom((value, { req }) => {
            if (req.body.preferences?.budgetRange?.min && value < req.body.preferences.budgetRange.min) {
                throw new Error('Maximum budget must be greater than or equal to minimum budget');
            }
            return true;
        }),

    body('preferences.notifications.email')
        .optional()
        .isBoolean().withMessage('Email notification preference must be true or false'),

    body('preferences.notifications.sms')
        .optional()
        .isBoolean().withMessage('SMS notification preference must be true or false')
];

module.exports = {
    registerCustomerValidation,
    updateProfileValidation
};
