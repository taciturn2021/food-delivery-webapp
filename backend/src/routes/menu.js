import express from 'express';
import multer from 'multer';
import { 
    createMenuItem, 
    getAllMenuItems, 
    updateMenuItem, 
    deleteMenuItem,
    assignMenuItemToBranch,
    getMenuItemImage,
    uploadMenuItemImage
} from '../controllers/menuController.js';
import { protect, isAdmin, isAdminOrManager } from '../middleware/auth.js';
import { menuReadLimiter, menuWriteLimiter } from '../middleware/rateLimiter/index.js';

const router = express.Router();
const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        callback(null, allowedTypes.includes(file.mimetype));
    }
});
const uploadSingleImage = (req, res, next) => {
    imageUpload.single('image')(req, res, (error) => {
        if (!error) return next();

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'Image must be 5 MB or smaller' });
        }

        return res.status(400).json({ message: 'Invalid image upload' });
    });
};

// Images are public because customer menu responses expose their image URL.
router.get('/:id/image', menuReadLimiter, getMenuItemImage);

// Apply write limiter to create operations
router.post('/', protect, menuWriteLimiter, isAdmin, createMenuItem);

// Apply read limiter to get operations
router.get('/', protect, menuReadLimiter, isAdminOrManager, getAllMenuItems);

// Apply write limiter to update/delete operations
router.put('/:id', protect, menuWriteLimiter, isAdmin, updateMenuItem);
router.delete('/:id', protect, menuWriteLimiter, isAdmin, deleteMenuItem);
router.post('/branch-assignment', protect, menuWriteLimiter, isAdminOrManager, assignMenuItemToBranch);
router.post('/:id/image', protect, menuWriteLimiter, isAdmin, uploadSingleImage, uploadMenuItemImage);

export default router;