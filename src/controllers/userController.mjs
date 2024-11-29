import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { client, DB_NAME } from '../config/database.mjs';

const USERS_COLLECTION = 'users';

export const getAllUsers = async (req, res) => {
    try {
        const db = client.db(DB_NAME);
        const users = await db.collection(USERS_COLLECTION).find().toArray();
        res.json({ error: false, message: 'Users retrieved successfully', data: users });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.json({ error: true, message: 'An error occurred while retrieving users' });
    }
};

export const getUserById = async (req, res) => {
    const userId = req.params.id === 'me' ? req.user.userId : req.params.id;

    try {
        if (!ObjectId.isValid(userId)) {
            return res.json({ error: true, message: 'Invalid user ID format' });
        }

        const db = client.db(DB_NAME);
        const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.json({ error: true, message: 'User not found' });
        }

        const { password, ...safeUser } = user;
        res.json({ error: false, message: 'User retrieved successfully', data: safeUser });
    } catch (error) {
        console.error('Error retrieving user:', error.message);
        res.json({ error: true, message: 'An error occurred while retrieving user' });
    }
};

export const createUser = async (req, res) => {
    const { username, name, surnames, email, password } = req.body;

    try {
        const db = client.db(DB_NAME);

        const existingUser = await db.collection(USERS_COLLECTION).findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.json({ error: true, message: 'The username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            name,
            surnames,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection(USERS_COLLECTION).insertOne(newUser);
        res.json({ error: false, message: 'User created successfully', userId: result.insertedId });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.json({ error: true, message: 'An error occurred while creating user' });
    }
};

export const updateUserById = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const db = client.db(DB_NAME);

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
            return res.json({ error: true, message: 'User not found' });
        }

        res.json({ error: false, message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.json({ error: true, message: 'An error occurred while updating user' });
    }
};

export const deleteUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const db = client.db(DB_NAME);

        const result = await db.collection(USERS_COLLECTION).deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.json({ error: true, message: 'User not found' });
        }

        res.json({ error: false, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.json({ error: true, message: 'An error occurred while deleting user' });
    }
};

export const resetUserPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
        return res.json({
            error: true,
            message: 'Invalid password. It must be at least 8 characters long.',
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const db = client.db(DB_NAME);

        const result = await db.collection(USERS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            return res.json({ error: true, message: 'User not found' });
        }

        res.json({ error: false, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        res.json({ error: true, message: 'An error occurred while resetting password' });
    }
};
