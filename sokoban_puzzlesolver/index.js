import { loadEnv } from "./services/loadEnv.js";
// console.log("\nFetching environment variables...");
await loadEnv();   // fetch env params and secrets at container startup    
// console.log("\nEnvironment loaded.");

import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { pool as _pool } from 'workerpool';
import { sqs } from "./services/aws.js";
const sqsQueueUrl = "https://sqs.ap-southeast-2.amazonaws.com/901444280953/n11022639-asst-uploads.fifo"; 
let polledMessages = [];
let missedPolls = 0;
let sigterm = false;

// Process messages using worker pool
const pool = _pool( "./worker.js", {maxWorkers: 3, workerType: "process"} );

async function main() {
    // console.log("\nStarting main polling loop...\n");
    while (missedPolls < 6 && !sigterm) {
        await pollMessages();
        // Process polled messages, if any
        if (polledMessages.length > 0) {
            const processPromises = polledMessages.map(msg => {
                return pool.exec("processAndDeleteMessages", [msg, sqsQueueUrl]
                )
                .catch(err => {
                    console.error("Error processing message:", err);
                });
            });
            await Promise.all(processPromises);
            // console.log("\nAll polled messages processed.");
            // await pool.terminate(); // terminate the worker pool
            polledMessages = []; // clear processed messages
        } 
    }
    // console.log("\nExiting main polling loop.");
    await pool.terminate(); // terminate the worker pool
    // console.log("Worker pool terminated. Exiting.");
    process.exit(0);
}

async function pollMessages() {    
    // Receive messages from the queue
    const receiveCommand = new ReceiveMessageCommand({
        MaxNumberOfMessages: 5,
        // AttributeNames: ["All"],
        // MessageAttributeNames: ["All"],
        QueueUrl: sqsQueueUrl,
        WaitTimeSeconds: 20 // how long to wait for a message before returning if none.
        // , VisibilityTimeout: 420, // overrides the default for the queue?
    });
    
    const newMessages = await receiveMessages(receiveCommand);
    if (newMessages && newMessages?.length > 0) {
        polledMessages = polledMessages.concat(newMessages);
        missedPolls = 0;
        return true;
    }
    else {
        missedPolls += 1;
        // console.log("Missed Polls count:", missedPolls);
        return false;
    }
}

async function receiveMessages(receiveCommand) {
    const receiveResponse = await sqs.send(receiveCommand);

    // If there are no messages then return null.
    let Messages = receiveResponse.Messages;
    if (!Messages?.length) {
        return [];
    }
    return Messages;
}

main();