module.exports = function(req, res, next) {
    // 1. Check puzzle info in req
    if (!req?.user?.id || !req?.puzzle?.whId || !req?.puzzle?.soln?.moves || !req?.puzzle?.soln?.cost  || !req?.puzzle?.soln?.vis) {
        const err = new Error('Missing puzzle or solution info in request');
        console.error(err.message);
        res.status(500).json({ error: true , message: err.message });
        return; 
        /* console.error('Error accessing Sokoban puzzle and solution info');
        req.sendToUser(
            req.userId, 'job-error',
            { error: 'Error accessing jodId and metadata' }
        );
        return;  */
    }
    else {
        // 2. Insert puzzle metadata into db
        console.log('\nIn insertmetadata middleware\n');
        const pId = req.puzzle.whId;
        const uId = req.user.id;
        const wh = req.puzzle.wh;
        const vis = req.puzzle.soln.vis;
        const moves = req.puzzle.soln.moves;
        const cost = req.puzzle.soln.cost;

        req.db
        .into("puzzles")
        .insert({puzzleId: pId, userId: uId, name: wh, solnVis: vis, solnMoves: moves, solnCost: cost})
        .catch((err) => {
            console.error('Error during db insert: ', req.puzzle.name, req.user.userId);
            console.error('Error: ', err.message);
            /* req.jobs[req.jobId].status = 'error';
            req.jobs[req.jobId].error = err.message;
            req.sendToUser(
                req.puzzle.soln.userId, 'job-error',
                { jobId: req.jobId, status: req.jobs[req.jobId].status, title: req.puzzle.soln.title, error: err.message }
            ); */
            res.status(409).json({ error: true, message: err.message });
        })
        .then(() => {
            next();
        });
    };
};