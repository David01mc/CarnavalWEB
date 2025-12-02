import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function ensureAdmin() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is missing');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(process.env.DB_NAME || 'CarnavalRAG');
        const usersCollection = db.collection('users');

        const username = 'admin';
        const password = 'admin123';
        const email = 'admin@example.com';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await usersCollection.updateOne(
            { username: username },
            {
                $set: {
                    username,
                    email,
                    password: hashedPassword,
                    role: 'admin',
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log('Admin user ensured: admin / admin123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

ensureAdmin();
