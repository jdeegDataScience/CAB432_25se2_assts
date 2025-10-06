module.exports = function(req, res, next) {
    const BLtime = Math.floor(Date.now() / 1000);
    const userEmail = req.user.email ? req.user.email : req.body.email;
    req.db("usersbltokens")
    .insert({email: userEmail, blfrom: `${BLtime}`})
    .onConflict('email')
    .merge({blfrom: BLtime})
    .then(_ => {
        next();
    });
};