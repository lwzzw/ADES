const router = require('express').Router()
const config = require('../config')
const database = require('../database/database')
const verifyToken = require('../middleware/checkUserAuthorize')
const createHttpError = require('http-errors')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const queryString = require('query-string')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook')
const qs = require('qs')

// when user clicks on google login
router.get('/google/url', (req, res, next) => {
  const stringifiedParams = queryString.stringify({
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: 'https://f2a.games/authenticate/google', // change to https://f2a.games/authenticate/google when redeployed
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' '), // space seperated string
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  })
  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`
  return res.redirect(googleLoginUrl)
})

// authenticate google tokens and get user information
router.get('/google', async (req, res, next) => {
  const code = req.query.code
  console.log(code)

  // this gets the access code from the url that google sends after it redirects back to our website
  const data1 = await axios({
    url: 'https://oauth2.googleapis.com/token',
    method: 'post',
    data: {
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://f2a.games/authenticate/google', // change to https://f2a.games/authenticate/google when redeployed;
      grant_type: 'authorization_code',
      code
    }
  }).then((response) => response.data) // returns another url with access token
    .catch((error) => {
      next(createHttpError(500, error))
    })
  console.log(data1)
  if (data1 == null) { return next(createHttpError(500, 'no data')) } else {
    // using the access token to authorize our website to get the userinfo of the google account
    const data2 = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${data1.access_token}`
      }
    }).then((response) => {
      return database
        .query('SELECT name, email, phone FROM public.user_detail where email = $1', [response.data.email])
        .then((response) => {
          if (response && response.rowCount == 1) { // checks if the google account is already registered
            const data = {
              token: jwt.sign(
                {
                  id: response.rows[0].id,
                  name: response.rows[0].name,
                  email: response.rows[0].email,
                  phone: response.rows[0].phone
                },
                config.JWTKEY,
                {
                  expiresIn: 86400
                }
              )
            }
            return data
          } else { // else they will be registerd
            return database
              .query(
                'INSERT INTO public.user_detail (name, email, auth_type) VALUES ($1, $2, $3) returning id, name, phone, email',
                [response.data.given_name, response.data.email, 2]
              )
              .then((response) => {
                console.log(response)
                if (response && response.rowCount == 1) {
                  const data = {
                    token: jwt.sign(
                      {
                        id: response.rows[0].id,
                        name: response.rows[0].name,
                        email: response.rows[0].email,
                        phone: response.rows[0].phone
                      },
                      config.JWTKEY,
                      {
                        expiresIn: 86400
                      }
                    )
                  }
                  return data
                }
              })
          }
        })
    })
    res.redirect('/index.html?token=' + data2.token)
    return res.status(200).json(data2.token)
  }
})

// when user click facebook login
router.get(
  '/login/facebook',
  passport.authenticate('facebook', {
    scope: ['email']
  })
)

// after facebook login
router.get(
  '/oauth2/redirect/facebook',
  passport.authenticate('facebook', {
    failureRedirect: '/login.html',
    failureMessage: true
  }),
  function (req, res) {
    res.redirect('/index.html?token=' + req.user.token)
  }
)

// for facebook login
passport.use(
  new FacebookStrategy(
    {
      clientID: config.FACEBOOK_APP_ID,
      clientSecret: config.FACEBOOK_APP_SECRET,
      callbackURL: 'https://f2a.games/user/oauth2/redirect/facebook',
      profileFields: ['displayName', 'email']
    },
    function (accessToken, refreshToken, profile, cb) {
      try {
        database
          .query(
            'SELECT name, email, phone, gender FROM public.user_detail where email = $1',
            [profile.emails[0].value]
          )
          .then((response) => {
            if (response && response.rowCount == 1) {
              // checks if the facebook account is already registered
              const data = {
                token: jwt.sign(
                  {
                    id: response.rows[0].id,
                    name: response.rows[0].name,
                    email: response.rows[0].email,
                    phone: response.rows[0].phone || null,
                    gender: response.rows[0].gender || null
                  },
                  config.JWTKEY,
                  {
                    expiresIn: 86400
                  }
                )
              }
              return cb(null, data)
            } else {
              // if the user dont have a account then store the user detail to database
              return database
                .query(
                  'INSERT INTO public.user_detail (name, email, auth_type) VALUES ($1, $2, $3) returning id, name, email, gender',
                  [profile.displayName, profile.emails[0].value, 2]
                )
                .then((response) => {
                  if (response && response.rowCount == 1) {
                    const data = {
                      token: jwt.sign(
                        {
                          id: response.rows[0].id,
                          name: response.rows[0].name,
                          email: response.rows[0].email,
                          phone: null,
                          gender: null
                        },
                        config.JWTKEY,
                        {
                          expiresIn: 86400
                        }
                      )
                    }
                    return cb(null, data)
                  }
                })
            }
          })
          .catch((err) => {
            return cb(err)
          })
      } catch (err) {
        return cb(err)
      }
    }
  )
)
passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

