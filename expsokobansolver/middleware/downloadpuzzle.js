const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3 } = require("../services/aws");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

module.exports = async function(req, res, next) {
    const userId = req.query?.userId ? req.query.userId : req.user.id;
    // 1. Check all info in req
    try {
        if (!req.query.puzzle || !req.query.target) {
            throw new Error('Missing puzzle id or download target in request');
        }
        let ext = '';
        switch (req.query.target) {
            case 'warehouses': ext = 'txt';
                break;
            case 'solutions': ext = 'json';
                break;
            case 'gifs': ext = 'gif';
                break;
        }
        const objectKey = `${req.query.target}/${String(userId)}/${req.query.puzzle}.${ext}`;
        const command = new GetObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: objectKey,
                ResponseContentDisposition: `attachment; filename="${req.query.puzzle}.${ext}"`,
            });
        const presignedURL = await getSignedUrl(s3, command, {expiresIn: 3600} );
        res.json({ downloadURL: presignedURL });        
    } catch (err) {
        res.status(410).json({ error: true, message: err.message });
    }
    return;
};