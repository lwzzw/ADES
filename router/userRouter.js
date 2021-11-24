const database = require('../database/database');
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = require('../middleware/checkUserAuthorize')
const router = require('express').Router();

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body);
    if (email == null || password == null) {
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
                        return res.status(200).json(data);
                    } //End of passowrd comparison with the retrieved decoded password.
                    else return next(createHttpError(401, "login failed"));
                } //End of checking if there are returned SQL results
            )
            .catch(err => {
                next(createHttpError(500, err));
            })
    }
})

router.get('/checkLogin', verifyToken, (req, res, next) => {
    res.status(200).json({name:req.name});
})

module.exports = router;