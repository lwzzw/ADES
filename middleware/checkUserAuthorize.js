const createHttpError = require('http-errors')
const jwt = require('jsonwebtoken')
const config = require('../config')
const logger = require('../logger')

function verifyToken (req, res, next) {
  console.log(req.path)
  if (
    (req.path == '/admin_page' ||
      req.path == '/admin_game_list' ||
      req.path == '/edit_game' ||
      req.path == '/admin_requests') &&
    !req.cookies.token
  ) {
    return res.redirect('/login.html') // if the path is adminpage and the cookie is not exist then redirect to login page
  }
  (req.id = ''), (req.name = ''), (req.email = '')
  let token = req.headers.authorization || 'Bearer ' + req.cookies.token
  console.log(token)
  if (!token || !token.includes('Bearer')) {
    next(createHttpError(401, 'No token'))
    // logger.error(
    //   `401 No token ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    // );
  } else {
    token = token.split('Bearer ')[1]
    jwt.verify(token, config.JWTKEY, function (err, decoded) {
      if (err) {
        console.log(err)
        if (
          req.path == '/admin_page' ||
          req.path == '/admin_game_list' ||
          req.path == '/edit_game' ||
          req.path == '/admin_requests'
        ) {
          return res.redirect('/login.html')// if the path is adminpage then redirect to login page
        }
        req.id = req.body.uid
        console.log('verify error')
        next(createHttpError(401, 'Not authorize'))
        logger.error(
          `401 No token ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        )
      } else {
        console.log('verify success')
        req.id = decoded.id
        req.name = decoded.name
        req.email = decoded.email
        req.phone = decoded.phone
        req.gender = decoded.gender
        req.role = decoded.role || 0
        logger.info(
          `200 Verify success||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        )
        next()
      }
    })
  }
}

module.exports = verifyToken
