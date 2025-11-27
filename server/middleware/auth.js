import jwt from 'jsonwebtoken';

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
export default function (req, res, next) {
    // Obtener token del header
    const token = req.header('x-auth-token');

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Añadir usuario del payload a la request
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}
