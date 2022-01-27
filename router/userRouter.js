const database = require('../database/database')
const createHttpError = require('http-errors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const config = require('../config')
const verifyToken = require('../middleware/checkUserAuthorize')
const router = require('express').Router()
const logger = require('../logger')
const nocache = require('nocache')
const sendMail = require('../email/email').sendMail
const receiveMail = require('../email/email').receiveMail
const generateKey = require('../key/generateKey')
const APP_CACHE = require('../cache')
const CACHE_KEYS = APP_CACHE.get('CACHE_KEYS')
const validator = require('../middleware/validator')
const axios = require('axios')
const recaptchaKey = config.RECAPTCHA_SECRET

// user login as normal user
router.post('/login', validator.verifypassword, async (req, res, next) => {
  if (!req.body.captcha) {
    // google recaptcha
    return res.json({ success: false, msg: 'Captcha is not checked' })
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaKey}&response=${req.body.captcha}` // url that verify the recaptcha

  const options = {
    method: 'POST',
    url: verifyUrl
  }

  const verify = await axios(options)
    .then(function (response) {
      return response.data
    })
    .catch(function (error) {
      return next(createHttpError(500, error))
    }) // send the request

  // check the user
  if (!verify.success && verify.success === undefined) {
    return res.json({ success: false, msg: 'Captcha cannot verify' })
  } else if (verify.score < 0.4) {
    return res.json({ success: false, msg: 'You are a robot' })
  }

  // start login
  const email = req.body.email
  const password = req.body.password
  const secretCode = req.body.secretCode
  if (email == null || password == null) {
    logger.error(
      `401 Empty Credentials ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
    return next(createHttpError(401, 'empty credentials'))
  } else {//gets user details
    return database
      .query(
        `SELECT user_detail.id, user_detail.name, user_detail.email, user_detail.phone, user_detail.auth_type, user_auth.password, user_detail.gender, user_detail.role
         FROM public.user_detail INNER JOIN user_auth ON user_detail.id = user_auth.userid
         where email=$1`,
        [email]
      )
      .then(async (result) => {//attempts to get the user's secret_key
        await database
          .query(
            'SELECT secret_key FROM twofactor_authenticator WHERE belong_to = $1',
            [result.rows[0].id]
          )
          .then(async (auth) => {//if user has a secret_key
            if (auth.rows.length == 1) {//validate the user's secretCode input with the google-authenticator API.
              const authResult = await validator.validateSecretKey(
                secretCode,
                auth.rows[0].secret_key
              )
              if (authResult.toLowerCase() == 'false') {
                return next(
                  createHttpError(401, 'Please enter correct Secret Code')
                )
              }
            }
          })//if the user's secret code has been validated and its correct, it will check if the user is a normal user
        if (result.rows[0].auth_type == '1') {
          if (bcrypt.compareSync(password, result.rows[0].password) == true) {
            const data = {
              success: true,
              token: jwt.sign(
                {
                  id: result.rows[0].id,
                  name: result.rows[0].name,
                  email: result.rows[0].email,
                  phone: result.rows[0].phone,
                  gender: result.rows[0].gender,
                  role: result.rows[0].role
                },
                config.JWTKEY,
                {
                  expiresIn: 86400
                }
              )
            }

            logger.info(
              `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            )
            res.cookie('token', data.token, {
              maxAge: 86400000,
              httpOnly: true
            })
            return res.status(200).json(data)
          } else {
            logger.error(
              `401 Login Failed ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            )
            return next(createHttpError(401, 'Email or password is invalid'))
          }
        }
      })
      .catch((err) => {
        next(createHttpError(401, 'Email or password is invalid'))
        logger.error(
          `${err || '401 Login Failed'} ||  ${res.statusMessage} - ${req.originalUrl
          } - ${req.method} - ${req.ip}`
        )
      })
  }
})

