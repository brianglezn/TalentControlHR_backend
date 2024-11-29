import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { client, DB_NAME } from '../config/database.mjs';

const usersCollection = client.db(DB_NAME).collection('users');

export const registerUser = async (req, res) => {
    try {
        const { username, name, surnames, email, password } = req.body;

        if (!username || !name || !surnames || !email || !password) {
            return res.json({ error: true, message: 'All fields are required.' });
        }

        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.json({ error: true, message: 'The username or email already exists.' });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#+-])[A-Za-z\d@$!%*?&#+-]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.json({
                error: true,
                message: 'The password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await usersCollection.insertOne({
            username,
            name,
            surnames,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.json({ error: false, message: 'User registered successfully.', userId: result.insertedId });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.json({ error: true, message: 'An error occurred during registration.' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!password || (!username && !email)) {
            return res.json({ error: true, message: 'Username/email and password are required.' });
        }

        const user = await usersCollection.findOne({
            $or: [{ username }, { email }],
        });

        if (!user) {
            return res.json({ error: true, message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ error: true, message: 'Incorrect password.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        });

        res.json({ error: false, message: 'Login successful.', user });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.json({ error: true, message: 'An error occurred during login.' });
    }
};

export const verifySession = (req, res) => {
    try {
        const token = req.cookies.authToken;
        if (!token) {
            return res.json({ error: true, message: 'No token provided.', isAuthenticated: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ error: false, message: 'Session verified.', isAuthenticated: true, user: decoded });
    } catch (error) {
        return res.json({ error: true, message: 'Invalid or expired token.', isAuthenticated: false });
    }
};

export const logoutUser = (req, res) => {
    try {
        res.clearCookie('authToken');
        res.json({ error: false, message: 'Session closed successfully.' });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.json({ error: true, message: 'An error occurred during logout.' });
    }
};
