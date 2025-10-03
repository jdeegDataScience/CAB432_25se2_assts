// centralised aws service clients
require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { SecretsManagerClient } = require("@aws-sdk/client-secrets-manager");
const { SESClient } = require("@aws-sdk/client-ses");
const S3Presigner = require("@aws-sdk/s3-request-presigner");

const region = process.env.AWS_REGION;

// Instantiate once
const s3 = new S3Client({ region });
const presigner = new S3Presigner.S3RequestPresigner({ client: s3 });
const dynamo = new DynamoDBClient({ region });
const secrets = new SecretsManagerClient({ region });
const ses = new SESClient({ region });

module.exports = {
    s3,
    presigner,
    dynamo,
    secrets,
    ses
};
