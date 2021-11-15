const database = require('../database/database');
const createHttpError = require('http-errors');

const router = require('express').Router();


router.get('/getAllCategories', async function (req, res, next) {
    try {
        let dbResult = await database.query("SELECT id, category_name FROM main_category").then(result => result).catch(err => {
            next(createHttpError(500, err))
        });
        for (let i = 0; i < dbResult.rows.length; i++) {
            let parentcat = await database.query(`SELECT id, category_name FROM parent_subcategory where fk_main=$1;`, [dbResult.rows[i].id])
                .then(result => result)
                .catch(err => {
                    next(createHttpError(500, err))
                });
            dbResult.rows[i].parent = parentcat.rows;
            for (let j = 0; j < parentcat.rows.length; j++) {
                let childcat = await database.query(`SELECT id, category_name FROM child_subcategory where fk_parent=$1;`, [parentcat.rows[j].id])
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

module.exports = router;