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
        CREATE TABLE IF NOT EXISTS G2A_gameDatabase (
          game_id SERIAL primary key,
          game_name VARCHAR (50) not null,
          game_platform VARCHAR (50) not null,
          game_price NUMERIC(12,2) not null,
          game_description VARCHAR(255) not null,
          game_image VARCHAR (255) not null
        );

        CREATE TABLE IF NOT EXISTS G2A_category (
          category_name VARCHAR (50) not null,
          fk_game_id INT not null
        );
        `
            )
                .then(response => {
                    return db.query(`
                INSERT INTO g2a_category (category_name, fk_game_id) SELECT 'MOBA', 1 WHERE NOT EXISTS (SELECT * FROM g2a_category WHERE category_name = 'MOBA');
                INSERT INTO g2a_category (category_name, fk_game_id) SELECT 'MMO', 1 WHERE NOT EXISTS (SELECT * FROM g2a_category WHERE category_name = 'MMO');
                INSERT INTO g2a_gamedatabase (game_name, game_platform, game_price,game_description, game_image) SELECT 'DOTA 2', 'PC', 99.9, 'EZ GAME', 'image' WHERE NOT EXISTS (SELECT * FROM g2a_gamedatabase WHERE game_name = 'DOTA 2');
                 `)
                })
                .then(response => {
                    return db.query(`SELECT g2a_category.fk_game_id, g2a_gamedatabase.game_name, string_agg(g2a_category.category_name, ',') FROM g2a_category INNER JOIN g2a_gamedatabase ON g2a_category.fk_game_id = g2a_gamedatabase.game_id GROUP BY g2a_category.fk_game_id,g2a_gamedatabase.game_name`);
                })
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