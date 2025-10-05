require('dotenv').config();
const { memch } = require("../../services/aws");

/* GET movies search results. */
module.exports = async function(req, res, next) {
    const selectCols = [
        'puzzleId', 'userId', 'name', 'cost', 'ts'
    ];
    const cacheKey = (req.user.groups.includes("admins")) ? "admin" : req.user.id;

    // Try to get from cache first
    const cacheRes = await memch.aGet(`puzzles_${cacheKey}`)
    .catch((err) => { 
        console.log("Memcached get error: ", err);
    });
    if (cacheRes) {
        console.log("Cache hit for puzzles");
        req.puzzles = JSON.parse(cacheRes);
        return next();
    }
    else {
        const rows = await req.db.from("puzzles").select(selectCols)
        .where((builder) => {
            // If NOT admin, filter by userId
            if (!req.user.groups.includes("admins")) {builder.where("userId", parseInt(req.user.id));};
        }).orderBy('ts')
        .catch((err) => { 
            console.log(err);
            res.json({Error: true, Message: "Error in MySQL query" });
            return;
        });
        // Store in cache for next time
        await memch.aSet(`puzzles_${cacheKey}`, JSON.stringify(rows), 300)
        .catch((err) => {
            console.log("Memcached set error: ", err);
        });
        req.puzzles = rows;
        next();
    };
};