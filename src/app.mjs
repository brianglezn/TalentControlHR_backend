import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173',
    'https://talentcontrolhr-frontend.onrender.com',
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

import authRoutes from './routes/authRoutes.mjs';
app.use('/api/auth', authRoutes);
import userRoutes from './routes/userRoutes.mjs';
app.use('/api/user', userRoutes);

const port = 3000;
app.listen(port, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Server running in development mode at http://localhost:3000');
    }
});
