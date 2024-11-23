import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { client, DB_NAME } from '../config/database.mjs';

const usersCollection = client.db(DB_NAME).collection('users');

export const registerUser = async (req, res) => {
    try {
        const { username, name, surnames, email, password } = req.body;

        if (!username || !name || !surnames || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'The username or email already exists' });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
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
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
    } catch (error) {
        console.error('Error when registering the user:', error.message);
        res.status(500).json({ message: 'Error when registering the user', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {

        const { username, email, password } = req.body;

        if (!password || (!username && !email)) {
            console.error('Missing username/email or password');
            return res.status(400).json({ message: 'Username/email and password are required' });
        }

        const user = await usersCollection.findOne({
            $or: [{ username }, { email }],
        });

        if (!user) {
            console.error('User not found for username/email:', { username, email });
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error('Invalid password for username/email:', { username, email });
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const logoutUser = (req, res) => {
    try {
        res.clearCookie('authToken');
        res.status(200).json({ message: 'Session closed successfully' });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
};
