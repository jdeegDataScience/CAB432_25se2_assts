const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const path = require('node:path');


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
        puzzleRes.puzzleFile = req.file.path; // destination file path
        
        req.puzzle = puzzleRes; // pass to next middleware
        next();
        // res.json(puzzleRes);
    } catch (err) {
        console.error('Error in solvepuzzle middleware:', err);
        res.status(500).json({ error: true , message: err.message });
    }
}