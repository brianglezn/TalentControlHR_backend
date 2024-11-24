import express from 'express';
import {
    getAllUsers,
    getUserById,
    getUserByCompany,
    getUserByTeam,
    createUser,
    updateUserById,
    deleteUserById,
    resetUserPassword,
} from '../controllers/userController.mjs';

const router = express.Router();

// Rutas de usuario
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.get('/company/:companyId', getUserByCompany);
router.get('/team/:teamId', getUserByTeam);
router.post('/', createUser);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.patch('/:id/reset-password', resetUserPassword);

export default router;
