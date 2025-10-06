module.exports = function(req, res, next) {
    console.log("\nGetting user ID...");
    req.db.from("users").select(`id`)
    .where({email: req.user.email})
    .then((rows) => {
        req.user.id = rows[0].id;
    })
    .then(_ => {
        next();
    })
    .catch((err) => { 
        console.log(err);
        res.json({Error: true, Message: "Error in MySQL query" });
        return;
    });
};
