module.exports = function(req, res, next) {
    // 1. Check all info in req
    if (!req.body.downloadLink) {
        res.status(400).json({ error: true, 
            message: `Request cannot be processed, missing required puzzle identifier.`});
        return; 
    }
    else {
        const puzzlePath = req.body.downloadLink;
        try {
            res.download(puzzlePath);
        }
        catch (err) {
            res.status(410).json({ error: true, message: err.message });
        }
    };
};