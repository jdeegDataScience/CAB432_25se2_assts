// worker.js
import { worker } from "workerpool";
import { sqs, s3 } from "./services/aws.js";
import { DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand }  from "@aws-sdk/client-s3";
import { promisify } from 'node:util';
import { exec as execCb } from 'node:child_process';
import { knex } from './services/knexfile.js';

const exec = promisify(execCb);
import * as path from 'node:path';
import { fileURLToPath } from 'url';
import * as fs from 'node:fs/promises';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function processAndDeleteMessages(msg, sqsQueueUrl) {

    // solve puzzle
    await solve_puzzle(msg);
    // delete message id
    // console.log("\nAttempting Delete for Message:", msg.MessageId);
    // Delete the message after dealt with.
    const deleteCommand = new DeleteMessageCommand({
        QueueUrl: sqsQueueUrl,
        ReceiptHandle: msg.ReceiptHandle,
    });
    const delAttemptRes = await sqs.send(deleteCommand).catch(err => {
        console.error("Error deleting message:", err.Code);
        return err;
    });
    // console.log("Delete Status: ", delAttemptRes.$metadata.httpStatusCode);
    return true;
};

async function solve_puzzle(msg) {
    try {
        // Retrieve the first message from the body
        // console.log('\nParsing message...\nMessage ID:', msg.MessageId);
        
        // Retrieve body
        const bodyObj = JSON.parse(msg.Body);
        // console.log("Message.Body:\n", bodyObj);
        const s3bucket = bodyObj.bucket;
        const s3key = bodyObj.key;
        const userId = s3key.split("/")[1];
        const tmpFile = s3key.split("/").pop()
        const puzzleId = tmpFile.split(".").shift(); // destination file name
        const baseName = puzzleId.slice(0, -14); // base puzzle name

        // track progress
        // console.log("Updating DB:\n", { puzzleid: puzzleId, status: 'solving' });
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
        // console.log('\nSolving puzzle...');
        const scriptPath = path.resolve(__dirname, 'py_scripts/solvePuzzle.py');
        const { stdout, stderr } = await exec(`python "${scriptPath}" "${tmpFilePath}"`);

        if (stderr && stderr.trim()) {
            throw new Error(stderr);
        }

        const puzzleRes = JSON.parse(stdout);
        // console.log("Puzzle solved. Solution:", puzzleRes);
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
        return true;
    } catch (err) {
        const bodyObj = JSON.parse(msg.Body);
        const s3bucket = bodyObj.bucket;
        const s3key = bodyObj.key;
        const puzzleId = s3key.split("/").pop().split(".").shift();
        // tidy up 
        s3.send(new DeleteObjectCommand({ Bucket: s3bucket, Key: s3key }));
        knex('puzzles').where({ puzzleid: puzzleId }).del();
        console.error('Error in solvepuzzle middleware:', err);
        return false;
    }
}

// create a worker and register public functions
worker({
    processAndDeleteMessages: processAndDeleteMessages
});