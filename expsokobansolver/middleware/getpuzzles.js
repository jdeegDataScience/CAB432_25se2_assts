require('dotenv').config();

/* GET movies search results. */
module.exports = function(req, res, next) {
    const selectCols = [
        'puzzleId', 'userId', 'name', 'cost', 'ts'
    ];
    
    req.db.from("puzzles").select(selectCols)
    .where((builder) => {
        // If NOT admin, filter by userId
        if (!req.user.groups.includes("admins")) {builder.where("userId", parseInt(req.user.id));};
    }).orderBy('ts')
    .then((rows) => {
        req.puzzles = rows;
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