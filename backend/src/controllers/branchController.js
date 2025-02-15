import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const createBranch = async (req, res) => {
    const { name, address, phone, managerEmail, managerPassword, managerName } = req.body;

    try {
        // Start a transaction since we're making multiple related changes
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create branch manager user first
            const hashedPassword = await bcrypt.hash(managerPassword, 10);
            const managerResult = await client.query(
                'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [managerName, managerEmail, hashedPassword, 'branch_manager']
            );

            const managerId = managerResult.rows[0].id;

            // Create the branch with the new manager
            const branchResult = await client.query(
                'INSERT INTO branches (name, address, phone, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, address, phone, managerId]
            );

            await client.query('COMMIT');

            // Return combined result
            res.status(201).json({
                ...branchResult.rows[0],
                manager: {
                    id: managerId,
                    username: managerName,
                    email: managerEmail
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating branch and manager account', 
            error: error.message 
        });
    }
};

export const getAllBranches = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, u.username as manager_name, u.email as manager_email 
            FROM branches b 
            LEFT JOIN users u ON b.manager_id = u.id 
            ORDER BY b.name
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branches', error: error.message });
    }
};

export const updateBranch = async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, manager_id, status } = req.body;

    try {
        // Check if new manager is valid and available
        if (manager_id) {
            const managerCheck = await pool.query(
                'SELECT * FROM users WHERE id = $1 AND role = $2',
                [manager_id, 'branch_manager']
            );

            if (managerCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid manager ID or user is not a branch manager' });
            }

            const existingAssignment = await pool.query(
                'SELECT * FROM branches WHERE manager_id = $1 AND id != $2',
                [manager_id, id]
            );

            if (existingAssignment.rows.length > 0) {
                return res.status(400).json({ message: 'Manager is already assigned to another branch' });
            }
        }

        const result = await pool.query(
            'UPDATE branches SET name = $1, address = $2, phone = $3, manager_id = $4, status = $5 WHERE id = $6 RETURNING *',
            [name, address, phone, manager_id, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating branch', error: error.message });
    }
};

export const deleteBranch = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if branch has any orders
        const orderCheck = await pool.query(
            'SELECT * FROM orders WHERE branch_id = $1 LIMIT 1',
            [id]
        );

        if (orderCheck.rows.length > 0) {
            // If branch has orders, just mark it as inactive
            await pool.query(
                'UPDATE branches SET status = $1 WHERE id = $2',
                ['inactive', id]
            );
            return res.json({ message: 'Branch marked as inactive due to existing orders' });
        }

        // If no orders, proceed with deletion
        const result = await pool.query(
            'DELETE FROM branches WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting branch', error: error.message });
    }
};

export const getBranchMenu = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT mi.*, bmi.price as branch_price, bmi.is_available as branch_availability 
            FROM menu_items mi 
            LEFT JOIN branch_menu_items bmi ON mi.id = bmi.menu_item_id AND bmi.branch_id = $1
            ORDER BY mi.category, mi.name
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branch menu', error: error.message });
    }
};