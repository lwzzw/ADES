const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../logger");

function verifyToken(req, res, next) {
  (req.id = ""), (req.name = ""), (req.email = "");
  var token = req.headers["authorization"];
  if (!token || !token.includes("Bearer")) {
    next(createHttpError(401, "No token"));
    // logger.error(
    //   `401 No token ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    // );
  } else {
    token = token.split("Bearer ")[1];
    jwt.verify(token, config.JWTKEY, function (err, decoded) {
      if (err) {
        req.id = req.body.uid;
        console.log("verify error");
        next(createHttpError(401, "Not authorize"));
        logger.error(
          `401 No token ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
      } else {
        console.log("verify success");
        console.log(decoded.id);
        req.id = decoded.id;
        req.name = decoded.name;
        req.email = decoded.email;
        req.phone = decoded.phone;
        logger.info(
          `200 Verify success||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
        next();
      }
    });
  }
}

module.exports = verifyToken;
