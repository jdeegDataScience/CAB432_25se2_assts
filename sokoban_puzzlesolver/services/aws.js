// centralised aws service clients
require("dotenv").config();
import { S3Client } from "aws-sdk/client-s3";
import { SecretsManagerClient } from "aws-sdk/client-secrets-manager";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { SSMClient } from "@aws-sdk/client-ssm";
import { SQSClient } from "@aws-sdk/client-sqs";

// const { SESClient } = require("@aws-sdk/client-ses");
// const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const region = process.env.AWS_REGION || 'ap-southeast-2';

// Instantiate once
const s3 = new S3Client({ region });
const secrets = new SecretsManagerClient({ region });
const cognito = new CognitoIdentityProviderClient({ region });
const ssm = new SSMClient({ region });
const sqs = new SQSClient({ region });

// const s3presigner = new S3RequestPresigner({ client: s3 });
// const ses = new SESClient({ region });


export {
    s3,
    secrets,
    cognito,
    ssm,
    sqs
    // ses,
    // s3presigner,
    // dynamo
};