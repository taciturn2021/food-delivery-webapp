import { pool } from '../config/database.js';

export const createOrder = async (req, res) => {
    const { branch_id, items, delivery_address } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Calculate total amount and verify items
        let total_amount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItemResult = await client.query(
                'SELECT price FROM branch_menu_items WHERE branch_id = $1 AND menu_item_id = $2 AND is_available = true',
                [branch_id, item.menu_item_id]
            );

            if (menuItemResult.rows.length === 0) {
                throw new Error(`Menu item ${item.menu_item_id} is not available at this branch`);
            }

            const price = menuItemResult.rows[0].price;
            total_amount += price * item.quantity;
            orderItems.push({
                ...item,
                price_at_time: price
            });
        }

        // Create order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, branch_id, status, total_amount, delivery_address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.userId, branch_id, 'pending', total_amount, delivery_address]
        );

        const order = orderResult.rows[0];

        // Create order items
        for (const item of orderItems) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time, special_instructions) VALUES ($1, $2, $3, $4, $5)',
                [order.id, item.menu_item_id, item.quantity, item.price_at_time, item.special_instructions]
            );
        }

        await client.query('COMMIT');

        // Fetch complete order with items
        const completeOrder = await getOrderWithItems(order.id);
        res.status(201).json(completeOrder);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

export const getOrders = async (req, res) => {
    try {
        const { status, branch_id, start_date, end_date } = req.query;
        let query = `
            SELECT o.*, 
                   u.username as customer_name,
                   b.name as branch_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE 1=1
        `;
        const queryParams = [];
        let paramCount = 1;

        if (status) {
            query += ` AND o.status = $${paramCount}`;
            queryParams.push(status);
            paramCount++;
        }

        if (branch_id) {
            query += ` AND o.branch_id = $${paramCount}`;
            queryParams.push(branch_id);
            paramCount++;
        }

        if (start_date) {
            query += ` AND o.created_at >= $${paramCount}`;
            queryParams.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND o.created_at <= $${paramCount}`;
            queryParams.push(end_date);
            paramCount++;
        }

        query += ' ORDER BY o.created_at DESC';

        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderWithItems(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user has permission to view this order
        if (req.user.role === 'customer' && order.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verify order exists and user has permission
        const orderCheck = await client.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );

        if (orderCheck.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = orderCheck.rows[0];

        // Only allow status updates in valid sequence
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['preparing', 'cancelled'],
            preparing: ['ready', 'cancelled'],
            ready: ['delivered', 'cancelled'],
            delivered: [],
            cancelled: []
        };

        if (!validTransitions[order.status].includes(status)) {
            throw new Error(`Cannot transition from ${order.status} to ${status}`);
        }

        const result = await client.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

export const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderCheck = await client.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );

        if (orderCheck.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = orderCheck.rows[0];

        // Only allow cancellation of orders that aren't delivered or already cancelled
        if (['delivered', 'cancelled'].includes(order.status)) {
            throw new Error(`Cannot cancel order in ${order.status} status`);
        }

        // Verify user has permission to cancel
        if (req.user.role === 'customer' && order.user_id !== req.user.userId) {
            throw new Error('Access denied');
        }

        const result = await client.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            ['cancelled', id]
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

// Helper function to get complete order with items
async function getOrderWithItems(orderId) {
    const orderResult = await pool.query(`
        SELECT o.*, 
               u.username as customer_name,
               b.name as branch_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN branches b ON o.branch_id = b.id
        WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
        return null;
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(`
        SELECT oi.*, mi.name, mi.description, mi.category
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = $1
    `, [orderId]);

    order.items = itemsResult.rows;
    return order;
}