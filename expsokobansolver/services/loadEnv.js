// loadEnv.js
const {  GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const { GetParameterCommand } = require("@aws-sdk/client-ssm");

const { secrets, ssm } = require("./aws");

module.exports = async function loadEnv() {
    const secretCommand = new GetSecretValueCommand({ SecretId: "n11022639-asst2" });
    const secretResponse = await secrets.send(secretCommand);
    const secretsParsed = JSON.parse(secretResponse.SecretString);

    // load parameters from SSM Parameter Store
    const getBucketNameCommand = new GetParameterCommand({ Name: "/n11022639/asst2/bucket_name" });
    const getBucketNameResponse = await ssm.send(getBucketNameCommand);
    const getPortCommand = new GetParameterCommand({ Name: "/n11022639/asst2/port" });
    const getPortResponse = await ssm.send(getPortCommand);
    const getDBClientCommand = new GetParameterCommand({ Name: "/n11022639/asst2/dbclient" });
    const getDBClientResponse = await ssm.send(getDBClientCommand);
    
    process.env.PORT = getPortResponse.Parameter.Value;
    process.env.S3_BUCKET = getBucketNameResponse.Parameter.Value;
    process.env.DB_CLIENT = getDBClientResponse.Parameter.Value; // e.g. 'pg'
    process.env.DB_USER = secretsParsed.PG_USER;
    process.env.DB_PASSWORD = secretsParsed.PG_PASSWORD;
    process.env.DB_HOST = secretsParsed.PG_HOST;
    process.env.DB_NAME = secretsParsed.PG_NAME;
    process.env.DB_PORT = secretsParsed.PG_PORT;
    process.env.JWT_SECRET = secretsParsed.JWT_SECRET;
    process.env.ADMIN_EMAIL = secretsParsed.SERVER_ADMIN_EMAIL;
    process.env.USER_POOL_ID = secretsParsed.USER_POOL_ID;
    process.env.APP_CLIENT_ID = secretsParsed.APP_CLIENT_ID;
    process.env.APP_CLIENT_SECRET = secretsParsed.APP_CLIENT_SECRET;
    console.log("Secrets and parameters loaded");
}
