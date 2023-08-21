const jwt = require('jsonwebtoken');  // assuming you'll use JSON web tokens for authentication

module.exports = (req, res, next) => {
    // Get token from the header
    const token = req.header('x-auth-token');

    // Check if token exists
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET should be in your .env file

        // Attach the user to the request object
        req.user = decoded.user;

        // Move on to the next middleware or route handler
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
