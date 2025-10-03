const path = require('path');
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');
const fs = require('node:fs');
const os = require('node:os');
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/aws");

module.exports = async function renderSolution(req, res, next) {
  try {
    console.log('\nIn visualizesolution middleware\n');
    if (!req.puzzle) {
      return res.status(400).json({ error: true, message: 'Missing puzzle data from previous step' });
    }
    const { cost, solution, whId, whPath, wh } = req.puzzle; // solution as array of strings
    // params for uploading solution JSON to S3
    const params = {
        Bucket: process.env.S3_BUCKET,
        ACL: 'authenticated-read',
        Metadata: {
            warehouse: wh,
            userId: req.user.id
        },
        Key: `gifs/${req.user.id}/${whId}.gif`,
        ContentType: "image/gif"
    };
    
    const scriptPath = path.resolve(__dirname, '../py_scripts/vizSokobanSoln.py');
    const tmpFilePath = path.join(os.tmpdir(), `${whId}.gif`);
    console.log('Temporary local file path:', tmpFilePath);
    const args = [whPath, JSON.stringify(solution), tmpFilePath];

    const py = spawn('python', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    py.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    py.on('close', async (code) => {
    if (code !== 0) {
        return res.status(500).json({ error: true, code, details: stderr });
    }
    try {
        const result = JSON.parse(stdout);
        params.Body = fs.createReadStream(result.solutionGIF); // solution gif file name
        await s3.send(new PutObjectCommand(params));
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Failed to parse Python output', stdout, stderr });
    }
    });
    } catch (err) {
        console.error('Error in visualizesolution middleware:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
};