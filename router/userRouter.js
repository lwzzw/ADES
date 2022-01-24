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
const APP_CACHE = require('../cache');
const CACHE_KEYS = APP_CACHE.get("CACHE_KEYS");
const validator = require("../middleware/validator");
const axios = require("axios");
const recaptchaKey = config.RECAPTCHA_SECRET;
var qs = require("qs");

var passport = require("passport");
var FacebookStrategy = require("passport-facebook");
const { validateRegister } = require("../middleware/validator");

passport.use(
  new FacebookStrategy(
    {
      clientID: config.FACEBOOK_APP_ID,
      clientSecret: config.FACEBOOK_APP_SECRET,
      callbackURL: "https://f2a.games/user/oauth2/redirect/facebook",
      profileFields: ["displayName", "email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(profile);
      try {
        database
          .query(
            `SELECT name, email, phone, gender FROM public.user_detail where email = $1`,
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
                    gender: response.rows[0].gender || null,
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
                  `INSERT INTO public.user_detail (name, email, auth_type) VALUES ($1, $2, $3) returning id, name, email, gender`,
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
                          gender: null,
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
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

router.get(
  "/login/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

router.get(
  "/oauth2/redirect/facebook",
  passport.authenticate("facebook", {
    failureRedirect: "/login.html",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/index.html?token=" + req.user.token);
  }
);

router.post("/login", async (req, res, next) => {
  if (!req.body.captcha) {
    return res.json({ success: false, msg: "Capctha is not checked" });
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaKey}&response=${req.body.captcha}`;

  var options = {
    method: "POST",
    url: verifyUrl,
  };
  let verify = await axios(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      return next(createHttpError(500, error));
    });
  if (!verify.success && verify.success === undefined) {
    return res.json({ success: false, msg: "Capctha cannot verify" });
  } else if (verify.score < 0.4) {
    return res.json({ success: false, msg: "You are robot" });
  }
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
        `SELECT user_detail.id, user_detail.name, user_detail.email, user_detail.phone, user_detail.auth_type, user_auth.password, user_detail.gender, user_detail.role
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
                return next(
                  createHttpError(401, "Please enter correct Secret Code")
                );
              }
            }
          });
        if (results.rows[0].auth_type == "1") {
          if (bcrypt.compareSync(password, results.rows[0].password) == true) {
            let data = {
              success: true,
              token: jwt.sign(
                {
                  id: results.rows[0].id,
                  name: results.rows[0].name,
                  email: results.rows[0].email,
                  phone: results.rows[0].phone,
                  gender: results.rows[0].gender,
                  role: results.rows[0].role,
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
            res.cookie("token", data.token, {
              maxAge: 86400000,
              httpOnly: true,
            });
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

router.post("/register", validateRegister,(req, res, next) => {
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
  const CODE_CACHE = APP_CACHE.get(`${CACHE_KEYS.USERS.EMAILS}.${useremail}`);
  if (
    username == null ||
    useremail == null ||
    userpassword == null ||
    userphone == null ||
    usergender == null ||
    !reEmail.test(useremail) ||
    !rePassword.test(userpassword) ||
    CODE_CACHE != code
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
          .transactionQuery(`select * from insert_user($1, $2, $3, $4, $5)`, [
            username,
            useremail,
            hash,
            usergender,
            userphone,
          ])
          .then((response) => {
            if (response && response.rowCount == 1) {
              let data = {
                token: jwt.sign(
                  {
                    id: response.rows[0].nid,
                    name: response.rows[0].uname,
                    email: response.rows[0].uemail,
                    phone: response.rows[0].uphone,
                    gender: response.rows[0].ugender,
                    role: response.rows[0].urole,
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
              APP_CACHE.del(`${CACHE_KEYS.USERS.EMAILS}.${useremail}`);//delete cache after register
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
  res.status(200).json({
    name: req.name,
    id: req.id,
    email: req.email,
    phone: req.phone,
    gender: req.gender,
    role: req.role,
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
      APP_CACHE.set(`${CACHE_KEYS.USERS.FORGETPASS}.${email}`, resetCode, 15*60);//set resetcode to cache and the ttl is 15 minutes
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
    const USERCODE = APP_CACHE.get(`${CACHE_KEYS.USERS.FORGETPASS}.${email}`);
    if (USERCODE == code) {
      if (!rePassword.test(password)) {
        return next(createHttpError(400, "Wrong password format"));
      }
      APP_CACHE.del(`${CACHE_KEYS.USERS.FORGETPASS}.${email}`);//delete user code after verify
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
    console.log(code);
    APP_CACHE.set(`${CACHE_KEYS.USERS.EMAILS}.${email}`, code, 15*60);//set code ttl to 15 minutes
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
        `UPDATE user_detail SET name = $1, phone = $2, gender = $3 WHERE id = $4 returning id, name, email, phone, gender`,
        [req.body.username, req.body.phone, req.body.gender, req.id]
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

router.post("/supportRequest", verifyToken, validator.supportformValidator, nocache(), async (req, res, next) => {
  const email = req.body.email;
  const subject = req.body.subject;
  const message = req.body.message;
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  let string = "";
  for (var i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return database
    .query(
      `INSERT INTO support_request (request_id, email, subject, message) VALUES($1,$2,$3,$4)`,
      [string, email, subject, message]
    )
    .then((result) => {
      if (result.rowCount == 1) {
        const html = `<h2>REQUEST NUMBER : ${string}</h2><p>This request is from user ${email}</p><p>The request is : ${message}</p>`;
        receiveMail(subject, { html }, (err, info) => {
          if (err) {
            console.log(err);
            return next(createHttpError(500, err));
          } else {
            res.status(200).json({ status: "done" });
          }
        });
      } else {
        next(createHttpError(500, err));
      }
    })
    .catch((err) => {
      next(createHttpError(500, err));
    });
});

//PayPal login to get user's access_token
router.get("/login/callback", (req, res, next) => {
  //data to be sent to PayPal's authentication API in order to get the user's access_token
  var data = qs.stringify({
    grant_type: "authorization_code",
    code: req.query.code,
  });
  var options = {
    method: "post",
    url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    headers: {
      Authorization: `Basic ${config.PAYPAL_SECRET}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie:
        "LANG=en_US%3BUS; cookie_check=yes; d_id=fd5c4b92473a41eba8a7b92593bcc19a1642746243115; enforce_policy=ccpa; ts=vreXpYrS%3D1737442687%26vteXpYrS%3D1642750087%26vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2%26vtyp%3Dreturn; ts_c=vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2; tsrce=unifiedloginnodeweb; x-cdn=fastly:QPG; x-pp-s=eyJ0IjoiMTY0Mjc0ODI4NzYzNCIsImwiOiIwIiwibSI6IjAifQ",
    },
    data: data,
  };

  return axios(options)
    .then(function (response) {
      //the user's access_token is passed into the getPaypalUserIdentity function in order to retrieve the user's paypal profile information
      getPaypalUserIdentity(response.data.access_token)
        .then((response) => {
          let username = response.name;
          let email = response.emails[0].value;
          //after getting the user's paypal profile information, it is then used to create or login into the account
          try {
            //database checks if the user is already a registered user
            database
              .query(
                `SELECT id, name, email, phone, gender FROM public.user_detail where email = $1`,
                [email]
              )
              .then((results) => {
                if (results && results.rowCount == 1) {
                  //if the user is registered, the user will be logged in
                  let data = {
                    token: jwt.sign(
                      {
                        id: results.rows[0].id,
                        name: results.rows[0].name,
                        email: results.rows[0].email,
                        phone: results.rows[0].phone || null,
                        gender: results.rows[0].gender || null,
                      },
                      config.JWTKEY,
                      {
                        expiresIn: 86400,
                      }
                    ),
                  };
                  return res.status(200).json(data);
                } else {
                  console.log("register user");
                  // else if the user is not a registered user, an account will be create for the user
                  return database
                    .query(
                      `INSERT INTO public.user_detail (name, email, auth_type) VALUES ($1, $2, $3) returning id, name, email, gender`,
                      [username, email, 2]
                    )
                    .then((response) => {
                      if (response && response.rowCount == 1) {
                        //after the account has been successfully created, the jwt token will be signed
                        let data = {
                          token: jwt.sign(
                            {
                              id: response.rows[0].id,
                              name: response.rows[0].name,
                              email: response.rows[0].email,
                              phone: null,
                              gender: null,
                            },
                            config.JWTKEY,
                            {
                              expiresIn: 86400,
                            }
                          ),
                        };
                        return res.status(200).json(data);
                      }
                    });
                }
              })
              .catch((err) => {
                //error occur when checking if the user is registered
                console.log(err);
                next(createHttpError(500, error));
                return err;
              });
          } catch (err) {
            //error occur when try block fails
            console.log(err);
            next(createHttpError(500, error));
            return err;
          }
        })
        .catch((err) => {
          //error occur when getting user's paypal identity
          if (err) {
            throw new Error(JSON.stringify(err));
          }
          return err;
        });
    })
    .catch(function (error) {
      //axios error
      next(createHttpError(500, error));
    });
});

//Checks if the user's secret code is correct
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

//gets user's paypal profile information via the access_token
function getPaypalUserIdentity(access_token) {
  var options = {
    method: "get",
    url: "https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1",
    headers: {
      Authorization: `Bearer ${access_token}`,
      Cookie:
        "LANG=en_US%3BUS; cookie_check=yes; d_id=fd5c4b92473a41eba8a7b92593bcc19a1642746243115; enforce_policy=ccpa; ts=vreXpYrS%3D1737442687%26vteXpYrS%3D1642750087%26vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2%26vtyp%3Dreturn; ts_c=vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2; tsrce=unifiedloginnodeweb; x-cdn=fastly:QPG; x-pp-s=eyJ0IjoiMTY0Mjc0ODI4NzYzNCIsImwiOiIwIiwibSI6IjAifQ",
    },
  };

  return axios(options)
    .then(function (response) {
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
