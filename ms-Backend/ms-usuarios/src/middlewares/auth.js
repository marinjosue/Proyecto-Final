const jwt = require('jsonwebtoken');

module.exports = (requireAdmin = false) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Si se requiere rol admin y no lo es
            if (requireAdmin && decoded.rol !== 'admin') {
                return res.status(403).json({ message: 'Acceso restringido a administradores' });
            }

            next();
        } catch {
            return res.status(403).json({ message: 'Token inválido' });
        }
    };
};
