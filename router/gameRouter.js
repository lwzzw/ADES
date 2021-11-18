const database = require('../database/database');
const createHttpError = require('http-errors');

const router = require('express').Router();


router.get('/getAllCategories', async function (req, res, next) {
    //to use only one database connection so we use await
    try {
        let dbResult = await database.query("SELECT id, category_name FROM main_category").then(result => result).catch(err => {
            next(createHttpError(500, err))
        });
        dbResult.rows.main = dbResult.rows;
        for (let i = 0; i < dbResult.rows.length; i++) {
            let parentcat = await database.query(`SELECT id, category_name, fk_main FROM parent_subcategory where fk_main=$1;`, [dbResult.rows[i].id])
                .then(result => result)
                .catch(err => {
                    next(createHttpError(500, err))
                });
            dbResult.rows[i].parent = parentcat.rows;
            for (let j = 0; j < parentcat.rows.length; j++) {
                let childcat = await database.query(`SELECT id, category_name, fk_parent FROM child_subcategory where fk_parent=$1;`, [parentcat.rows[j].id])
                    .then(result => result)
                    .catch(err => {
                        next(createHttpError(500, err))
                    });
                dbResult.rows[i].parent[j].child = childcat.rows;
            }
        }
        return res.status(200).json({
            categories: dbResult.rows
        })
    } catch (err) {
        next(createHttpError(500, err));
    }
})

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

router.get('/game',(req, res, next)=>{
    // console.log(req.query)
    
})

module.exports = router;