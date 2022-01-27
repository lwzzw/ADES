const router = require('express').Router()
const config = require('../config')
const database = require('../database/database')
const verifyToken = require('../middleware/checkUserAuthorize')
const createHttpError = require('http-errors')
const logger = require('../logger')
const generateKey = require('../key/generateKey')
const aws = require('aws-sdk')
const S3_BUCKET = config.S3_BUCKET_NAME
aws.config.region = 'us-east-2'
const APP_CACHE = require('../cache')
const CACHE_KEYS = APP_CACHE.get('CACHE_KEYS')

// admin get all category to let admin add game, edit game
router.get('/getAllCategory', verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  let main, sub, child
  main = await database
    .query('SELECT id, category_name FROM main_category')
    .then((result) => {
      return (main = result.rows)
    })
  sub = await database
    .query('SELECT id, category_name, fk_main FROM parent_subcategory')
    .then((result) => {
      return (sub = result.rows)
    })
  child = await database
    .query('SELECT id, category_name, fk_parent FROM child_subcategory')
    .then((result) => {
      return (child = result.rows)
    })
  if (!main || !sub || !child) {
    return next(createHttpError(500, 'no category'))
  }
  return res.status(200).json({ main, sub, child })
})

// admin get all region to let admin add game, edit game
router.get('/region', verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  database
    .query('select id, region_name from region', [])
    .then((result) => {
      return res.status(200).json({ result: result.rows })
    })
    .catch((err) => {
      next(createHttpError(500, err))
    })
})

// admin add game
router.post('/addGame', verifyToken, async function (req, res, next) {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  const game = req.body.game
  console.log(game)
  game.gamePrice = parseFloat(game.gamePrice).toFixed(2)
  game.gameDiscount = parseFloat(game.gameDiscount).toFixed(2)
  game.gameDiscount == 'NaN' ? (game.gameDiscount = 0) : ''// if admin didt enter game discount then game discount will be 0
  if (
    !game.gameName.trim() ||
    !game.gameDes.trim() ||
    !game.gamePic.trim() ||
    !game.gamePrice ||
    game.gamePrice == 0 ||
    game.gameDiscount < 0 ||
    (game.gameDiscount != 'NaN' && game.gameDiscount > game.gamePrice) ||
    game.mainCat == 0 ||
    game.secCat == 0 ||
    game.thirdCat == 0 ||
    game.region == 0 ||
    !game.date
  ) {
    return next(createHttpError(400, 'Please check your input'))
  }
  const val = [
    game.gameName,
    game.gamePrice,
    game.gameDes,
    game.mainCat,
    game.secCat,
    game.thirdCat,
    game.gamePic,
    game.date,
    game.region
  ]
  if (game.gameDiscount && game.gameDiscount > 0) {
    val.push(game.gameDiscount)// if admin enter game discount then add it to the array
  }
  try {
    await database.query(
      `INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region${
        game.gameDiscount == 0 ? '' : ', g_discount'
      }) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9${
      game.gameDiscount == 0 ? '' : ', $10'
    });
    `,
      val
    )
    logger.info(
      `201 Insert ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
    res.status(201).json({ success: 1 })
    // reset the cache
    APP_CACHE.del(CACHE_KEYS.AUTOCOMPLETE.GAMES)
    APP_CACHE.del(CACHE_KEYS.DEALS.ROWS)
    APP_CACHE.del(CACHE_KEYS.PREORDERS.GAMES)
    APP_CACHE.del(CACHE_KEYS.LATESTRELEASES.GAMES)
  } catch (err) {
    next(createHttpError(500, err))
    logger.error(
      `${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    )
  }
})

// admin get game detail
router.get('/adminGetGame/:id', verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  database
    .query(
      `SELECT g_region, g_id, g_name, g_description, g_price, g_image, to_char(g_publishdate::timestamp,'dd/mm/YYYY') g_publishdate, g_discount, g_maincategory, g_parentsubcategory, g_childsubcategory
    from G2A_gameDatabase 
    where g_id = $1`,
      [req.params.id]
    )
    .then((result) => {
      return res.status(200).json({ result: result.rows })
    })
    .catch((err) => {
      next(createHttpError(500, err))
    })
})

