const router = require('express').Router();
const config = require('../config');
const database = require('../database/database');
const verifyToken = require('../middleware/checkUserAuthorize');
const createHttpError = require("http-errors");
const axios = require('axios');
const jwt = require('jsonwebtoken');
const queryString = require('query-string');

router.get("/google/url", (req, res, next) => {
  const stringifiedParams = queryString.stringify({
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: 'http://f2a.games/authenticate/google', //change to https://f2a.games/authenticate/google when redeployed
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '), // space seperated string
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
  });
  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
  return res.redirect(googleLoginUrl);
})

router.get("/google", async (req, res, next)=> { 
    const code = req.query.code;
    console.log(code);

    //this gets the access code from the url that google sends after it redirects back to our website
    const  data1  = await axios({
      url: `https://oauth2.googleapis.com/token`,
      method: 'post',
      data: {
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://f2a.games/authenticate/google', //change to https://f2a.games/authenticate/google when redeployed;
        grant_type: 'authorization_code',
        code,
      },
    }).then((res) => res.data) //returns another url with access token
      .catch((error) => {
        next(createHttpError(500, error));
      });
      console.log(data1)
    if (data1 == null) { return next(createHttpError(500, 'no data')); }
    else {

      //using the access token to authorize our website to get the userinfo of the google account
      const data2  = await axios({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        method: 'get',
        headers: {
          Authorization: `Bearer ${data1.access_token}`,
        },
      }).then((res) => {
        return database
        .query(`SELECT name, email, phone FROM public.user_detail where email = $1`, [res.data.email])
        .then((response) => {
            if (response && response.rowCount == 1) {  //checks if the google account is already registered
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
            else{ //else they will be registerd
                return database
                .query(
                  `INSERT INTO public.user_detail (name, email, auth_type) VALUES ($1, $2, $3) returning id, name, phone, email`,
                  [res.data.given_name, res.data.email, 2]
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
