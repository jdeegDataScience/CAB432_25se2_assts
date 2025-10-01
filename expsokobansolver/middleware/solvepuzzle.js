const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const path = require('node:path');
const fs = require("fs");


module.exports = async function (req, res, next) {
    try {
        console.log('\nIn solvepuzzle middleware\n');

        const scriptPath = path.resolve(__dirname, '../py_scripts/solvePuzzle.py');
        const puzzleFileAbsPath = path.resolve(req.file.path); // multer puts the file path here
        if (!puzzleFileAbsPath) {
            return res.status(400).json({ error: 'Missing puzzle file parameter' });
        }

        // Call python script with the file path
        const { stdout, stderr } = await exec(`python "${scriptPath}" "${puzzleFileAbsPath}"`);

        if (stderr && stderr.trim()) {
            return res.status(500).json({ error: true, message: stderr });
        }

        const puzzleRes = JSON.parse(stdout);
        // ensure directory exists
        const solnMovesDir = path.join(__dirname, "..", "solutions", "moves");
        fs.mkdirSync(solnMovesDir, { recursive: true });

        // solution moves filename
        const solnFile = `sokoban_${req.file.filename}_soln.txt`;
        const outpath = path.join(solnMovesDir, solnFile);

        // write moves
        fs.writeFileSync(outpath, JSON.stringify(puzzleRes.solution, null, 2), "utf-8");
        puzzleRes.whPath = req.file.path; // destination file path
        puzzleRes.whId = req.file.filename; // destination file name
        puzzleRes.wh = req.file.originalname.split(".")[0]; // original file name
        puzzleRes.soln = {};
        puzzleRes.soln.moves = solnFile; // solution moves file name
        puzzleRes.soln.cost = puzzleRes.cost; // solution moves file name
        
        req.puzzle = puzzleRes; // pass to next middleware
        next();
    } catch (err) {
        console.error('Error in solvepuzzle middleware:', err);
        res.status(500).json({ error: true , message: err.message });
    }
}