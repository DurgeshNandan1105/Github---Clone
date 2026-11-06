const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"] || req.headers["x-access-token"];
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
