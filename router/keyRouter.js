const router = require('express').Router();
const config = require('../config');
const database = require('../database/database');
const verifyToken = require('../middleware/checkUserAuthorize');
const createHttpError = require("http-errors");
const { response } = require('express');
const { data } = require('../logger');

router.post('/getkeys', (req, res, next) =>{
    var id = req.body.userid;
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let keys = [];

    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            id = req.id;
        })
    } else {
        id = req.body.uid;
    }
    return database.query(`SELECT order_history.user_id, order_history.id, order_detail.g_id, order_detail.amount, g2a_gamedatabase.g_name  
    FROM order_history 
    INNER JOIN user_detail ON user_detail.id = order_history.user_id
    INNER JOIN order_detail ON order_history.id = order_detail.order_id 
    INNER JOIN g2a_gamedatabase ON g2a_gamedatabase.g_id = order_detail.g_id where user_id = $1`, [$1])
    .then(response => {
        if(response){
            for(var i = 0; i < response.amount; i++){
                keys.push(characters.charAt(Math.floor(Math.random() * 16)))
            }
            for(var j =0; j< keys.length; j++){
                return database.query(`INSERT INTO (order_id, g_id, key) VALUES($1, $2, $3)`, [response.order_id, response.g_id, keys[j]])
                .then(response => {
                    if(response.rowCount > 0){
                        return res.status(200).json(response);
                    }
                }).catch(error => {
                next(createHttpError(500, error));
            })
            }
            
        }
    }).catch(error => {
        next(createHttpError(500, error));
    })
})
module.exports = router;
