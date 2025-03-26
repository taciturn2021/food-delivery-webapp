import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const createRider = async (req, res) => {
    const {
        branch_id,
        full_name,
        email,
        password,
        cnic,
        contact_number,
        emergency_contact,
        vehicle_type,
        vehicle_plate_no,
        license_no
    } = req.body;

    // Input validation logging
    console.log('Received rider creation request with data:', {
        branch_id,
        full_name,
        email,
        cnic,
        contact_number,
        vehicle_type,
        vehicle_plate_no,
        license_no
        // Excluding password for security
    });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Starting user creation...');
        // First create user account
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await client.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [full_name, email, hashedPassword, 'rider']
        ).catch(err => {
            console.error('Error creating user:', err.message);
            throw new Error(`User creation failed: ${err.message}`);
        });

        const userId = userResult.rows[0].id;
        console.log('User created successfully with ID:', userId);

        console.log('Starting rider profile creation...');
        // Then create rider profile
        const riderResult = await client.query(
            `INSERT INTO riders (
                branch_id, user_id, full_name, cnic, contact_number, 
                emergency_contact, vehicle_type, vehicle_plate_no, license_no
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [branch_id, userId, full_name, cnic, contact_number, emergency_contact, 
             vehicle_type, vehicle_plate_no, license_no]
        ).catch(err => {
            console.error('Error creating rider profile:', err.message);
            throw new Error(`Rider profile creation failed: ${err.message}`);
        });

        console.log('Rider profile created successfully');
        await client.query('COMMIT');

        res.status(201).json({
            ...riderResult.rows[0],
            email
        });
    } catch (error) {
        console.error('Complete error details:', error);
        await client.query('ROLLBACK');
        
        // Send more specific error message based on the error type
        let errorMessage = 'Error creating rider account';
        if (error.message.includes('duplicate key')) {
            errorMessage = 'A user with this email or CNIC already exists';
            res.status(409); // Conflict
        } else if (error.message.includes('null value')) {
            errorMessage = 'Missing required fields';
            res.status(400); // Bad Request
        } else if (error.message.includes('foreign key')) {
            errorMessage = 'Invalid branch ID';
            res.status(400); // Bad Request
        } else {
            res.status(500); // Internal Server Error
        }

        res.json({ 
            message: errorMessage, 
            error: error.message,
            details: error.detail || 'No additional details available'
        });
    } finally {
        client.release();
    }
};

export const getBranchRiders = async (req, res) => {
    const { branch_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.*, u.email 
             FROM riders r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.branch_id = $1`,
            [branch_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching riders', error: error.message });
    }
};

// Update this endpoint to handle general rider data
export const updateRider = async (req, res) => {
    const { id } = req.params;  // this is the user_id from frontend
    const {
        status,
        contact_number,
        emergency_contact,
        vehicle_type,
        vehicle_plate_no,
        license_no
    } = req.body;

    try {
        // First get the rider ID from user_id
        const riderQuery = await pool.query(
            'SELECT id FROM riders WHERE user_id = $1',
            [id]
        );

        if (riderQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        const riderId = riderQuery.rows[0].id;

        // Then update the rider's data
        const result = await pool.query(
            `UPDATE riders 
             SET status = COALESCE($1, status),
                 contact_number = COALESCE($2, contact_number),
                 emergency_contact = COALESCE($3, emergency_contact),
                 vehicle_type = COALESCE($4, vehicle_type),
                 vehicle_plate_no = COALESCE($5, vehicle_plate_no),
                 license_no = COALESCE($6, license_no)
             WHERE id = $7 
             RETURNING *`,
            [status, contact_number, emergency_contact, vehicle_type,
             vehicle_plate_no, license_no, riderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Failed to update rider' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating rider:', error);
        res.status(500).json({ message: 'Error updating rider', error: error.message });
    }
};



export const getRiderOrders = async (req, res) => {
    const { rider_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT o.*, oa.status as delivery_status, oa.assigned_at, oa.completed_at
             FROM orders o
             JOIN order_assignments oa ON o.id = oa.order_id
             WHERE oa.rider_id = $1
             ORDER BY oa.assigned_at DESC`,
            [rider_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rider orders', error: error.message });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    const { orderId } = req.params;
    const { assignmentId, status } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'UPDATE order_assignments SET status = $1 WHERE id = $2',
            [status, assignmentId]
        );

        if (status === 'delivered') {
            await client.query(
                'UPDATE orders SET status = $1 WHERE id = $2',
                ['delivered', orderId]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Delivery status updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error updating delivery status', error: error.message });
    } finally {
        client.release();
    }
};

export const updateRiderLocation = async (req, res) => {
    const { latitude, longitude } = req.body;
    try {
        console.log('Location update request received:', {
            userId: req.user.userId,
            time: new Date().toISOString(),
            coordinates: { latitude, longitude }
        });
        
        // First get the rider ID from user_id
        const riderQuery = await pool.query(
            'SELECT id, full_name FROM riders WHERE user_id = $1',
            [req.user.userId]
        );

        if (riderQuery.rows.length === 0) {
            console.error('No rider found for user_id:', req.user.userId);
            return res.status(404).json({ message: 'Rider not found' });
        }

        const riderId = riderQuery.rows[0].id;
        console.log('Found rider:', {
            riderId,
            name: riderQuery.rows[0].full_name,
            previousData: await getCurrentLocation(riderId)
        });

        // Use UPSERT to update or insert the location and return the updated data
        const result = await pool.query(
            `INSERT INTO rider_locations (rider_id, latitude, longitude)
             VALUES ($1, $2, $3)
             ON CONFLICT (rider_id) 
             DO UPDATE SET 
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [riderId, latitude, longitude]
        );
        
        console.log('Location updated successfully:', {
            riderId,
            newLocation: result.rows[0],
            timestamp: new Date().toISOString()
        });
        
        res.json({
            message: 'Location updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating location:', error);
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack,
            user: req.user,
            requestBody: req.body
        });
        res.status(500).json({ message: 'Error updating location', error: error.message });
    }
};

