const router = require('express').Router();
const config = require('../config');
const database = require('../database/database');
const verifyToken = require('../middleware/checkUserAuthorize');
const createHttpError = require("http-errors");

//Endpoint to insert authenticator's secret key
router.post('/secretDetail', (req, res, next) => {
    var userID = req.body.uid;
    var secretKey = req.body.secretkey;
    return database.query(`SELECT auth_type FROM user_detail WHERE id = $1`, [userID])
    .then(response => {
        if (response && response.rows[0].auth_type == 2) {
            throw new Error('third-party do not need 2-fa');
        } else {
            return database.query(`INSERT INTO twofactor_authenticator (belong_to, secret_key) VALUES ($1, $2) ON CONFLICT (belong_to) DO UPDATE SET secret_key = $2`, [userID, secretKey])
            .then(response => {
                if (response) {
                    if (response.rowCount == 1) {
                        let message = 'Successfully uploaded secret key'
                        return res.status(200).json(message);
                    }
                }
            }).catch(error => {
                next(createHttpError(500, error));
            })
        }
    }).catch(error => {
        next(createHttpError(500, error));
    })


})

//Endpoint to get user's secret key if it exists
router.get('/getSecret', verifyToken, (req, res, next) => {
    var userID = req.id

    return database.query(`SELECT twofactor_authenticator.belong_to, twofactor_authenticator.secret_key, auth_type FROM twofactor_authenticator INNER JOIN user_detail ON twofactor_authenticator.belong_to = user_detail.id WHERE belong_to = $1`, [userID])
    .then(result => {
        if (result.rows.length == 1 && result.rows[0].auth_type == 1) {
            return res.status(200).json(result.rows[0].secret_key)
        } else if (result.rows.length == 1 && result.rows[0].auth_type == 2) {
            throw new Error ('Users connected via third party platforms need not have 2-fa enabled');
        } 
        else {
            let twoFAEnabled = false
            return res.status(200).json({message: twoFAEnabled})
        }
    }).catch(error => {
        next(createHttpError(500, error));
    })
})

module.exports = router;