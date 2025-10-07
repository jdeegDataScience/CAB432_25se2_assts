const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
require("dotenv").config();
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../services/aws");

module.exports = async function (req, res, next) {
    try {
        console.log('\nSolving puzzle...');
        const puzzleId = req.file.key.split("/").pop().split(".")[0]; // destination file name
        const baseName = req.file.originalname.split(".")[0]; // original file name

        // Download the S3 file to a local temporary path
        const tmpFilePath = path.join(os.tmpdir(), `${Date.now()}_${req.file.originalname}`);

        const getObjCmd = new GetObjectCommand({
            Bucket: req.file.bucket,
            Key: req.file.key
        });

        const s3Object = await s3.send(getObjCmd);
        const bodyStream = s3Object.Body;

        // Save S3 object to local file
        const writable = await fs.open(tmpFilePath, 'w');
        await new Promise((resolve, reject) => {
            bodyStream.pipe(writable.createWriteStream())
                .on('finish', resolve)
                .on('error', reject);
        });

        // Run Python script on local file
        const scriptPath = path.resolve(__dirname, '../py_scripts/solvePuzzle.py');
        const { stdout, stderr } = await exec(`python "${scriptPath}" "${tmpFilePath}"`);

        if (stderr && stderr.trim()) {
            return res.status(500).json({ error: true, message: stderr });
        }

        const puzzleRes = JSON.parse(stdout);
        // params for uploading solution JSON to S3
        const params = {
            Bucket: process.env.S3_BUCKET,
            Metadata: {
                warehouse: baseName,
                userId: String(req.user.id)
            },
            Key: `solutions/${String(req.user.id)}/${puzzleId}.json`,
            Body: JSON.stringify({ moves: puzzleRes.solution }, null, 2),
            ContentType: "application/json"
        };

        await s3.send(new PutObjectCommand(params));
        puzzleRes.whId = puzzleId; // destination file name
        puzzleRes.whPath = tmpFilePath; // local temp file path
        puzzleRes.wh = baseName; // original file name        
        req.puzzle = puzzleRes; // pass to next middleware
        next();
    } catch (err) {
        console.error('Error in solvepuzzle middleware:', err);
        res.status(500).json({ error: true , message: err.message });
    }
}