// admin edit the game
router.post('/saveGame/:id', verifyToken, async function (req, res, next) {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  const game = req.body.game
  const id = req.params.id
  console.log(game)
  game.gamePrice = parseFloat(game.gamePrice).toFixed(2)
  game.gameDiscount = parseFloat(game.gameDiscount).toFixed(2)
  game.gameDiscount == 'NaN' || game.gameDiscount == 0
    ? (game.gameDiscount = 'null')// if admin didt enter game discount then game discount will be null
    : ''
  if (
    !game.gameName.trim() ||
    !game.gameDes.trim() ||
    !game.gamePic.trim() ||
    !game.gamePrice ||
    game.gamePrice == 0 ||
    game.gameDiscount < 0 ||
    (game.gameDiscount != 'null' && game.gameDiscount > game.gamePrice) ||
    game.mainCat == 0 ||
    game.secCat == 0 ||
    game.thirdCat == 0 ||
    game.region == 0 ||
    !game.date
  ) {
    return next(createHttpError(400, 'Please check your input'))
  }
  const val = [
    game.gameName,
    game.gamePrice,
    game.gameDes,
    game.mainCat,
    game.secCat,
    game.thirdCat,
    game.gamePic,
    game.date,
    game.region,
    id
  ]
  if (game.gameDiscount != 'null') {
    val.push(game.gameDiscount)// if admin enter game discount then add it to the array
  }
  console.log(val)
  try {
    await database.query(
      `UPDATE public.G2A_gameDatabase set g_name = $1, g_price = $2, g_description = $3, g_maincategory= $4, g_parentSubcategory = $5, g_childSubcategory = $6, g_image = $7, g_publishDate = $8, g_region = $9, g_discount = ${
        game.gameDiscount != 'null' ? ' $11' : 'NULL'
      } where g_id = $10;
    `,
      val
    )
    logger.info(
      `201 UPDATE ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
    res.status(201).json({ success: 1 })
    // reset the cache
    APP_CACHE.del(CACHE_KEYS.AUTOCOMPLETE.GAMES)
    APP_CACHE.del(CACHE_KEYS.DEALS.ROWS)
    APP_CACHE.del(CACHE_KEYS.PREORDERS.GAMES)
    APP_CACHE.del(CACHE_KEYS.LATESTRELEASES.GAMES)
  } catch (err) {
    next(createHttpError(500, err))
    logger.error(
      `${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    )
  }
})

// admin delete the game
router.post('/delGame/:id', verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  const id = req.params.id
  database
    .query('DELETE from public.G2A_gameDatabase where g_id = $1', [id])
    .then((result) => {
      // reset the cache
      APP_CACHE.del(CACHE_KEYS.AUTOCOMPLETE.GAMES)
      APP_CACHE.del(CACHE_KEYS.DEALS.ROWS)
      APP_CACHE.del(CACHE_KEYS.PREORDERS.GAMES)
      APP_CACHE.del(CACHE_KEYS.LATESTRELEASES.GAMES)
      return res.status(200).json({ success: 1 })
    })
    .catch((err) => {
      next(createHttpError(500, err))
    })
})

// admin get the requests list
router.get('/requests', verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  database
    .query('SELECT request_id, email, subject, message, status FROM support_request')
    .then((result) => {
      return res.status(200).json({
        requests: result.rows
      })
    })
    .catch((err) => {
      next(createHttpError(500, err))
    })
})

// admin update the requests
router.post('/updaterequests', verifyToken, async (req, res, next) => {
  const id = req.body.id
  const status = req.body.status
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  database
    .query('UPDATE support_request set status = $1 WHERE request_id = $2', [status, id])
    .then((result) => {
      if (result.rowCount == 1) {
        res.status(201).json({
          result: result.rowCount
        })
      } else {
        next(createHttpError(500, 'Failed to update. Try again!'))
      }
    }).catch((err) => {
      next(createHttpError(500, err))
    })
})

// admin send the image detail and this will return the sign request to let admin upload the image in front end
router.get('/sign-s3', verifyToken, (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, 'Unauthorize'))// if the user is not a admin return 401
  const s3 = new aws.S3()
  const originUrl = req.query['origin-url'] || false
  let fileName = generateKey(20) + req.query['file-name']
  if (originUrl && originUrl.startsWith('https://f2aimage.s3.amazonaws.com/')) { // if the game original url is from the s3 bucket then use the original url to replace the image with new image
    fileName = originUrl.split('https://f2aimage.s3.amazonaws.com/')[1]
  }
  const fileType = req.query['file-type']
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  }
  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err)
      return next(createHttpError(500, err))
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
      fileType,
      fileName
    }
    res.status(200).json({ result: returnData })
  })
})

module.exports = router
