
const express = require('express');
const router = express.Router();
const { cognito } = require("../services/aws");
const {
    InitiateAuthCommand,
    SignUpCommand,
    ConfirmSignUpCommand,
    GetTokensFromRefreshTokenCommand,
    GlobalSignOutCommand,
    RespondToAuthChallengeCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require("crypto");
const userExists = require("../middleware/postuserexists");
const invalidatetoken = require("../middleware/invalidatetoken");
const usertokens = require("../middleware/usertokens");

function secretHash(clientId, clientSecret, username) {
    const hasher = crypto.createHmac('sha256', clientSecret);
    hasher.update(`${username}${clientId}`);
    return hasher.digest('base64');
}

/* POST user login; auth token */
router.post('/login', userExists, function(req, res, next) {
    // If user does not exist, throw error
    if (!req.match) {
        res.status(401).json({ error: true, message:`Incorrect username or password`});
        return;
    }
    next();
    }, function(req, res, next) {
        // check all required fields are present
        if (!req.body.password || !req.body.username) {
        res.status(401).json({ error: true, message:`Missing login parameters, both username and password required.`});
        return;
    }
    next();
    }, invalidatetoken, async function(req, res, next) {
        console.log("Req.body:", req.body);
        const { username, password, mfaCode, session } = req.body;
        try {
            // Step 1: If MFA code not yet provided → initiate auth
            if (!mfaCode) {
                const initAuthCommand = new InitiateAuthCommand({
                    AuthFlow: "USER_PASSWORD_AUTH",
                    ClientId: process.env.APP_CLIENT_ID,
                    AuthParameters: {
                        USERNAME: username,
                        PASSWORD: password,
                        SECRET_HASH: secretHash(process.env.APP_CLIENT_ID, process.env.APP_CLIENT_SECRET, username)
                    }
                });

                const initAuthRes = await cognito.send(initAuthCommand);

                // MFA challenge will always be returned
                return res.status(200).json({
                    message: "MFA required. Enter the code sent to your email.",
                    session: initAuthRes.Session
                });
            }
            // Step 2: If MFA code provided → respond to auth challenge
            // Get authentication tokens from MFA challenge response
            const authChallengeCommand = new RespondToAuthChallengeCommand({
                ClientId: process.env.APP_CLIENT_ID,
                ChallengeName: "EMAIL_OTP", // email OTP in Cognito
                Session: session,
                ChallengeResponses: {
                    USERNAME: username,
                    EMAIL_OTP_CODE: mfaCode,
                    SECRET_HASH: secretHash(process.env.APP_CLIENT_ID, process.env.APP_CLIENT_SECRET, username)
                }
            });

            const authChallengeRes = await cognito.send(authChallengeCommand);

            console.log(authChallengeRes.AuthenticationResult);
            req.AuthRes = authChallengeRes.AuthenticationResult;
            next();
        } catch (e) {
            res.status(401).json({ error: true, message: e.message });
            return;
        };
    }, usertokens
);

/* POST register user; add to db */
router.post('/register', userExists, async function(req, res) {
    // If user does exist, throw error
    try { 
        if (req.match) {
            throw new Error(`User already exists`);
        }
        // check all required fields are present
        if (!req.body.email || !req.body.password || !req.body.username) {
            throw new Error(`Request body incomplete, email, username, and password are required.`);
        }
        else {
            const email = req.body.email;
            const username = req.body.username;
            const password = req.body.password;
            const hash = secretHash(process.env.APP_CLIENT_ID, process.env.APP_CLIENT_SECRET, username);
            const command = new SignUpCommand({
                ClientId: process.env.APP_CLIENT_ID,
                SecretHash: hash, 
                Username: username,
                Password: password,
                UserAttributes: [{ Name: "email", Value: email }],
            });
            const cognitoRes = await cognito.send(command);
            console.log(cognitoRes);
            req.db.from("users").insert({ email, hash, username })
            .then(() => {
                res.status(201).json({message: "User created, please confirm your email with the code sent."});
            })
            .catch((e) => {
                res.status(409).json({ error: true, message: e.message });
            });
        };
        return;
    } catch (e) {
        res.status(400).json({ error: true, message: e.message });
        return;
    }
});

/* POST register user; add to db */
router.post('/confirm', async function(req, res) {
    try {
        // 1. Check username and code in req.body
        if (!req.body.username || !req.body.code) {
            throw new Error(`Request body incomplete, username and SignUp confirmation code are required.`);
        }
        else {
            const code = req.body.code;
            const username = req.body.username;
            const hash = secretHash(process.env.APP_CLIENT_ID, process.env.APP_CLIENT_SECRET, username);
            const command = new ConfirmSignUpCommand({
                ClientId: process.env.APP_CLIENT_ID,
                SecretHash: hash, 
                Username: username,
                ConfirmationCode: code
            });
            const cognitoRes = await cognito.send(command);
            console.log(cognitoRes);
            res.status(200).json({ message: "User confirmed" });
        };
    } catch (e) {
        res.status(400).json({ error: true, message: e.message });
    };
    return;
});

/* POST refresh token */
router.post('/refresh',
    function(req, res, next) {
        // 1. Check refreshToken in req.body
        if (!req.body.refreshToken) {
            res.status(400).json({ error: true, 
                message: `Request body incomplete, refresh token required` });
            return; 
        }
        next();
    }, invalidatetoken, async function(req, res, next) {
        try {
            // 2. Get new tokens from Cognito using the refresh token
            const command = new GetTokensFromRefreshTokenCommand({
                RefreshToken: req.body.refreshToken,
                ClientId: process.env.APP_CLIENT_ID,
                ClientSecret: process.env.APP_CLIENT_SECRET
            });
            const refreshRes = await cognito.send(command);
            req.AuthRes = refreshRes.AuthenticationResult;
            next();
        } catch (e) {
            res.status(401).json({ error: true, message: e.message });
            return;
        };
    }, usertokens
);

/* POST refresh token */
router.post('/logout', 
    function(req, res, next) {
        // 1. Check refreshToken in req.body
        if (!req.body.accessToken) {
            res.status(400).json({ error: true, 
                message: `Request body incomplete, access token required` });
            return; 
        }
        next();
    }, invalidatetoken,
    function(req, res) {
        try {
            const command = new GlobalSignOutCommand({AccessToken: req.body.accessToken});
            cognito.send(command);
            res.status(200).json({error: false, message: 'Token successfully invalidated'});
        } catch (e) {
            res.status(401).json({ error: true, message: e.message });
        };
        return;
    }
);

/* GET users listing. */
router.get('/', function(req, res, next) {
    req.db.from("users").select('userId', 'email')
    .then((rows) => { 
        res.status(200).json({ Error: false, Message: "Success", Users: rows }); 
    });
});

module.exports = router;
