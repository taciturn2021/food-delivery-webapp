import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
};

console.log('Attempting to connect to database with config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
});

const pool = new pg.Pool(dbConfig);

pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize database tables
const initializeDatabase = async () => {
    const client = await pool.connect();
    console.log('Initializing database...');
    try {
        await client.query('BEGIN');

        // Check if sequences exist before creating tables
        const checkSequence = async (sequenceName) => {
            const result = await client.query(
                "SELECT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = $1)",
                [sequenceName]
            );
            return result.rows[0].exists;
        };

        const createTableIfNotExists = async (tableName, createTableSQL) => {
            const sequenceName = `${tableName}_id_seq`;
            const sequenceExists = await checkSequence(sequenceName);
            
            if (!sequenceExists) {
                await client.query(createTableSQL);
            }
        };

        // Create users table
        await createTableIfNotExists('users', `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'branch_manager', 'customer')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create branches table
        await createTableIfNotExists('branches', `
            CREATE TABLE IF NOT EXISTS branches (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                address TEXT NOT NULL,
                phone VARCHAR(20),
                manager_id INTEGER REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                opening_time TIME DEFAULT '09:00',
                closing_time TIME DEFAULT '22:00',
                delivery_radius INTEGER DEFAULT 10,
                minimum_order_amount DECIMAL(10,2) DEFAULT 15.00,
                max_concurrent_orders INTEGER DEFAULT 20,
                preparation_time_minutes INTEGER DEFAULT 30,
                allow_scheduled_orders BOOLEAN DEFAULT true,
                max_schedule_days INTEGER DEFAULT 7,
                automatic_order_assignment BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create menu_items table
        await createTableIfNotExists('menu_items', `
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(50) NOT NULL,
                image_url TEXT,
                is_available BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create branch_menu_items table (for branch-specific availability and pricing)
        await client.query(`
            CREATE TABLE IF NOT EXISTS branch_menu_items (
                branch_id INTEGER REFERENCES branches(id),
                menu_item_id INTEGER REFERENCES menu_items(id),
                price DECIMAL(10,2),
                is_available BOOLEAN DEFAULT true,
                PRIMARY KEY (branch_id, menu_item_id)
            )
        `);

        // Create orders table
        await createTableIfNotExists('orders', `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                branch_id INTEGER REFERENCES branches(id),
                status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled')),
                total_amount DECIMAL(10,2) NOT NULL,
                delivery_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create order_items table
        await createTableIfNotExists('order_items', `
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id),
                menu_item_id INTEGER REFERENCES menu_items(id),
                quantity INTEGER NOT NULL,
                price_at_time DECIMAL(10,2) NOT NULL,
                special_instructions TEXT
            )
        `);

        // Create riders table
        await createTableIfNotExists('riders', `
            CREATE TABLE IF NOT EXISTS riders (
                id SERIAL PRIMARY KEY,
                branch_id INTEGER REFERENCES branches(id),
                user_id INTEGER REFERENCES users(id),
                full_name VARCHAR(100) NOT NULL,
                cnic VARCHAR(15) NOT NULL UNIQUE,
                contact_number VARCHAR(20) NOT NULL,
                emergency_contact VARCHAR(20),
                vehicle_type VARCHAR(50) NOT NULL,
                vehicle_plate_no VARCHAR(20) NOT NULL UNIQUE,
                license_no VARCHAR(50) NOT NULL UNIQUE,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'busy')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create order_assignments table for tracking rider assignments
        await createTableIfNotExists('order_assignments', `
            CREATE TABLE IF NOT EXISTS order_assignments (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id),
                rider_id INTEGER REFERENCES riders(id),
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked', 'delivered', 'cancelled'))
            )
        `);

        // Create rider_locations table for tracking real-time locations
        await createTableIfNotExists('rider_locations', `
            CREATE TABLE IF NOT EXISTS rider_locations (
                rider_id INTEGER REFERENCES riders(id) PRIMARY KEY,
                latitude DECIMAL(10, 8) NOT NULL,
                longitude DECIMAL(11, 8) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create delivery_metrics table for tracking performance
        await createTableIfNotExists('delivery_metrics', `
            CREATE TABLE IF NOT EXISTS delivery_metrics (
                id SERIAL PRIMARY KEY,
                rider_id INTEGER REFERENCES riders(id),
                order_id INTEGER REFERENCES orders(id),
                assignment_id INTEGER REFERENCES order_assignments(id),
                pickup_time TIMESTAMP,
                delivery_time TIMESTAMP,
                estimated_distance DECIMAL(10,2),
                actual_distance DECIMAL(10,2),
                customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
                delivery_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create branch_settings table
        await createTableIfNotExists('branch_settings', `
            CREATE TABLE IF NOT EXISTS branch_settings (
                branch_id INTEGER REFERENCES branches(id),
                opening_time TIME NOT NULL DEFAULT '09:00:00',
                closing_time TIME NOT NULL DEFAULT '22:00:00',
                delivery_radius INTEGER NOT NULL DEFAULT 10,
                minimum_order_amount DECIMAL(10,2) NOT NULL DEFAULT 15.00,
                max_concurrent_orders INTEGER NOT NULL DEFAULT 20,
                preparation_time_minutes INTEGER NOT NULL DEFAULT 30,
                allow_scheduled_orders BOOLEAN NOT NULL DEFAULT true,
                max_schedule_days INTEGER NOT NULL DEFAULT 7,
                automatic_order_assignment BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (branch_id)
            )
        `);

    

        // Create customers table
        await createTableIfNotExists('customers', `
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create customer_addresses table
        await createTableIfNotExists('customer_addresses', `
            CREATE TABLE IF NOT EXISTS customer_addresses (
                id SERIAL PRIMARY KEY,
                customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
                street_address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100) DEFAULT 'Pakistan',
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                branch_id INTEGER REFERENCES branches(id),
                is_default BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Update branches table constraints
        await client.query(`
            ALTER TABLE branches
            ALTER COLUMN opening_time SET DEFAULT '09:00:00',
            ALTER COLUMN closing_time SET DEFAULT '22:00:00',
            ALTER COLUMN status SET DEFAULT 'active',
            ALTER COLUMN status TYPE VARCHAR(20)
        `);

        // Update order_assignments table constraints
        await client.query(`
            ALTER TABLE order_assignments
            ALTER COLUMN status SET DEFAULT 'assigned',
            ALTER COLUMN status TYPE VARCHAR(20)
        `);

        // Update riders table constraints
        await client.query(`
            ALTER TABLE riders
            ALTER COLUMN status SET DEFAULT 'active',
            ALTER COLUMN status TYPE VARCHAR(20)
        `);

        // Create default admin user with a fresh password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        console.log('Attempting to create/update default admin user...');
        
        // First, check if admin user exists
        const existingAdmin = await client.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            ['admin@example.com']
        );

        if (existingAdmin.rows.length > 0) {
            // Update existing admin's password
            await client.query(
                'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, role',
                [hashedPassword, 'admin@example.com']
            );
            console.log('Updated existing admin user password');
        } else {
            // Create new admin user
            await client.query(
                'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
                ['admin', 'admin@example.com', hashedPassword, 'admin']
            );
            console.log('Created new admin user');
        }

        // Verify admin user
        const verifyAdmin = await client.query(
            'SELECT id, email, role, password FROM users WHERE email = $1',
            ['admin@example.com']
        );
        
        if (verifyAdmin.rows.length > 0) {
            console.log('Admin user verification:', {
                id: verifyAdmin.rows[0].id,
                email: verifyAdmin.rows[0].email,
                role: verifyAdmin.rows[0].role,
                passwordLength: verifyAdmin.rows[0].password.length
            });
        }

        await client.query('COMMIT');
        console.log('Database initialization completed successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database initialization error:', error);
        throw error;
    } finally {
        client.release();
    }
};



// Initialize database on server startup
initializeDatabase().catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});


export { pool, initializeDatabase };