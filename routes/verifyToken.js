const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    const token = req.header("Authorization");

    if (!token) return res.status(401).json({
        "message": 'Access Denied',
        "status": "fail"
    });

    try {
        const verified = jwt.verify(token, "secret");
        req.user = verified;
        next();

    } catch (error) {
        return res.status(400).json({
            "message": 'Invalid Token',
            "status": "fail"
        });
    }
}