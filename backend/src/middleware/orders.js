import { pool } from '../config/database.js';


export const isBranchActive = (req, res, next) => {

    const branchId = req.body.branch_id  // Get branch ID from request body or params

    if (!branchId) {
        return res.status(400).json({ message: 'Branch ID is required' });
    }

    pool.query('SELECT status FROM branches WHERE id = $1', [branchId], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error', error });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        const isActive = results.rows[0].status;
        if (isActive !== 'active') {
            return res.status(403).json({ message: 'Branch is inactive' });
        }

        next();
    });
}