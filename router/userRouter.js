const database = require('../database/database');
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = require('express').Router();

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body);
    if(email == null || password == null){
        return next(createHttpError(500, "empty credentials"));
    }
    else{
    return database.query(`SELECT id, name, email FROM public.user_detail where email=$1 and password=$2`, [email, password])
        .then(results => {
            console.log(results.rows.length);
            if (results.rows.length == 1) {
                if ((password == null) || (results.rows[0] == null)) {
                  console.log("smth");
                    return res.status(403).json({ message: 'login failed' });

                }
                // if (bcrypt.compareSync(password, results[0].user_password) == true) {

                let data = {
                    user_id: results.rows[0].id,
                    token: jwt.sign({ id: results.rows[0].id }, config.JWTKEY, {
                        expiresIn: 86400 //Expires in 24 hrs
                    })
                }; //End of data variable setup

                return res.status(200).json(data);

                // } else {
                //     // return res.status(500).json({ message: 'Login has failed.' });
                //     res.status(500).json({ message:'login had failed.' });


            } //End of passowrd comparison with the retrieved decoded password.
            else return next(createHttpError(403, "login failed"));
        } //End of checking if there are returned SQL results

        )

        .catch(err => {
            next(createHttpError(500, err));
            
        })
    }
})


module.exports = router;