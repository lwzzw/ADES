const database = require('../database/database');
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = require('../middleware/checkUserAuthorize')
const router = require('express').Router();
const logger = require('../logger');

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email == null || password == null) {
        logger.error(`401 Empty Credentials ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        return next(createHttpError(401, "empty credentials"));
        
    } else {
        return database.query(`SELECT id, name, email FROM public.user_detail where email=$1 and password=$2`, [email, password])
            .then(results => {
                    console.log(results.rows.length);
                    if (results.rows.length == 1) {
                        let data = {
                            token: jwt.sign({
                                id: results.rows[0].id,
                                name: results.rows[0].name
                            }, config.JWTKEY, {
                                expiresIn: 86400 //Expires in 24 hrs
                            })
                        }; //End of data variable setup
                        logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                        return res.status(200).json(data);
                        
                    } //End of passowrd comparison.
                    else {
                        logger.error(`401 Login Failed ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                        return next(createHttpError(401, "login failed"));
                    }
                    
                } //End of checking if there are returned SQL results
            )
            .catch(err => {
                next(createHttpError(500, err));
                logger.error(`${err || '500 Error'} ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            })
    }
})

router.get('/checkLogin', verifyToken, (req, res, next) => {
    res.status(200).json({name:req.name});
    logger.info(`200 Login Success ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
})

module.exports = router;