const database = require("../database/database");
const createHttpError = require("http-errors");
const paypal = require("@paypal/checkout-server-sdk");
const router = require("express").Router();
const logger = require("../logger");
const verifyToken = require("../middleware/checkUserAuthorize");
const axios = require("axios");
const nodeCache = require("node-cache");
const config = require("../config");
const sendMail = require("../email/email").sendMail;
const generateKey = require("../key/generateKey");
const Environment =
  config.ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(config.PAYPAL_CLIENT_ID, config.PAYPAL_CLIENT_SECRET)
);
const PaypalAccessToken = Buffer.from(
  config.PAYPAL_CLIENT_ID + ":" + config.PAYPAL_CLIENT_SECRET
).toString("base64");
const cache = new nodeCache({ stdTTL: 1800, checkperiod: 60 });

//create new order and count the total
router.post("/create-order", async (req, res, next) => {
  var id,
    total = 0;
  if (req.headers.authorization) {
    verifyToken(req, res, () => {
      id = req.id;
    });
  } else {
    id = req.body.uid;
  }
  await database
    .query(
      `select game_id, amount, g_name, g_description, g_price, g_discount, g_image from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1`,
      [id]
    )
    .then((result) => {
      if (result) {
        return result.rows.forEach((cart) => {
          cart.g_discount
            ? (total += parseInt(cart.g_discount))
            : (total += parseInt(cart.g_price));
        });
      } else {
        return 0;
      }
    })
    .catch((err) => {
      next(createHttpError(500, err));
    });
  if (total <= 0) return next(createHttpError(400, "No cart"));
  console.log(total);
  const request = new paypal.orders.OrdersCreateRequest();

  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "SGD",
          value: total,
          breakdown: {
            item_total: {
              currency_code: "SGD",
              value: 0,
            },
          },
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    cache.set(id, order.result.id);
    res.status(200).json({
      id: order.result.id,
    });
  } catch (err) {
    next(createHttpError(500, err));
  }
});

//save the order to order history and check out the cart
router.post("/save-order", async (req, res, next) => {
  try {
    var id,
      total = 0;
    if (req.headers.authorization) {
      verifyToken(req, res, () => {
        id = req.id;
      });
    } else {
      id = req.body.uid;
    }

    if (req.body.detail.status !== "COMPLETED") {
      return next(createHttpError(400, "transaction not complete"));
    }
    const paypalRes = await axios
      .get(req.body.detail.links[0].href, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + PaypalAccessToken,
        },
      })
      .then((res) => res.data);
    if (paypalRes.status !== "COMPLETED" || paypalRes.id != cache.get(id)) {
      return next(createHttpError(400, "transaction not complete"));
    }

    let cart = await database.query(
      `select game_id, amount, COALESCE(g_discount, g_price) price from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1`,
      [id]
    );
    cart.rows.forEach((c) => {
      total += parseInt(c.price);
    });
    let hid = await database.transactionQuery(`select confirm_order($1, $2)`, [
      id,
      total,
    ]);
    let emailHtml
    await database
      .transactionQuery(
        `select order_id, order_detail.g_id, amount, g_name FROM order_detail join G2A_gameDatabase on order_detail.g_id = G2A_gameDatabase.g_id  WHERE order_id = $1`,
        [hid.rows[0].confirm_order]
      )
      .then(async (result) => {
        let isUser = await database
          .query(`select 1 from user_detail where id = $1`, [id])
          .then((result) => result.rows.length == 1);
        let orderList = result.rows;
        orderList.forEach((orderDetail) => {
          console.log(isUser);
          if (isUser) {
            insertKey(orderDetail.amount);
            function insertKey(amount) {
              let string = "";
              for (let i = 0; i < amount; i++) {
                string += `INSERT INTO keys (order_id, g_id, key) VALUES(${
                  orderDetail.order_id
                }, ${orderDetail.g_id}, '${generateKey(16)}'); `;
              }
              database.transactionQuery(string).catch((err) => {
                console.log(err);
                insertKey(amount);
              });
            }
          } else {
            emailHtml = "<p>Below is your game key</p><ul>";
            for (let i = 0; i < orderDetail.amount; i++) {
              emailHtml += `<li> ${orderDetail.g_name} - ${generateKey(16)} </li>`;
            }
            emailHtml += "</ul>";
          }
        });
      });
    let html = `<p>You have been successful make a payment total ${total} on ${paypalRes.create_time}</p>${emailHtml?emailHtml:""}`;
    sendMail(paypalRes.payer.email_address, "Thank you for purchase", { html });
    cache.del(id);
    res.status(201).json({
      done: "true",
    });
  } catch (err) {
    next(createHttpError(500, err));
  }
});

router.post("/orderHistory", (req, res, next) => {
  var id;
  if (req.headers.authorization) {
    verifyToken(req, res, () => {
      id = req.id;
    });
  } else {
    id = req.body.uid;
  }
  return database
    .query(
      `SELECT id, user_id, total, to_char(buydate::timestamp,'dd/mm/YYYY') as buydate FROM order_history WHERE user_id = $1;`,
      [id]
    )
    .then((result) => {
      if (!result.rows)
        return res.status(200).json({
          orderhistory: [],
        });
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        orderhistory: result.rows,
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

router.post("/orderDetails", (req, res, next) => {
  var oid = req.body.oid;
  return database
    .query(
      `SELECT id, order_id, g2a_gamedatabase.g_id, g2a_gamedatabase.g_name, amount FROM order_detail INNER JOIN g2a_gamedatabase ON order_detail.g_id = g2a_gamedatabase.g_id WHERE order_id = $1`,
      [oid]
    )
    .then((result) => {
      console.log(result.rows);
      if (!result.rows)
        return res.status(200).json({
          orderdetails: [],
        });
      logger.info(
        `200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(200).json({
        orderdetails: result.rows,
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

module.exports = router;