// register user
router.post('/register', validator.validateRegister, (req, res, next) => {
  const username = req.body.username
  const useremail = req.body.useremail
  const userpassword = req.body.userpassword
  const userphone = req.body.userphone
  const usergender = req.body.usergender
  const code = req.body.code
  const CODE_CACHE = APP_CACHE.get(`${CACHE_KEYS.USERS.EMAILS}.${useremail}`)// get the verify email code
  if (
    username == null ||
    useremail == null ||
    userpassword == null ||
    userphone == null ||
    usergender == null ||
    CODE_CACHE != code// if the code is different then return 401
  ) {
    logger.error(
      `401 Empty Credentials ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
    return next(createHttpError(401, 'empty credentials'))
  } else {
    bcrypt.hash(userpassword, 10, async (err, hash) => {
      if (err) {
        console.log('Error on hashing password')
        res
          .status(500)
          .json({ statusMessage: 'Unable to complete registration' })
        return logger.error(
          `500 unable to complete registration || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        )
      } else {
        return database
          .transactionQuery('select * from insert_user($1, $2, $3, $4, $5)', [
            username,
            useremail,
            hash,
            usergender,
            userphone
          ])
          .then((result) => {
            if (result && result.rowCount == 1) {
              const data = {
                token: jwt.sign(
                  {
                    id: result.rows[0].nid,
                    name: result.rows[0].uname,
                    email: result.rows[0].uemail,
                    phone: result.rows[0].uphone,
                    gender: result.rows[0].ugender,
                    role: result.rows[0].urole
                  },
                  config.JWTKEY,
                  {
                    expiresIn: 86400
                  }
                )
              }
              logger.info(
                `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
              )
              APP_CACHE.del(`${CACHE_KEYS.USERS.EMAILS}.${useremail}`) // delete cache after register
              return res.status(200).json(data)
            } else {
              logger.error(
                `401 Register Failed ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
              )
              return next(createHttpError(401, 'Register failed'))
            }
          })
          .catch((error) => {
            next(createHttpError(500, error))
          })
      }
    })
  }
})

// check user if they are already login and return the user detail
router.get('/checkLogin', nocache(), verifyToken, (req, res, next) => {
  res.status(200).json({
    name: req.name,
    id: req.id,
    email: req.email,
    phone: req.phone,
    gender: req.gender,
    role: req.role
  })
})

// user forget password
router.post('/forgetPass', validator.verifyemail, nocache(), async (req, res, next) => {
  try {
    const email = req.body.email
    if (!email) {
      return next(createHttpError(400, 'no email'))
    }
    const isEmailExist = await database
      .query('SELECT 1 from user_detail WHERE email = $1', [email])
      .then((result) => result.rows)
    if (isEmailExist.length != 1) {
      return next(createHttpError(404, 'User email not exist'))// if the user email not exist return 404
    }
    const resetCode = generateKey(20)
    const link = `https://f2a.games/resetPass.html?email=${email}&code=${resetCode}`
    const html = `<p>You've recently requested to reset your f2a account password from ${req.ip}.</p><p>Please click the following <a href='${link}'>link</a> to reset your password.</p><p>Please ignore this email if you did not request to reset your password.</p>`
    sendMail(email, 'Reset Password', { html }, () => {
      APP_CACHE.set(
        `${CACHE_KEYS.USERS.FORGETPASS}.${email}`,
        resetCode,
        15 * 60
      ) // set resetcode to cache and the ttl is 15 minutes
      res.status(200).json({ status: 'done' })
    })// send the email to user
  } catch (err) {
    console.log(err)
    next(createHttpError(500, err))
  }
})

