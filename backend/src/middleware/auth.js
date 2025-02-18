import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const result = await pool.query(
                'SELECT u.id, u.username, u.email, u.role, b.id as branch_id FROM users u LEFT JOIN branches b ON u.id = b.manager_id WHERE u.id = $1',
                [decoded.userId]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = {
                userId: decoded.userId,
                role: result.rows[0].role,
                username: result.rows[0].username,
                email: result.rows[0].email,
                branchId: result.rows[0].branch_id,
                riderId: decoded.riderId  // Make sure riderId is included
            };
            
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: 'Token has expired' });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

export const isRider = (req, res, next) => {
    if (req.user.role !== 'rider') {
        return res.status(403).json({ message: 'Access denied. Rider only.' });
    }
    next();
};

export const isBranchManager = (req, res, next) => {
    if (req.user.role !== 'branch_manager') {
        return res.status(403).json({ message: 'Access denied. Branch manager only.' });
    }
    next();
};

export const isAdminOrManager = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'branch_manager') {
        return res.status(403).json({ message: 'Access denied. Admin or branch manager only.' });
    }
    next();
};

export const isRiderOrManager = (req, res, next) => {
    if (req.user.role !== 'rider' && req.user.role !== 'branch_manager' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Rider, manager or admin only.' });
    }
    next();
};

export const isRiderForOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const { assignmentId } = req.body;

    try {
        // For managers and admins, allow access
        if (req.user.role === 'admin' || req.user.role === 'branch_manager') {
            return next();
        }

        // For riders, verify assignment
        const result = await pool.query(
            'SELECT * FROM order_assignments oa JOIN riders r ON oa.rider_id = r.id WHERE oa.id = $1 AND r.user_id = $2',
            [assignmentId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied. Not assigned to this order.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verifying order assignment' });
    }
};

export const isAdminOrManagerOrSelfRider = async (req, res, next) => {
    try {
        // Allow admin and branch managers
        if (req.user.role === 'admin' || req.user.role === 'branch_manager') {
            return next();
        }

        // For riders, verify if they are updating their own profile
        if (req.user.role === 'rider' && req.user.userId === parseInt(req.params.id)) {
            return next();
        }

        res.status(403).json({ message: 'Access denied. Not authorized.' });
    } catch (error) {
        console.error('Permission check error:', error);
        res.status(500).json({ message: 'Error checking permissions', error: error.message });
    }
};

export default {
    protect,
    isAdmin,
    isRider,
    isBranchManager,
    isAdminOrManager,
    isRiderOrManager
};