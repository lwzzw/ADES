const database = require('../database/database')
const createHttpError = require('http-errors')
const paypal = require('@paypal/checkout-server-sdk')
const router = require('express').Router()
const logger = require('../logger')
const verifyToken = require('../middleware/checkUserAuthorize')
const axios = require('axios')
const config = require('../config')
const sendMail = require('../email/email').sendMail
const generateKey = require('../key/generateKey')
const Environment =
  config.ENV === 'production'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment// declare the paypal environment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(config.PAYPAL_CLIENT_ID, config.PAYPAL_CLIENT_SECRET)
)
const PaypalAccessToken = Buffer.from(
  config.PAYPAL_CLIENT_ID + ':' + config.PAYPAL_CLIENT_SECRET
).toString('base64')// paypal access token to check the order detail
const APP_CACHE = require('../cache')
const CACHE_KEYS = APP_CACHE.get('CACHE_KEYS')

// create new order and count the total
router.post('/create-order', async (req, res, next) => {
  let id
  let total = 0.00
  if (req.headers.authorization) {
    verifyToken(req, res, () => {
      id = req.id// if user is login user
    })
  } else {
    id = req.body.uid// if user is public user
  }
  await database
    .query(
      'select game_id, amount, g_name, g_description, g_price, g_discount, g_image from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1',
      [id]
    )
    .then((result) => {
      if (result) {
        return result.rows.forEach((cart) => {
          cart.g_discount
            ? (total += parseFloat(cart.g_discount).toFixed(2) * parseInt(cart.amount))
            : (total += parseFloat(cart.g_price).toFixed(2) * parseInt(cart.amount))// check if the discount exist
        })
      } else {
        return 0
      }
    })
    .catch((err) => {
      next(createHttpError(500, err))
    })
  if (total <= 0) return next(createHttpError(400, 'No cart'))
  const request = new paypal.orders.OrdersCreateRequest()// create new order

  request.prefer('return=representation')
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'SGD',
          value: total, // set the total
          breakdown: {
            item_total: {
              currency_code: 'SGD',
              value: 0
            }
          }
        }
      }
    ]
  })

  try {
    const order = await paypalClient.execute(request)// send the order detail to paypal and get the order
    APP_CACHE.set(`${CACHE_KEYS.USERS.ORDER}.${id}`, order.result.id, 30 * 60)// set the cache ttl to 30 minutes
    res.status(200).json({
      id: order.result.id
    })
  } catch (err) {
    next(createHttpError(500, err))
  }
})

// save the order to order history and check out the cart
router.post('/save-order', async (req, res, next) => {
  try {
    let id
    let total = 0.00
    if (req.headers.authorization) {
      verifyToken(req, res, () => {
        id = req.id// if user is login user
      })
    } else {
      id = req.body.uid// if user is public user
    }

    if (req.body.detail.status !== 'COMPLETED') { // check if the status is completed
      return next(createHttpError(400, 'transaction not complete'))
    }
    const paypalRes = await axios
      .get(req.body.detail.links[0].href, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + PaypalAccessToken
        }
      })
      .then((res) => res.data)// get the order status from paypal
    if (paypalRes.status !== 'COMPLETED' || paypalRes.id != APP_CACHE.get(`${CACHE_KEYS.USERS.ORDER}.${id}`)) { // check with paypal if the status is completed
      return next(createHttpError(400, 'transaction not complete'))
    }

    const cart = await database.query(
      'select game_id, amount, COALESCE(g_discount, g_price) price from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1',
      [id]
    )
    cart.rows.forEach((c) => {
      total += parseFloat(c.price).toFixed(2) * parseInt(c.amount)
    })
    const hid = await database.transactionQuery('select confirm_order($1, $2)', [
      id,
      total
    ])// insert the order detail to database, delete the cart and get the id from database
    let emailHtml
    await database
      .transactionQuery(
        'select order_id, order_detail.g_id, amount, g_name FROM order_detail join G2A_gameDatabase on order_detail.g_id = G2A_gameDatabase.g_id  WHERE order_id = $1',
        [hid.rows[0].confirm_order]
      )
      .then(async (result) => {
        const isUser = await database
          .query('select 1 from user_detail where id = $1', [id])
          .then((result) => result.rows.length == 1)
        const orderList = result.rows
        emailHtml = !isUser ? '<p>Below is your game key</p><ul>' : ''
        orderList.forEach((orderDetail) => {
          if (isUser) { // if user is login user store the key to database
            insertKey(orderDetail.amount)
            function insertKey (amount) {
              let string = ''
              for (let i = 0; i < amount; i++) {
                string += `INSERT INTO keys (order_id, g_id, key) VALUES(${
                  orderDetail.order_id
                }, ${orderDetail.g_id}, '${generateKey(16)}'); `
              }
              database.transactionQuery(string).catch((err) => {
                console.log(err)
                insertKey(amount)
              })
            }
          } else { // if user is public user send the key to the email
            for (let i = 0; i < orderDetail.amount; i++) {
              emailHtml += `<li> ${orderDetail.g_name} - ${generateKey(16)} </li>`
            }
          }
        })
        emailHtml += !isUser ? '</ul>' : ''
      })
    const date = new Date(paypalRes.create_time)
    const html = `<p>You have been successful make a payment total ${parseFloat(total).toFixed(2)} SGD on ${date.toLocaleString('en-US')}</p><p>Your order id for this transaction is ${APP_CACHE.get(`${CACHE_KEYS.USERS.ORDER}.${id}`)}</p>${emailHtml || ''}`
    logger.info(
      `200 OK ||  ${APP_CACHE.get(`${CACHE_KEYS.USERS.ORDER}.${id}`)} - ${paypalRes.payer.email_address} - ${total} - ${req.ip}`
    )
    sendMail(paypalRes.payer.email_address, 'Thank you for purchase', { html })// send the email to user
    APP_CACHE.del(`${CACHE_KEYS.USERS.ORDER}.${id}`)
    res.status(201).json({
      done: 'true'
    })
  } catch (err) {
    next(createHttpError(500, err))
  }
})

// get the order history
router.post('/orderHistory', (req, res, next) => {
  let id
  if (req.headers.authorization) {
    verifyToken(req, res, () => {
      id = req.id// if user is login user
    })
  } else {
    id = req.body.uid// if user is public user
  }
  return database
    .query(
      'SELECT id, user_id, total, to_char(buydate::timestamp,\'dd/mm/YYYY\') as buydate FROM order_history WHERE user_id = $1;',
      [id]
    )
    .then((result) => {
      if (!result.rows) {
        return res.status(200).json({
          orderhistory: []
        })
      }
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      )
      return res.status(200).json({
        orderhistory: result.rows
      })
    })
    .catch((err) => {
      next(createHttpError(500, err))
      logger.error(
        `${err || '500 Error'} ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      )
    })
})

// get the order detail
router.post('/orderDetails', (req, res, next) => {
  const oid = req.body.oid
  return database
    .query(
      'SELECT id, order_id, g2a_gamedatabase.g_id, g2a_gamedatabase.g_name, amount FROM order_detail INNER JOIN g2a_gamedatabase ON order_detail.g_id = g2a_gamedatabase.g_id WHERE order_id = $1',
      [oid]
    )
    .then((result) => {
      if (!result.rows) {
        return res.status(200).json({
          orderdetails: []
        })
      }
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      )
      return res.status(200).json({
        orderdetails: result.rows
      })
    })
    .catch((err) => {
      next(createHttpError(500, err))
      logger.error(
        `${err || '500 Error'} ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      )
    })
})

module.exports = router
