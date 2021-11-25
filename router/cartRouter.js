const database = require('../database/database');
const createHttpError = require('http-errors');
const verifyToken = require('../middleware/checkUserAuthorize');
const {
    throws
} = require('assert');
const {
    error
} = require('console');
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
        if (result) {
            return res.status(200).json({
                cart: result.rows
            });
        }else {
            return res.status(200).json({
                cart: []
            });
        }
    }).catch(err => {
        next(createHttpError(500, err))
    })
})

router.post("/editShoppingCart", async function (req, res, next) {
    var id;
    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            id = req.id;
        })
    } else {
        id = req.body.uid;
    }
    try {
        var cart = req.body.cart;
        for (let i = 0; i < cart.length; i++) {
            let c = cart[i];
            await database.query(`select insert_cart($1, $2, $3, $4)`, [id, c.id, c.amount, req.body.edit])
                .catch(err => {
                    throw err;
                })
        }
        res.status(201).end();
    } catch (err) {
        next(createHttpError(500, err))
    }
})


module.exports = router;