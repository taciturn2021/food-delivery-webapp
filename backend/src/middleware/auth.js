import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token or invalid token format, authorization denied' });
        }

        // Extract token without 'Bearer ' prefix
        const token = authHeader.slice(7);
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const result = await pool.query(
                'SELECT id, username, email, role FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = {
                userId: decoded.userId,
                role: result.rows[0].role
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