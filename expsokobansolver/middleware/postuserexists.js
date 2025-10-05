module.exports = function(req, res, next) {
    // 1. Check email in req.body
    if (!req.body.email && !req.body.username) {
        res.status(400).json({ error: true, 
            message: `Request body incomplete, email or username missing.` });
        return; 
    }
    else {        
        req.db
        .from("users")
        .select('*') 
        .where((builder) => {
            if (req.body.email) {builder.where("email", `%${req.body.email}%`)};
            if (req.body.username) {builder.where("username", `%${req.body.username}%`)};
        })
        .then((users) => {
            if (users.length !== 1) {
                req.match = false;
            }
            else {
                req.match = true;
                req.user = users[0];
            }
            next();
        })
    };
};