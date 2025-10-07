// centralised aws service clients
require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
const { SecretsManagerClient } = require("@aws-sdk/client-secrets-manager");
const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider");
const { SSMClient } = require("@aws-sdk/client-ssm");
// const { SESClient } = require("@aws-sdk/client-ses");
// const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
// const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const region = process.env.AWS_REGION || 'ap-southeast-2';

// Instantiate once
const s3 = new S3Client({ region });
const secrets = new SecretsManagerClient({ region });
const cognito = new CognitoIdentityProviderClient({ region });
const ssm = new SSMClient({ region });

// const s3presigner = new S3RequestPresigner({ client: s3 });
// const ses = new SESClient({ region });


module.exports = {
    s3,
    secrets,
    cognito,
    ssm
    // ses,
    // s3presigner,
    // dynamo
};
