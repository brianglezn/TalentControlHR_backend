import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = [
    'http://localhost:5173',
    'https://talentcontrolhr-frontend.onrender.com',
    'https://talentcontrolhr.brian-novoa.com',
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: 'GET,POST,PUT,DELETE,OPTIONS',
    })
);

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

import authRoutes from './routes/authRoutes.mjs';
app.use('/api/auth', authRoutes);

import userRoutes from './routes/userRoutes.mjs';
app.use('/api/users', userRoutes);

import companiesRoutes from './routes/companiesRoutes.mjs';
app.use('/api/companies', companiesRoutes);

const port = 3000;
app.listen(port, () => {
    console.log(`Server running in development mode at http://localhost:${port}`);
});
