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
            const ext = file.originalname.split('.').pop();
            const baseName = file.originalname.replace(/\.[^/.]+$/, "");
            cb(null, `warehouses/${String(req.user.id)}/${baseName}_${Date.now().toString()}.${ext}`);
        }
    }) 
}); 

const getpuzzles = require("../middleware/getpuzzles");
const insertmetadata = require("../middleware/insertmetadata");
const downloadpuzzle = require("../middleware/downloadpuzzle");
const hasbearertoken = require("../middleware/hasbearertoken");
const authorisation = require("../middleware/authorisation");
const getuserid = require("../middleware/getuserid");
const solvepuzzle = require("../middleware/solvepuzzle");
const visualizesolution = require("../middleware/visualizesolution");

router.use(hasbearertoken, authorisation, getuserid);

router.post('/solve', upload.single('file'), solvepuzzle, visualizesolution, insertmetadata, function(req, res, next) {
    // send response to user
    res.json(req.puzzle);
});

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
        ts: puzzle.ts
    })))
    .then((puzzles) => {
        res.json({ userGroup, data: puzzles, pagination: {total: totalPuzzles, lastPage: last, perPage: perPage, currentPage: pageNum, from: pageStart, to: pageEnd } });
    });
});

module.exports = router;