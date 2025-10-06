module.exports = function(req, res, next) {
    const BLtime = Math.floor(Date.now() / 1000);
    req.db("usersbltokens")
    .insert({email: req.user.email, blfrom: `${BLtime}`})
    .onConflict('email')
    .merge({blfrom: BLtime})
    .then(_ => {
        next();
    });
};