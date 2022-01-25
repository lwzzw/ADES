// require("dotenv").config();
const config = require("../config.js");
var nodemailer = require("nodemailer");
const tranporter = nodemailer.createTransport({
  service: "gmail.com",//use gmail service
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
    dkim: {//to prevent the email go to junk email
      domainName: "f2a.games",
      keySelector: config.EMAIL_KEY_SELECTOR,
      privateKey: config.EMAIL_PRIVATE_KEY
    }
  },
});

//export the send mail function
exports.sendMail = function (user, subject, body, callback) {
  var mailOptions = {
    from: config.EMAIL_USER,
    to: user,
    subject: subject,
    text: body.text,
    html: body.html,
  };
  tranporter.sendMail(
    mailOptions,
    callback ||//if callback exist then use callback
      ((err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      })
  );
};

//export the send mail function
exports.receiveMail = function (subject, body, callback) {
  var mailOptions = {
    from: config.EMAIL_USER,
    to: "sharyssebuenaventura@gmail.com",
    subject: subject,
    html: body.html,
  };
  tranporter.sendMail(
    mailOptions,
    callback ||//if callback exist then use callback
      ((err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      })
  );
};
