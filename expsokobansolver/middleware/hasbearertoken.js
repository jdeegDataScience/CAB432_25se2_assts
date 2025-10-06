module.exports = function(req, res, next) {
    const hasToken = req.headers.authorization ?? false;
    if (!(hasToken && hasToken.startsWith("Bearer"))) {
        res.status(401).json({ error: true, message: `Authorization header ('Bearer token') not found`});
    }
    else {
        /* standardised reference for token between middlewares */
        console.log("\nToken found");
        console.log("Token:", hasToken);
        console.log("Token trimmed:", hasToken.substring(7));
        req.token = hasToken.substring(7);
        next();
    };
};
