const database = require("../database/database");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");
const queryString = require("query-string");
const verifyToken = require("../middleware/checkUserAuthorize");
const router = require("express").Router();
const logger = require("../logger");
const nocache = require("nocache");
const sendMail = require("../email/email").sendMail;
const generateKey = require("../key/generateKey");
const nodeCache = require("node-cache");
const e = require("express");
const cache = new nodeCache({ stdTTL: 15 * 60, checkperiod: 60 });
const validator = require("../middleware/validator");
const { data } = require("../logger");


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
        `SELECT id, name, email, password, phone FROM public.user_detail where email=$1`,
        [email]
      )
      .then((results) => {
        if (bcrypt.compareSync(password, results.rows[0].password) == true) {
          let data = {
            token: jwt.sign(
              {
                id: results.rows[0].id,
                name: results.rows[0].name,
                email: results.rows[0].email,
                phone: results.rows[0].phone
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
          `${err || "500 Error"} ||  ${res.statusMessage} - ${req.originalUrl
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
    (cache.get(useremail) != code)
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
            `INSERT INTO public.user_detail (name, email, password, gender, phone) VALUES ($1, $2, $3, $4, $5) returning id, name, phone, email`,
            [username, useremail, hash, usergender, userphone]
          )
          .then((response) => {
            console.log(response)
            if (response && response.rowCount == 1) {
              let data = {
                token: jwt.sign(
                  {
                    id: response.rows[0].id,
                    name: response.rows[0].name,
                    email: response.rows[0].email,
                    phone: response.rows[0].phone
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
  res.status(200).json({ name: req.name, id: req.id, email: req.email, phone: req.phone });
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
          `UPDATE user_detail SET password = $1 WHERE email = $2;`,
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

router.post("/googleLogin", async (req, res, next) => {
  const code = req.body.code;

  const { data1 } = await axios({
    url: `https://oauth2.googleapis.com/token`,
    method: 'post',
    data: {
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/authenticate/google', //change to https://f2a.games/authenticate/google when redeployed;
      grant_type: 'authorization_code',
      code,
    },
  }).then((res) => res.data)
    .catch((error) => {
      next(createHttpError(500, error));
    });
  if (data1 == null) { return next(createHttpError(500, err)); }
  else {
    const { data2 } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${data1.access_token}`,
      },
    }).then((res) => {
      let data = {
        token: jwt.sign(
          {
            id: res.id,
            name: res.name,
          },
          config.JWTKEY,
          {
            expiresIn: 86400,
          }
        ),
      };
      return res.status(200).json(data);
    });
    if (data2 == null) { return next(createHttpError(500, err)); }
  }

})

//When API is invoked, verifyToken and userInfoValidator middleware will be invoked before allowing user_detail to be updated.
router.post("/saveUserInfo", verifyToken, validator.userInfoValidator,  async (req, res, next) => {
  //Update user's detail and return id,name,email and phone
  return database.query(`UPDATE user_detail SET name = $1, email = $2, phone = $3 WHERE id = $4 returning id, name, email, phone`, [req.body.username, req.body.email, req.body.phone, req.id])
    .then(result => {
      //if user_detail is successfully updated
      if (result.rowCount == 1) {
        //create a new token
        let data = {
          token: jwt.sign(
            {
              id: result.rows[0].id,
              name: result.rows[0].name,
              email: result.rows[0].email,
              phone: result.rows[0].phone
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
  }).catch(err => {
    next(createHttpError(500, err));
  })
})


module.exports = router;
