const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../logger');

function verifyToken(req, res, next) {
    req.id = "", req.name = "", req.email = "";
    var token = req.headers['authorization'];
    if (!token || !token.includes('Bearer')) {
        next(createHttpError(403, "No token"));
        logger.error(`403 No token ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    } else {
        token = token.split('Bearer ')[1];
        jwt.verify(token, config.JWTKEY, function (err, decoded) {
            if (err) {
                console.log('verify error');
                next(createHttpError(403, "Not authorize"));
                logger.error(`403 No token ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            } else {
                console.log('verify success');
                req.id = decoded.id;
                req.name = decoded.name;
                req.email = decoded.email;
                logger.info(`200 Verify success||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                next();
            }
        });
    }

}

module.exports = verifyToken;