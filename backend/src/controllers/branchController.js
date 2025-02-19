import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const createBranch = async (req, res) => {
    const { name, address, phone, managerEmail, managerPassword, managerName, latitude, longitude } = req.body;

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const hashedPassword = await bcrypt.hash(managerPassword, 10);
            const managerResult = await client.query(
                'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [managerName, managerEmail, hashedPassword, 'branch_manager']
            );

            const managerId = managerResult.rows[0].id;

            const branchResult = await client.query(
                'INSERT INTO branches (name, address, phone, manager_id, latitude, longitude) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, address, phone, managerId, latitude, longitude]
            );

            await client.query('COMMIT');

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
        // If it's a public request (no auth), only return active branches with limited info
        if (!req.user) {
            const result = await pool.query(`
                SELECT 
                    id, 
                    name, 
                    address, 
                    latitude, 
                    longitude,
                    opening_time,
                    closing_time,
                    delivery_radius,
                    minimum_order_amount,
                    status
                FROM branches 
                WHERE status = 'active'
                ORDER BY name
            `);
            return res.json(result.rows);
        }

        // For authenticated admin/manager requests, return full branch details
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
    const { name, address, phone, manager_id, status, latitude, longitude, manager_name, manager_email, manager_password} = req.body;

    // For branch managers, only allow updating their own branch
    if (req.user.role === 'branch_manager' && req.user.branchId !== parseInt(id)) {
        return res.status(403).json({ message: 'You can only update your own branch' });
    }

    try {
        // First get existing branch data
        const existingBranch = await pool.query(
            'SELECT * FROM branches WHERE id = $1',
            [id]
        );

        if (existingBranch.rows.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        const current = existingBranch.rows[0];

        // Only admins can update manager_id
        if (manager_id && manager_id !== current.manager_id) {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only admins can change branch manager' });
            }

            const managerCheck = await pool.query(
                'SELECT * FROM users WHERE id = $1 AND role = $2',
                [manager_id, 'branch_manager']
            );

            if (managerCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid manager ID or user is not a branch manager' });
            }

            // Ensure manager isn't assigned to another branch
            const existingAssignment = await pool.query(
                'SELECT * FROM branches WHERE manager_id = $1 AND id != $2',
                [manager_id, id]
            );

            if (existingAssignment.rows.length > 0) {
                return res.status(400).json({ message: 'Manager is already assigned to another branch' });
            }
        }

        const result = await pool.query(
            `UPDATE branches SET 
                name = $1,
                address = $2,
                phone = $3,
                manager_id = $4,
                status = $5,
                latitude = $6,
                longitude = $7
            WHERE id = $8 RETURNING *`,
            [
                name || current.name,
                address || current.address,
                phone || current.phone,
                manager_id !== undefined ? manager_id : current.manager_id,
                status || current.status,
                latitude !== undefined ? latitude : current.latitude,
                longitude !== undefined ? longitude : current.longitude,
                id
            ]
        );

        // Update manager details if provided
        if (manager_name || manager_email || manager_password) {
            const updateFields = [];
            const updateValues = [];
            let valueCounter = 1;

            if (manager_name) {
                updateFields.push(`username = $${valueCounter}`);
                updateValues.push(manager_name);
                valueCounter++;
            }

            if (manager_email) {
                updateFields.push(`email = $${valueCounter}`);
                updateValues.push(manager_email);
                valueCounter++;
            }

            if (manager_password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(manager_password, salt);
                updateFields.push(`password = $${valueCounter}`);
                updateValues.push(hashedPassword);
                valueCounter++;
            }

            if (updateFields.length > 0) {
                await pool.query(
                    `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${valueCounter}`,
                    [...updateValues, current.manager_id]
                );
            }
        }

        // Fetch updated branch data with manager info
        const updatedBranch = await pool.query(
            `SELECT b.*, u.username as manager_name, u.email as manager_email 
             FROM branches b 
             LEFT JOIN users u ON b.manager_id = u.id 
             WHERE b.id = $1`,
            [id]
        );

        res.json(updatedBranch.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating branch', error: error.message });
    }
};

export const deleteBranch = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // First check if branch exists
        const branchCheck = await client.query(
            'SELECT * FROM branches WHERE id = $1',
            [id]
        );

        if (branchCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        const branch = branchCheck.rows[0];
        const managerId = branch.manager_id;

        // Check for existing orders
        const orderCheck = await client.query(
            'SELECT * FROM orders WHERE branch_id = $1 LIMIT 1',
            [id]
        );

        if (orderCheck.rows.length > 0) {
            await client.query(
                'UPDATE branches SET status = $1, manager_id = NULL WHERE id = $2',
                ['inactive', id]
            );

            // Update the manager's role to 'customer' if they exist
            if (managerId) {
                await client.query(
                    'UPDATE users SET role = $1 WHERE id = $2',
                    ['customer', managerId]
                );
            }

            await client.query('COMMIT');
            return res.json({ 
                message: 'Branch marked as inactive and manager role updated due to existing orders'
            });
        }

        // If no orders exist, proceed with deletion
        // First remove branch_menu_items
        await client.query(
            'DELETE FROM branch_menu_items WHERE branch_id = $1',
            [id]
        );

        // Remove riders associated with this branch
        await client.query(
            'UPDATE riders SET branch_id = NULL WHERE branch_id = $1',
            [id]
        );

        // Delete the branch
        await client.query(
            'DELETE FROM branches WHERE id = $1',
            [id]
        );

        // Update the manager's role to 'customer' if they exist
        if (managerId) {
            await client.query(
                'UPDATE users SET role = $1 WHERE id = $2',
                ['customer', managerId]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Branch and related data deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in deleteBranch:', error);
        res.status(500).json({ 
            message: 'Error deleting branch', 
            error: error.message,
            stack: error.stack
        });
    } finally {
        client.release();
    }
};

export const getBranchMenu = async (req, res) => {
    const { id } = req.params;

    // For branch managers, only allow viewing their own branch
    if (req.user.role === 'branch_manager' && req.user.branchId !== parseInt(id)) {
        return res.status(403).json({ message: 'You can only view your own branch menu' });
    }

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

export const getPublicBranchMenu = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT 
                mi.id,
                mi.name,
                mi.description,
                mi.price,
                mi.category,
                mi.image_url,
                COALESCE(bmi.price, mi.price) as branch_price
            FROM menu_items mi 
            INNER JOIN branch_menu_items bmi 
                ON mi.id = bmi.menu_item_id 
                AND bmi.branch_id = $1
            WHERE mi.is_available = true
                AND bmi.is_available = true
            ORDER BY mi.category, mi.name
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branch menu', error: error.message });
    }
};

export const getBranchSettings = async (req, res) => {
    const { id } = req.params;

    // For branch managers, only allow viewing their own branch
    if (req.user.role === 'branch_manager' && req.user.branchId !== parseInt(id)) {
        return res.status(403).json({ message: 'You can only view your own branch settings' });
    }

    try {
        const branchResult = await pool.query(
            `SELECT b.*, u.email as manager_email
             FROM branches b
             LEFT JOIN users u ON b.manager_id = u.id 
             WHERE b.id = $1`,
            [id]
        );

        if (branchResult.rows.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        res.json(branchResult.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching branch settings', error: error.message });
    }
};

export const updateBranchSettings = async (req, res) => {
    const { id } = req.params;

    // For branch managers, only allow updating their own branch
    if (req.user.role === 'branch_manager' && req.user.branchId !== parseInt(id)) {
        return res.status(403).json({ message: 'You can only update your own branch settings' });
    }

    const {
        openingTime,
        closingTime,
        deliveryRadius,
        minimumOrderAmount,
        maxConcurrentOrders,
        preparationTimeMinutes,
        allowScheduledOrders,
        maxScheduleDays,
        automaticOrderAssignment
    } = req.body;

    console.log('Received branch settings update:', {
        id,
        openingTime,
        closingTime,
        deliveryRadius,
        minimumOrderAmount,
        maxConcurrentOrders,
        preparationTimeMinutes,
        allowScheduledOrders,
        maxScheduleDays,
        automaticOrderAssignment,
        userRole: req.user.role,
        userBranchId: req.user.branchId
    });

    try {
        const values = [
            openingTime,
            closingTime,
            deliveryRadius,
            minimumOrderAmount,
            maxConcurrentOrders,
            preparationTimeMinutes,
            allowScheduledOrders,
            maxScheduleDays,
            automaticOrderAssignment,
            id
        ];

        console.log('Values being sent to query:', values);

        const result = await pool.query(
            `UPDATE branches SET
                opening_time = COALESCE($1, opening_time),
                closing_time = COALESCE($2, closing_time),
                delivery_radius = COALESCE($3, delivery_radius),
                minimum_order_amount = COALESCE($4, minimum_order_amount),
                max_concurrent_orders = COALESCE($5, max_concurrent_orders),
                preparation_time_minutes = COALESCE($6, preparation_time_minutes),
                allow_scheduled_orders = COALESCE($7, allow_scheduled_orders),
                max_schedule_days = COALESCE($8, max_schedule_days),
                automatic_order_assignment = COALESCE($9, automatic_order_assignment)
            WHERE id = $10 
            RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Branch not found' });
        }

        console.log('Updated branch settings:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating branch settings:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Error updating branch settings', 
            error: error.message,
            stack: error.stack 
        });
    }
};