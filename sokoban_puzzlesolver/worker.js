// worker.js
import { worker } from "workerpool";
import { sqs, s3 } from "./services/aws.js";
import { DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand }  from "@aws-sdk/client-s3";
// import * as util from 'node:util';
// import { exec } from util.promisify(require('node:child_process').exec);
import { promisify } from 'node:util';
import { exec as execCb } from 'node:child_process';

const exec = promisify(execCb);
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import * as fs from 'node:fs/promises';
import os from 'node:os';
import * as options from './knexfile.js';
import knexInit from 'knex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knex = knexInit(options);
// const bucket = process.env.S3_BUCKET || 'n11022639-asst2';


async function processAndDeleteMessages(msg, sqsQueueUrl) {

    // solve puzzle
    await solve_puzzle(msg);
    // delete message id
    console.log("\nAttempting Delete for Message:", msg.MessageId);
    // Delete the message after dealt with.
    const deleteCommand = new DeleteMessageCommand({
        QueueUrl: sqsQueueUrl,
        ReceiptHandle: msg.ReceiptHandle,
    });
    sqs.send(deleteCommand);
    return;
};

async function solve_puzzle(msg) {
    try {
        console.log("\nHello from solve_puzzle() in processAndDeleteMessages Worker Thread!\n");

        // Retrieve the first message from the body
        console.log("\nMessage ID:", msg.MessageId);
        // Retrieve body
        console.log("Message Body Type:", typeof msg.Body);
        console.log("Message.Body == { bucket, key } ?\n", msg.Body);
        
        
        // Retrieve atrributes
        // console.log("My Message Attributes:");
        // console.log(msg.MessageAttributes);

        console.log('\nSolving puzzle...');
        const bodyObj = JSON.parse(msg.Body);
        const s3bucket = bodyObj.bucket;
        const s3key = bodyObj.key;
        const userId = s3key.split("/")[1];
        const tmpFile = s3key.split("/").pop()
        const puzzleId = tmpFile.split(".").shift(); // destination file name
        const baseName = puzzleId.slice(0, -14); // base puzzle name

        // track progress
        await knex('puzzles')
        .where({ puzzleid: puzzleId })
        .update({ status: 'solving' });


        // Download the S3 file to a local temporary path
        const tmpFilePath = path.join(os.tmpdir(), `${tmpFile}`);

        const getObjCmd = new GetObjectCommand({
            Bucket: s3bucket,
            Key: s3key
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
        const scriptPath = path.resolve(__dirname, 'py_scripts/solvePuzzle.py');
        const { stdout, stderr } = await exec(`python "${scriptPath}" "${tmpFilePath}"`);

        if (stderr && stderr.trim()) {
            return res.status(500).json({ error: true, message: stderr });
        }

        const puzzleRes = JSON.parse(stdout);
        // params for uploading solution JSON to S3
        const params = {
            Bucket: s3bucket,
            Metadata: {
                warehouse: baseName,
                userId: String(userId)
            },
            Key: `solutions/${String(userId)}/${puzzleId}.json`,
            Body: JSON.stringify({ moves: puzzleRes.solution }, null, 2),
            ContentType: "application/json"
        };

        await s3.send(new PutObjectCommand(params));
    } catch (err) {
        const bodyObj = JSON.parse(msg.Body);
        const s3bucket = bodyObj.bucket;
        const s3key = bodyObj.key;
        const puzzleId = s3key.split("/").pop().split(".")[0];
        // tidy up 
        s3.send(new DeleteObjectCommand({ Bucket: s3bucket, Key: s3key }));
        knex('puzzles').where({ puzzleid: puzzleId }).del();
        console.error('Error in solvepuzzle middleware:', err);
        return;
        // res.status(500).json({ error: true , message: err.message });
    }
}

// create a worker and register public functions
worker({
    processAndDeleteMessages: processAndDeleteMessages
});