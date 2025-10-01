const express = require('express');
const router = express.Router();

const puzzlesRouter = require("./puzzles");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Sokoban Solver Server' });
});

router.use('/puzzles', puzzlesRouter);

module.exports = router;
