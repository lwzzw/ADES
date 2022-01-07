const router = require('express').Router();
const config = require('../config');
const database = require('../database/database');
const verifyToken = require('../middleware/checkUserAuthorize');

//Endpoint to insert authenticator's secret key
router.post('/secretDetail', (req, res, next) => {
    var userID = req.body.uid;
    var secretKey = req.body.secretkey;
    return database.query(`INSERT INTO twofactor_authenticator (belong_to, secret_key) VALUES ($1, $2)`, [userID, secretKey])
    .then(response => {
        if (response.rowCount == 1) {
            let message = 'Successfully uploaded secret key'
            return res.status(200).json(message);
        } else {
            let message = 'error'
            return res.status(500).json(message)
        }
    }).catch(error => {
        next(createHttpError(500, error));
    })
})

//Endpoint to get user's secret key if it exists
router.get('/getSecret', verifyToken, (req, res, next) => {
    var userID = req.id
    return database.query(`SELECT secret_key FROM twofactor_authenticator WHERE belong_to = $1`, [userID])
    .then(result => {
        if (result.rows.length == 1) {
            return res.status(200).json(result.rows[0].secret_key)
        } else {
            let twoFAEnabled = false
            return res.status(200).json({message: twoFAEnabled})
        }
    }).catch(error => {
        next(createHttpError(500, error));
    })
})

module.exports = router;