import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsQueueUrl = "https://sqs.ap-southeast-2.amazonaws.com/901444280953/n11022639-asst-uploads.fifo"; 
const client = new SQSClient({ region: "ap-southeast-2" });

export const handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    const command = new SendMessageCommand({
      QueueUrl: sqsQueueUrl,
      MessageBody: JSON.stringify({ bucket, key }),
      MessageGroupId: "puzzle-uploads",   // FIFO requirement
      MessageDeduplicationId: key         // prevents duplicates
    });

    try {
      const response = await client.send(command);
    } catch (err) {
      console.error(`Failed to send SQS message for ${key}`, err);
      throw err; // ensures Lambda retries on failure
    }
  }

  // optional return for logging/debugging
  return { status: "ok", recordsProcessed: event.Records.length };
};