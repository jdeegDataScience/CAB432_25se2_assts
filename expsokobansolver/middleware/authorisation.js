const { CognitoJwtVerifier } = require("aws-jwt-verify");
const jwtIdVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: "id",
    groups: ["users", "admins"],
    clientId: process.env.APP_CLIENT_ID
});


module.exports = async function(req, res, next) {
    try {
        console.log("\nVerifying token...");
        const decoded = await jwtIdVerifier.verify(req.token);
        console.log("Token verified. User email:", decoded.email);
        console.log("User groups:", decoded["cognito:groups"]);
        console.log("Token iat:", decoded.iat);
        /* standardised reference for user email between middlewares */
        req.user = {};   
        req.user.email = decoded.email;
        req.user.groups = decoded["cognito:groups"];
        req.db
        .from("usersbltokens")
        .select('*') 
        .where({email: req.user.email})
        .then((users) => {
            if (users.length === 0) { next(); }
            else { decoded.iat < users[0]?.blfrom ? res.status(401).json({ error: true, message: "Invalid JWT token" }) : next();
            };
        });
    } 
    catch (e) {
        console.log(e.message);
        if (e.name === "TokenExpiredError") {
            res.status(401).json({ error: true, message: `JWT token has expired` });
        } else {
        res.status(401).json({ error: true, message: "Invalid JWT token" });
        }
    };
    return;
};
