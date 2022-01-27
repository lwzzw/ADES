const router = require('express').Router()
const config = require('../config')
const database = require('../database/database')
const verifyToken = require('../middleware/checkUserAuthorize')
const createHttpError = require('http-errors')

// Endpoint to insert authenticator's secret key
router.post('/secretDetail', (req, res, next) => {
  const userID = req.body.uid
  const secretKey = req.body.secretkey
  // checks if user is from third-party platform e.g paypal, google and facebook
  return database.query('SELECT auth_type FROM user_detail WHERE id = $1', [userID])
    .then(result => {
      // if user is from third-party platform, throw error
      if (result && result.rows[0].auth_type == 2) {
        throw new Error('Users connected via third party platforms need not have 2-fa enabled')
      } else {
        // inserts secret key into database, if user has existing secret key, it will be updated with the new secret key.
        return database.query('INSERT INTO twofactor_authenticator (belong_to, secret_key) VALUES ($1, $2) ON CONFLICT (belong_to) DO UPDATE SET secret_key = $2', [userID, secretKey])
          .then(result => {
            if (result) {
              if (result.rowCount == 1) {
                const message = 'Successfully uploaded secret key'
                return res.status(200).json(message)
              }
            }
          }).catch(error => {
            next(createHttpError(500, error))
          })
      }
    }).catch(error => {
      next(createHttpError(500, error))
    })
})

// Endpoint to get user's secret key if it exists
router.get('/getSecret', verifyToken, (req, res, next) => {
  const userID = req.id
  return database.query('SELECT twofactor_authenticator.belong_to, twofactor_authenticator.secret_key, auth_type FROM twofactor_authenticator INNER JOIN user_detail ON twofactor_authenticator.belong_to = user_detail.id WHERE belong_to = $1', [userID])
    .then(result => {
      // if user has 2-fa enabled, return user's secret key
      if (result.rows.length == 1 && result.rows[0].auth_type == 1) {
        return res.status(200).json(result.rows[0].secret_key)
      } else if (result.rows.length == 1 && result.rows[0].auth_type == 2) {
        // if user is enabling 2-fa from a third party platform, throw error
        throw new Error('Users connected via third party platforms need not have 2-fa enabled')
      } else {
        const twoFAEnabled = false
        return res.status(200).json({ message: twoFAEnabled })
      }
    }).catch(error => {
      next(createHttpError(500, error))
    })
})

module.exports = router
