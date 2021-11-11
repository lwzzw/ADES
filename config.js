const dotenv = require('dotenv').config();

exports.DATABASEURL = process.env.DATABASEURL;
exports.PORT = process.env.PORT || 5000;