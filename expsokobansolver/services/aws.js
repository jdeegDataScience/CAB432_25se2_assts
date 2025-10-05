// centralised aws service clients
require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
const { SecretsManagerClient } = require("@aws-sdk/client-secrets-manager");
// const { SESClient } = require("@aws-sdk/client-ses");
// const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider");
const { SSMClient } = require("@aws-sdk/client-ssm");
const Memcached = require("memcached");
const util = require("node:util");

// Replace this with the endpoint for your Elasticache instance
const memcachedAddress = "something.cfg.apse2.cache.amazonaws.com:11211";


const region = process.env.AWS_REGION || 'ap-southeast-2';

// Instantiate once
const s3 = new S3Client({ region });
// const s3presigner = new S3RequestPresigner({ client: s3 });
const secrets = new SecretsManagerClient({ region });
// const ses = new SESClient({ region });
const cognito = new CognitoIdentityProviderClient({ region });
const ssm = new SSMClient({ region });
const memch = new Memcached(memcachedAddress);
memch.on("failure", (details) => {
    console.log("Memcached server failure: ", details);
});

// Monkey patch some functions for convenience
// can call these with async
memch.aGet = util.promisify(memch.get);
memch.aSet = util.promisify(memch.set);


module.exports = {
    s3,
    // s3presigner,
    dynamo,
    secrets,
    cognito,
    // ses,
    ssm,
    memch
};
