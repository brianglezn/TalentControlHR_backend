import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

import { client, DB_NAME } from '../config/database.mjs';

const USERS_COLLECTION = 'users';

export const getAllUsers = async (req, res) => {
    try {
        const db = client.db(DB_NAME);
        const users = await db.collection(USERS_COLLECTION).find().toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users', details: error.message });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const db = client.db(DB_NAME);
        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving user', details: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const db = client.db(DB_NAME);

        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving current user', details: error.message });
    }
};

export const createUser = async (req, res) => {
    const { username, name, surnames, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const db = client.db(DB_NAME);

        const newUser = {
            username,
            name,
            surnames,
            email,
            password: hashedPassword,
            role: "employee",
        };

        const result = await db.collection(USERS_COLLECTION).insertOne(newUser);
        res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user', details: error.message });
    }
};

export const updateUserById = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const db = client.db(DB_NAME);

        if (updateData.company) {
            updateData.company = new ObjectId(updateData.company);
        }
        if (updateData.team) {
            updateData.team = new ObjectId(updateData.team);
        }

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const result = await db.collection(USERS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating user', details: error.message });
    }
};

export const deleteUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const db = client.db(DB_NAME);

        const result = await db.collection(USERS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user', details: error.message });
    }
};

export const resetUserPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Invalid password. It must be at least 8 characters long.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const db = client.db(DB_NAME);

        const result = await db.collection(USERS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error resetting password', details: error.message });
    }
};