import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        console.log('No token provided in cookies');
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification error:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
