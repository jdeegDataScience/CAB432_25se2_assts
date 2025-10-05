module.exports = async function(req, res, next) {
    // ID Tokens are used to authenticate users to your application
    const id_token = req.AuthRes.IdToken;
    // Access tokens are used to link IAM roles to identities for accessing AWS services
    const access_token = res.AuthRes.AccessToken;

    // Refresh tokens are used to get new ID and access tokens
    const refresh_token = res.AuthRes.RefreshToken;
    
    res.status(200).json({
        bearerToken: {
            token: id_token,
            token_type: "Bearer"
        },
        accessToken: {
            token: access_token,
            token_type: "Access"
        },
        refreshToken: {
            token: refresh_token,
            token_type: "Refresh"
        }                
    });
    return;
}