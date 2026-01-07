const { body, param, query } = require('express-validator');

// Validation for farmer registration
const registerFarmerValidation = [
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

    body('address.street')
        .notEmpty().withMessage('Street address is required')
        .isLength({ max: 200 }).withMessage('Street address cannot be longer than 200 characters'),

    body('address.city')
        .notEmpty().withMessage('City is required')
        .isLength({ max: 100 }).withMessage('City name cannot be longer than 100 characters'),

    body('address.state')
        .notEmpty().withMessage('State is required')
        .isLength({ max: 50 }).withMessage('State name cannot be longer than 50 characters'),

    body('address.pincode')
        .notEmpty().withMessage('Pincode is required')
        .matches(/^[1-9][0-9]{5}$/).withMessage('Please provide a valid 6-digit pincode'),

    body('farmSize')
        .notEmpty().withMessage('Farm size is required')
        .isFloat({ min: 0.1 }).withMessage('Farm size must be at least 0.1 acres'),

    body('aadharNumber')
        .notEmpty().withMessage('Aadhar number is required')
        .matches(/^\d{12}$/)
        .withMessage('Aadhar number must be exactly 12 digits'),

    body('bankDetails.accountNumber')
        .notEmpty().withMessage('Bank account number is required')
        .isLength({ min: 9, max: 18 }).withMessage('Account number must be between 9 and 18 digits'),

    body('bankDetails.bankName')
        .notEmpty().withMessage('Bank name is required')
        .isLength({ max: 100 }).withMessage('Bank name cannot be longer than 100 characters'),

    body('bankDetails.ifscCode')
        .notEmpty().withMessage('IFSC code is required')
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Please provide a valid IFSC code'),

    body('bankDetails.accountHolderName')
        .notEmpty().withMessage('Account holder name is required')
        .isLength({ max: 100 }).withMessage('Account holder name cannot be longer than 100 characters'),

    body('crops')
        .optional({ checkFalsy: true })
        .isArray().withMessage('Crops must be an array of strings'),

    body('crops.*')
        .isString().withMessage('Each crop must be a string')
        .trim().notEmpty().withMessage('Crop name cannot be empty'),

    body('livestock')
        .optional({ checkFalsy: true })
        .isArray().withMessage('Livestock must be an array of strings'),

    body('livestock.*')
        .isString().withMessage('Each livestock item must be a string')
        .trim().notEmpty().withMessage('Livestock name cannot be empty'),

    body('documents')
        .optional({ checkFalsy: true })
        .isArray().withMessage('Documents must be an array')
];

// Validation for document upload
const documentUploadValidation = [
    body('documentType')
        .isIn(['aadhar', 'landRecord', 'bankPassbook', 'other'])
        .withMessage('Invalid document type'),
    
    body('documentUrl')
        .notEmpty().withMessage('Document URL is required')
        .isURL().withMessage('Invalid document URL')
];

// Validation for profile update
const updateProfileValidation = [
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
    
    body('address.street')
        .optional()
        .isLength({ max: 200 }).withMessage('Street address cannot be longer than 200 characters'),
    
    body('address.city')
        .optional()
        .isLength({ max: 100 }).withMessage('City name cannot be longer than 100 characters'),
    
    body('address.state')
        .optional()
        .isLength({ max: 50 }).withMessage('State name cannot be longer than 50 characters'),
    
    body('address.pincode')
        .optional()
        .matches(/^[1-9][0-9]{5}$/).withMessage('Please provide a valid 6-digit pincode'),
    
    body('farmSize')
        .optional()
        .isFloat({ min: 0.1 }).withMessage('Farm size must be at least 0.1 acres'),
    
    body('bankDetails.accountNumber')
        .optional()
        .isLength({ min: 9, max: 18 }).withMessage('Account number must be between 9 and 18 digits'),
    
    body('bankDetails.bankName')
        .optional()
        .isLength({ max: 100 }).withMessage('Bank name cannot be longer than 100 characters'),
    
    body('bankDetails.ifscCode')
        .optional()
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/).withMessage('Please provide a valid IFSC code'),
    
    body('bankDetails.accountHolderName')
        .optional()
        .isLength({ max: 100 }).withMessage('Account holder name cannot be longer than 100 characters'),
    
    body('crops')
        .optional({ checkFalsy: true })
        .isArray().withMessage('Crops must be an array of strings'),
    
    body('crops.*')
        .optional()
        .isString().withMessage('Each crop must be a string')
        .trim().notEmpty().withMessage('Crop name cannot be empty'),
    
    body('livestock')
        .optional({ checkFalsy: true })
        .isArray().withMessage('Livestock must be an array of strings'),
    
    body('livestock.*')
        .optional()
        .isString().withMessage('Each livestock item must be a string')
        .trim().notEmpty().withMessage('Livestock name cannot be empty')
];

module.exports = {
    registerFarmerValidation,
    documentUploadValidation,
    updateProfileValidation
};
