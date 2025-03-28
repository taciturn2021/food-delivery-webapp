import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeDatabase } from './config/database.js';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import branchRoutes from './routes/branch.js';
import orderRoutes from './routes/order.js';
import riderRoutes from './routes/rider.js';
import customerRoutes from './routes/customer.js';

const __filename = fileURLToPath(import.meta.url); // 
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Trust proxy - required for Cloudflare tunnels or any proxy
// This enables Express to trust the X-Forwarded-For header from a proxy
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// Initialize database
initializeDatabase().catch(console.error);

// Routes - specific rate limiters are applied in each route file
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/customers', customerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});