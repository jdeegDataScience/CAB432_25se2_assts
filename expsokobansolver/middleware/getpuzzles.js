require('dotenv').config();
const util = require("node:util");
const Memcached = require("memcached");
const memch = new Memcached(process.env.MEMCACHE);
memch.on("failure", (details) => {
    console.log("Memcached server failure: ", details);
});
// Monkey patch some functions for convenience
// can call these with async
memch.aGet = util.promisify(memch.get);
memch.aSet = util.promisify(memch.set);

/* GET movies search results. */
module.exports = async function(req, res, next) {
    const selectCols = [
        'puzzleid', 'userid', 'name', 'cost', 'ts'
    ];
    const cacheKey = (req.user.groups.includes("admins")) ? "admin" : String(req.user.id);

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
            if (!req.user.groups.includes("admins")) {builder.where("userid", parseInt(req.user.id));};
        }).orderBy('ts')
        .catch((err) => { 
            console.log(err);
            res.json({Error: true, Message: "Error in MySQL query" });
            return;
        });
        // Store in cache for next time
        await memch.aSet(`puzzles_${cacheKey}`, JSON.stringify(rows), 60)
        .catch((err) => {
            console.log("Memcached set error: ", err);
        });
        req.puzzles = rows;
        next();
    };
};