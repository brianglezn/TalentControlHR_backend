import express from 'express';
import {
    getAllUsers,
    getUserById,
    getCurrentUser,
    createUser,
    updateUserById,
    deleteUserById,
    resetUserPassword,
} from '../controllers/userController.mjs';
import { authenticateToken } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.get('/:id', authenticateToken, getUserById);
router.post('/', authenticateToken, createUser);
router.put('/:id', authenticateToken, updateUserById);
router.delete('/:id', authenticateToken, deleteUserById);
router.patch('/:id/reset-password', authenticateToken, resetUserPassword);
router.get('/', authenticateToken, getAllUsers);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
