import { pool } from '../config/database.js';

// Get all addresses for the logged-in customer
export const getAddresses = async (req, res) => {
    try {
        // Get customer_id from user_id
        const customerResult = await pool.query(
            'SELECT id FROM customers WHERE user_id = $1',
            [req.user.userId]
        );

        if (customerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customerResult.rows[0].id;

        // Get all addresses for this customer
        const addressesResult = await pool.query(
            `SELECT * FROM customer_addresses 
             WHERE customer_id = $1
             ORDER BY is_default DESC, created_at DESC`,
            [customerId]
        );

        // Format the addresses to match the frontend expectations
        const addresses = addressesResult.rows.map(address => ({
            id: address.id,
            street: address.street_address,
            city: address.city,
            state: address.state,
            zipCode: address.postal_code,
            country: address.country,
            latitude: parseFloat(address.latitude),
            longitude: parseFloat(address.longitude),
            isDefault: address.is_default,
            branchId: address.branch_id || null,
            createdAt: address.created_at
        }));

        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ 
            message: 'Failed to fetch addresses', 
            error: error.message 
        });
    }
};

// Add a new address for the logged-in customer
export const addAddress = async (req, res) => {
    const client = await pool.connect();
    try {
        const { 
            street, 
            city, 
            state, 
            zipCode, 
            country = 'Pakistan', 
            latitude, 
            longitude,
            branchId
        } = req.body;

        if (!street || !city) {
            return res.status(400).json({ message: 'Street address and city are required' });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Location coordinates are required' });
        }

        await client.query('BEGIN');

        // Get customer_id from user_id
        const customerResult = await client.query(
            'SELECT id FROM customers WHERE user_id = $1',
            [req.user.userId]
        );

        if (customerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customerResult.rows[0].id;

        // Check if this is the first address (make it default)
        const addressCountResult = await client.query(
            'SELECT COUNT(*) FROM customer_addresses WHERE customer_id = $1',
            [customerId]
        );

        const isDefault = parseInt(addressCountResult.rows[0].count) === 0;

        // Insert the new address
        const result = await client.query(
            `INSERT INTO customer_addresses 
            (customer_id, street_address, city, state, postal_code, country, latitude, longitude, is_default, branch_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                customerId,
                street,
                city,
                state,
                zipCode,
                country,
                latitude,
                longitude,
                isDefault,
                branchId
            ]
        );

        await client.query('COMMIT');

        // Format the address for the response
        const address = {
            id: result.rows[0].id,
            street: result.rows[0].street_address,
            city: result.rows[0].city,
            state: result.rows[0].state,
            zipCode: result.rows[0].postal_code,
            country: result.rows[0].country,
            latitude: parseFloat(result.rows[0].latitude),
            longitude: parseFloat(result.rows[0].longitude),
            isDefault: result.rows[0].is_default,
            branchId: result.rows[0].branch_id || null,
            createdAt: result.rows[0].created_at
        };

        res.status(201).json(address);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding address:', error);
        res.status(500).json({ 
            message: 'Failed to add address', 
            error: error.message 
        });
    } finally {
        client.release();
    }
};

// Update an existing address
export const updateAddress = async (req, res) => {
    const client = await pool.connect();
    try {
        const addressId = req.params.id;
        const { 
            street, 
            city, 
            state, 
            zipCode, 
            country = 'Pakistan', 
            latitude, 
            longitude,
            branchId
        } = req.body;

        if (!street || !city) {
            return res.status(400).json({ message: 'Street address and city are required' });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Location coordinates are required' });
        }

        await client.query('BEGIN');

        // Get customer_id from user_id
        const customerResult = await client.query(
            'SELECT id FROM customers WHERE user_id = $1',
            [req.user.userId]
        );

        if (customerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customerResult.rows[0].id;

        // Verify that this address belongs to the customer
        const addressResult = await client.query(
            'SELECT * FROM customer_addresses WHERE id = $1 AND customer_id = $2',
            [addressId, customerId]
        );

        if (addressResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Address not found or does not belong to the customer' });
        }

        // Update the address
        const result = await client.query(
            `UPDATE customer_addresses 
             SET street_address = $1, city = $2, state = $3, postal_code = $4, 
             country = $5, latitude = $6, longitude = $7, branch_id = $8
             WHERE id = $9 AND customer_id = $10
             RETURNING *`,
            [
                street,
                city,
                state,
                zipCode,
                country,
                latitude,
                longitude,
                branchId,
                addressId,
                customerId
            ]
        );

        await client.query('COMMIT');

        // Format the address for the response
        const address = {
            id: result.rows[0].id,
            street: result.rows[0].street_address,
            city: result.rows[0].city,
            state: result.rows[0].state,
            zipCode: result.rows[0].postal_code,
            country: result.rows[0].country,
            latitude: parseFloat(result.rows[0].latitude),
            longitude: parseFloat(result.rows[0].longitude),
            isDefault: result.rows[0].is_default,
            branchId: result.rows[0].branch_id || null,
            createdAt: result.rows[0].created_at
        };

        res.json(address);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating address:', error);
        res.status(500).json({ 
            message: 'Failed to update address', 
            error: error.message 
        });
    } finally {
        client.release();
    }
};

// Delete an address
export const deleteAddress = async (req, res) => {
    const client = await pool.connect();
    try {
        const addressId = req.params.id;

        await client.query('BEGIN');

        // Get customer_id from user_id
        const customerResult = await client.query(
            'SELECT id FROM customers WHERE user_id = $1',
            [req.user.userId]
        );

        if (customerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customerResult.rows[0].id;

        // Check if this is the address we're deleting is the default one
        const addressResult = await client.query(
            'SELECT is_default FROM customer_addresses WHERE id = $1 AND customer_id = $2',
            [addressId, customerId]
        );

        if (addressResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Address not found or does not belong to the customer' });
        }

        const isDefault = addressResult.rows[0].is_default;

        // Delete the address
        await client.query(
            'DELETE FROM customer_addresses WHERE id = $1 AND customer_id = $2',
            [addressId, customerId]
        );

        // If the deleted address was the default one, make another address the default if any exist
        if (isDefault) {
            const remainingAddressResult = await client.query(
                'SELECT id FROM customer_addresses WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1',
                [customerId]
            );

            if (remainingAddressResult.rows.length > 0) {
                await client.query(
                    'UPDATE customer_addresses SET is_default = true WHERE id = $1',
                    [remainingAddressResult.rows[0].id]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting address:', error);
        res.status(500).json({ 
            message: 'Failed to delete address', 
            error: error.message 
        });
    } finally {
        client.release();
    }
};

// Set an address as default
export const setDefaultAddress = async (req, res) => {
    const client = await pool.connect();
    try {
        const addressId = req.params.id;

        await client.query('BEGIN');

        // Get customer_id from user_id
        const customerResult = await client.query(
            'SELECT id FROM customers WHERE user_id = $1',
            [req.user.userId]
        );

        if (customerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const customerId = customerResult.rows[0].id;

        // Verify that this address belongs to the customer
        const addressResult = await client.query(
            'SELECT * FROM customer_addresses WHERE id = $1 AND customer_id = $2',
            [addressId, customerId]
        );

        if (addressResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Address not found or does not belong to the customer' });
        }

        // Clear default flag from all addresses
        await client.query(
            'UPDATE customer_addresses SET is_default = false WHERE customer_id = $1',
            [customerId]
        );

        // Set the new default
        await client.query(
            'UPDATE customer_addresses SET is_default = true WHERE id = $1',
            [addressId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Default address updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error setting default address:', error);
        res.status(500).json({ 
            message: 'Failed to set default address', 
            error: error.message 
        });
    } finally {
        client.release();
    }
};

// Get customer profile information
export const getCustomerProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, u.username, u.email
             FROM customers c
             JOIN users u ON c.user_id = u.id
             WHERE c.user_id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        const profile = {
            id: result.rows[0].id,
            userId: result.rows[0].user_id,
            username: result.rows[0].username,
            email: result.rows[0].email,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            phone: result.rows[0].phone,
            createdAt: result.rows[0].created_at
        };

        res.json(profile);
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        res.status(500).json({ 
            message: 'Failed to fetch customer profile', 
            error: error.message 
        });
    }
};

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;

        if (!firstName || !lastName || !phone) {
            return res.status(400).json({ message: 'First name, last name, and phone are required' });
        }

        // Update customer profile
        await pool.query(
            `UPDATE customers 
             SET first_name = $1, last_name = $2, phone = $3
             WHERE user_id = $4`,
            [firstName, lastName, phone, req.user.userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating customer profile:', error);
        res.status(500).json({ 
            message: 'Failed to update customer profile', 
            error: error.message 
        });
    }
};