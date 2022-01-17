const router = require('express').Router();
const config = require('../config');
const database = require('../database/database');
const verifyToken = require('../middleware/checkUserAuthorize');
const createHttpError = require("http-errors");
const axios = require('axios');
const jwt = require('jsonwebtoken');
const queryString = require('query-string');
const { response } = require('express');

router.get("/google", async (req, res, next)=> { 
    const code = req.query.code;
    console.log(code);

    const  data1  = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: 'post',
      data: {
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:5000/authenticate/google', //change to https://f2a.games/authenticate/google when redeployed;
        grant_type: 'authorization_code',
        code,
      },
    }).then((res) => res.data)
      .catch((error) => {
        next(createHttpError(500, error));
      });
      console.log(data1)
    if (data1 == null) { return next(createHttpError(500, 'no data')); }
    else {
      const data2  = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${data1.access_token}`,
        },
      }).then((res) => {
        return database
        .query(`SELECT name, email, password, phone FROM public.user_detail where email = $1`, [res.data.email])
        .then((response) => {
            if (response && response.rowCount == 1) {
                let data = {
                  token: jwt.sign(
                    {
                      id: response.rows[0].id,
                      name: response.rows[0].name,
                      email: response.rows[0].email,
                      phone: response.rows[0].phone
                    },
                    config.JWTKEY,
                    {
                      expiresIn: 86400,
                    }
                 ),
                };
                return data;
            }
            else{
                return database
                .query(
                  `INSERT INTO public.user_detail (name, email, password) VALUES ($1, $2, $3) returning id, name, phone, email`,
                  [res.data.given_name, res.data.email, "hidden"]
                )
                .then((response) => {
                  console.log(response)
                  if (response && response.rowCount == 1) {
                    let data = {
                      token: jwt.sign(
                        {
                          id: response.rows[0].id,
                          name: response.rows[0].name,
                          email: response.rows[0].email,
                          phone: response.rows[0].phone
                        },
                        config.JWTKEY,
                        {
                          expiresIn: 86400,
                        }
                        ),
                    };
                    return data;
            }
            
        })    
        }
        
        }) 
      })
      res.redirect("/index.html?token="+data2.token)
      return res.status(200).json(data2.token);
      }
    })


module.exports = router;