// PayPal login to get user's access_token
router.get('/login/callback', (req, res, next) => {
  // data to be sent to PayPal's authentication API in order to get the user's access_token
  const data = qs.stringify({
    grant_type: 'authorization_code',
    code: req.query.code
  })
  const options = {
    method: 'post',
    url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    headers: {
      Authorization: `Basic ${config.PAYPAL_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie:
        'LANG=en_US%3BUS; cookie_check=yes; d_id=fd5c4b92473a41eba8a7b92593bcc19a1642746243115; enforce_policy=ccpa; ts=vreXpYrS%3D1737442687%26vteXpYrS%3D1642750087%26vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2%26vtyp%3Dreturn; ts_c=vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2; tsrce=unifiedloginnodeweb; x-cdn=fastly:QPG; x-pp-s=eyJ0IjoiMTY0Mjc0ODI4NzYzNCIsImwiOiIwIiwibSI6IjAifQ'
    },
    data: data
  }
  // sends request to Paypal sandbox API
  return axios(options)
    .then(function (response) {
      // the user's access_token is passed into the getPaypalUserIdentity function in order to retrieve the user's paypal profile information
      getPaypalUserIdentity(response.data.access_token)
        .then((response) => {
          const username = response.name
          const email = response.emails[0].value
          // after getting the user's paypal profile information, it is then used to create or login into the account
          try {
            // database checks if the user is already a registered user
            database
              .query(
                'SELECT id, name, email, phone, gender FROM public.user_detail where email = $1',
                [email]
              )
              .then((results) => {
                if (results && results.rowCount == 1) {
                  // if the user is registered, the user will be logged in
                  const data = {
                    token: jwt.sign(
                      {
                        id: results.rows[0].id,
                        name: results.rows[0].name,
                        email: results.rows[0].email,
                        phone: results.rows[0].phone || null,
                        gender: results.rows[0].gender || null
                      },
                      config.JWTKEY,
                      {
                        expiresIn: 86400
                      }
                    )
                  }
                  return res.status(200).json(data)
                } else {
                  console.log('register user')
                  // else if the user is not a registered user, an account will be create for the user
                  return database
                    .query(
                      'INSERT INTO public.user_detail (name, email, auth_type) VALUES ($1, $2, $3) returning id, name, email, gender',
                      [username, email, 2]
                    )
                    .then((response) => {
                      if (response && response.rowCount == 1) {
                        // after the account has been successfully created, the jwt token will be signed
                        const data = {
                          token: jwt.sign(
                            {
                              id: response.rows[0].id,
                              name: response.rows[0].name,
                              email: response.rows[0].email,
                              phone: null,
                              gender: null
                            },
                            config.JWTKEY,
                            {
                              expiresIn: 86400
                            }
                          )
                        }
                        return res.status(200).json(data)
                      }
                    })
                }
              })
              .catch((err) => {
                // error occur when checking if the user is registered
                console.log(err)
                next(createHttpError(500, error))
                return err
              })
          } catch (err) {
            // error occur when try block fails
            console.log(err)
            next(createHttpError(500, error))
            return err
          }
        })
        .catch((err) => {
          // error occur when getting user's paypal identity
          if (err) {
            throw new Error(JSON.stringify(err))
          }
          return err
        })
    })
    .catch(function (error) {
      // axios error
      console.log(error)
      return res.status(401).json({ error: error.response.statusText + ': ' + error.response.data.error })
    })
})

// Checks if the user's secret code is correct
function validateSecretKey (secretCodeInput, secretKey) {
  const options = {
    method: 'GET',
    url: 'https://google-authenticator.p.rapidapi.com/validate/',
    params: { code: secretCodeInput, secret: secretKey },
    headers: {
      'x-rapidapi-host': 'google-authenticator.p.rapidapi.com',
      'x-rapidapi-key': 'a7cc9771dbmshdb30f345bae847ep1fb8d8jsn5d90b789d2ea'
    }
  }
  // sends request to google authenticator API
  return axios
    .request(options)
    .then(function (response) {
      console.log(response.data)
      return response.data
    })
    .catch(function (error) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response.data))
      }
      return error.response.data
    })
}

// gets user's paypal profile information via the access_token
function getPaypalUserIdentity (access_token) {
  const options = {
    method: 'get',
    url: 'https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Cookie:
        'LANG=en_US%3BUS; cookie_check=yes; d_id=fd5c4b92473a41eba8a7b92593bcc19a1642746243115; enforce_policy=ccpa; ts=vreXpYrS%3D1737442687%26vteXpYrS%3D1642750087%26vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2%26vtyp%3Dreturn; ts_c=vr%3D76985c2417e0a7887168c0e1f32da9ff%26vt%3D7b4e681b17e0a60212536f7cd20503f2; tsrce=unifiedloginnodeweb; x-cdn=fastly:QPG; x-pp-s=eyJ0IjoiMTY0Mjc0ODI4NzYzNCIsImwiOiIwIiwibSI6IjAifQ'
    }
  }
  // sends request to paypal sandbox API
  return axios(options)
    .then(function (response) {
      return response.data
    })
    .catch(function (error) {
      if (error.response) {
        throw new Error(JSON.stringify(error.response.data))
      }
      return error.response.data
    })
}

module.exports = router
