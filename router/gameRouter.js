const database = require('../database/database');
const createHttpError = require('http-errors');
const router = require('express').Router();
const logger = require('../logger');

router.get('/gameDetailById/:id', (req, res, next) => {
    var id = req.params.id;
    //parent_subcategory is platform
    return database.query(`SELECT g_id, g_name, g_description, g_price, g_image, g_publishdate, g_region, g_discount, category_name 
                            from G2A_gameDatabase 
                            join parent_subcategory on g_parentsubcategory = id 
                            where g_id = $1`, [id])
        .then(result => {
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                game: result.rows
            });
        })
        .catch(err => {
            next(createHttpError(500, err))
            logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})

router.get('/gameDetailFilter', (req, res, next) => {
    const LIMIT = 18;
    var i = 1,
        platform = req.query.platform,
        maincat = req.query.maincat,
        childcat = req.query.childcat,
        name = req.query.name,
        minprice = req.query.minprice,
        maxprice = req.query.maxprice,
        page = req.query.page,
        offset = ((page - 1) < 0 ? 0 : page - 1) * LIMIT || 0,
        order = req.query.sort;
    var array = [];
    if (name) array.push(name);
    if (minprice) array.push(minprice);
    if (maxprice) array.push(maxprice);
    if (platform) array.push(platform);
    if (maincat && maincat != "All categories") array.push(maincat);
    if (childcat) array.push(childcat);
    if (order) {
        if (order == "default") order = "";
        else if (order == "pricedesc") order = "g_price desc";
        else if (order == "priceasc") order = "g_price asc";
        else if (order == "datedesc") order = "g_publishdate desc";
        else if (order == "datedasc") order = "g_publishdate asc";
        else order = ""
    }
    array.push(LIMIT);
    array.push(offset);
    return database.query(`SELECT g_id, g_name, g_description, g_price, g_discount, g_image, g_publishdate, g_region 
                            from G2A_gameDatabase 
                            where 1=1 ${name?`AND g_name LIKE '%' || $${i++} || '%' `:''}
                            ${minprice?`AND COALESCE(g_discount, g_price) >= $${i++} `:''}
                            ${maxprice?`AND COALESCE(g_discount, g_price) <= $${i++} `:''}
                            ${platform?`AND g_parentsubcategory = (select id from parent_subcategory where category_name = $${i++}) `:''}
                            ${maincat&&maincat!="All categories"?`AND g_maincategory = (select id from main_category where category_name = $${i++}) `:''}
                            ${childcat?`AND g_childsubcategory in (select id from child_subcategory where category_name = $${i++}) `:''}
                            ${order?"order by "+order:""}
                            LIMIT $${i++} OFFSET $${i++};
                            `, array)
        .then(result => {
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                games: result.rows
            });
        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})

router.get('/getDeals', (req, res, next) => {

    return database.query(`SELECT * FROM g2a_gamedatabase WHERE g_discount IS NOT NULL`)
        .then(result => {
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                deals: result.rows
            })

        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})

router.get('/getBSellers', (req, res, next) => {

    return database.query(`SELECT order_detail.g_id, SUM(amount) bestseller, g2a_gamedatabase.g_name, g2a_gamedatabase.g_image, COALESCE(g_discount, g_price) bs_price, g2a_gamedatabase.g_price FROM order_detail INNER JOIN g2a_gamedatabase ON order_detail.g_id = g2a_gamedatabase.g_id GROUP BY order_detail.g_id, g2a_gamedatabase.g_name, g2a_gamedatabase.g_image, g2a_gamedatabase.g_price, g2a_gamedatabase.g_discount  ORDER BY bestseller DESC LIMIT 6;`)
        .then(result => {
            if (!result.rows) return res.status(200).json({
                bsellers: []
            })
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                bsellers: result.rows
            })
        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'} ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})

router.get('/getPreorders', (req, res, next) => {

    return database.query(`SELECT g_id, g_name, g_price, g_image, COALESCE(g_discount, g_price) preorder_price, NULLIF(g2a_gamedatabase.g_discount, g2a_gamedatabase.g_price), g_publishdate FROM g2a_gamedatabase WHERE g_publishDate > current_timestamp LIMIT 6;`)
        .then(result => {
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                preorders: result.rows
            })
        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'} ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})

router.get('/getLRelease', (req, res, next) => {

    return database.query(`SELECT g_id, g_name, g_image,COALESCE(g_discount, g_price) g_discount, g_price, NULLIF(g2a_gamedatabase.g_discount, g2a_gamedatabase.g_price), to_char(g_publishdate::timestamp,'dd/mm/YYYY') as date FROM g2a_gamedatabase WHERE g_publishdate <= current_timestamp ORDER BY g_publishdate DESC LIMIT 6;`)
        .then(result => {
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                lrelease: result.rows
            })
        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'}  ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})


module.exports = router;