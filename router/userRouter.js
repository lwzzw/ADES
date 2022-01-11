const database = require("../database/database");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");
const verifyToken = require("../middleware/checkUserAuthorize");
const router = require("express").Router();
const logger = require("../logger");
const nocache = require("nocache");
const sendMail = require("../email/email").sendMail;

router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email == null || password == null) {
    logger.error(
      `401 Empty Credentials ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return next(createHttpError(401, "empty credentials"));
  } else {
    return database
      .query(
        `SELECT id, name, email FROM public.user_detail where email=$1 and password=$2`,
        [email, password]
      )
      .then((results) => {
        console.log(results.rows.length);
        if (results.rows.length == 1) {
          let data = {
            token: jwt.sign(
              {
                id: results.rows[0].id,
                name: results.rows[0].name,
              },
              config.JWTKEY,
              {
                expiresIn: 86400,
              }
            ),
          };
          logger.info(
            `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
          );
          return res.status(200).json(data);
        } else {
          logger.error(
            `401 Login Failed ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
          );
          return next(createHttpError(401, "login failed"));
        }
      })
      .catch((err) => {
        next(createHttpError(500, err));
        logger.error(
          `${err || "500 Error"} ||  ${res.statusMessage} - ${
            req.originalUrl
          } - ${req.method} - ${req.ip}`
        );
      });
  }
});

router.post("/register", (req, res, next) => {
  const username = req.body.username;
  const useremail = req.body.useremail;
  const userpassword = req.body.userpassword;
  const userphone = req.body.userphone;
  const usergender = req.body.usergender;
  if (
    username == null ||
    useremail == null ||
    userpassword == null ||
    userphone == null ||
    usergender == null
  ) {
    logger.error(
      `401 Empty Credentials ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return next(createHttpError(401, "empty credentials"));
  } else {
    bcrypt.hash(userpassword, 10, async (err, hash) => {
      if (err) {
        console.log("Error on hashing password");
        res
          .status(500)
          .json({ statusMessage: "Unable to complete registration" });
        return logger.error(
          `500 unable to complete registration || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
      } else {
        return database
          .query(
            `INSERT INTO public.user_detail (name, email, password, gender, phone) VALUES ($1, $2, $3, $4, $5)`,
            [username, useremail, hash, usergender, userphone]
          )
          .then((response) => {
            if (response && response.rowCount == 1) {
              let data = {
                token: jwt.sign(
                  {
                    id: response.id,
                    name: response.name,
                  },
                  config.JWTKEY,
                  {
                    expiresIn: 86400,
                  }
                ),
              };
              logger.info(
                `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
              );
              return res.status(200).json(data);
            } else {
              logger.error(
                `401 Register Failed ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
              );
              return next(createHttpError(401, "Register failed"));
            }
          })
          .catch((error) => {
            next(createHttpError(500, error));
          });
      }
    });
  }
});

router.get("/checkLogin", nocache(), verifyToken, (req, res, next) => {
  res.status(200).json({ name: req.name, id: req.id });
});

router.post("/forgetPass", nocache(), (req, res, next) => {
  const email = req.body.email;
  if (!email) {
    return next(createHttpError(400, "no email"));
  }
  console.log(req.ip);
  const link = `https://f2a.games/resetPass.html?email=`;
  let html = `<p>You've recently requested to reset your f2a account password from ${req.ip}.</p><p>Please click the following <a href='${link}'>link</a> to reset your password.</p><p>Please ignore this email if you did not request to reset your password.</p>`;
  sendMail(email, "Reset Password", {html});
});

module.exports = router;
