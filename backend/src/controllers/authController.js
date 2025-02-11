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
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
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

        const tokenPayload = { userId: user.id, role: user.role };
        console.log('Generating token with payload:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Send response without password
        const response = {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };

        console.log('Sending successful response:', {
            userId: user.id,
            role: user.role,
            tokenGenerated: !!token
        });

        res.json(response);
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

export const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, role FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};