require("dotenv").config();
const config = require("../config.js");
var nodemailer = require("nodemailer");
const tranporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

exports.sendMail = function (user, subject, text, callback) {
  var mailOptions = {
    from: "noreply@f2a.games",
    to: user,
    subject: subject,
    text: text,
  };
  tranporter.sendMail(
    mailOptions,
    callback ||
      ((err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      })
  );
};
