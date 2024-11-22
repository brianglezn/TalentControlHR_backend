import { getDatabase } from '../config/database.mjs';

const db = getDatabase();
const usersCollection = db.collection('users');

export const getUsers = async (req, res) => {
    try {
        const users = await usersCollection.find().toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', error });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
        res.status(200).json({ message: 'Usuario actualizado', result });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ message: 'Usuario eliminado', result });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
};
