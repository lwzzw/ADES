const database = require('../database/database');
const createHttpError = require('http-errors');
const logger = require('../logger');
const router = require('express').Router();
var cat;
getCat();


//to use only one database connection so we use await
async function getCat() {
    try {
        let dbResult = await database.query("SELECT id, category_name FROM main_category").then(result => result).catch(err => {
            // console.log(err);
            logger.error(`${err} - ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        });
        dbResult.rows.main = dbResult.rows;
        for (let i = 0; i < dbResult.rows.length; i++) {
            let parentcat = await database.query(`SELECT id, category_name, fk_main FROM parent_subcategory where fk_main=$1;`, [dbResult.rows[i].id])
                .then(result => result)
                .catch(err => {
                    // console.log(err);
                    return
                });
            dbResult.rows[i].parent = parentcat.rows;
            for (let j = 0; j < parentcat.rows.length; j++) {
                let childcat = await database.query(`SELECT id, category_name, fk_parent FROM child_subcategory where fk_parent=$1;`, [parentcat.rows[j].id])
                    .then(result => result)
                    .catch(err => {
                        // console.log(err);
                        return
                    });
                dbResult.rows[i].parent[j].child = childcat.rows;
            }
        }
        cat = dbResult.rows
        return {
            categories: cat
        }
    } catch (err) {
        // console.log(err);
        getCat();
    }
}

router.get('/getAllCategories', async function (req, res, next) {
    if (cat) return res.status(200).json({
        categories: cat
    })
    let result = await getCat();
    if (result) { 
        logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        return res.status(200).json(result);
    }
    else {
        next(createHttpError(500, "Get category error"));
        logger.error(`500 Error ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
})

router.get('/countOfGame/:mainCategory', (req, res, next) => {
    var mainCat = req.params.mainCategory;
    return database.query(`SELECT COUNT(g_id),category_name 
                            FROM G2A_gameDatabase 
                            join child_subcategory on g_childSubcategory = id 
                            WHERE g_maincategory = (select id from main_category where category_name = $1)
                            group by category_name`, [decodeURI(mainCat)])
        .then(result => {
            logger.info(`200 OK ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(200).json({
                count: result.rows
            });
        })
        .catch(err => {
            next(createHttpError(500, err));
            logger.error(`${err || '500 Error'} ||  ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        })
})

module.exports = router;