// verify user reset password
router.post('/verifyResetPass', validator.verifypassword, validator.verifyemail, nocache(), async (req, res, next) => {
  try {
    const email = req.body.email
    const code = req.body.code
    const password = req.body.password
    const USERCODE = APP_CACHE.get(`${CACHE_KEYS.USERS.FORGETPASS}.${email}`)// get the code from cache
    if (USERCODE == code) {
      APP_CACHE.del(`${CACHE_KEYS.USERS.FORGETPASS}.${email}`) // delete user code after verify
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          console.log('Error on hashing password')
          logger.error(
            `500 unable to complete registration || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
          )
          return next(
            createHttpError(500, 'Unable to complete reset password')
          )
        }
        await database.query(
          `UPDATE user_auth SET password = $1 FROM (SELECT id, email FROM user_detail) AS subquery
          WHERE  user_auth.userid = subquery.id AND subquery.email = $2`,
          [hash, email]
        )
        res.status(200).json({ status: 'done' })
      })
    } else {
      return next(createHttpError(400, 'Wrong code'))// if user enter wrong code return 400
    }
  } catch (err) {
    console.log(err)
    next(createHttpError(500, err))
  }
})

// verify the email when user register
router.post('/verifyEmail', validator.verifyemail, async (req, res, next) => {
  try {
    const email = req.body.email
    const isEmailExist = await database
      .query('SELECT 1 from user_detail WHERE email = $1', [email])
      .then((result) => result.rows)
    if (isEmailExist.length != 0) {
      return next(createHttpError(400, 'This email already exist'))// return 400 if the email exist
    }
    const code = generateKey(20)// generate the code
    APP_CACHE.set(`${CACHE_KEYS.USERS.EMAILS}.${email}`, code, 15 * 60) // set code ttl to 15 minutes
    const html = `<p>Your verification code is <h1>${code}</h1></p><p>Enter this code in the register page within 15 minutes to continue register.</p><p>Please ignore this email if you did not request to register account.</p><p>If you have any questions, send us an email <a href="mailto:support@f2a.games">support@f2a.games</a>.</p>`
    sendMail(email, 'Verify Your Email', { html }, (err, info) => {
      if (err) {
        console.log(err)
        return next(createHttpError(500, err))
      } else {
        res.status(200).json({ status: 'done' })
      }
    })// send the email
  } catch (err) {
    console.log(err)
    return next(createHttpError(500, err))
  }
})
// When API is invoked, verifyToken and userInfoValidator middleware will be invoked before allowing user_detail to be updated.
router.post(
  '/saveUserInfo',
  verifyToken,
  validator.validateUsername,
  validator.validatePhoneNo,
  validator.validateGender,
  async (req, res, next) => {
    // Update user's detail and return id,name,email and phone
    return database
      .query(
        'UPDATE user_detail SET name = $1, phone = $2, gender = $3 WHERE id = $4 returning id, name, email, phone, gender',
        [req.body.username, req.body.phone, req.body.gender, req.id]
      )
      .then((result) => {
        // if user_detail is successfully updated
        if (result.rowCount == 1) {
          // create a new token
          const data = {
            token: jwt.sign(
              {
                id: result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].email,
                phone: result.rows[0].phone,
                gender: result.rows[0].gender
              },
              config.JWTKEY,
              {
                expiresIn: 86400
              }
            )
          }
          // return the token
          return res.status(200).json(data)
        } else {
          return res.status(204).end()
        }
      })
      .catch((err) => {
        next(createHttpError(500, err))
      })
  }
)

router.post(
  '/supportRequest',
  verifyToken,
  validator.supportformValidator,
  nocache(),
  async (req, res, next) => {
    const email = req.body.email
    const subject = req.body.subject
    const message = req.body.message
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const charactersLength = characters.length
    let string = ''
    for (let i = 0; i < 6; i++) {
      string += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return database
      .query(
        'INSERT INTO support_request (request_id, email, subject, message) VALUES($1,$2,$3,$4)',
        [string, email, subject, message]
      )
      .then((result) => {
        if (result.rowCount == 1) {
          const html = `<h2>REQUEST NUMBER : ${string}</h2><p>This request is from user ${email}</p><p>The request is : ${message}</p>`
          receiveMail(subject, { html }, (err, info) => {
            if (err) {
              console.log(err)
              return next(createHttpError(500, err))
            } else {
              res.status(200).json({ status: 'done' })
            }
          })
        } else {
          next(createHttpError(500, err))
        }
      })
      .catch((err) => {
        next(createHttpError(500, err))
      })
  }
)

router.post("/reset2FA", nocache(), async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return next(createHttpError(400, "Email is empty !"));
    }
    let reEmail = new RegExp(
      /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]+$/
    );
    if (!reEmail.test(email)) {
      return next(createHttpError(400, "Please verify that the email you entered is correct !"));//return 400 if the user enter wrong email format
    }
    //check if email is registered and have 2-fa enabled.
    let isEmailExist = await database
      .query(`SELECT 1, user_detail.email, twofactor_authenticator.secret_key from user_detail inner join twofactor_authenticator on user_detail.id = twofactor_authenticator.belong_to WHERE email = $1`, [email])
      .then((result) => result.rows);
    if (isEmailExist.length != 1) {
      return next(createHttpError(400, "User is not registered or does not have 2-fa enabled"));//if the user does not have 2fa enabled or registered return 400
    }
    const resetCode = generateKey(20); //generate code
    const link = `http://localhost:5000/reset_fa.html?email=${email}&code=${resetCode}`; //set reset link
    //set email message
    let html = `<p>You've recently requested to reset your two-factor authenticator from f2a.games</p><p>Please click the following <a href='${link}'>link</a> to reset your authenticator.</p><p>Please ignore this email if you did not request to reset your authenticator.</p>`;
    sendMail(email, "Reset 2-FA", { html }, () => {
      APP_CACHE.set(
        `${CACHE_KEYS.USERS.TWOFACODE}.${email}`,
        resetCode,
        15 * 60
      ); //set resetcode to cache and the ttl is 15 minutes
      res.status(200).json({ status: "done", cache: APP_CACHE.get(`${CACHE_KEYS.USERS.TWOFACODE}.${email}`) });
    });//send the email to user
  } catch (err) {
    console.log(err);
    next(createHttpError(500, err));
  }
});

router.post("/reset2FA/confirmed", nocache(), async (req, res, next) => {
  try {
    const email = req.body.email;
    const code = req.body.code;
    const password = req.body.password;
    const rePassword = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/); //password regex : Minimum eight characters, at least one letter and one number:
    const USERCODE = APP_CACHE.get(`${CACHE_KEYS.USERS.TWOFACODE}.${email}`);//get the code from cache
    if (USERCODE == code) {
      if (!rePassword.test(password)) {
        return next(createHttpError(400, "Password entered does not meet the requirements"));
      }
      //gets the password of the requesting user
      database.query(`SELECT password FROM user_auth inner join user_detail ON user_detail.id = user_auth.userid WHERE user_detail.email = $1`, [email])
        .then(result => {
          //verify if the password is correct
          if (bcrypt.compareSync(password, result.rows[0].password) == true) {
            //delete user's secret key
            database.query(`DELETE FROM twofactor_authenticator USING user_detail WHERE user_detail.email = $1 `, [email])
              .then(result => {
                console.log(result)
                APP_CACHE.del(`${CACHE_KEYS.USERS.TWOFACODE}.${email}`); //delete user's verification code after successfully resetting 2-fa
                res.status(200).json({ status: "done" });
              }).catch(error => {
                console.log(error)
                throw new Error(error)
              })
          } else {
            throw new Error('Wrong password entered')
          }
        }).catch(error => {
          console.log(error)
          next(createHttpError(401, error));
        })
    } else {
      return next(createHttpError(400, "Wrong verification code"));//if user enter wrong code return 400
    }
  } catch (err) {
    console.log(err);
    next(createHttpError(500, err));
  }
});

module.exports = router;
