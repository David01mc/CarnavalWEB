import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import readline from 'readline';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ Error: MONGODB_URI not found in .env file');
        rl.close();
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const dbName = process.env.DB_NAME || 'CarnavalRAG';
        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  An admin user already exists:');
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Email: ${existingAdmin.email}`);
            const overwrite = await question('Do you want to create another admin? (yes/no): ');
            if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
                console.log('❌ Operation cancelled');
                rl.close();
                await client.close();
                return;
            }
        }

        console.log('\n📝 Creating new admin user...\n');

        const username = await question('Enter username: ');
        const email = await question('Enter email: ');
        const password = await question('Enter password (min 6 characters): ');

        if (!username || !email || !password) {
            console.log('❌ All fields are required');
            rl.close();
            await client.close();
            return;
        }

        if (password.length < 6) {
            console.log('❌ Password must be at least 6 characters');
            rl.close();
            await client.close();
            return;
        }

        // Check if username or email already exists
        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('❌ Username or email already exists');
            rl.close();
            await client.close();
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user
        const adminUser = {
            username,
            email,
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date(),
            lastLogin: null
        };

        const result = await usersCollection.insertOne(adminUser);

        console.log('\n✅ Admin user created successfully!');
        console.log(`   ID: ${result.insertedId}`);
        console.log(`   Username: ${username}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: admin`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
        await client.close();
    }
}

createAdmin();
