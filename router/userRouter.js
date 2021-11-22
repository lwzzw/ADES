const database = require('../database/database');
const createHttpError = require('http-errors');

const router = require('express').Router();

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;


    return database.query(`SELECT id, name, email, password FROM public.user_detail ORDER BY id`)
    .then(result => {
        
            for(let i = 0; i< result.rows.length; i++) {
                const user = result.rows[i];
                if(email == user.email && password == user.password){ 
                    return res.status(200).json({userid: userid});
                }
            }
            
    })
    .catch(err =>{
        next(createHttpError(500, err));
    })
})

module.exports = router;