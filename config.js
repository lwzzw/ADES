require('dotenv').config();

exports.DATABASEURL = process.env.DATABASEURL;
exports.JWTKEY = process.env.JWTKEY;
exports.PORT = process.env.PORT || 5000;
exports.ENV = process.env.ENV||"sandbox";
exports.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
exports.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
exports.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
exports.EMAIL_USER = process.env.EMAIL_USER;
exports.EMAIL_PASS = process.env.EMAIL_PASS;
exports.EMAIL_KEY_SELECTOR = process.env.EMAIL_KEY_SELECTOR;
exports.EMAIL_PRIVATE_KEY = process.env.EMAIL_PRIVATE_KEY;
exports.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
exports.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
exports.FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
exports.FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;