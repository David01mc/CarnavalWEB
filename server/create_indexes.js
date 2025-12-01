import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'CarnavalRAG';

if (!uri) {
    console.error('❌ Error: MONGODB_URI no está definido en el archivo .env');
    process.exit(1);
}

async function createIndexes() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB');

        const db = client.db(dbName);
        const collection = db.collection('agrupaciones');

        console.log('⏳ Creando índices...');

        // Índice para búsqueda por título (nombre)
        await collection.createIndex({ name: 1 });
        console.log('   ✓ Índice creado: name (asc)');

        // Índice para búsqueda por autor
        await collection.createIndex({ 'authors.name': 1 });
        console.log('   ✓ Índice creado: authors.name (asc)');

        // Índice para filtros
        await collection.createIndex({ category: 1 });
        console.log('   ✓ Índice creado: category (asc)');

        await collection.createIndex({ year: 1 });
        console.log('   ✓ Índice creado: year (asc)');

        // Índice compuesto para búsquedas comunes (opcional pero recomendado)
        await collection.createIndex({ name: 1, year: 1 });
        console.log('   ✓ Índice compuesto creado: name + year');

        console.log('\n✨ ¡Todos los índices han sido creados exitosamente!');
        console.log('   Las búsquedas ahora deberían ser mucho más rápidas.');

    } catch (error) {
        console.error('❌ Error creando índices:', error);
    } finally {
        await client.close();
    }
}

createIndexes();
