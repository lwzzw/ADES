require('dotenv').config();

exports.DATABASEURL = process.env.DATABASEURL;
exports.JWTKEY = process.env.JWTKEY;
exports.PORT = process.env.PORT || 5000;
exports.ENV = process.env.ENV||"sandbox";
exports.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
exports.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
exports.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;