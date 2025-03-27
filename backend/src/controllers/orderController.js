import { pool } from '../config/database.js';

export const createOrder = async (req, res) => {
    const { branch_id, items, delivery_address } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

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
        
        // Check if id is valid
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        
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
        console.error('Error in getOrderById:', error.message, error.stack);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const  status  = req.body.status.status;
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
        const validTransitions = {
            pending: ['preparing', 'cancelled'],
            preparing: ['delivering', 'cancelled'],
            delivering: ['delivered'],
            delivered: [],
            cancelled: []
        };

        if (!validTransitions[order.status].includes(status)) {
            throw new Error(`Cannot transition from ${order.status} to ${status}`);
        }
        if(order.status === 'preparing' && !order.rider_id){
            throw new Error('Cannot change status to delivering without assigning a rider first');
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

// Customer-related functions
export const getCustomerActiveOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, 
                   b.name as branch_name,
                   b.address as branch_address,
                   b.latitude as branch_latitude,
                   b.longitude as branch_longitude
            FROM orders o
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE o.user_id = $1 
            AND o.status NOT IN ('delivered', 'cancelled')
            ORDER BY o.created_at DESC
        `, [req.user.userId]);

        // Get items for each order
        const items = await pool.query(`
            SELECT oi.*, mi.name, mi.description, mi.category, oi.order_id
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id IN (
                SELECT id FROM orders 
                WHERE user_id = $1 
                AND status NOT IN ('delivered', 'cancelled')
            )
        `, [req.user.userId]);

        // add items for each order
        const orders = result.rows.map(order => {
            const orderItems = items.rows.filter(item => item.order_id === order.id);
            return {
                ...order,
                items: orderItems
            };
        });

        res.json(orders);
    } catch (error) {
        console.error('Error in getCustomerActiveOrders:', error);
        res.status(500).json({ message: 'Error fetching active orders', error: error.message });
    }
};

export const getCustomerOrderHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const result = await pool.query(`
            SELECT o.*, 
                   b.name as branch_name
            FROM orders o
            LEFT JOIN branches b ON o.branch_id = b.id
            WHERE o.user_id = $1 
            AND o.status IN ('delivered', 'cancelled')
            ORDER BY o.created_at DESC
            LIMIT $2 OFFSET $3
        `, [req.user.userId, limit, offset]);

        // Get items for each order
        const items = await pool.query(`
            SELECT oi.*, mi.name, mi.description, mi.category, oi.order_id
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            WHERE oi.order_id IN (SELECT id FROM orders WHERE user_id = $1 AND status IN ('delivered', 'cancelled'))
        `, [req.user.userId]);

        // add items for each order
        const orders = result.rows.map(order => {
            const orderItems = items.rows.filter(item => item.order_id === order.id);
            return {
                ...order,
                items: orderItems
            };
        });

        // Get total count for pagination
        const countResult = await pool.query(`
            SELECT COUNT(*) 
            FROM orders 
            WHERE user_id = $1 
            AND status IN ('delivered', 'cancelled')
        `, [req.user.userId]);
        
        console.log(`Total orders count: ${countResult.rows[0].count}`);
        console.log(`Orders:`, orders);

        res.json({
            orders: orders,
            total: parseInt(countResult.rows[0].count),
            totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order history', error: error.message });
    }
};

// Branch-related functions
export const assignRiderToOrder = async (req, res) => {
    const { id } = req.params;
    const { rider_id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verify order exists and is in a valid state for assignment
        const orderCheck = await client.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );

        if (orderCheck.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = orderCheck.rows[0];

        // Only allow rider assignment for orders in confirmed/preparing/ready status
        if (!['confirmed', 'preparing', 'ready'].includes(order.status)) {
            throw new Error(`Cannot assign rider to order in ${order.status} status`);
        }

        // Verify rider exists and is active
        const riderCheck = await client.query(
            'SELECT * FROM riders WHERE id = $1 AND status = $2',
            [rider_id, 'active']
        );

        if (riderCheck.rows.length === 0) {
            throw new Error('Rider not found or not active');
        }

        // Assign rider to order
        const result = await client.query(
            'UPDATE orders SET rider_id = $1 WHERE id = $2 RETURNING *',
            [rider_id, id]
        );

        await client.query('COMMIT');
        
        // Return complete order info
        const updatedOrder = await getOrderWithItems(id);
        res.json(updatedOrder);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

export const getBranchPendingOrders = async (req, res) => {
    try {
        const { branch_id } = req.query;
        
        // Verify user has access to this branch
        if (req.user.role === 'branch_manager' && req.user.branchId != branch_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await pool.query(`
            SELECT o.*, 
                   u.username as customer_name,
                   u.phone as customer_phone,
                   r.first_name as rider_first_name,
                   r.last_name as rider_last_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN riders r ON o.rider_id = r.id
            WHERE o.branch_id = $1 
            AND o.status NOT IN ('delivered', 'cancelled')
            ORDER BY o.created_at ASC
        `, [branch_id]);

        // Get items for each order
        const orders = await Promise.all(
            result.rows.map(async (order) => {
                const itemsResult = await pool.query(`
                    SELECT oi.*, mi.name, mi.description, mi.category
                    FROM order_items oi
                    JOIN menu_items mi ON oi.menu_item_id = mi.id
                    WHERE oi.order_id = $1
                `, [order.id]);
                
                return {
                    ...order,
                    items: itemsResult.rows
                };
            })
        );

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending orders', error: error.message });
    }
};



export const riderUpdateOrderStatus = async (req, res) => {
    console.log(req.params);
    console.log(req.body.status);
    const { id } = req.params;
    const { status } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verify order exists and is assigned to this rider
        const orderCheck = await client.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );

        if (orderCheck.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = orderCheck.rows[0];

        // Riders should only be able to update to delivered
        if (!['delivered'].includes(status)) {
            throw new Error(`Riders can only update to delivered status`);
        }

        // Validate status transition
        const validTransitions = {
            delivering: ['delivered']
        };

        if (!validTransitions[order.status]?.includes(status)) {
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

// Helper function to get complete order with items
export async function getOrderWithItems(orderId) {
    try {
        const riderIDCheck = await pool.query(`
            SELECT rider_id FROM orders WHERE id = $1
        `, [orderId]);
        let orderQuery;
        if(riderIDCheck.rows[0].rider_id){
        orderQuery = `
            SELECT o.*, 
                   u.username as customer_name,
                   c.phone as phone,
                   b.name as branch_name,
                   b.latitude as branch_latitude,
                   b.longitude as branch_longitude,
                   r.id as rider_id,
                   r.full_name as rider_first_name,
                   r.contact_number as rider_phone,
                   rl.latitude as rider_latitude,
                   rl.longitude as rider_longitude
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN branches b ON o.branch_id = b.id
            LEFT JOIN riders r ON o.rider_id = r.id
            LEFT JOIN rider_locations rl ON r.id = rl.rider_id
            LEFT JOIN customers c ON o.user_id = c.user_id
            WHERE o.id = $1
        `;
        } else{
            orderQuery = `
            SELECT o.*, 
                   u.username as customer_name,
                   c.phone as phone,
                   b.name as branch_name,
                   b.latitude as branch_latitude,
                   b.longitude as branch_longitude
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN branches b ON o.branch_id = b.id
            LEFT JOIN customers c ON o.user_id = c.user_id
            WHERE o.id = $1
        `;
        }
        const orderResult = await pool.query(orderQuery, [orderId]);

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
    } catch (error) {
        console.error('Error in getOrderWithItems:', error);
        throw error;
    }
}