const express = require("express");
const app = express();
const path = require('path');
const createHttpErrors = require('http-errors');
const ApiRouter = require('./router/api');
const db = require("./database/database");
const port = require("./config").PORT;
// const port = 3001;

db.connect()
    .then(response => {
        if (response) {
            return db.query(
                `

        
        CREATE TABLE IF NOT EXISTS main_category (
          id SERIAL primary key,
          category_name VARCHAR (50) not null,
        );

        CREATE TABLE IF NOT EXISTS parent_subcategory (
          id SERIAL primary key,
          sub_category_name VARCHAR (50) not null,
          fk_main INT not null,

        );

        CREATE TABLE IF NOT EXISTS child_subcategory (
            id SERIAL primary key,
            child_category_name VARCHAR (50) not null,
            fk_parent INT not null,
          );

          DROP TABLE G2A_gameDatabase;
          CREATE TABLE IF NOT EXISTS G2A_gameDatabase (
            gid SERIAL primary key,
            g_name VARCHAR (50) not null,
            g_platform VARCHAR (50) not null,
            g_price NUMERIC(12,2) not null,
            g_description VARCHAR null,
            g_maincategory INT not null,
            g_parentSubcategory INT null,
            g_childSubcategory INT null,
            g_image VARCHAR (255) null,
            g_publishDate DATE not null,
            CONSTRAINT fk_main FOREIGN KEY(g_maincategory) REFERENCES main_category(id),
            CONSTRAINT fk_parent FOREIGN KEY(g_parentSubcategory) REFERENCES parent_subcategory(id),
            CONSTRAINT fk_child FOREIGN KEY(g_childSubcategory) REFERENCES child_subcategory(id)
          );
          
        CREATE TABLE IF NOT EXISTS order_history (
            historyid SERIAL primary key,

        )
        `
            )
                // .then(response => {
                //     return db.query(`
                // INSERT INTO main_category (category_name, fk_game_id) SELECT 'MOBA', 1 WHERE NOT EXISTS (SELECT * FROM main_category WHERE category_name = 'MOBA');
                // INSERT INTO main_category (category_name, fk_game_id) SELECT 'MMO', 1 WHERE NOT EXISTS (SELECT * FROM main_category WHERE category_name = 'MMO');
                // INSERT INTO g2a_gamedatabase (g_name, g_platform, g_price, g_description, g_image, g_publishdate) SELECT 'DOTA 2', 'PC', 99.9, 'EZ GAME', 'image', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT * FROM g2a_gamedatabase WHERE g_name = 'DOTA 2');
                //  `)
                // })
                // .then(response => {
                //     return db.query(`SELECT main_category.fk_game_id, g2a_gamedatabase.g_name, string_agg(main_category.category_name, ',') FROM main_category INNER JOIN g2a_gamedatabase ON main_category.fk_game_id = g2a_gamedatabase.gid GROUP BY main_category.fk_game_id,g2a_gamedatabase.g_name`);
                // })
                .then(response => {
                    console.log(response.rows)

                    console.log('GameName : ' + response.rows[0].game_name + ' GameCategory : ' + response.rows[0].string_agg)
                    // can be used to split categories
                    // let categories = response.rows[0].string_agg
                    // for (let i = 0; i < categories.split(',').length; i++) {
                    //   console.log(categories.split(',')[i])
                    // }


                })
        }
    })
    .catch(err => {
        console.log(err)
    })

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));

app.use(ApiRouter);

// 404 Handler
app.use((req, res, next) => {
    console.log('404');
    next(createHttpErrors(404, `Unknown Resource ${req.method} ${req.originalUrl}`));
});

// Error Handler
app.use((error, req, res, next) => {
    console.error(error);
    return res.status(error.status || 500).json({
        error: error.message || `Unknown Error!`,
        status: error.status
    });
});

app.listen(port, () => {
    console.log(`App listen on port http://localhost:${port}`);
});