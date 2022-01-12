const database = require('../database/database');
const createHttpError = require('http-errors');
const verifyToken = require('../middleware/checkUserAuthorize');
const logger = require('../logger');

const router = require('express').Router();

router.post("/getShoppingCart", (req, res, next) => {
    var id;
    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            id = req.id;
        })
    } else {
        id = req.body.uid;
    }
    return database.query(`select game_id, amount, g_name, g_description, g_price, g_discount, g_image from cart inner join g2a_gamedatabase on game_id = g_id where user_id = $1`, [id]).then(result => {
        console.log(id)
        if (result) {
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                cart: result.rows
            });
        } else {
            return res.status(200).json({
                cart: []
            });
        }
    }).catch(err => {
        next(createHttpError(500, err))
        logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    })
})

router.post("/editShoppingCart", async function (req, res, next) {
    var id;
    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            console.log("verify");
            console.log(req.id);
            id = req.id;
        })
    } else {
        console.log("id = body uid");
        console.log(req.body);
        id = req.body.uid;
    }
    try {
        var cart = req.body.cart;
        for (let i = 0; i < cart.length; i++) {
            let c = cart[i];
            console.log(id)
            console.log(c.amount)
            console.log(c.id)
            await database.query(`select insert_cart($1, $2, $3, $4)`, [id, c.id, c.amount, req.body.edit])
                .catch(err => {
                    throw err
                })
        }
        console.log("continue");
        logger.info(`201 Insert ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(201).end();
    } catch (err) {
        console.log("err");
        next(createHttpError(500, err))
        logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
})


module.exports = router;