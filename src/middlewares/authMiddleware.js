// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('No token provided');
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.warn('Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        exports.authenticate,
        (req, res, next) => {
            if (roles.length && !roles.includes(req.user.role)) {
                logger.warn(`User role ${req.user.role} not authorized`);
                return res.status(403).json({ message: 'Forbidden' });
            }
            next();
        }
    ];
};
