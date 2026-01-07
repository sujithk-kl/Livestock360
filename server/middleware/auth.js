const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

        // Add user from payload
        req.user = await User.findById(decoded.id).select('-password');
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
