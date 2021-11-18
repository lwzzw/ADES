const database = require('../database/database');
const createHttpError = require('http-errors');
const router = require('express').Router();


router.get('/gameDetailById/:id', (req, res, next) => {
    var id = req.params.id;
    //parent_subcategory is platform
    return database.query(`SELECT g_id, g_name, g_description, g_price, g_image, g_publishdate, g_region, category_name 
                            from G2A_gameDatabase 
                            join parent_subcategory on g_parentsubcategory = id 
                            where g_id = $1`, [id])
        .then(result => {
            return res.status(200).json({
                game: result.rows
            });
        })
        .catch(err => {
            next(createHttpError(500, err))
        })
})

router.get('/gameDetailByPlatform/:platform', (req, res, next) => {
    var platform = req.params.platform;
    return database.query(`SELECT g_id, g_name, g_description, g_price, g_image, g_publishdate, g_region, category_name 
                            from G2A_gameDatabase 
                            join parent_subcategory on g_parentsubcategory = id 
                            where category_name = $1`, [platform])
        .then(result => {
            return res.status(200).json({
                games: result.rows
            });
        })
        .catch(err => {
            next(createHttpError(500, err));
        })
})

router.get('/gameDetailByMainCategory/:main', (req, res, next) => {
    var main = req.params.main;
    return database.query(`SELECT g_id, g_name, g_description, g_price, g_image, g_publishdate, g_region, category_name 
                            from G2A_gameDatabase 
                            join main_category on g_maincategory = id 
                            where category_name = $1`, [main])
        .then(result => {
            return res.status(200).json({
                games: result.rows
            });
        })
        .catch(err => {
            next(createHttpError(500, err));
        })
})

router.get('/getDeals', (req, res, next) => {
    return database.query(`SELECT * FROM g2a_gamedatabase WHERE g_discount IS NOT NULL`)
        .then(result => {
                return res.status(200).json({
                    deals: result.rows
                })
        })
        .catch(err => {
            next(createHttpError(500, err));
        })
})

module.exports = router;