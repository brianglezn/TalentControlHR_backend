import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById,
    resetUserPassword,
} from '../controllers/userController.mjs';
import { authenticateToken } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.get('/:id', authenticateToken, getUserById);
router.get('/me', authenticateToken, getUserById);
router.post('/', authenticateToken, createUser);
router.put('/:id', authenticateToken, updateUserById);
router.delete('/:id', authenticateToken, deleteUserById);
router.patch('/:id/reset-password', authenticateToken, resetUserPassword);
router.get('/', authenticateToken, getAllUsers);

export default router;
