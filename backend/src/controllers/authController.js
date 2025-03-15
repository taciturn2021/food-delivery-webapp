import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export const login = async (req, res) => {
    try {
        console.log('Login request received:', {
            body: req.body,
            contentType: req.headers['content-type']
        });

        if (!req.body || !req.body.email || !req.body.password) {
            console.log('Missing required fields:', { 
                hasBody: !!req.body,
                fields: req.body ? Object.keys(req.body) : [] 
            });
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const { email, password } = req.body;
        
        // Get user with password for comparison
        let result;
        result = await pool.query(
            `SELECT u.*, b.id as branch_id, r.id as rider_id 
             FROM users u 
             LEFT JOIN branches b ON u.id = b.manager_id 
             LEFT JOIN riders r ON u.id = r.user_id 
             WHERE u.email = $1`,
            [email.toLowerCase()]
        );

        console.log('Database query result:', { 
            userFound: result.rows.length > 0,
            email: email.toLowerCase(),
            role: result.rows[0]?.role
        });

        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation:', { 
            isValid: isValidPassword,
            providedPassword: !!password,
            hashedPasswordLength: user.password.length
        });

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create consistent user data structure
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            branchId: user.branch_id,
            riderId: user.rider_id
        };

        const token = jwt.sign(
            { userId: user.id, role: user.role, branchId: user.branch_id, riderId: user.rider_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log('Login successful:', {
            userId: userData.id,
            role: userData.role,
            tokenGenerated: !!token,
            hasBranchId: !!userData.branchId,
            hasRiderId: !!userData.riderId
        });

        res.json({
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login', 
            error: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            [username, email, hashedPassword, role]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const registerCustomer = async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, email, password, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const userExists = await client.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email.toLowerCase(), username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        await client.query('BEGIN');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userResult = await client.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            [username, email.toLowerCase(), hashedPassword, 'customer']
        );

        // Create customer profile
        const customerResult = await client.query(
            'INSERT INTO customers (user_id, first_name, last_name, phone) VALUES ($1, $2, $3, $4) RETURNING id',
            [userResult.rows[0].id, firstName, lastName, phone]
        );

        await client.query('COMMIT');

        const userData = {
            ...userResult.rows[0],
            customer_id: customerResult.rows[0].id,
            firstName,
            lastName,
            phone
        };

        const token = jwt.sign(
            { userId: userData.id, role: userData.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            token,
            user: userData
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration', 
            error: error.message 
        });
    } finally {
        client.release();
    }
};

export const getProfile = async (req, res) => {
    try {
        let result;
        if (req.user.role === 'rider') {
            result = await pool.query(
                `SELECT u.id, u.username, u.email, u.role, r.id as rider_id, r.branch_id 
                 FROM users u 
                 LEFT JOIN riders r ON u.id = r.user_id 
                 WHERE u.id = $1`,
                [req.user.userId]
            );
        } else {
            result = await pool.query(
                `SELECT u.id, u.username, u.email, u.role, b.id as branch_id 
                 FROM users u 
                 LEFT JOIN branches b ON u.id = b.manager_id 
                 WHERE u.id = $1`,
                [req.user.userId]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format the response to include rider_id if applicable
        const userData = {
            id: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email,
            role: result.rows[0].role,
            branchId: result.rows[0].branch_id,
            riderId: result.rows[0].rider_id
        };

        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.userId;
        const { username, email, firstName, lastName, phone } = req.body;

        await client.query('BEGIN');

        // Check if user exists
        const userCheck = await client.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is changing username or email, check if they are already taken
        if (username !== userCheck.rows[0].username || email !== userCheck.rows[0].email) {
            const duplicateCheck = await client.query(
                'SELECT * FROM users WHERE (email = $1 OR username = $2) AND id != $3',
                [email, username, userId]
            );

            if (duplicateCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Username or email already taken' });
            }
        }

        // Update user basic details
        await client.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3',
            [username, email, userId]
        );

        // If it's a customer, also update customer-specific info
        if (req.user.role === 'customer' && (firstName || lastName || phone)) {
            const customerCheck = await client.query(
                'SELECT * FROM customers WHERE user_id = $1',
                [userId]
            );

            if (customerCheck.rows.length > 0) {
                // Update existing customer profile
                await client.query(
                    'UPDATE customers SET first_name = $1, last_name = $2, phone = $3 WHERE user_id = $4',
                    [firstName, lastName, phone, userId]
                );
            } else if (firstName && lastName && phone) {
                // Create new customer profile if it doesn't exist
                await client.query(
                    'INSERT INTO customers (user_id, first_name, last_name, phone) VALUES ($1, $2, $3, $4)',
                    [userId, firstName, lastName, phone]
                );
            }
        }

        await client.query('COMMIT');

        // Get updated user data
        let result;
        if (req.user.role === 'customer') {
            result = await pool.query(
                `SELECT u.id, u.username, u.email, u.role, c.id as customer_id, c.first_name, c.last_name, c.phone
                 FROM users u
                 LEFT JOIN customers c ON u.id = c.user_id
                 WHERE u.id = $1`,
                [userId]
            );
        } else if (req.user.role === 'rider') {
            result = await pool.query(
                `SELECT u.id, u.username, u.email, u.role, r.id as rider_id, r.branch_id 
                 FROM users u 
                 LEFT JOIN riders r ON u.id = r.user_id 
                 WHERE u.id = $1`,
                [userId]
            );
        } else {
            result = await pool.query(
                `SELECT u.id, u.username, u.email, u.role, b.id as branch_id 
                 FROM users u 
                 LEFT JOIN branches b ON u.id = b.manager_id 
                 WHERE u.id = $1`,
                [userId]
            );
        }

        // Format the response
        const userData = {
            id: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email,
            role: result.rows[0].role,
        };

        // Add role-specific fields
        if (req.user.role === 'customer') {
            userData.firstName = result.rows[0].first_name;
            userData.lastName = result.rows[0].last_name;
            userData.phone = result.rows[0].phone;
            userData.customerId = result.rows[0].customer_id;
        } else if (req.user.role === 'rider') {
            userData.riderId = result.rows[0].rider_id;
            userData.branchId = result.rows[0].branch_id;
        } else {
            userData.branchId = result.rows[0].branch_id;
        }

        res.json({ message: 'Profile updated successfully', user: userData });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error during profile update', error: error.message });
    } finally {
        client.release();
    }
};

export const updatePassword = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        // Verify the current password
        const userResult = await client.query(
            'SELECT password FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        await client.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ message: 'Server error during password update', error: error.message });
    } finally {
        client.release();
    }
};