const database = require('../database/database');
const createHttpError = require('http-errors');

const router = require('express').Router();


router.get('/getAllCategories', function (req, res, next) {
    return database
        .query(`SELECT category_name FROM g2a_category`)
        .then(result => {
            return res.status(200).json({categories: result.rows})
        })
})

module.exports = router;
