const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ message: 'Token inválido' });
    }
}

// Middleware adicional para verificar rol
function isAdmin(req, res, next) {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso solo permitido a administradores' });
    }
    next();
}

module.exports = auth;
module.exports.isAdmin = isAdmin;
