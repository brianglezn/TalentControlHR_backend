import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const DB_USER = process.env.MONGO_USERNAME;
const DB_PASS = process.env.MONGO_PASSWORD;
const DB_NAME = process.env.MONGO_DATABASE;
const DB_CLUSTER = process.env.MONGO_CLUSTER;
const DB_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&ssl=true`;

const client = new MongoClient(DB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

export const runDatabase = async () => {
    try {
        await client.connect();
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
        return client;
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        try {
            await client.close();
        } catch (closeError) {
            console.error('Error cerrando la conexión a MongoDB:', closeError.message);
        }
        throw error;
    }
};

export { client, DB_NAME };
