const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        // 1. Tomar el header Authorization
        const header = req.headers.authorization;

        // 2. Validar que exista
        if (!header) {
            return res.status(401).json({ error: "Token requerido" });
        }

        // 3. Separar "Bearer <token>"
        const token = header.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Token mal formado" });
        }

        // 4. Verificar token con JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Guardar usuario dentro de la request
        req.user = decoded;

        // 6. Continuar a la ruta
        next();

    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

module.exports = authMiddleware;