const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const protect = async (req, res, next) => {
    // Get token from header
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // First try to find user in User collection (for farmers, admins, etc.)
        let account = await User.findById(decoded.id).select('-password');

        // If not found in User, try Customer collection
        if (!account) {
            account = await Customer.findById(decoded.id).select('-password');
        }

        if (!account) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        req.user = account;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Role-based access control
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }
        
        // Check if user has any of the required roles
        const hasRole = req.user.roles.some(role => roles.includes(role));
        
        if (!hasRole) {
            return res.status(403).json({ 
                success: false,
                message: `User with roles [${req.user.roles.join(', ')}] is not authorized to access this route` 
            });
        }
        
        next();
    };
};

module.exports = {
    protect,
    authorize
};
