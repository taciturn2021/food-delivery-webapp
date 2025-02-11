import { pool } from '../config/database.js';

export const createMenuItem = async (req, res) => {
    const { name, description, price, category, image_url, is_available } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO menu_items (name, description, price, category, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, category, image_url, is_available]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error: error.message });
    }
};

export const getAllMenuItems = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};

export const updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image_url, is_available } = req.body;

    try {
        const result = await pool.query(
            'UPDATE menu_items SET name = $1, description = $2, price = $3, category = $4, image_url = $5, is_available = $6 WHERE id = $7 RETURNING *',
            [name, description, price, category, image_url, is_available, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    const { id } = req.params;

    try {
        // First check if the item is used in any orders
        const orderCheck = await pool.query(
            'SELECT * FROM order_items WHERE menu_item_id = $1 LIMIT 1',
            [id]
        );

        if (orderCheck.rows.length > 0) {
            // If item is used in orders, just mark it as unavailable instead of deleting
            await pool.query(
                'UPDATE menu_items SET is_available = false WHERE id = $1',
                [id]
            );
            return res.json({ message: 'Menu item marked as unavailable due to existing orders' });
        }

        // If not used in orders, delete completely
        const result = await pool.query(
            'DELETE FROM menu_items WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting menu item', error: error.message });
    }
};

export const assignMenuItemToBranch = async (req, res) => {
    const { branch_id, menu_item_id, price, is_available } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO branch_menu_items (branch_id, menu_item_id, price, is_available) VALUES ($1, $2, $3, $4) ON CONFLICT (branch_id, menu_item_id) DO UPDATE SET price = $3, is_available = $4 RETURNING *',
            [branch_id, menu_item_id, price, is_available]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning menu item to branch', error: error.message });
    }
};