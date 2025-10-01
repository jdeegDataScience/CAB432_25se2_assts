const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // files saved here

const getpuzzles = require("../middleware/getpuzzles");
// const insertmetadata = require("../middleware/insertmetadata");
// const downloadpuzzle = require("../middleware/downloadpuzzle");
const hasbearertoken = require("../middleware/hasbearertoken");
const authorisation = require("../middleware/authorisation");
const getuserid = require("../middleware/getuserid");
const solvepuzzle = require("../middleware/solvepuzzle");
const visualizesolution = require("../middleware/visualizesolution");

router.post('/solve', upload.single('file'), solvepuzzle, visualizesolution);

// router.post('/convert', hasbearertoken, authorisation, getuserid, /* getpuzzleinfo, convertpuzzle, */ insertmetadata);

// router.get('/download', hasbearertoken, authorisation, downloadpuzzle);

router.use('/', hasbearertoken, authorisation, getuserid, getpuzzles);

router.get('/', function(req, res, next) {
    const pageNum = req.query?.page ? parseInt(req.query.page) : 1;
    const perPage = 10; // number of puzzles in each page 
    const totalPuzzles = req.puzzles?.length;
    const last = Math.ceil(totalPuzzles/perPage);
    const pageStart = (pageNum - 1) * perPage; // start index of requested rows set 
    const pageEnd = totalPuzzles - pageStart < 10 ? totalPuzzles : pageStart+10;

    const currPagePuzzles = req.puzzles.slice(pageStart, pageEnd);
    Promise.resolve(currPagePuzzles.map((puzzle) => ({
        id: puzzle.puzzleId,
        title: puzzle.title,
        imgUrl: puzzle.thumbnail,
        length: Number(puzzle.length),
        ts: puzzle.ts,
        
    })))
    .then((puzzles) => {
        res.json({ data: puzzles, pagination: {total: totalPuzzles, lastPage: last, perPage: perPage, currentPage: pageNum, from: pageStart, to: pageEnd } });
    });
});

/* GET Puzzles page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'The Puzzles Search Page' });
// });

module.exports = router;