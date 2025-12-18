import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import forumRoutes from './routes/forum.js';
import taskRoutes, { setDb as setTaskDb } from './routes/tasks.js';
import bingoRoutes, { setDb as setBingoDb } from './routes/bingo.js';
import usersRoutes from './routes/users.js';
import auth from './middleware/auth.js';
import { createTaskIndexes } from './models/Task.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://carnaval-web.onrender.com'
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true
});

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'CarnavalRAG');
    console.log('✅ Connected to MongoDB');

    // Create indexes for performance
    await db.collection('agrupaciones').createIndex({ name: 1 });
    await db.collection('agrupaciones').createIndex({ 'authors.name': 1 });
    await db.collection('agrupaciones').createIndex({ category: 1 });
    await db.collection('agrupaciones').createIndex({ year: 1 });
    console.log('⚡ Agrupaciones indexes created/verified');

    // Create task indexes
    await createTaskIndexes(db);

    // Inject db into task routes
    setTaskDb(db);

    // Inject db into bingo routes
    setBingoDb(db);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Auth routes (public)
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bingo', bingoRoutes);

// GET all Preliminares 2026 data (public)
app.get('/api/preliminares2026', async (req, res) => {
  try {
    const events = await db.collection('Preliminares2026').find({}).sort({ fecha: 1 }).toArray();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET search Preliminares 2026 by name (for admin editor)
app.get('/api/preliminares2026/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const results = await db.collection('Preliminares2026')
      .find({
        nombre: { $regex: q, $options: 'i' }
      })
      .limit(10)
      .toArray();

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add agrupación to a new phase (duplicate record with new date/fase)
app.post('/api/preliminares2026/add-to-phase', async (req, res) => {
  try {
    const { agrupacionId, fecha, fase } = req.body;

    if (!agrupacionId || !fecha || !fase) {
      return res.status(400).json({ error: 'Missing required fields: agrupacionId, fecha, fase' });
    }

    // Find the original agrupación
    const original = await db.collection('Preliminares2026').findOne({
      _id: new ObjectId(agrupacionId)
    });

    if (!original) {
      return res.status(404).json({ error: 'Agrupación not found' });
    }

    // Create a duplicate with new fecha and fase
    const { _id, ...agrupacionData } = original;
    const newAgrupacion = {
      ...agrupacionData,
      fecha,
      fase
    };

    const result = await db.collection('Preliminares2026').insertOne(newAgrupacion);
    const created = await db.collection('Preliminares2026').findOne({ _id: result.insertedId });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE agrupación from a phase
app.delete('/api/preliminares2026/:id', async (req, res) => {
  try {
    const result = await db.collection('Preliminares2026').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Agrupación not found' });
    }

    res.json({ message: 'Agrupación deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all entries (public)
app.get('/api/agrupaciones', async (req, res) => {
  try {
    const { title, author, category, year, sort, order } = req.query;
    const query = {};

    // Build query conditions
    const conditions = [];

    if (title) {
      conditions.push({ name: { $regex: title, $options: 'i' } });
    }

    if (author) {
      conditions.push({ 'authors.name': { $regex: author, $options: 'i' } });
    }

    // Combine conditions with AND logic
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    if (category) query.category = category;
    if (year) query.year = year;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const total = await db.collection('agrupaciones').countDocuments(query);

    // Default sort by year descending (newest first)
    const sortField = sort || 'year';
    const sortOrder = order === 'asc' ? 1 : -1; // Default descending

    let agrupaciones;

    // If sorting by year, use aggregation to convert string to number
    if (sortField === 'year') {
      agrupaciones = await db.collection('agrupaciones')
        .aggregate([
          { $match: query },
          {
            $addFields: {
              yearNum: { $toInt: { $ifNull: ['$year', '0'] } }
            }
          },
          { $sort: { yearNum: sortOrder, name: 1 } },
          { $skip: skip },
          { $limit: limit },
          { $project: { yearNum: 0 } } // Remove temporary field
        ])
        .toArray();
    } else {
      // Regular sort for other fields
      agrupaciones = await db.collection('agrupaciones')
        .find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();
    }

    res.json({
      data: agrupaciones,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET featured agrupación of the day (public)
app.get('/api/agrupaciones/featured', async (req, res) => {
  try {
    // 1. Get total count (FAST)
    const count = await db.collection('agrupaciones').countDocuments();

    if (count === 0) {
      return res.status(404).json({ error: 'No agrupaciones found' });
    }

    // 2. Calculate index based on the day (deterministic)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysSinceEpoch = Math.floor(startOfDay.getTime() / (1000 * 60 * 60 * 24));

    const index = daysSinceEpoch % count;

    // 3. Fetch ONLY the specific document (FAST)
    const agrupaciones = await db.collection('agrupaciones')
      .find({})
      .skip(index)
      .limit(1)
      .toArray();

    if (agrupaciones.length === 0) {
      return res.status(404).json({ error: 'Agrupación not found' });
    }

    // Return the featured agrupación of the day
    res.json({
      agrupacion: agrupaciones[0],
      date: startOfDay.toISOString().split('T')[0],
      index: index,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single entry by ID
app.get('/api/agrupaciones/:id', async (req, res) => {
  try {
    const agrupacion = await db.collection('agrupaciones').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!agrupacion) {
      return res.status(404).json({ error: 'Agrupación not found' });
    }

    res.json(agrupacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST increment lyric view count (public)
app.post('/api/agrupaciones/:id/lyrics/:lyricIndex/view', async (req, res) => {
  try {
    const { id, lyricIndex } = req.params;
    const idx = parseInt(lyricIndex);

    if (isNaN(idx) || idx < 0) {
      return res.status(400).json({ error: 'Invalid lyric index' });
    }

    // Fetch the document
    const agrupacion = await db.collection('agrupaciones').findOne({
      _id: new ObjectId(id)
    });

    if (!agrupacion) {
      return res.status(404).json({ error: 'Agrupación not found' });
    }

    if (!agrupacion.lyrics || !agrupacion.lyrics[idx]) {
      return res.status(404).json({ error: 'Lyric not found' });
    }

    // Get current views (handle string or number), increment by 1
    const currentViews = parseInt(agrupacion.lyrics[idx].views || 0, 10);
    const newViews = currentViews + 1;

    // Update the specific lyric's views as a number
    const viewsField = `lyrics.${idx}.views`;
    await db.collection('agrupaciones').updateOne(
      { _id: new ObjectId(id) },
      { $set: { [viewsField]: newViews } }
    );

    res.json({ success: true, views: newViews });
  } catch (error) {
    console.error('Lyric view increment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create new entry (protected)
app.post('/api/agrupaciones', auth, async (req, res) => {
  try {
    const newAgrupacion = {
      ...req.body,
      callejera: req.body.callejera || 'No',
      descripcion: req.body.descripcion || '',
      caracteristicas: req.body.caracteristicas || [],
      componentes: req.body.componentes || [],
      authors: req.body.authors || [],
      lyrics: req.body.lyrics || [],
      youtube: req.body.youtube || [],
      spotify: req.body.spotify || [],
      posición: req.body.posición || ''
    };

    const result = await db.collection('agrupaciones').insertOne(newAgrupacion);
    const created = await db.collection('agrupaciones').findOne({ _id: result.insertedId });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update entry (protected)
app.put('/api/agrupaciones/:id', auth, async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    // First, update the current agrupacion
    const result = await db.collection('agrupaciones').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Agrupación not found' });
    }

    // Auto-propagate author images and descriptions to other agrupaciones
    if (updateData.authors && updateData.authors.length > 0) {
      for (const author of updateData.authors) {
        if (author.name) {
          // Prepare update fields for this author
          const authorUpdate = {};
          if (author.image) {
            authorUpdate['authors.$[elem].image'] = author.image;
          }
          if (author.descripcion) {
            authorUpdate['authors.$[elem].descripcion'] = author.descripcion;
          }

          // Only propagate if there's something to update
          if (Object.keys(authorUpdate).length > 0) {
            await db.collection('agrupaciones').updateMany(
              {
                _id: { $ne: new ObjectId(req.params.id) }, // Exclude current document
                'authors.name': author.name
              },
              { $set: authorUpdate },
              { arrayFilters: [{ 'elem.name': author.name }] }
            );
          }
        }
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE entry (protected)
app.delete('/api/agrupaciones/:id', auth, async (req, res) => {
  try {
    const result = await db.collection('agrupaciones').deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Agrupación not found' });
    }

    res.json({ message: 'Agrupación deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
