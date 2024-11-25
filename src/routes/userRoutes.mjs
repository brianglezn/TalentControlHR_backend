import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUserById,
    deleteUserById,
    resetUserPassword,
} from '../controllers/userController.mjs';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.patch('/:id/reset-password', resetUserPassword);

export default router;
