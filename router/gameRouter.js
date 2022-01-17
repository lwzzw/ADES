const database = require("../database/database");
const createHttpError = require("http-errors");
const router = require("express").Router();
const logger = require("../logger");
let gameAC = [];

module.exports.getGameAC = getGameAC;

router.get("/gameDetailById/:id", (req, res, next) => {
  var id = req.params.id;
  //parent_subcategory is platform
  return database
    .query(
      `SELECT region_name ,g_id, g_name, g_description, g_price, g_image, to_char(g_publishdate::timestamp,'dd/mm/YYYY') g_publishdate, g_region, g_discount, category_name 
                            from G2A_gameDatabase 
                            join parent_subcategory on g_parentsubcategory = id 
                            join region on region.id = g_region
                            where g_id = $1`,
      [id]
    )
    .then((result) => {
      if (result.rows) {
        logger.info(
          `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
        return res.status(200).json({
          game: result.rows,
        });
      } else {
        logger.info(
          `204 NO CONTENT ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
        return res.status(204).end();
      }
    })
    .catch((err) => {
      next(createHttpError(500, err));
      logger.error(
        `${err || "500 Error"}  ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
    });
});

router.get("/gameDetailFilter", (req, res, next) => {
  const LIMIT = 18;
  var i = 1,
    platform = req.query.platform,
    maincat = req.query.maincat,
    childcat = req.query.childcat,
    name = req.query.name,
    minprice = req.query.minprice,
    maxprice = req.query.maxprice,
    page = req.query.page,
    offset = (page - 1 < 0 ? 0 : page - 1) * LIMIT || 0,
    order = req.query.sort;
  var array = [];
  if (name) array.push(name);
  if (minprice) array.push(minprice);
  if (maxprice) array.push(maxprice);
  if (platform) array.push(platform);
  if (maincat && maincat != "All categories") array.push(maincat);
  if (childcat) array.push(childcat);
  if (order) {
    if (order == "default") order = "";
    else if (order == "pricedesc") order = "g_price desc";
    else if (order == "priceasc") order = "g_price asc";
    else if (order == "datedesc") order = "g_publishdate desc";
    else if (order == "datedasc") order = "g_publishdate asc";
    else order = "";
  }
  array.push(LIMIT);
  array.push(offset);
  return database
    .query(
      `SELECT g_id, g_name, g_description, g_price, g_discount, g_image, g_publishdate, g_region 
                            from G2A_gameDatabase 
                            where 1=1 ${
                              name
                                ? `AND g_name ILIKE '%' || $${i++} || '%' `
                                : ""
                            }
                            ${
                              minprice
                                ? `AND COALESCE(g_discount, g_price) >= $${i++} `
                                : ""
                            }
                            ${
                              maxprice
                                ? `AND COALESCE(g_discount, g_price) <= $${i++} `
                                : ""
                            }
                            ${
                              platform
                                ? `AND g_parentsubcategory = (select id from parent_subcategory where category_name = $${i++}) `
                                : ""
                            }
                            ${
                              maincat && maincat != "All categories"
                                ? `AND g_maincategory = (select id from main_category where category_name = $${i++}) `
                                : ""
                            }
                            ${
                              childcat
                                ? `AND g_childsubcategory in (select id from child_subcategory where category_name = $${i++}) `
                                : ""
                            }
                            ${order ? "order by " + order : ""}
                            LIMIT $${i++} OFFSET $${i++};
                            `,
      array
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        games: result.rows,
      });
    })
    .catch((err) => {
      next(createHttpError(500, err));
      logger.error(
        `${err || "500 Error"}  ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
    });
});

router.get("/gameDetailFilterPageCount", (req, res, next) => {
  var i = 1,
    platform = req.query.platform,
    maincat = req.query.maincat,
    childcat = req.query.childcat,
    name = req.query.name,
    minprice = req.query.minprice,
    maxprice = req.query.maxprice;
  var array = [];
  if (name) array.push(name);
  if (minprice) array.push(minprice);
  if (maxprice) array.push(maxprice);
  if (platform) array.push(platform);
  if (maincat && maincat != "All categories") array.push(maincat);
  if (childcat) array.push(childcat);
  return database
    .query(
      `SELECT count(g_id)
        from G2A_gameDatabase 
        where 1=1 ${name ? `AND g_name ILIKE '%' || $${i++} || '%' ` : ""}
        ${minprice ? `AND COALESCE(g_discount, g_price) >= $${i++} ` : ""}
        ${maxprice ? `AND COALESCE(g_discount, g_price) <= $${i++} ` : ""}
        ${
          platform
            ? `AND g_parentsubcategory = (select id from parent_subcategory where category_name = $${i++}) `
            : ""
        }
        ${
          maincat && maincat != "All categories"
            ? `AND g_maincategory = (select id from main_category where category_name = $${i++}) `
            : ""
        }
        ${
          childcat
            ? `AND g_childsubcategory in (select id from child_subcategory where category_name = $${i++}) `
            : ""
        }
        `,
      array
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        games: result.rows,
      });
    })
    .catch((err) => {
      next(createHttpError(500, err));
      logger.error(
        `${err || "500 Error"}  ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
    });
});

router.get("/getDeals/:row", (req, res, next) => {
  var row = req.params.row;
  if (isNaN(row) || --row < 0) row = 0;
  const LIMIT = 6;
  var offset = LIMIT * row;
  return database
    .query(
      `SELECT g_id, g_name, g_discount, g_image, g_price FROM g2a_gamedatabase WHERE g_discount IS NOT NULL LIMIT $1 OFFSET $2`,
      [LIMIT, offset]
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        deals: result.rows,
      });
    })
    .catch((err) => {
      next(createHttpError(500, err));
      logger.error(
        `${err || "500 Error"}  ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
    });
});

