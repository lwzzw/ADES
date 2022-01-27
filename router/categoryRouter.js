const database = require('../database/database')
const createHttpError = require('http-errors')
const logger = require('../logger')
const router = require('express').Router()
const APP_CACHE = require('../cache')
const CACHE_KEYS = APP_CACHE.get('CACHE_KEYS')

module.exports.getCat = getCats

// cache the category
async function getCats () {
  let cat
  try {
    let main, sub, child
    main = await database
      .query('SELECT id, category_name FROM main_category')
      .then((result) => {
        return main = result.rows
      })
    sub = await database
      .query('SELECT id, category_name, fk_main FROM parent_subcategory')
      .then((result) => {
        return sub = result.rows
      })
    child = await database
      .query('SELECT id, category_name, fk_parent FROM child_subcategory')
      .then((result) => {
        return child = result.rows
      })
    return Promise.all([main, sub, child]).then(() => {
      child.forEach((childCat) => {
        const index = sub.findIndex((subCat) => subCat.id == childCat.fk_parent)
        if (!sub[index].child) sub[index].child = []
        sub[index].child.push(childCat)
      })
      sub.forEach((subCat) => {
        const index = main.findIndex((mainCat) => mainCat.id == subCat.fk_main)
        if (!main[index].parent) main[index].parent = []
        main[index].parent.push(subCat)
      })
      cat = main
      APP_CACHE.set(CACHE_KEYS.CATEGORIES.CAT, cat)// set the category to cache
      return {
        categories: cat
      }
    }).catch(err => {
      console.log(err)
    })
  } catch (err) {
    console.log(err)
  }
}

// get all category
router.get('/getAllCategories', async function (req, res, next) {
  const cat = APP_CACHE.get(CACHE_KEYS.CATEGORIES.CAT)
  if (cat)// if category cache exist return the cache
  {
    return res.status(200).json({
      categories: cat
    })
  }
  const result = await getCats()// if category cache does not exist call getCats to cache it
  if (result) {
    logger.info(
      `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
    return res.status(200).json(result)
  } else {
    next(createHttpError(500, 'Get category error'))
    logger.error(
      `500 Error ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    )
  }
})

// get count of game by main category
router.get('/countOfGame/:mainCategory', (req, res, next) => {
  const mainCat = req.params.mainCategory
  return database
    .query(
      `SELECT COUNT(g_id),parent_subcategory.category_name 
                            FROM main_category 
                            join parent_subcategory on fk_main = main_category.id 
                            join G2A_gameDatabase on g_parentSubcategory = parent_subcategory.id
                            WHERE g_maincategory = (select id from main_category where category_name = $1)
                            group by parent_subcategory.category_name`,
      [decodeURI(mainCat)]
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      )
      return res.status(200).json({
        count: result.rows
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

// get count of game by sub category
router.get('/countOfGameByPlatform/:subCategory', (req, res, next) => {
  const subCat = req.params.subCategory
  return database
    .query(
      `SELECT COUNT(g_id),category_name 
        FROM G2A_gameDatabase 
        join child_subcategory on g_childSubcategory = id 
        WHERE g_parentSubcategory = (select id from parent_subcategory where category_name = $1)
        group by category_name`,
      [decodeURI(subCat)]
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      )
      return res.status(200).json({
        count: result.rows
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

module.exports.default = router
