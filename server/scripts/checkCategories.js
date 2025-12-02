import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new MongoClient(process.env.MONGODB_URI);

async function checkCategories() {
    try {
        await client.connect();
        const db = client.db(process.env.DB_NAME || 'CarnavalRAG');

        const categories = await db.collection('agrupaciones').distinct('category');
        console.log('Distinct Categories:', categories);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkCategories();
