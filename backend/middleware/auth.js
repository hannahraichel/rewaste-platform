const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Look for token in the Authorization header (Format: Bearer <token>)
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    // If token doesn't exist, block access
    if (!token) {
        return res.status(401).json({ error: "Access denied. No authentication token found." });
    }

    try {
        // Verify token using our secret key
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the verified industry ID to the request object
        req.user = verified; 
        
        // Move to the next function/route handler
        next();
    } catch (err) {
        res.status(401).json({ error: "Token is invalid or expired." });
    }
};