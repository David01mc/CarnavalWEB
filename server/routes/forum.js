import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

dotenv.config();

const router = express.Router();

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;
let topicsCollection;
let postsCollection;

async function connectDB() {
    if (!db) {
        await client.connect();
        const dbName = process.env.DB_NAME || 'CarnavalRAG';
        db = client.db(dbName);
        topicsCollection = db.collection('forum_topics');
        postsCollection = db.collection('forum_posts');
    }
}

// @route   GET /api/forum/topics
// @desc    Get all topics
// @access  Public
router.get('/topics', async (req, res) => {
    try {
        await connectDB();
        const topics = await topicsCollection.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $addFields: {
                    authorIdObj: { $toObjectId: "$author.id" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorIdObj',
                    foreignField: '_id',
                    as: 'authorDetails'
                }
            },
            {
                $unwind: {
                    path: '$authorDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'author.avatarUrl': '$authorDetails.avatarUrl',
                    'author.username': '$authorDetails.username'
                }
            },
            {
                $project: {
                    authorDetails: 0,
                    authorIdObj: 0
                }
            }
        ]).toArray();
        res.json(topics);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/forum/topics
// @desc    Create a new topic
// @access  Private
router.post(
    '/topics',
    [
        auth,
        [
            body('title', 'Title is required').notEmpty(),
            body('content', 'Content is required').notEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            await connectDB();

            const newTopic = {
                title: req.body.title,
                content: req.body.content, // Initial post content
                author: {
                    id: req.user.id,
                    username: req.user.username
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                repliesCount: 0,
                views: 0
            };

            const result = await topicsCollection.insertOne(newTopic);

            // Create the first post for the topic
            const firstPost = {
                topicId: result.insertedId,
                content: req.body.content,
                author: {
                    id: req.user.id,
                    username: req.user.username
                },
                createdAt: new Date(),
                reactions: {
                    likes: [],
                    dislikes: []
                }
            };

            await postsCollection.insertOne(firstPost);

            res.json({ ...newTopic, _id: result.insertedId });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET /api/forum/topics/:id
// @desc    Get topic by ID
// @access  Public
router.get('/topics/:id', async (req, res) => {
    try {
        await connectDB();
        const topics = await topicsCollection.aggregate([
            { $match: { _id: new ObjectId(req.params.id) } },
            {
                $addFields: {
                    authorIdObj: { $toObjectId: "$author.id" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorIdObj',
                    foreignField: '_id',
                    as: 'authorDetails'
                }
            },
            {
                $unwind: {
                    path: '$authorDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'author.avatarUrl': '$authorDetails.avatarUrl',
                    'author.username': '$authorDetails.username'
                }
            },
            {
                $project: {
                    authorDetails: 0,
                    authorIdObj: 0
                }
            }
        ]).toArray();

        const topic = topics[0];

        if (!topic) {
            return res.status(404).json({ msg: 'Topic not found' });
        }

        // Increment views (fire and forget)
        topicsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $inc: { views: 1 } }
        );

        res.json(topic);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Topic not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   GET /api/forum/topics/:id/posts
// @desc    Get posts for a topic
// @access  Public
router.get('/topics/:id/posts', async (req, res) => {
    try {
        await connectDB();
        const posts = await postsCollection.aggregate([
            { $match: { topicId: new ObjectId(req.params.id) } },
            { $sort: { createdAt: 1 } },
            {
                $addFields: {
                    authorIdObj: { $toObjectId: "$author.id" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorIdObj',
                    foreignField: '_id',
                    as: 'authorDetails'
                }
            },
            {
                $unwind: {
                    path: '$authorDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'author.avatarUrl': '$authorDetails.avatarUrl',
                    'author.username': '$authorDetails.username'
                }
            },
            {
                $project: {
                    authorDetails: 0,
                    authorIdObj: 0
                }
            }
        ]).toArray();
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/forum/topics/:id/posts
// @desc    Reply to a topic
// @access  Private
router.post(
    '/topics/:id/posts',
    [
        auth,
        [body('content', 'Content is required').notEmpty()]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            await connectDB();

            const newPost = {
                topicId: new ObjectId(req.params.id),
                content: req.body.content,
                author: {
                    id: req.user.id,
                    username: req.user.username
                },
                createdAt: new Date(),
                reactions: {
                    likes: [],
                    dislikes: []
                }
            };

            const result = await postsCollection.insertOne(newPost);

            // Update topic's updated date and reply count
            await topicsCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                {
                    $set: { updatedAt: new Date() },
                    $inc: { repliesCount: 1 }
                }
            );

            res.json({ ...newPost, _id: result.insertedId });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   POST /api/forum/posts/:id/react
// @desc    React to a post (like/dislike)
// @access  Private
router.post('/posts/:id/react', auth, async (req, res) => {
    const { type } = req.body; // 'like' or 'dislike'

    if (!['like', 'dislike'].includes(type)) {
        return res.status(400).json({ msg: 'Invalid reaction type' });
    }

    try {
        await connectDB();
        const post = await postsCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const userId = req.user.id;
        const fieldName = type === 'like' ? 'likes' : 'dislikes';
        const otherFieldName = type === 'like' ? 'dislikes' : 'likes';

        // Check if already reacted with same type
        const hasReacted = post.reactions[fieldName]?.includes(userId);

        let updateQuery = {};

        if (hasReacted) {
            // Remove reaction (toggle off)
            updateQuery = {
                $pull: { [`reactions.${fieldName}`]: userId }
            };
        } else {
            // Add reaction and remove the other type if exists
            updateQuery = {
                $addToSet: { [`reactions.${fieldName}`]: userId },
                $pull: { [`reactions.${otherFieldName}`]: userId }
            };
        }

        await postsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            updateQuery
        );

        const updatedPost = await postsCollection.findOne({ _id: new ObjectId(req.params.id) });
        res.json(updatedPost.reactions);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/forum/topics/:id
// @desc    Delete a topic
// @access  Private (Admin or Author)
router.delete('/topics/:id', auth, async (req, res) => {
    try {
        await connectDB();
        const topic = await topicsCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!topic) {
            return res.status(404).json({ msg: 'Topic not found' });
        }

        // Check user
        if (topic.author.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await topicsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        await postsCollection.deleteMany({ topicId: new ObjectId(req.params.id) });

        res.json({ msg: 'Topic removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/forum/posts/:id
// @desc    Delete a post
// @access  Private (Admin or Author)
router.delete('/posts/:id', auth, async (req, res) => {
    try {
        await connectDB();
        const post = await postsCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check user
        if (post.author.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await postsCollection.deleteOne({ _id: new ObjectId(req.params.id) });

        // Decrement replies count in topic
        await topicsCollection.updateOne(
            { _id: post.topicId },
            { $inc: { repliesCount: -1 } }
        );

        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