const getCurrentLocation = async (riderId) => {
    try {
        const result = await pool.query(
            'SELECT * FROM rider_locations WHERE rider_id = $1',
            [riderId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting current location:', error);
        return null;
    }
};

export const getDeliveryLocation = async (req, res) => {
    const { assignment_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT rl.* FROM rider_locations rl
             JOIN order_assignments oa ON oa.rider_id = rl.rider_id
             WHERE oa.id = $1`,
            [assignment_id]
        );
        res.json(result.rows[0] || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching location', error: error.message });
    }
};

export const startDelivery = async (req, res) => {
    const { orderId } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        await client.query(
            `UPDATE order_assignments 
             SET started_at = CURRENT_TIMESTAMP, status = 'in_progress'
             WHERE order_id = $1`,
            [orderId]
        );

        await client.query(
            'UPDATE orders SET status = $1 WHERE id = $2',
            ['in_delivery', orderId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Delivery started successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error starting delivery', error: error.message });
    } finally {
        client.release();
    }
};

export const completeDelivery = async (req, res) => {
    const { orderId } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            `UPDATE order_assignments 
             SET completed_at = CURRENT_TIMESTAMP, status = 'completed'
             WHERE order_id = $1`,
            [orderId]
        );

        await client.query(
            'UPDATE orders SET status = $1 WHERE id = $2',
            ['delivered', orderId]
        );

        // Set rider back to active status
        await client.query(
            `UPDATE riders SET status = 'active' 
             WHERE id = (
                SELECT rider_id FROM order_assignments 
                WHERE order_id = $1
             )`,
            [orderId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Delivery completed successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Error completing delivery', error: error.message });
    } finally {
        client.release();
    }
};

export const submitDeliveryRating = async (req, res) => {
    const { orderId } = req.params;
    const { rating, feedback } = req.body;

    try {
        await pool.query(
            `UPDATE order_assignments 
             SET rating = $1, feedback = $2
             WHERE order_id = $3`,
            [rating, feedback, orderId]
        );
        res.json({ message: 'Delivery rating submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting rating', error: error.message });
    }
};

export const getRiderMetrics = async (req, res) => {
    const { rider_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_deliveries,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_deliveries,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_deliveries
             FROM order_assignments
             WHERE rider_id = $1`,
            [rider_id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching metrics', error: error.message });
    }
};

export const getRiderStatus = async (req, res) => {
    const { id } = req.params;
    try {
        // Query by user_id since we're getting data from the frontend user ID
        const result = await pool.query(
            `SELECT r.*, u.email 
             FROM riders r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.user_id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rider not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in getRiderStatus:', error);
        res.status(500).json({ message: 'Error fetching rider status', error: error.message });
    }
};

export const getBranchRiderStatuses = async (req, res) => {
    const { branchId } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.id, r.full_name, r.status, rl.latitude, rl.longitude, rl.updated_at
             FROM riders r
             LEFT JOIN rider_locations rl ON r.id = rl.rider_id
             WHERE r.branch_id = $1`,
            [branchId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rider statuses', error: error.message });
    }
};

export const getRiderSettings = async (req, res) => {
    const { rider_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.is_available, r.max_concurrent_orders, r.preferred_area, r.notification_preferences
             FROM riders r
             WHERE r.id = $1`,
            [rider_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rider not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rider settings', error: error.message });
    }
};

export const updateRiderSettings = async (req, res) => {
    const { rider_id } = req.params;
    const { isAvailable, maxConcurrentOrders, preferredArea, notifications } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE riders 
             SET is_available = $1,
                 max_concurrent_orders = $2,
                 preferred_area = $3,
                 notification_preferences = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 
             RETURNING *`,
            [isAvailable, maxConcurrentOrders, preferredArea, notifications, rider_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rider not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating rider settings', error: error.message });
    }
};

export const updateRiderAvailability = async (req, res) => {
    const { rider_id } = req.params;
    const { isAvailable } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE riders 
             SET is_available = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 
             RETURNING is_available`,
            [isAvailable, rider_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rider not found' });
        }
        
        res.json({ message: 'Availability updated successfully', isAvailable: result.rows[0].is_available });
    } catch (error) {
        res.status(500).json({ message: 'Error updating rider availability', error: error.message });
    }
};