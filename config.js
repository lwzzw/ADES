const dotenv = require('dotenv').config();

exports.DATABASEURL = process.env.DATABASEURL;
exports.JWTKEY = process.env.JWTKEY;
exports.PORT = process.env.PORT || 5000;