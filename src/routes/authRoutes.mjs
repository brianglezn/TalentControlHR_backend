import express from 'express';
import { registerUser, loginUser, logoutUser, verifySession } from '../controllers/authController.mjs';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/verify', verifySession);

export default router;