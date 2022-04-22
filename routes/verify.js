const jwt = require('jsonwebtoken');

const Verify = (req, res, next) => {
    try {
        const authHeader = req.headers.token;
        if (authHeader) {
            const accessToken = authHeader.split(" ")[1];
            jwt.verify(accessToken, process.env.SECRET_TOKEN_KEY, (err, user) => {
                if (err) {
                    res.status(403).json({ Message: "Token is not valid" })
                } else {
                    req.userId = user;
                    console.log(req.user, 'userr')
                    next();
                };
            });
        } else {
            res.status(401).json({ Message: "You are not authenticated" })
        };
    } catch (error) {
        console.log(error)
    };
};

module.exports = { Verify };