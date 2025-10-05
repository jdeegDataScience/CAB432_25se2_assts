// centralised aws service clients
require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
const { SecretsManagerClient } = require("@aws-sdk/client-secrets-manager");
const { SESClient } = require("@aws-sdk/client-ses");
// const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { SSMClient } = require("@aws-sdk/client-ssm");


const jwtIdVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: "id",
    groups: ["users", "admins"],
    clientId: process.env.APP_CLIENT_ID
});

const region = process.env.AWS_REGION || 'ap-southeast-2';

// Instantiate once
const s3 = new S3Client({ region });
// const s3presigner = new S3RequestPresigner({ client: s3 });
const secrets = new SecretsManagerClient({ region });
const ses = new SESClient({ region });
const cognito = new CognitoIdentityProviderClient({ region });
const ssm = new SSMClient({ region });


module.exports = {
    s3,
    // s3presigner,
    dynamo,
    secrets,
    cognito,
    ses,
    ssm,
    jwtIdVerifier
};
