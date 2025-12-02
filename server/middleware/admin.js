import jwt from 'jsonwebtoken';

/**
 * Middleware to verify user is admin
 * Must be used after auth middleware
 */
export default function (req, res, next) {
    // Check if user exists (from auth middleware)
    if (!req.user) {
        return res.status(401).json({ msg: 'No authentication. Use auth middleware first.' });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }

    next();
}