//This API querys the database for bestselling products depending on how many times a game has been purchased.
router.get("/getBSellers/:limitProducts", (req, res, next) => {
  const limitProducts = req.params.limitProducts;
  //limitProducts contains true or false, if it contains true, it will query the database and limit its search radius to 6 products only. if not, it will query the database for all of the products available.
  return database
    .query(
      `SELECT order_detail.g_id, SUM(amount) bestseller, g2a_gamedatabase.g_name, g2a_gamedatabase.g_image, COALESCE(g_discount, g_price) g_discount, g2a_gamedatabase.g_price FROM order_detail INNER JOIN g2a_gamedatabase ON order_detail.g_id = g2a_gamedatabase.g_id GROUP BY order_detail.g_id, g2a_gamedatabase.g_name, g2a_gamedatabase.g_image, g2a_gamedatabase.g_price, g2a_gamedatabase.g_discount ORDER BY bestseller DESC ${
        limitProducts == "true" ? "LIMIT 6" : ""
      };`
    )
    .then((result) => {
      if (!result.rows)
        return res.status(200).json({
          bsellers: [],
        });
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        bsellers: result.rows,
      });
    })
    .catch((err) => {
      next(createHttpError(500, err));
      logger.error(
        `${err || "500 Error"} ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
    });
});

//This API querys the database for products under preorder.
router.get(`/getPreorders/:limitProducts`, (req, res, next) => {
  //limitProducts contains true or false, if it contains true, it will query the database and limit its search radius to 6 products only. if not, it will query the database for all of the products available.
  const limitProducts = req.params.limitProducts;
  return database
    .query(
      `SELECT g_id, g_name, g_price, g_image, COALESCE(g_discount, g_price) g_discount, NULLIF(g2a_gamedatabase.g_discount, g2a_gamedatabase.g_price), g_publishdate FROM g2a_gamedatabase WHERE g_publishDate > current_timestamp ${
        limitProducts == "true" ? "LIMIT 6" : ""
      };`
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        preorders: result.rows,
      });
    })
    .catch((err) => {
      next(createHttpError(500, err));
      logger.error(
        `${err || "500 Error"} ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
    });
});

router.get("/getLRelease", (req, res, next) => {
  return database
    .query(
      `SELECT g_id, g_name, g_image, COALESCE(g_discount, g_price) g_discount, g_price, NULLIF(g2a_gamedatabase.g_discount, g2a_gamedatabase.g_price), to_char(g_publishdate::timestamp,'dd/mm/YYYY') as date FROM g2a_gamedatabase WHERE g_publishdate <= current_timestamp ORDER BY g_publishdate DESC LIMIT 6;`
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        lrelease: result.rows,
      });
    })
    .catch((err) => {
      next(createHttpError(500, err));
      logger.error(
        `${err || "500 Error"}  ||  ${res.statusMessage} - ${
          req.originalUrl
        } - ${req.method} - ${req.ip}`
      );
    });
});

router.get("/gameNameDes", async (req, res, next) => {
  try {
    if (gameAC.length > 0) {
      return res.status(200).json(gameAC);
    } else {
      await getGameAC();
      return res.status(200).json(gameAC);
    }
  } catch (err) {
    console.log(err);
    next(createHttpError(500, err));
    logger.error(
      `${err || "500 Error"}  ||  ${res.statusMessage} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
  }
});

async function getGameAC() {
  try {
    await database
      .query(`SELECT g_name, g_description, child_subcategory.category_name child_subcategory, parent_subcategory.category_name parent_subcategory, main_category.category_name main_category FROM g2a_gamedatabase join child_subcategory on g_childSubcategory=child_subcategory.id join parent_subcategory on g_parentSubcategory=parent_subcategory.id join main_category on g_maincategory=main_category.id`)
      .then((result) => {
        result.rows.forEach((game) => {
          gameAC.push({ label: game.g_name, des: game.g_description, main_cat: game.main_category, parent_cat: game.parent_subcategory, child_cat: game.child_subcategory});
        });
      });
  } catch (err) {
    console.log(err);
    next(createHttpError(500, err));
    logger.error(
      `${err || "500 Error"}  ||  ${res.statusMessage} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
  }
}

module.exports.default = router;
