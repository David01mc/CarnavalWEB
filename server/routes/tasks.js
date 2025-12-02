import express from 'express';
import { ObjectId } from 'mongodb';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { TaskValidation } from '../models/Task.js';

const router = express.Router();

// Get MongoDB instance (will be injected)
let db;
export function setDb(database) {
    db = database;
}

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (admin only)
 * @access  Private (Admin)
 */
router.get('/', auth, admin, async (req, res) => {
    try {
        const { status, priority, tags, assignedTo } = req.query;
        const query = {};

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (tags) query.tags = { $in: tags.split(',') };
        if (assignedTo) query['assignedTo.userId'] = new ObjectId(assignedTo);

        // Get tasks sorted by order within each status
        const tasks = await db.collection('tasks')
            .find(query)
            .sort({ status: 1, order: 1, createdAt: -1 })
            .toArray();

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/tasks
 * @desc    Create new task (admin only)
 * @access  Private (Admin)
 */
router.post('/', auth, admin, async (req, res) => {
    try {
        // Validate task data
        const validation = TaskValidation.validate(req.body, false);
        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Prepare task for insertion
        const taskData = TaskValidation.prepareForInsert(req.body, req.user);

        // Insert task
        const result = await db.collection('tasks').insertOne(taskData);
        const created = await db.collection('tasks').findOne({ _id: result.insertedId });

        res.status(201).json(created);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task (admin only)
 * @access  Private (Admin)
 */
router.put('/:id', auth, admin, async (req, res) => {
    try {
        // Validate task data
        const validation = TaskValidation.validate(req.body, true);
        if (!validation.isValid) {
            return res.status(400).json({ errors: validation.errors });
        }

        // Prepare update data
        const updateData = TaskValidation.prepareForUpdate(req.body);

        // Update task
        const result = await db.collection('tasks').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PUT /api/tasks/:id/move
 * @desc    Move task to different status/position (drag-and-drop)
 * @access  Private (Admin)
 */
router.put('/:id/move', auth, admin, async (req, res) => {
    try {
        const { status, order } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const validStatuses = ['ideas', 'todo', 'in-progress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData = {
            status,
            updatedAt: new Date()
        };

        if (order !== undefined) {
            updateData.order = order;
        }

        const result = await db.collection('tasks').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error moving task:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PUT /api/tasks/reorder
 * @desc    Reorder multiple tasks (batch update for drag-and-drop)
 * @access  Private (Admin)
 */
router.put('/reorder', auth, admin, async (req, res) => {
    try {
        const { tasks } = req.body;

        if (!Array.isArray(tasks)) {
            return res.status(400).json({ error: 'Tasks array is required' });
        }

        // Batch update all tasks
        const bulkOps = tasks.map(task => ({
            updateOne: {
                filter: { _id: new ObjectId(task.id) },
                update: {
                    $set: {
                        status: task.status,
                        order: task.order,
                        updatedAt: new Date()
                    }
                }
            }
        }));

        const result = await db.collection('tasks').bulkWrite(bulkOps);

        res.json({
            message: 'Tasks reordered successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error reordering tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const result = await db.collection('tasks').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
