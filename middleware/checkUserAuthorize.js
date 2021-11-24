const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const config = require('../config');

function verifyToken(req, res, next) {
    req.id = "", req.name = "", req.email = "";
    var token = req.headers['authorization'];
    if (!token || !token.includes('Bearer')) {
        next(createHttpError(403, "No token"));
    } else {
        token = token.split('Bearer ')[1];
        jwt.verify(token, config.JWTKEY, function (err, decoded) {
            if (err) {
                console.log('verify error');
                next(createHttpError(403, "Not authorize"));
            } else {
                console.log('verify success');
                req.id = decoded.id;
                req.name = decoded.name;
                req.email = decoded.email;
                next();
            }
        });
    }

}

module.exports = verifyToken;