import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

// Parse environment variables with fallbacks
const envConfig = {
  // Authentication rate limit configurations
  AUTH_LOGIN_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_LOGIN_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes in ms
  AUTH_LOGIN_LIMIT_MAX: parseInt(process.env.AUTH_LOGIN_LIMIT_MAX || '15', 10), // Max 15 login attempts per window
  AUTH_LOGIN_LIMIT_MESSAGE: process.env.AUTH_LOGIN_LIMIT_MESSAGE || 'Too many login attempts, please try again later.',
  
  AUTH_REGISTER_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_REGISTER_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour in ms
  AUTH_REGISTER_LIMIT_MAX: parseInt(process.env.AUTH_REGISTER_LIMIT_MAX || '3', 10), // Max 3 accounts per hour
  AUTH_REGISTER_LIMIT_MESSAGE: process.env.AUTH_REGISTER_LIMIT_MESSAGE || 'Account creation limit reached, please try again later.',
  
  // Order rate limit configurations
  ORDER_READ_LIMIT_WINDOW_MS: parseInt(process.env.ORDER_READ_LIMIT_WINDOW_MS || '60000', 10), // 1 minute in ms
  ORDER_READ_LIMIT_MAX: parseInt(process.env.ORDER_READ_LIMIT_MAX || '100', 10), // Max 100 GET requests per minute
  ORDER_READ_LIMIT_MESSAGE: process.env.ORDER_READ_LIMIT_MESSAGE || 'Too many order read requests, please try again later.',
  
  ORDER_WRITE_LIMIT_WINDOW_MS: parseInt(process.env.ORDER_WRITE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour in ms
  ORDER_WRITE_LIMIT_MAX: parseInt(process.env.ORDER_WRITE_LIMIT_MAX || '10', 10), // Max 10 POST/PUT/DELETE per hour
  ORDER_WRITE_LIMIT_MESSAGE: process.env.ORDER_WRITE_LIMIT_MESSAGE || 'Too many order write requests, please try again later.',
  
  // Customer rate limit configurations
  CUSTOMER_READ_LIMIT_WINDOW_MS: parseInt(process.env.CUSTOMER_READ_LIMIT_WINDOW_MS || '60000', 10), // 1 minute in ms
  CUSTOMER_READ_LIMIT_MAX: parseInt(process.env.CUSTOMER_READ_LIMIT_MAX || '60', 10), // Max 60 GET requests per minute
  CUSTOMER_READ_LIMIT_MESSAGE: process.env.CUSTOMER_READ_LIMIT_MESSAGE || 'Too many customer read requests, please try again later.',
  
  CUSTOMER_WRITE_LIMIT_WINDOW_MS: parseInt(process.env.CUSTOMER_WRITE_LIMIT_WINDOW_MS || '300000', 10), // 5 minutes in ms
  CUSTOMER_WRITE_LIMIT_MAX: parseInt(process.env.CUSTOMER_WRITE_LIMIT_MAX || '15', 10), // Max 15 write operations per 5 minutes
  CUSTOMER_WRITE_LIMIT_MESSAGE: process.env.CUSTOMER_WRITE_LIMIT_MESSAGE || 'Too many customer write requests, please try again later.',
  
  // Menu rate limit configurations
  MENU_READ_LIMIT_WINDOW_MS: parseInt(process.env.MENU_READ_LIMIT_WINDOW_MS || '60000', 10), // 1 minute in ms
  MENU_READ_LIMIT_MAX: parseInt(process.env.MENU_READ_LIMIT_MAX || '150', 10), // Max 150 GET requests per minute
  MENU_READ_LIMIT_MESSAGE: process.env.MENU_READ_LIMIT_MESSAGE || 'Too many menu read requests, please try again later.',
  
  MENU_WRITE_LIMIT_WINDOW_MS: parseInt(process.env.MENU_WRITE_LIMIT_WINDOW_MS || '300000', 10), // 5 minutes in ms
  MENU_WRITE_LIMIT_MAX: parseInt(process.env.MENU_WRITE_LIMIT_MAX || '20', 10), // Max 20 write operations per 5 minutes
  MENU_WRITE_LIMIT_MESSAGE: process.env.MENU_WRITE_LIMIT_MESSAGE || 'Too many menu write requests, please try again later.',
  
  // Branch rate limit configurations
  BRANCH_READ_LIMIT_WINDOW_MS: parseInt(process.env.BRANCH_READ_LIMIT_WINDOW_MS || '60000', 10), // 1 minute in ms
  BRANCH_READ_LIMIT_MAX: parseInt(process.env.BRANCH_READ_LIMIT_MAX || '120', 10), // Max 120 GET requests per minute
  BRANCH_READ_LIMIT_MESSAGE: process.env.BRANCH_READ_LIMIT_MESSAGE || 'Too many branch read requests, please try again later.',
  
  BRANCH_WRITE_LIMIT_WINDOW_MS: parseInt(process.env.BRANCH_WRITE_LIMIT_WINDOW_MS || '300000', 10), // 5 minutes in ms
  BRANCH_WRITE_LIMIT_MAX: parseInt(process.env.BRANCH_WRITE_LIMIT_MAX || '15', 10), // Max 15 write operations per 5 minutes
  BRANCH_WRITE_LIMIT_MESSAGE: process.env.BRANCH_WRITE_LIMIT_MESSAGE || 'Too many branch write requests, please try again later.',
  
  // Rider rate limit configurations
  RIDER_READ_LIMIT_WINDOW_MS: parseInt(process.env.RIDER_READ_LIMIT_WINDOW_MS || '60000', 10), // 1 minute in ms
  RIDER_READ_LIMIT_MAX: parseInt(process.env.RIDER_READ_LIMIT_MAX || '120', 10), // Max 120 GET requests per minute
  RIDER_READ_LIMIT_MESSAGE: process.env.RIDER_READ_LIMIT_MESSAGE || 'Too many rider read requests, please try again later.',
  
  RIDER_WRITE_LIMIT_WINDOW_MS: parseInt(process.env.RIDER_WRITE_LIMIT_WINDOW_MS || '120000', 10), // 2 minutes in ms
  RIDER_WRITE_LIMIT_MAX: parseInt(process.env.RIDER_WRITE_LIMIT_MAX || '30', 10), // Max 30 write operations per 2 minutes
  RIDER_WRITE_LIMIT_MESSAGE: process.env.RIDER_WRITE_LIMIT_MESSAGE || 'Too many rider write requests, please try again later.',
  
  // Standard headers setting
  RATE_LIMIT_HEADERS: process.env.RATE_LIMIT_HEADERS !== 'false', // Enable rate limit headers by default
};


// Login rate limiter - more lenient
export const loginLimiter = rateLimit({
  windowMs: envConfig.AUTH_LOGIN_LIMIT_WINDOW_MS,
  max: envConfig.AUTH_LOGIN_LIMIT_MAX,
  message: { success: false, message: envConfig.AUTH_LOGIN_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Register rate limiter - stricter to prevent abuse
export const registerLimiter = rateLimit({
  windowMs: envConfig.AUTH_REGISTER_LIMIT_WINDOW_MS,
  max: envConfig.AUTH_REGISTER_LIMIT_MAX,
  message: { success: false, message: envConfig.AUTH_REGISTER_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Order READ operations rate limiter (GET requests) - higher limits
export const orderReadLimiter = rateLimit({
  windowMs: envConfig.ORDER_READ_LIMIT_WINDOW_MS,
  max: envConfig.ORDER_READ_LIMIT_MAX,
  message: { success: false, message: envConfig.ORDER_READ_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Order WRITE operations rate limiter (POST/PUT/DELETE requests) - stricter limits
export const orderWriteLimiter = rateLimit({
  windowMs: envConfig.ORDER_WRITE_LIMIT_WINDOW_MS,
  max: envConfig.ORDER_WRITE_LIMIT_MAX,
  message: { success: false, message: envConfig.ORDER_WRITE_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Customer READ operations rate limiter (GET requests) - moderate limits
export const customerReadLimiter = rateLimit({
  windowMs: envConfig.CUSTOMER_READ_LIMIT_WINDOW_MS,
  max: envConfig.CUSTOMER_READ_LIMIT_MAX,
  message: { success: false, message: envConfig.CUSTOMER_READ_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Customer WRITE operations rate limiter (POST/PUT/DELETE requests) - moderate limits
export const customerWriteLimiter = rateLimit({
  windowMs: envConfig.CUSTOMER_WRITE_LIMIT_WINDOW_MS,
  max: envConfig.CUSTOMER_WRITE_LIMIT_MAX,
  message: { success: false, message: envConfig.CUSTOMER_WRITE_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Menu READ operations rate limiter (GET requests) - high limits for menu browsing
export const menuReadLimiter = rateLimit({
  windowMs: envConfig.MENU_READ_LIMIT_WINDOW_MS,
  max: envConfig.MENU_READ_LIMIT_MAX,
  message: { success: false, message: envConfig.MENU_READ_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Menu WRITE operations rate limiter (POST/PUT/DELETE requests) - moderate limits
export const menuWriteLimiter = rateLimit({
  windowMs: envConfig.MENU_WRITE_LIMIT_WINDOW_MS,
  max: envConfig.MENU_WRITE_LIMIT_MAX,
  message: { success: false, message: envConfig.MENU_WRITE_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Branch READ operations rate limiter (GET requests) - high limits
export const branchReadLimiter = rateLimit({
  windowMs: envConfig.BRANCH_READ_LIMIT_WINDOW_MS,
  max: envConfig.BRANCH_READ_LIMIT_MAX,
  message: { success: false, message: envConfig.BRANCH_READ_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Branch WRITE operations rate limiter (POST/PUT/DELETE requests) - moderate limits
export const branchWriteLimiter = rateLimit({
  windowMs: envConfig.BRANCH_WRITE_LIMIT_WINDOW_MS,
  max: envConfig.BRANCH_WRITE_LIMIT_MAX,
  message: { success: false, message: envConfig.BRANCH_WRITE_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Rider READ operations rate limiter (GET requests) - high limits for location updates
export const riderReadLimiter = rateLimit({
  windowMs: envConfig.RIDER_READ_LIMIT_WINDOW_MS,
  max: envConfig.RIDER_READ_LIMIT_MAX,
  message: { success: false, message: envConfig.RIDER_READ_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Rider WRITE operations rate limiter (POST/PUT/DELETE requests) - higher limits for frequent location updates
export const riderWriteLimiter = rateLimit({
  windowMs: envConfig.RIDER_WRITE_LIMIT_WINDOW_MS,
  max: envConfig.RIDER_WRITE_LIMIT_MAX,
  message: { success: false, message: envConfig.RIDER_WRITE_LIMIT_MESSAGE },
  standardHeaders: envConfig.RATE_LIMIT_HEADERS,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true'
});

// Create a factory function to generate custom rate limiters
export const createCustomLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 60000, // Default to 1 minute
    max: options.max || 30, // Default to 30 requests per minute
    message: options.message || { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: options.standardHeaders !== undefined ? options.standardHeaders : envConfig.RATE_LIMIT_HEADERS,
    legacyHeaders: options.legacyHeaders || false,
    keyGenerator: options.keyGenerator,
    skip: options.skip || ((req) => process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true')
  });
};