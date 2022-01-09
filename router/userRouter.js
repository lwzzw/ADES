const database = require('../database/database');
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
                            expiresIn: 86400
                        })
                    };
                    logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                    return res.status(200).json(data);

                }
                else {
                    logger.error(`401 Login Failed ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                    return next(createHttpError(401, "login failed"));
                }

            }
            )
            .catch(err => {
                next(createHttpError(500, err));
                logger.error(`${err || '500 Error'} ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            })
    }
}),

    router.post('/register', (req, res, next) => {
        const username = req.bosy.username;
        const useremail = req.body.useremail;
        const userpassword = req.body.password;
        const userphone = req.body.phone;
        const usergender = req.body.gender;
        if (username == null || useremail == null || userpassword == null || userphone == null || usergender == null) {
            logger.error(`401 Empty Credentials ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return next(createHttpError(401, "empty credentials"));
        }
        else {
            bcrypt.hash(userpassword, 10, async (err, hash) => {
                if (err) {
                    console.log('Error on hashing password');
                    res.status(500).json({ statusMessage: 'Unable to complete registration' });
                    return logger.error(`500 unable to complete registration || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                } else {
                    return database.query(`INSERT INTO public.user_detail (name, email, password, gender, c_card, phone) VALUES ($1, $2, $3, $4, $5, $6)`, [username, useremail, hash, usergender, , userphone])
                    .then(response => {
                        if (response) {
                            if (response.rowCount == 1) {
                                let data = {
                                    token: jwt.sign({
                                        id: results.rows[0].id,
                                        name: results.rows[0].name
                                    }, config.JWTKEY, {
                                        expiresIn: 86400
                                    })
                                }

                            }
                            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                            return res.status(200).json(data);
                        }
                        else {
                            logger.error(`401 Login Failed ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                            return next(createHttpError(401, "login failed"));
                        }


                    }).catch(error => {
                        next(createHttpError(500, error));
                    })
                }

            })
    }
})

router.get('/checkLogin', verifyToken, (req, res, next) => {
    res.status(200).json({ name: req.name, id: req.id });
})

module.exports = router;