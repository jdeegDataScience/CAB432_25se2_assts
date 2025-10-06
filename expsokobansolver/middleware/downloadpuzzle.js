const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3 } = require("../services/aws");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

module.exports = async function(req, res, next) {
    // 1. Check all info in req
    try {
        if (!req.body.puzzle || !req.body.target) {
            throw new Error('Missing puzzle id or download target in request');
        }
        const ext = req.body.target === 'gifs' ? 'gif' : 'txt';
        const objectKey = `${req.body.target}s/${String(req.user.id)}/${req.body.puzzle}.${ext}`;
        const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: objectKey,
                ResponseContentDisposition: `attachment; filename="${req.body.puzzle}.${ext}"`,
            });
        const presignedURL = await getSignedUrl(s3, command, {expiresIn: 3600} );
        res.json({ downloadURL: presignedURL });        
    } catch (err) {
        res.status(410).json({ error: true, message: err.message });
    }
    return;
};