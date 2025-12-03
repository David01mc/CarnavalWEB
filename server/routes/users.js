import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import adminAuth from '../middleware/adminAuth.js';

dotenv.config();

const router = express.Router();

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let usersCollection;

// Connect to MongoDB
async function connectDB() {
    if (!usersCollection) {
        await client.connect();
        const dbName = process.env.DB_NAME || 'CarnavalRAG';
        const db = client.db(dbName);
        usersCollection = db.collection('users');
    }
}

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
    try {
        await connectDB();

        const users = await usersCollection
            .find({}, { projection: { password: 0 } }) // Exclude passwords
            .sort({ createdAt: -1 }) // Most recent first
            .toArray();

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await connectDB();

        const userId = req.params.id;

        // Prevent self-deletion
        if (userId === req.user.id) {
            return res.status(400).json({ msg: 'Cannot delete your own account' });
        }

        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/users/:id/role
// @desc    Change user role (admin only)
// @access  Private (Admin)
router.put('/:id/role', adminAuth, async (req, res) => {
    try {
        await connectDB();

        const userId = req.params.id;
        const { role } = req.body;

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role. Must be "user" or "admin"' });
        }

        // Prevent changing own role
        if (userId === req.user.id) {
            return res.status(400).json({ msg: 'Cannot change your own role' });
        }

        const result = await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { $set: { role } },
            { returnDocument: 'after', projection: { password: 0 } }
        );

        if (!result) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
