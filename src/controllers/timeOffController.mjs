import { getDatabase } from '../config/database.mjs';

const db = getDatabase();
const vacationsCollection = db.collection('vacations');

export const requestVacation = async (req, res) => {
    try {
        const result = await vacationsCollection.insertOne(req.body);
        res.status(201).json({ message: 'Solicitud de vacaciones creada', vacationId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar vacaciones', error });
    }
};

export const getVacations = async (req, res) => {
    try {
        const vacations = await vacationsCollection.find().toArray();
        res.status(200).json(vacations);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las solicitudes de vacaciones', error });
    }
};

export const updateVacationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await vacationsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
        res.status(200).json({ message: 'Estado de la solicitud de vacaciones actualizado', result });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado de la solicitud de vacaciones', error });
    }
};
