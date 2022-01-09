const database = require("../database/database");
const createHttpError = require("http-errors");
const logger = require("../logger");
const router = require("express").Router();
var cat;
// getCat();

module.exports.getCat = getCats;
//to use only one database connection so we use await

async function getCats() {
  let main, sub, child;
  try {
    main = database
      .query("SELECT id, category_name FROM main_category")
      .then((result) => {
        main = result.rows;
      });
    sub = database
      .query("SELECT id, category_name, fk_main FROM parent_subcategory")
      .then((result) => {
        sub = result.rows;
      });
    child = database
      .query("SELECT id, category_name, fk_parent FROM child_subcategory")
      .then((result) => {
        child = result.rows;
      });
  } catch (err) {
    console.log(err);
  }
  return Promise.all([main, sub, child]).then(() => {
    child.forEach((childCat) => {
      let index = sub.findIndex((subCat) => subCat.id == childCat.fk_parent);
      if (!sub[index].child) sub[index].child = [];
      sub[index].child.push(childCat);
    });
    sub.forEach((subCat) => {
      let index = main.findIndex((mainCat) => mainCat.id == subCat.fk_main);
      if (!main[index].parent) main[index].parent = [];
      main[index].parent.push(subCat);
    });
    cat = main;
    return {
      categories: cat,
    };
  });
}

router.get("/getAllCategories", async function (req, res, next) {
  if (cat)
    return res.status(200).json({
      categories: cat,
    });
  let result = await getCats();
  if (result) {
    logger.info(
      `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(200).json(result);
  } else {
    next(createHttpError(500, "Get category error"));
    logger.error(
      `500 Error ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
  }
});

router.get("/countOfGame/:mainCategory", (req, res, next) => {
  var mainCat = req.params.mainCategory;
  return database
    .query(
      `SELECT COUNT(g_id),category_name 
                            FROM G2A_gameDatabase 
                            join child_subcategory on g_childSubcategory = id 
                            WHERE g_maincategory = (select id from main_category where category_name = $1)
                            group by category_name`,
      [decodeURI(mainCat)]
    )
    .then((result) => {
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        count: result.rows,
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

module.exports.default = router;
