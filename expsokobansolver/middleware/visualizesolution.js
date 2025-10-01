const path = require('path');
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');

module.exports = async function renderSolution(req, res, next) {
  try {
    console.log('\nIn visualizesolution middleware\n');
    if (!req.puzzle) {
      return res.status(400).json({ error: true, message: 'Missing puzzle data from previous step' });
    }
    const { cost, solution, puzzleFile } = req.puzzle; // solution as array of strings
    
    const scriptPath = path.resolve(__dirname, '../py_scripts/vizSokobanSoln.py');
    const puzzleFileAbsPath = path.resolve(puzzleFile);
    const args = [puzzleFileAbsPath, JSON.stringify(solution)];

    /* const command = `python "${scriptPath}" "${puzzleFileAbsPath}" '${JSON.stringify(solution)}'`;
    console.log('\nExecuting command:', command);
    const { stdout, stderr } = await exec(command);
    console.log('\nVisualization script stdout:', stdout);
    console.log('\nVisualization script stderr:', stderr);
    if (stderr) {
      return res.status(500).json({ error: true, message: stderr });
    }
    const result = JSON.parse(stdout);
    res.json(result); // { output: "/tmp/sokoban_12345.gif" } */

    const py = spawn('python', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => {
      console.log(`[python stdout]: ${data}`);
      stdout += data.toString();
    });

    py.stderr.on('data', (data) => {
      console.error(`[python stderr]: ${data}`);
      stderr += data.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: true, code, details: stderr });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse Python output', stdout, stderr });
      }
    });
  } catch (err) {
    // return // res.status(500).json({ error: true, message: err.message });
  }
};