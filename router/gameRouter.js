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

router.get('/gameDetailFilter', (req, res, next) => {
    var i = 1,
        platform = req.query.platform,
        maincat = req.query.maincat,
        childcat = req.query.childcat,
        name = req.query.name,
        minprice = req.query.minprice,
        maxprice = req.query.maxprice,
        page = req.query.page,
        offset = ((page - 1) || 0) * LIMIT;
    const LIMIT = 18;
    var array = [];
    if (name) array.push(name);
    if (minprice) array.push(minprice);
    if (maxprice) array.push(maxprice);
    if (platform) array.push(platform);
    if (maincat) array.push(maincat);
    if (childcat) array.push(childcat);
    array.push(LIMIT);
    array.push(offset);
    console.log(array)
    return database.query(`SELECT g_id, g_name, g_description, g_price, g_discount, g_image, g_publishdate, g_region 
                            from G2A_gameDatabase 
                            where 1=1 ${name?`AND g_name LIKE '%' || $${i++} || '%' `:''}
                            ${minprice?`AND g_price >= $${i++} `:''}
                            ${maxprice?`AND g_price <= $${i++} `:''}
                            ${platform?`AND g_parentsubcategory = (select id from parent_subcategory where category_name = "$${i++}") `:''}
                            ${maincat?`AND g_maing_maincategory = (select id from main_category where category_name = "$${i++}") `:''}
                            ${childcat?`AND g_childsubcategory = (select id from child_subcategory where category_name = "$${i++}") `:''}
                            LIMIT $${i++} OFFSET $${i++};
                            `, array)
        .then(result => {
            return res.status(200).json({
                games: result.rows
            });
        })
        .catch(err => {
            next(createHttpError(500, err));
        })
})

module.exports = router;