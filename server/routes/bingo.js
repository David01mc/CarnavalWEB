import { ObjectId } from 'mongodb';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import express from 'express';

const router = express.Router();
let db;

export function setDb(database) {
    db = database;
}

// Default bingo template with 25 cells
const DEFAULT_BINGO_TEMPLATE = {
    year: "2026",
    cells: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        title: `Dato ${i + 1}`,
        position: i
    })),
    createdAt: new Date(),
    updatedAt: new Date()
};

// Helper to ensure template exists
async function ensureTemplate(year) {
    let template = await db.collection('bingo_templates').findOne({ year });
    if (!template) {
        template = { ...DEFAULT_BINGO_TEMPLATE, year };
        await db.collection('bingo_templates').insertOne(template);
    }
    return template;
}

// Helper to get or create user bingo data
async function getUserBingoData(userId, year) {
    let userData = await db.collection('bingo_user_data').findOne({
        userId: new ObjectId(userId),
        year
    });

    if (!userData) {
        userData = {
            userId: new ObjectId(userId),
            year,
            cells: [],
            completedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await db.collection('bingo_user_data').insertOne(userData);
    }

    return userData;
}

// GET /api/bingo/:year - Get bingo template (public for viewing, but user data requires auth)
router.get('/:year', async (req, res) => {
    try {
        const { year } = req.params;
        const template = await ensureTemplate(year);
        res.json(template);
    } catch (error) {
        console.error('Error fetching bingo template:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bingo/:year/user - Get user's bingo data (protected)
router.get('/:year/user', auth, async (req, res) => {
    try {
        const { year } = req.params;
        const userId = req.user.id;

        // Ensure template exists
        await ensureTemplate(year);

        // Get user data
        const userData = await getUserBingoData(userId, year);

        res.json(userData);
    } catch (error) {
        console.error('Error fetching user bingo data:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/bingo/:year/agrupaciones - Get agrupaciones for selection (from Preliminares2026)
router.get('/:year/agrupaciones', auth, async (req, res) => {
    try {
        const { q } = req.query;

        let query = {
            tipo: { $exists: true, $ne: 'N/A' }
        };

        if (q && q.trim().length >= 2) {
            query.nombre = { $regex: q, $options: 'i' };
        }

        const agrupaciones = await db.collection('Preliminares2026')
            .find(query)
            .sort({ nombre: 1 })
            .limit(q ? 15 : 30)
            .toArray();

        // Remove duplicates by nombre
        const unique = [];
        const seen = new Set();
        for (const ag of agrupaciones) {
            if (!seen.has(ag.nombre)) {
                seen.add(ag.nombre);
                unique.push({
                    _id: ag._id,
                    nombre: ag.nombre,
                    tipo: ag.tipo
                });
            }
        }

        res.json(unique);
    } catch (error) {
        console.error('Error fetching agrupaciones:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/bingo/:year/cell/:cellId - Mark/update a cell (protected)
router.put('/:year/cell/:cellId', auth, async (req, res) => {
    try {
        const { year, cellId } = req.params;
        const { agrupacionId, agrupacionName, agrupacionTipo, pase } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!agrupacionName || !pase) {
            return res.status(400).json({ error: 'Agrupación y tipo de pase son requeridos' });
        }

        const validPases = ['Pasodoble', 'Cuplé', 'Presentación', 'Popurrí'];
        if (!validPases.includes(pase)) {
            return res.status(400).json({ error: 'Tipo de pase inválido' });
        }

        // Ensure template exists
        await ensureTemplate(year);

        const cellIdNum = parseInt(cellId);

        // Update or create cell entry
        const cellData = {
            cellId: cellIdNum,
            marked: true,
            agrupacionId: agrupacionId ? new ObjectId(agrupacionId) : null,
            agrupacionName,
            agrupacionTipo,
            pase,
            markedAt: new Date()
        };

        // Check if cell already exists
        const existingData = await db.collection('bingo_user_data').findOne({
            userId: new ObjectId(userId),
            year,
            'cells.cellId': cellIdNum
        });

        if (existingData) {
            // Update existing cell
            await db.collection('bingo_user_data').updateOne(
                {
                    userId: new ObjectId(userId),
                    year,
                    'cells.cellId': cellIdNum
                },
                {
                    $set: {
                        'cells.$': cellData,
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            // Add new cell
            await db.collection('bingo_user_data').updateOne(
                {
                    userId: new ObjectId(userId),
                    year
                },
                {
                    $push: { cells: cellData },
                    $set: { updatedAt: new Date() }
                },
                { upsert: true }
            );
        }

        // Check for bingo completion (all 25 cells marked)
        const userData = await db.collection('bingo_user_data').findOne({
            userId: new ObjectId(userId),
            year
        });

        if (userData.cells.length === 25 && !userData.completedAt) {
            await db.collection('bingo_user_data').updateOne(
                { userId: new ObjectId(userId), year },
                { $set: { completedAt: new Date() } }
            );
        }

        // Check for line completions (rows, columns, diagonals)
        const markedCells = new Set(userData.cells.map(c => c.cellId));
        const completedLines = [];

        // Check rows
        for (let row = 0; row < 5; row++) {
            const rowCells = [1, 2, 3, 4, 5].map(col => row * 5 + col);
            if (rowCells.every(cell => markedCells.has(cell))) {
                completedLines.push({ type: 'row', index: row });
            }
        }

        // Check columns
        for (let col = 1; col <= 5; col++) {
            const colCells = [0, 1, 2, 3, 4].map(row => row * 5 + col);
            if (colCells.every(cell => markedCells.has(cell))) {
                completedLines.push({ type: 'column', index: col - 1 });
            }
        }

        // Check diagonals
        const diagonal1 = [1, 7, 13, 19, 25]; // Top-left to bottom-right
        const diagonal2 = [5, 9, 13, 17, 21]; // Top-right to bottom-left

        if (diagonal1.every(cell => markedCells.has(cell))) {
            completedLines.push({ type: 'diagonal', index: 0 });
        }
        if (diagonal2.every(cell => markedCells.has(cell))) {
            completedLines.push({ type: 'diagonal', index: 1 });
        }

        res.json({
            success: true,
            cell: cellData,
            completedLines,
            totalMarked: markedCells.size
        });
    } catch (error) {
        console.error('Error marking cell:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/bingo/:year/cell/:cellId - Unmark a cell (protected)
router.delete('/:year/cell/:cellId', auth, async (req, res) => {
    try {
        const { year, cellId } = req.params;
        const userId = req.user.id;

        const cellIdNum = parseInt(cellId);

        await db.collection('bingo_user_data').updateOne(
            {
                userId: new ObjectId(userId),
                year
            },
            {
                $pull: { cells: { cellId: cellIdNum } },
                $set: {
                    updatedAt: new Date(),
                    completedAt: null // Reset completion if any cell is removed
                }
            }
        );

        res.json({ success: true, message: 'Casilla desmarcada' });
    } catch (error) {
        console.error('Error unmarking cell:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/bingo/:year/reset - Reset user's entire bingo (protected)
router.delete('/:year/reset', auth, async (req, res) => {
    try {
        const { year } = req.params;
        const userId = req.user.id;

        await db.collection('bingo_user_data').updateOne(
            {
                userId: new ObjectId(userId),
                year
            },
            {
                $set: {
                    cells: [],
                    completedAt: null,
                    updatedAt: new Date()
                }
            }
        );

        res.json({ success: true, message: 'Bingo reseteado' });
    } catch (error) {
        console.error('Error resetting bingo:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/bingo/:year/cell/:cellId/title - Admin: Edit cell title (admin only)
router.put('/:year/cell/:cellId/title', auth, adminAuth, async (req, res) => {
    try {
        const { year, cellId } = req.params;
        const { title } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ error: 'Título requerido' });
        }

        const cellIdNum = parseInt(cellId);

        await db.collection('bingo_templates').updateOne(
            { year, 'cells.id': cellIdNum },
            {
                $set: {
                    'cells.$.title': title.trim(),
                    updatedAt: new Date()
                }
            }
        );

        res.json({ success: true, message: 'Título actualizado' });
    } catch (error) {
        console.error('Error updating cell title:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
