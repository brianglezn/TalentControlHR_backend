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

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#+-])[A-Za-z\d@$!%*?&#+-]{8,}$/;
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
            role: 'employee',
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
            return res.status(400).json({ message: 'Username/email and password are required' });
        }

        const user = await usersCollection.findOne({
            $or: [{ username }, { email }],
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role, company: user.company },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Devuelve el token y la información del usuario al cliente
        res.status(200).json({ message: 'Login successful', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
