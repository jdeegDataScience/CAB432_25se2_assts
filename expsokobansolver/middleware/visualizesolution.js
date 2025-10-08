const path = require('path');
// const util = require('util');
// const exec = util.promisify(require('node:child_process').exec);
const { spawn } = require('child_process');
const fs = require('node:fs');
const os = require('node:os');
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/aws");

module.exports = async function renderSolution(req, res, next) {
    try {
        console.log('\nCreating GIF of puzzle solution...');
        if (!req.puzzle) {
            return res.status(400).json({ error: true, message: 'Missing puzzle data from previous step' });
        }
        const { cost, solution, whId, whPath, wh } = req.puzzle; // solution as array of strings
        
        const scriptPath = path.resolve(__dirname, '../py_scripts/vizSokobanSoln.py');
        const tmpGifPath = path.join(os.tmpdir(), `${whId}.gif`);
        // Call Python script with paths
        const pyViz = spawn('python3', [scriptPath, whPath, JSON.stringify(solution), tmpGifPath]);
        let pyStdout = '';
        pyViz.stdout.on('data', (data) => {pyStdout += data.toString();});
        pyViz.stderr.on('data', (data) => console.error(data.toString()));

        pyViz.on('close', async (code) => {
            // console.log(`Python exited with code ${code}`);
            // Trim whitespace/newlines
            const gifPath = pyStdout.trim();

            // Prepare S3 upload params
            const params = { 
                Bucket: process.env.S3_BUCKET,
                Metadata: { 
                    warehouse: wh, 
                    userId: String(req.user.id) 
                },
                Key: `gifs/${String(req.user.id)}/${whId}.gif`,
                ContentType: 'image/gif',
                Body: fs.createReadStream(gifPath) // stream the GIF file
            };

            // Upload to S3
            await s3.send(new PutObjectCommand(params));
            
            next();
        });
    } catch (err) {
        // tidy up 
        s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: req.file.key }));
        const puzzleId = req.file.key.split("/").pop().split(".")[0];
        s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: `solutions/${String(req.user.id)}/${puzzleId}.json`}));
        req.db('puzzles').where({ puzzleid: puzzleId }).del();
        console.error('\nError in visualizesolution middleware:', err);
        return // res.status(500).json({ error: true, message: err.message });
    }
};