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
const receiveMail = require("../email/email").receiveMail;
const generateKey = require("../key/generateKey");
const nodeCache = require("node-cache");
const cache = new nodeCache({ stdTTL: 15 * 60, checkperiod: 60 });
const validator = require("../middleware/validator");
const axios = require("axios");

var passport = require("passport");
var FacebookStrategy = require("passport-facebook");

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env["FACEBOOK_APP_ID"] || "459608262423566",
      clientSecret:
        process.env["FACEBOOK_APP_SECRET"] ||
        "76c7a3012d982c7ab1cbc66e0d3a5ed2",
      callbackURL: "https://f2a.games/user/oauth2/redirect/facebook",
      profileFields: ['displayName', 'email']
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      try {
        database
          .query(
            `SELECT name, email, phone FROM public.user_detail where email = $1`,
            [profile.emails[0].value]
          )
          .then((response) => {
            if (response && response.rowCount == 1) {
              //checks if the google account is already registered
              let data = {
                token: jwt.sign(
                  {
                    id: response.rows[0].id,
                    name: response.rows[0].name,
                    email: response.rows[0].email,
                    phone: response.rows[0].phone || null,
                  },
                  config.JWTKEY,
                  {
                    expiresIn: 86400,
                  }
                ),
              };
              return cb(null, data);
            } else {
              //else they will be registerd
              return database
                .query(
                  `INSERT INTO public.user_detail (name, email, auth_type) VALUES ($1, $2, $3) returning id, name, email`,
                  [profile.displayName, profile.emails[0].value, 2]
                )
                .then((response) => {
                  // console.log(response);
                  if (response && response.rowCount == 1) {
                    let data = {
                      token: jwt.sign(
                        {
                          id: response.rows[0].id,
                          name: response.rows[0].name,
                          email: response.rows[0].email,
                          phone: null,
                        },
                        config.JWTKEY,
                        {
                          expiresIn: 86400,
                        }
                      ),
                    };
                    return cb(null, data);
                  }
                });
            }
          })
          .catch((err) => {
            return cb(err);
          });
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

router.get(
  "/login/facebook",
  passport.authenticate("facebook", {
    scope: [ "email"],
  })
);
router.get(
  "/oauth2/redirect/facebook",
  passport.authenticate("facebook", {
    failureRedirect: "/login.html",
    failureMessage: true
  }),
  function (req, res) {
    console.log(req);
    console.log("here");
    res.redirect("/");
  }
);
router.post("/login", async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const secretCode = req.body.secretCode;
  if (email == null || password == null) {
    logger.error(
      `401 Empty Credentials ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return next(createHttpError(401, "empty credentials"));
  } else {
    return database
      .query(
        `SELECT user_detail.id, user_detail.name, user_detail.email, user_detail.phone, user_detail.auth_type, user_auth.password, user_detail.gender
         FROM public.user_detail INNER JOIN user_auth ON user_detail.id = user_auth.userid
         where email=$1`,
        [email]
      )
      .then(async (results) => {
        await database
          .query(
            `SELECT secret_key FROM twofactor_authenticator WHERE belong_to = $1`,
            [results.rows[0].id]
          )
          .then(async (auth) => {
            if (auth.rows.length == 1) {
              let authResult = await validateSecretKey(
                secretCode,
                auth.rows[0].secret_key
              );
              if (authResult.toLowerCase() == "false") {
                return next(createHttpError(401, "Wrong Secret Code"));
              }
            }
          });
        if (results.rows[0].auth_type == "1") {
          if (bcrypt.compareSync(password, results.rows[0].password) == true) {
            let data = {
              token: jwt.sign(
                {
                  id: results.rows[0].id,
                  name: results.rows[0].name,
                  email: results.rows[0].email,
                  phone: results.rows[0].phone,
                  gender: results.rows[0].gender,
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
  const code = req.body.code;
  let reEmail = new RegExp(
    `^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`
  );
  let rePassword = new RegExp(`^.{8,}$`);
  if (
    username == null ||
    useremail == null ||
    userpassword == null ||
    userphone == null ||
    usergender == null ||
    !reEmail.test(useremail) ||
    !rePassword.test(userpassword) ||
    cache.get(useremail) != code
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
          .transactionQuery(`select insert_user($1, $2, $3, $4, $5) `, [
            username,
            useremail,
            hash,
            usergender,
            userphone,
          ])
          .then((response) => {
            console.log(response);
            if (response && response.rowCount == 1) {
              let data = {
                token: jwt.sign(
                  {
                    id: response.rows[0].id,
                    name: response.rows[0].name,
                    email: response.rows[0].email,
                    phone: response.rows[0].phone,
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
              cache.del(useremail);
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
  res
    .status(200)
    .json({
      name: req.name,
      id: req.id,
      email: req.email,
      phone: req.phone,
      gender: req.gender,
    });
});

router.post("/forgetPass", nocache(), async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return next(createHttpError(400, "no email"));
    }
    let reEmail = new RegExp(
      `^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`
    );
    if (!reEmail.test(email)) {
      return next(createHttpError(400, "wrong email format"));
    }
    let isEmailExist = await database
      .query(`SELECT 1 from user_detail WHERE email = $1`, [email])
      .then((result) => result.rows);
    if (isEmailExist.length != 1) {
      return next(createHttpError(404, "User email not exist"));
    }
    const resetCode = generateKey(20);
    const link = `https://f2a.games/resetPass.html?email=${email}&code=${resetCode}`;
    let html = `<p>You've recently requested to reset your f2a account password from ${req.ip}.</p><p>Please click the following <a href='${link}'>link</a> to reset your password.</p><p>Please ignore this email if you did not request to reset your password.</p>`;
    sendMail(email, "Reset Password", { html }, () => {
      cache.set(email, resetCode);
      res.status(200).json({ status: "done" });
    });
  } catch (err) {
    console.log(err);
    next(createHttpError(500, err));
  }
});

router.post("/verifyResetPass", nocache(), async (req, res, next) => {
  try {
    const email = req.body.email;
    const code = req.body.code;
    const password = req.body.password;
    let rePassword = new RegExp(`^.{8,}$`);
    if (cache.get(email) == code) {
      if (!rePassword.test(password)) {
        return next(createHttpError(400, "Wrong password format"));
      }
      cache.del(email);
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          console.log("Error on hashing password");
          logger.error(
            `500 unable to complete registration || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
          );
          return next(
            createHttpError(500, "Unable to complete reset password")
          );
        }
        await database.query(
          `UPDATE user_auth SET password = $1 FROM (SELECT id, email FROM user_detail) AS subquery
          WHERE  user_auth.userid = subquery.id AND subquery.email = $2`,
          [hash, email]
        );
        res.status(200).json({ status: "done" });
      });
    } else {
      return next(createHttpError(400, "Wrong code"));
    }
  } catch (err) {
    console.log(err);
    next(createHttpError(500, err));
  }
});

router.post("/verifyEmail", async (req, res, next) => {
  try {
    const email = req.body.email;
    let reEmail = new RegExp(
      `^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$`
    );
    if (!reEmail.test(email)) {
      return next(createHttpError(400, "wrong email format"));
    }
    let isEmailExist = await database
      .query(`SELECT 1 from user_detail WHERE email = $1`, [email])
      .then((result) => result.rows);
    if (isEmailExist.length != 0) {
      return next(createHttpError(400, "This email already exist"));
    }
    const code = generateKey(20);
    cache.set(email, code);
    const html = `<p>Your verification code is <h1>${code}</h1></p><p>Enter this code in the register page within 15 minutes to continue register.</p><p>Please ignore this email if you did not request to register account.</p><p>If you have any questions, send us an email <a href="mailto:support@f2a.games">support@f2a.games</a>.</p>`;
    sendMail(email, "Verify Your Email", { html }, (err, info) => {
      if (err) {
        console.log(err);
        return next(createHttpError(500, err));
      } else {
        res.status(200).json({ status: "done" });
      }
    });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, err));
  }
});
//When API is invoked, verifyToken and userInfoValidator middleware will be invoked before allowing user_detail to be updated.
router.post(
  "/saveUserInfo",
  verifyToken,
  validator.userInfoValidator,
  async (req, res, next) => {
    //Update user's detail and return id,name,email and phone
    return database
      .query(
        `UPDATE user_detail SET name = $1, email = $2, phone = $3 WHERE id = $4 returning id, name, email, phone`,
        [req.body.username, req.body.email, req.body.phone, req.id]
      )
      .then((result) => {
        //if user_detail is successfully updated
        if (result.rowCount == 1) {
          //create a new token
          let data = {
            token: jwt.sign(
              {
                id: result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].email,
                phone: result.rows[0].phone,
                gender: result.rows[0].gender,
              },
              config.JWTKEY,
              {
                expiresIn: 86400,
              }
            ),
          };
          //return the token
          return res.status(200).json(data);
        } else {
          return res.status(204).end();
        }
      })
      .catch((err) => {
        next(createHttpError(500, err));
      });
  }
);

router.post("/supportRequest", nocache(), async (req, res, next) => {
  const email = req.body.email;
  const subject = req.body.subject;
  const message = req.body.message;

  const html = `<p>This request is from user ${email}</p><p>The request is : ${message}</p>`;
  receiveMail(subject, { html }, (err, info) => {
    if (err) {
      console.log(err);
      return next(createHttpError(500, err));
    } else {
      res.status(200).json({ status: "done" });
    }
  });
});

function validateSecretKey(secretCodeInput, secretKey) {
  var options = {
    method: "GET",
    url: "https://google-authenticator.p.rapidapi.com/validate/",
    params: { code: secretCodeInput, secret: secretKey },
    headers: {
      "x-rapidapi-host": "google-authenticator.p.rapidapi.com",
      "x-rapidapi-key": "a7cc9771dbmshdb30f345bae847ep1fb8d8jsn5d90b789d2ea",
    },
  };
  return axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response.data));
      }
      return error.response.data;
    });
}

module.exports = router;
