const router = require('express').Router();
const config = require('../config');
const database = require('../database/database');
const verifyToken = require('../middleware/checkUserAuthorize');
const createHttpError = require("http-errors");

router.post('/getkeys', (req, res, next) =>{
    var id = req.body.uid;

    if (req.headers.authorization) {
        verifyToken(req, res, () => {
            id = req.id;
        })
    } else {
        id = req.body.uid;
    }
    return database.query(`SELECT g2a_gamedatabase.g_name, keys.order_id, keys.g_id, keys.key FROM keys
     INNER JOIN order_history ON order_history.id = keys.order_id 
     INNER JOIN g2a_gamedatabase ON g2a_gamedatabase.g_id = keys.g_id
     where user_id = $1`, [id])
    .then(response => {
        if(response){
           return res.status(200).json({
            keys : response.rows
           });
        }
        else{
            return res.status(404).json("not found");
        }
    }).catch(error => {
        next(createHttpError(500, error));
    })
})
module.exports = router;