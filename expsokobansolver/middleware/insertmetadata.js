module.exports = function(req, res, next) {
    // 1. Check puzzle info in req
    if (!req?.user?.id || !req?.puzzle?.whId || !req?.puzzle?.cost ) {
        const err = new Error('Missing puzzle or solution info in request');
        console.error(err.message);
        res.status(500).json({ error: true , message: err.message });
        return; 
    }
    else {
        // 2. Insert puzzle metadata into db
        console.log('\nIn insertmetadata middleware\n');
        const pId = req.puzzle.whId;
        const uId = req.user.id;
        const wh = req.puzzle.wh;
        const cost = req.puzzle.cost;

        req.db
        .into("puzzles")
        .insert({puzzleId: pId, userId: uId, name: wh, cost: cost})
        .catch((err) => {
            console.error('Error during db insert: ', req.puzzle.name, req.user.id);
            console.error('Error: ', err.message);
            res.status(409).json({ error: true, message: err.message });
        })
        .then(() => {
            next();
        });
    };
};