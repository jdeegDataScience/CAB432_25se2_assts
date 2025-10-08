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
        'puzzleid', 'userid', 'name', 'cost', 'status', 'ts'
    ];
    const cacheKey = (req.user.groups.includes("admins")) ? "admin" : String(req.user.id);
    try {
        // Try to get from cache first
        const cacheRes = await memch.aGet(`puzzles_${cacheKey}`);

        console.log(`\nCache lookup for puzzles_${cacheKey}`);
        console.log("result length:", cacheRes?.length);

        if (cacheRes) {
            console.log(`Cache hit for puzzles_${cacheKey}`);
            req.puzzles = JSON.parse(cacheRes);
            return next();
        }
        else {
            console.log(`Cache miss for puzzles_${cacheKey}`);
            const rows = await req.db.from("puzzles").select(selectCols)
            .where((builder) => {
                // If NOT admin, filter by userId
                if (!req.user.groups.includes("admins")) {builder.where("userid", parseInt(req.user.id));};
            }).orderBy('ts', 'desc');

            // Store in cache for next time
            await memch.aSet(`puzzles_${cacheKey}`, JSON.stringify(rows), 60);
            req.puzzles = rows;
            return next();
        };
    } catch (err) {
        console.log(err);
        return res.json({Error: true, Message: err.message});
    };
};