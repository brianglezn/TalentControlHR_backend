import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken;
    console.log('Token recibido en authenticateToken:', token); // Verifica si el token se recibe

    if (!token) {
        console.log('No se proporcionó token');
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado correctamente:', decoded); // Verifica si el token se decodifica correctamente
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Error al verificar token:', error.message); // Detecta problemas al verificar el token
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
