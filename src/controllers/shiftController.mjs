import { getDatabase } from '../config/database.mjs';

const db = getDatabase();
const shiftsCollection = db.collection('shifts');

export const createShift = async (req, res) => {
    try {
        const result = await shiftsCollection.insertOne(req.body);
        res.status(201).json({ message: 'Turno creado', shiftId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el turno', error });
    }
};

export const getShifts = async (req, res) => {
    try {
        const shifts = await shiftsCollection.find().toArray();
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los turnos', error });
    }
};

export const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await shiftsCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body });
        res.status(200).json({ message: 'Turno actualizado', result });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el turno', error });
    }
};

export const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await shiftsCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ message: 'Turno eliminado', result });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el turno', error });
    }
};
