const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/aws");

module.exports = async function(req, res, next) {
    try {
        // 1. Check puzzle info in req
        if (!req.user?.id || !req.puzzle?.whId || !req.puzzle?.cost ) {
            throw new Error('Missing puzzle or solution info in request');
        }
        else {
            // 2. Insert puzzle metadata into db
            console.log('\nInserting puzzle metadata');
            const pId = req.puzzle.whId;
            const uId = req.user.id;
            const wh = req.puzzle.wh;
            const cost = req.puzzle.cost;

            await req.db("puzzles")
            .where({puzzleid: pId}).update({status: "solved", cost: cost});
        };
    } catch (err) {
        // tidy up 
        s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: req.file.key }));
        s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: `solutions/${String(req.user.id)}/${pId}.json`}));
        s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: `gifs/${String(req.user.id)}/${pId}.gif`}));
        req.db('puzzles').where({ puzzleid: pId }).del();
        console.error('\nError during db insert: ', req.puzzle.whId, req.user.id);
        console.error('Error: ', err.message);
        // res.status(409).json({ error: true, message: err.message });
    }
    return;    
};