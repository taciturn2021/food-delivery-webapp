import { pool } from '../config/database.js';

const imagePath = (id, version) => `/fooddelivery/api/menu/${id}/image${version ? `?v=${encodeURIComponent(version)}` : ''}`;

export const getMenuItemImageUrl = (req, id, version) =>
    `${req.protocol}://${req.get('host')}${imagePath(id, version)}`;

const decorateMenuItem = (req, item) => {
    const { has_uploaded_image, image_updated_at, ...menuItem } = item;

    return {
        ...menuItem,
        image_url: has_uploaded_image
            ? getMenuItemImageUrl(req, item.id, image_updated_at)
            : menuItem.image_url
    };
};

const isSupportedImage = (file) => {
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!allowedMimeTypes.has(file.mimetype)) return false;

    const bytes = file.buffer;
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isGif = bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a';
    const isWebp = bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
        bytes.subarray(8, 12).toString('ascii') === 'WEBP';

    return isJpeg || isPng || isGif || isWebp;
};

export const createMenuItem = async (req, res) => {
    const { name, description, price, category, image_url, is_available } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO menu_items (name, description, price, category, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, category, image_url, is_available]
        );

        res.status(201).json(decorateMenuItem(req, result.rows[0]));
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item', error: error.message });
    }
};

export const getAllMenuItems = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT mi.*, 
                   (mii.menu_item_id IS NOT NULL) AS has_uploaded_image,
                   mii.updated_at AS image_updated_at
            FROM menu_items mi
            LEFT JOIN menu_item_images mii ON mii.menu_item_id = mi.id
            ORDER BY mi.category, mi.name
        `);
        res.json(result.rows.map(item => decorateMenuItem(req, item)));
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

        const imageResult = await pool.query(
            'SELECT updated_at AS image_updated_at, true AS has_uploaded_image FROM menu_item_images WHERE menu_item_id = $1',
            [id]
        );

        res.json(decorateMenuItem(req, {
            ...result.rows[0],
            ...(imageResult.rows[0] || {})
        }));
    } catch (error) {
        res.status(500).json({ message: 'Error updating menu item', error: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    const { id } = req.params;

    try {
        const orderCheck = await pool.query(
            'SELECT 1 FROM order_items WHERE menu_item_id = $1 LIMIT 1',
            [id]
        );

        if (orderCheck.rows.length > 0) {
            await pool.query(
                'UPDATE menu_items SET is_available = false WHERE id = $1',
                [id]
            );
            return res.json({ message: 'Menu item marked as unavailable due to existing orders' });
        }

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

export const uploadMenuItemImage = async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'An image file is required' });
    }

    if (!isSupportedImage(req.file)) {
        return res.status(400).json({ message: 'Only valid JPEG, PNG, WebP, or GIF images are supported' });
    }

    try {
        const menuItem = await pool.query('SELECT id FROM menu_items WHERE id = $1', [id]);
        if (menuItem.rows.length === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        const result = await pool.query(`
            INSERT INTO menu_item_images (menu_item_id, image_data, mime_type, file_size, updated_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            ON CONFLICT (menu_item_id) DO UPDATE SET
                image_data = EXCLUDED.image_data,
                mime_type = EXCLUDED.mime_type,
                file_size = EXCLUDED.file_size,
                updated_at = CURRENT_TIMESTAMP
            RETURNING updated_at
        `, [id, req.file.buffer, req.file.mimetype, req.file.size]);

        res.json({
            message: 'Menu item image uploaded successfully',
            image_url: getMenuItemImageUrl(req, id, result.rows[0].updated_at)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading menu item image', error: error.message });
    }
};

export const getMenuItemImage = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT image_data, mime_type, updated_at FROM menu_item_images WHERE menu_item_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Image not found');
        }

        const image = result.rows[0];
        res.set({
            'Content-Type': image.mime_type,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Last-Modified': new Date(image.updated_at).toUTCString()
        });
        res.send(image.image_data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu item image' });
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
