const router = require('express').Router()
const config = require('../config')
const database = require('../database/database')
const verifyToken = require('../middleware/checkUserAuthorize')
const createHttpError = require('http-errors')

// Endpoint to get user's secret key if it exists
router.get('/getSecret', verifyToken, (req, res, next) => {
  const userID = req.id
  console.log(req.id)
  return database.query('SELECT twofactor_authenticator.belong_to, twofactor_authenticator.auth_enabled, auth_type FROM twofactor_authenticator INNER JOIN user_detail ON twofactor_authenticator.belong_to = user_detail.id WHERE belong_to = $1', [userID])
    .then(result => {
      // if user has 2-fa enabled, return user's secret key
      if (result.rows.length == 1 && result.rows[0].auth_type == 1) {
        return res.status(200).json(result.rows[0].auth_type)
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

router.post('/enableAuthenticator', verifyToken, (req, res, next) => {
  const uid = req.body.uid 
  console.log(req.id)
  console.log(uid)
  database.query('SELECT auth_type FROM user_detail WHERE id = $1', [uid])
    .then(result => {
      console.log(result.rows)
      if (result.rows[0].auth_type == 2) {
        res.status(401).json({error : 'Users connected via third party platforms need not have 2-fa enabled'})
      } else {
        database.query('INSERT INTO twofactor_authenticator (belong_to, auth_enabled) VALUES ($1, $2)', [uid, 'true'])
          .then(result => {
            if (result.rowCount == 1) {
              const message = 'Successfully enabled 2FA'
              return res.status(200).json(message)
            } else {
              //error occurs when database fails to insert secret key
              res.status(400).json({ error : 'Unknown error occured, Please try again'})            
            }
          }).catch(error => {
            if (error.code == '23505') {
              res.status(409).json({ error : 'You already have 2-fa enabled'})
            } else {
              res.status(400).json({ error : 'Unknown error occured, Please try again'})
            }
          })
      }
    }).catch(error => {
      console.log(error)
      next(createHttpError(401), error.message)
    })

})

module.exports = router
