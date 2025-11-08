const express = require('express');
require("dotenv").config();
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3')
const { s3 } = require("../services/aws");

const upload = multer({ // files saved here
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        metadata: function (req, file, cb) {
            cb(null, {
                warehouse: file.originalname.split(".")[0],
                userId: String(req.user.id)
            });
        },
        key: function (req, file, cb) {
            try {
                const ext = file.originalname.split('.').pop();
                const baseName = file.originalname.replace(/\.[^/.]+$/, "");
                const puzzleKey = `${baseName}_${Date.now().toString()}`;
                const s3key = `warehouses/${String(req.user.id)}/${puzzleKey}.${ext}`;
                cb(null, s3key);
                
            } catch (err) {cb(err);}
        }
    }) 
}); 

const getpuzzles = require("../middleware/getpuzzles");
const updatemetadata = require("../middleware/updatemetadata");
const downloadpuzzle = require("../middleware/downloadpuzzle");
const hasbearertoken = require("../middleware/hasbearertoken");
const authorisation = require("../middleware/authorisation");
const getuserid = require("../middleware/getuserid");
const solvepuzzle = require("../middleware/solvepuzzle");
const visualizesolution = require("../middleware/visualizesolution");

router.use(hasbearertoken, authorisation, getuserid);

router.post('/upload', upload.single('file'), async function(req, res) {
    const puzzleKey = req.file.key.split("/").pop().split(".").shift();
    const baseName = req.file.originalname.replace(/\.[^/.]+$/, "");
    // Create DB record first with status = 'pending'
    await req.db('puzzles')
    .insert({
        puzzleid: puzzleKey,
        userid: req.user.id,
        name: baseName,
        cost: 0,
        status: 'queued'
    });
    // File has been uploaded to S3 and DB record created.
    res.status(200).json({
        error: false,
        message: 'File uploaded successfully',
        puzzleId: puzzleKey
    });
});


// router.post('/solve', upload.single('file'), solvepuzzle, visualizesolution, updatemetadata);

router.get('/download', downloadpuzzle);

router.get('/', getpuzzles, function(req, res, next) {
    const pageNum = req.query?.page ? parseInt(req.query.page) : 1;
    const perPage = 10; // number of puzzles in each page 
    const totalPuzzles = req.puzzles?.length;
    const last = Math.ceil(totalPuzzles/perPage);
    const pageStart = (pageNum - 1) * perPage; // start index of requested rows set 
    const pageEnd = totalPuzzles - pageStart < perPage ? totalPuzzles : pageStart+perPage;
    const userGroup = req.user?.groups?.includes("admins") ? "admin" : "user";

    const currPagePuzzles = req.puzzles.slice(pageStart, pageEnd);
    Promise.resolve(currPagePuzzles.map((puzzle) => ({
        id: puzzle.puzzleid,
        user: puzzle.userid,
        name: puzzle.name,
        cost: puzzle.cost,
        status: puzzle.status,
        ts: puzzle.ts
    })))
    .then((puzzles) => {
        res.json({ userGroup, data: puzzles, pagination: {total: totalPuzzles, lastPage: last, perPage: perPage, currentPage: pageNum, from: pageStart, to: pageEnd } });
    });
});

module.exports = router;