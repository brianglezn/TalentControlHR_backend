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

router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.patch('/:id/reset-password', resetUserPassword);
router.get('/', authenticateToken, getAllUsers);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
