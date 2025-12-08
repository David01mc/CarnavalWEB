import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import auth from '../middleware/auth.js';
import axios from 'axios';

dotenv.config();

// Generate daily 6-digit registration code
function generateDailyCode() {
    const seed = process.env.CODE_SEED || 'carnaval-dev-secret-2024';
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const hash = crypto.createHash('sha256').update(seed + today).digest('hex');
    // Convert first 8 hex chars to number, then mod to get 6 digits
    const code = (parseInt(hash.substring(0, 8), 16) % 1000000).toString().padStart(6, '0');
    return code;
}

const router = express.Router();

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let usersCollection;

// Conectar a MongoDB
async function connectDB() {
    if (!usersCollection) {
        await client.connect();
        const dbName = process.env.DB_NAME || 'CarnavalRAG';
        const db = client.db(dbName);
        usersCollection = db.collection('users');
    }
}

// Function to verify reCAPTCHA token
async function verifyRecaptcha(token) {
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: secretKey,
                    response: token
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return { success: false };
    }
}

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public (cambiar a Private si solo admins pueden crear usuarios)
router.post(
    '/register',
    [
        body('username', 'Username is required').notEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        body('recaptchaToken', 'reCAPTCHA token is required').notEmpty(),
        body('registrationCode', 'Registration code is required').notEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role, recaptchaToken, registrationCode } = req.body;

        try {
            // Verify registration code FIRST
            const expectedCode = generateDailyCode();
            if (registrationCode !== expectedCode) {
                return res.status(400).json({
                    msg: 'Código de registro inválido. Contacta con un administrador.'
                });
            }

            // Verify reCAPTCHA token
            const recaptchaResult = await verifyRecaptcha(recaptchaToken);

            if (!recaptchaResult.success) {
                return res.status(400).json({
                    msg: 'reCAPTCHA verification failed. Please try again.'
                });
            }

            // Optional: Check score for v3 (0.0 to 1.0, higher is better)
            // Uncomment if using reCAPTCHA v3 and you want to enforce a minimum score
            // if (recaptchaResult.score && recaptchaResult.score < 0.5) {
            //     return res.status(400).json({ 
            //         msg: 'reCAPTCHA score too low. Please try again.' 
            //     });
            // }

            await connectDB();

            // Verificar si el usuario ya existe
            let user = await usersCollection.findOne({ $or: [{ email }, { username }] });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // Crear hash de la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Crear nuevo usuario
            const newUser = {
                username,
                email,
                password: hashedPassword,
                role: role || 'user', // Por defecto 'user', puede ser 'admin'
                createdAt: new Date(),
                lastLogin: null
            };

            const result = await usersCollection.insertOne(newUser);

            // Crear payload para JWT
            const payload = {
                user: {
                    id: result.insertedId.toString(),
                    username: username,
                    role: newUser.role
                }
            };

            // Firmar token
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, user: { id: result.insertedId, username, email, role: newUser.role } });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post(
    '/login',
    [
        body('username', 'Username is required').notEmpty(),
        body('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            await connectDB();

            // Verificar si el usuario existe
            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Verificar contraseña
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Actualizar último login
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { lastLogin: new Date() } }
            );

            // Crear payload para JWT
            const payload = {
                user: {
                    id: user._id.toString(),
                    username: user.username,
                    role: user.role
                }
            };

            // Firmar token
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                        user: {
                            id: user._id,
                            username: user.username,
                            email: user.email,
                            role: user.role
                        }
                    });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET /api/auth/user
// @desc    Obtener usuario autenticado
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        await connectDB();

        const user = await usersCollection.findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { password: 0 } } // No devolver la contraseña
        );

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

import upload from '../config/cloudinary.js';

// ... (existing imports)

// @route   PUT /api/auth/profile
// @desc    Update user profile (including avatar)
// @access  Private
router.put(
    '/profile',
    [
        auth,
        upload.single('avatar')
    ],
    async (req, res) => {
        try {
            await connectDB();

            const updateData = {};

            // If file uploaded, update avatarUrl
            if (req.file) {
                updateData.avatarUrl = req.file.path;
            }

            // Update other fields if provided
            if (req.body.username) updateData.username = req.body.username;
            if (req.body.email) updateData.email = req.body.email;
            if (req.body.bio) updateData.bio = req.body.bio;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ msg: 'No data to update' });
            }

            const result = await usersCollection.findOneAndUpdate(
                { _id: new ObjectId(req.user.id) },
                { $set: updateData },
                { returnDocument: 'after', projection: { password: 0 } }
            );

            res.json(result);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET /api/auth/registration-code
// @desc    Get current daily registration code (admin only)
// @access  Private (Admin only)
router.get('/registration-code', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
        }

        const code = generateDailyCode();
        const today = new Date().toISOString().split('T')[0];

        res.json({
            code,
            validUntil: today + 'T23:59:59Z',
            message: 'Este código cambia cada día a medianoche (UTC)'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
