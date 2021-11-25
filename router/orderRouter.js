const database = require('../database/database');
const createHttpError = require('http-errors');
const paypal = require("@paypal/checkout-server-sdk")
const router = require('express').Router();
const logger = require('../logger');
const Environment =
    process.env.ENV === "production" ?
    paypal.core.LiveEnvironment :
    paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)

router.get("/checkOut", (req, res, next) => {
    res.render("checkout", {
        paypalClientId: process.env.PAYPAL_CLIENT_ID,
    });
})

router.post("/create-order", async (req, res, next) => {
    var id, total = 0;
    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            id = req.id;
        })
    } else {
        id = req.body.uid;
    }
    await database.query(`select game_id, amount, g_name, g_description, g_price, g_discount, g_image from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1`, [id]).then(result => {
        if (result) {
            return result.rows.forEach(cart => {
                cart.g_discount ? total += cart.g_discount : total += cart.g_price;
            })
        } else {
            return 0;
        }
    }).catch(err => {
        next(createHttpError(500, err))
    })
    if (total <= 0) return next(createHttpError(400, "No cart"));
    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
            amount: {
                currency_code: "SGD",
                value: total,
                breakdown: {
                    item_total: {
                        currency_code: "SGD",
                        value: 0,
                    },
                },
            }
        }, ],
    })

    try {
        const order = await paypalClient.execute(request)
        res.json({
            id: order.result.id
        })
    } catch (err) {
        next(createHttpError(500, err));
    }
})

router.post("/save-order", async (req, res, next) => {
    if (req.body.detail.status !== "COMPLETED") {
        return next(createHttpError(400, "transaction not complete"))
    }
    var id, total = 0;
    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            id = req.id;
        })
    } else {
        id = req.body.uid;
    }
    try {
        let cart = await database.query(`select game_id, amount, COALESCE(g_discount, g_price) price from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1`, [id]);
        cart.rows.forEach(c => {
            total += c.price;
        })
        let historyid = await database.query(`insert into order_history(user_id, total, buydate) VALUES ($1, $2, current_timestamp) RETURNING id;`, [id, total]).then(result => {
            return result.rows[0].id;
        }).catch(err => {
            console.log(err)
        });
        await database.query(`insert into order_detail(order_id, g_id, amount) select $1, game_id, amount from cart where user_id = $2`, [historyid, id]).catch(err => {
            console.log(err)
        });
        await database.query(`delete from cart where user_id = $1`, [id]).catch(err => {
            console.log(err)
        });
        res.status(201).json({
            done: "true"
        });
    } catch (err) {
        next(createHttpError(500, err))
    }
})

router.post('/orderHistory', (req, res, next) => {
    var id;
    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            id = req.id;
        })
    } else {
        id = req.body.uid;
    }
    return database.query(`SELECT id, user_id, total, to_char(buydate::timestamp,'dd/mm/YYYY') as buydate FROM order_history WHERE user_id = $1;`, [id] )
        .then(result => {
            if (!result.rows) return res.status(200).json({
                orderhistory: []
            })
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                orderhistory: result.rows
            })
        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'} ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})

router.post('/orderDetails', (req, res, next) => {
    var oid = req.body.oid
    return database.query(`SELECT id, order_id, g2a_gamedatabase.g_id, g2a_gamedatabase.g_name, amount FROM order_detail INNER JOIN g2a_gamedatabase ON order_detail.g_id = g2a_gamedatabase.g_id WHERE order_id = $1`, [oid] )
        .then(result => {
            console.log(result.rows)
            if (!result.rows) return res.status(200).json({
                orderdetails: []
            })
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                orderdetails: result.rows
            })
        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'} ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})
module.exports = router;