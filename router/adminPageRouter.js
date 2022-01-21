const router = require("express").Router();
const config = require("../config");
const database = require("../database/database");
const verifyToken = require("../middleware/checkUserAuthorize");
const createHttpError = require("http-errors");
const logger = require("../logger");
const getGameAC = require("../router/gameRouter").getGameAC;
const { data } = require("../logger");
const { response } = require("express");

router.get("/getAllCategory", verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  let main, sub, child;
  main = await database
    .query("SELECT id, category_name FROM main_category")
    .then((result) => {
      return (main = result.rows);
    });
  sub = await database
    .query("SELECT id, category_name, fk_main FROM parent_subcategory")
    .then((result) => {
      return (sub = result.rows);
    });
  child = await database
    .query("SELECT id, category_name, fk_parent FROM child_subcategory")
    .then((result) => {
      return (child = result.rows);
    });
  if (!main || !sub || !child) {
    return next(createHttpError(500, "no category"));
  }
  return res.status(200).json({ main, sub, child });
});

router.get("/region", verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  database
    .query("select id, region_name from region", [])
    .then((result) => {
      return res.status(200).json({ result: result.rows });
    })
    .catch((err) => {
      next(createHttpError(500, err));
    });
});

router.post("/addGame", verifyToken, async function (req, res, next) {
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  const game = req.body.game;
  console.log(game);
  game.gamePrice = parseFloat(game.gamePrice).toFixed(2);
  game.gameDiscount = parseFloat(game.gameDiscount).toFixed(2);
  game.gameDiscount == "NaN" ? (game.gameDiscount = 0) : "";
  if (
    !game.gameName.trim() ||
    !game.gameDes.trim() ||
    !game.gamePic.trim() ||
    !game.gamePrice ||
    game.gamePrice == 0 ||
    game.gameDiscount < 0 ||
    (game.gameDiscount != "NaN" && game.gameDiscount > game.gamePrice) ||
    game.mainCat == 0 ||
    game.secCat == 0 ||
    game.thirdCat == 0 ||
    game.region == 0 ||
    !game.date
  ) {
    return next(createHttpError(400, "Please check your input"));
  }
  let val = [
    game.gameName,
    game.gamePrice,
    game.gameDes,
    game.mainCat,
    game.secCat,
    game.thirdCat,
    game.gamePic,
    game.date,
    game.region,
  ];
  console.log(val);
  if (game.gameDiscount && game.gameDiscount > 0) {
    val.push(game.gameDiscount);
  }
  console.log(val);
  try {
    await database.query(
      `INSERT INTO public.G2A_gameDatabase (g_name, g_price, g_description, g_maincategory, g_parentSubcategory, g_childSubcategory, g_image, g_publishDate, g_region${
        game.gameDiscount == 0 ? "" : ", g_discount"
      }) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9${
      game.gameDiscount == 0 ? "" : ", $10"
    });
    `,
      val
    );
    logger.info(
      `201 Insert ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    res.status(201).json({ success: 1 });
    getGameAC();
  } catch (err) {
    next(createHttpError(500, err));
    logger.error(
      `${err || "500 Error"}  ||  ${res.statusMessage} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
  }
});

router.get("/adminGetGame/:id", verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  database
    .query(
      `SELECT g_region, g_id, g_name, g_description, g_price, g_image, to_char(g_publishdate::timestamp,'dd/mm/YYYY') g_publishdate, g_discount, g_maincategory, g_parentsubcategory, g_childsubcategory
    from G2A_gameDatabase 
    where g_id = $1`,
      [req.params.id]
    )
    .then((result) => {
      return res.status(200).json({ result: result.rows });
    })
    .catch((err) => {
      next(createHttpError(500, err));
    });
});

router.post("/saveGame/:id", verifyToken, async function (req, res, next) {
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  const game = req.body.game;
  const id = req.params.id;
  console.log(game);
  game.gamePrice = parseFloat(game.gamePrice).toFixed(2);
  game.gameDiscount = parseFloat(game.gameDiscount).toFixed(2);
  game.gameDiscount == "NaN" || game.gameDiscount == 0
    ? (game.gameDiscount = "null")
    : "";
  if (
    !game.gameName.trim() ||
    !game.gameDes.trim() ||
    !game.gamePic.trim() ||
    !game.gamePrice ||
    game.gamePrice == 0 ||
    game.gameDiscount < 0 ||
    (game.gameDiscount != "null" && game.gameDiscount > game.gamePrice) ||
    game.mainCat == 0 ||
    game.secCat == 0 ||
    game.thirdCat == 0 ||
    game.region == 0 ||
    !game.date
  ) {
    return next(createHttpError(400, "Please check your input"));
  }
  let val = [
    game.gameName,
    game.gamePrice,
    game.gameDes,
    game.mainCat,
    game.secCat,
    game.thirdCat,
    game.gamePic,
    game.date,
    game.region,
    id,
  ];
  if (game.gameDiscount != "null") {
    val.push(game.gameDiscount);
  }
  console.log(val);
  try {
    await database.query(
      `UPDATE public.G2A_gameDatabase set g_name = $1, g_price = $2, g_description = $3, g_maincategory= $4, g_parentSubcategory = $5, g_childSubcategory = $6, g_image = $7, g_publishDate = $8, g_region = $9, g_discount = ${
        game.gameDiscount != "null" ? " $11" : "NULL"
      } where g_id = $10;
    `,
      val
    );
    logger.info(
      `201 UPDATE ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    res.status(201).json({ success: 1 });
    getGameAC();
  } catch (err) {
    next(createHttpError(500, err));
    logger.error(
      `${err || "500 Error"}  ||  ${res.statusMessage} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`
    );
  }
});

router.post("/delGame/:id", verifyToken, async (req, res, next) => {
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  const id = req.params.id;
  database
    .query(`DELETE from public.G2A_gameDatabase where g_id = $1`, [id])
    .then((result) => {
      return res.status(200).json({ success: 1 });
    })
    .catch((err) => {
      next(createHttpError(500, err));
    });
});

router.get("/requests", verifyToken, async (req,res,next)=> {
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  database
  .query(`SELECT request_id, email, subject, message, status FROM support_request`)
  .then((result) => {
    return res.status(200).json({
      requests : result.rows
     });
  })
  .catch((err) => {
    next(createHttpError(500, err));
  });
})

router.post("/updaterequests", verifyToken, async(req,res,next)=> {
  const id = req.body.id;
  const status = req.body.status;
  if (req.role != 1) return next(createHttpError(401, "Unauthorize"));
  database
  .query(`UPDATE support_request set status = $1 WHERE request_id = $2`, [status, id])
  .then((result)=>{
    if(result.rowCount == 1){
    res.status(201).json({
      result : result.rows
    });
    }
    else{
      next(createHttpError(500, 'Failed to update. Try again!'));
    }

  }). catch((err)=> {
    next(createHttpError(500, err));
  });
})
module.exports = router;
