const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'warehouses/' }); // files saved here

const getpuzzles = require("../middleware/getpuzzles");
const insertmetadata = require("../middleware/insertmetadata");
// const downloadpuzzle = require("../middleware/downloadpuzzle");
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

// router.get('/download', hasbearertoken, authorisation, downloadpuzzle);

router.get('/', getpuzzles, function(req, res, next) {
    const pageNum = req.query?.page ? parseInt(req.query.page) : 1;
    const perPage = 10; // number of puzzles in each page 
    const totalPuzzles = req.puzzles?.length;
    const last = Math.ceil(totalPuzzles/perPage);
    const pageStart = (pageNum - 1) * perPage; // start index of requested rows set 
    const pageEnd = totalPuzzles - pageStart < perPage ? totalPuzzles : pageStart+perPage;

    const currPagePuzzles = req.puzzles.slice(pageStart, pageEnd);
    Promise.resolve(currPagePuzzles.map((puzzle) => ({
        id: puzzle.puzzleId,
        user: puzzle.userId,
        name: puzzle.name,
        solutionGIF: puzzle.solnGIF,
        solutionMoves: puzzle.solnMoves,
        solutionCost: puzzle.solnCost,
        ts: puzzle.ts
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