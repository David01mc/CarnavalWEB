import { ObjectId } from 'mongodb';

/**
 * Task Schema for Kanban Board
 * This is a schema definition for MongoDB (not Mongoose)
 */
export const TaskSchema = {
    // Basic Information
    title: String,           // Required
    description: String,     // Optional

    // Status for Kanban columns
    status: String,          // Required: "todo", "in-progress", "done"

    // Priority
    priority: String,        // Required: "low", "medium", "high"

    // Dates
    dueDate: Date,          // Optional
    createdAt: Date,        // Auto-generated
    updatedAt: Date,        // Auto-updated

    // User tracking
    createdBy: {
        userId: ObjectId,     // Reference to User
        username: String      // Denormalized for quick access
    },

    assignedTo: [{
        userId: ObjectId,     // Reference to User
        username: String      // Denormalized for quick access
    }],

    // Tags/Labels
    tags: [String],

    // Order within column (for drag-and-drop)
    order: Number
};

/**
 * Validation functions for Task fields
 */
export const TaskValidation = {
    /**
     * Validate task data before insert/update
     */
    validate(taskData, isUpdate = false) {
        const errors = [];

        // Title is required for new tasks
        if (!isUpdate && !taskData.title) {
            errors.push('Title is required');
        }

        // Status validation
        const validStatuses = ['ideas', 'todo', 'in-progress', 'done'];
        if (taskData.status && !validStatuses.includes(taskData.status)) {
            errors.push('Invalid status. Must be: ideas, todo, in-progress, or done');
        }

        // Priority validation
        const validPriorities = ['low', 'medium', 'high'];
        if (taskData.priority && !validPriorities.includes(taskData.priority)) {
            errors.push('Invalid priority. Must be: low, medium, or high');
        }

        // Due date validation
        if (taskData.dueDate && !(taskData.dueDate instanceof Date || typeof taskData.dueDate === 'string')) {
            errors.push('Invalid due date format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Prepare task data with defaults for insertion
     */
    prepareForInsert(taskData, user) {
        const now = new Date();

        return {
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status || 'ideas',
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
            createdAt: now,
            updatedAt: now,
            createdBy: {
                userId: new ObjectId(user.userId),
                username: user.username
            },
            assignedTo: taskData.assignedTo || [],
            tags: taskData.tags || [],
            subtasks: taskData.subtasks || [],
            order: taskData.order || 0
        };
    },

    /**
     * Prepare task data for update
     */
    prepareForUpdate(taskData) {
        const update = {
            updatedAt: new Date()
        };

        if (taskData.title !== undefined) update.title = taskData.title;
        if (taskData.description !== undefined) update.description = taskData.description;
        if (taskData.status !== undefined) update.status = taskData.status;
        if (taskData.priority !== undefined) update.priority = taskData.priority;
        if (taskData.dueDate !== undefined) update.dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;
        if (taskData.assignedTo !== undefined) update.assignedTo = taskData.assignedTo;
        if (taskData.tags !== undefined) update.tags = taskData.tags;
        if (taskData.subtasks !== undefined) update.subtasks = taskData.subtasks;
        if (taskData.order !== undefined) update.order = taskData.order;

        return update;
    }
};

/**
 * Create indexes for the tasks collection
 */
export async function createTaskIndexes(db) {
    const collection = db.collection('tasks');

    await collection.createIndex({ status: 1, order: 1 });
    await collection.createIndex({ 'createdBy.userId': 1 });
    await collection.createIndex({ 'assignedTo.userId': 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ dueDate: 1 });
    await collection.createIndex({ createdAt: -1 });

    console.log('✅ Task indexes created');
}
