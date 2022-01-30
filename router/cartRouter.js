const database = require('../database/database')
const createHttpError = require('http-errors')
const verifyToken = require('../middleware/checkUserAuthorize')
const logger = require('../logger')

const router = require('express').Router()

// user get the shopping badge to show in front end
router.post('/getShoppingBadge', (req, res, next) => {
  let id
  if (req.headers.authorization) {
    verifyToken(req, res, () => {
      id = req.id// if user is login user
    })
  } else {
    id = req.body.uid// if user is public user
  }
  return database.query('select amount from cart where user_id = $1', [id]).then(result => {
    if (result) {
      logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(200).json({
        items: result.rows
      })
    } else {
      return res.status(200).json({
        items: []
      })
    }
  }).catch(err => {
    next(createHttpError(500, err))
    logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
  })
})

// user get the shopping cart
router.post('/getShoppingCart', (req, res, next) => {
  let id
  if (req.headers.authorization) {
    verifyToken(req, res, () => {
      id = req.id// if user is login user
    })
  } else {
    id = req.body.uid// if user is public user
  }
  return database.query('select game_id, amount, g_name, g_description, g_price, g_discount, g_image from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1', [id]).then(result => {
    if (result) {
      logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(200).json({
        cart: result.rows
      })
    } else {
      return res.status(200).json({
        cart: []
      })
    }
  }).catch(err => {
    next(createHttpError(500, err))
    logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
  })
})

// user add, edit, delete shopping cart
router.post('/editShoppingCart', async function (req, res, next) {
  let id
  console.log(req.headers)
  if (req.headers.authorization) {
    verifyToken(req, res, () => {
      id = req.id// if user is login user
      console.log(id)
    })
  } else {
    id = req.body.uid// if user is public user
  }
  console.log(id)
  try {
    const cart = req.body.cart
    for (let i = 0; i < cart.length; i++) {
      const c = cart[i]
      await database.query('select insert_cart($1, $2, $3, $4)', [id, c.id, c.amount, req.body.edit])// this query will insert, edit, delete the shopping cart
        .catch(err => {
          throw err
        })
    }
    logger.info(`201 Insert ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(201).end()
  } catch (err) {
    next(createHttpError(500, err))
    logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
  }
})

module.exports = router
