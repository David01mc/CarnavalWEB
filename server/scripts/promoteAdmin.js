import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory (one level up from scripts)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function promoteToAdmin() {
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

        const username = 'david01mc';

        const result = await usersCollection.updateOne(
            { username: username },
            {
                $set: { role: 'admin' }
            }
        );

        if (result.matchedCount > 0) {
            console.log(`User ${username} promoted to admin.`);
        } else {
            console.log(`User ${username} not found.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

promoteToAdmin();
