require('dotenv').config();

/* GET movies search results. */
module.exports = function(req, res, next) {
    const selectCols = [
        'puzzleId', 'userId', 'name', 'solnVis',
        'solnMoves', 'solnCost', 'ts'
    ];
    
    // 1. Return all puzzles IF user.email === admin] 
    if (req.user.email === process.env.ADMIN_EMAIL) {
        req.db.from("puzzles").select(selectCols)
        .orderBy('ts')
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
    }
    else {
        req.db.from("puzzles").select(selectCols)
        .where({userId: req.user.id}).orderBy('ts')
        /* .where((builder) => {
            builder.where({userId: req.user.id});
            if (req.query.title) {builder.whereILike("title", `%${req.query.title}%`)};
            if (req.query.year) {builder.where("year", parseInt(req.query.year))};
        }) */
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
    }
};