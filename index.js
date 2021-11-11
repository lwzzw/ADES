const express = require("express");
const app = express();
const path = require('path');
const createHttpErrors = require('http-errors');
const ApiRouter = require('./router/api');
const db = require("./database/database");
// const port = 3001;
const port = process.env.PORT || 5000;

db.connect();

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));

app.post('/connect', function (req, res, next) {
    // query parameters are all strings
    const reset = req.query.reset === 'true';
    const connectionString = req.body.connectionString;
    db.connect(connectionString).then(function () {
      return db
        .query(
          `
          ${reset ? 'DROP TABLE IF EXISTS modules_tab;' : ''}
          CREATE TABLE IF NOT EXISTS modules_tab (
            id SERIAL primary key,
            module_code VARCHAR unique not null,
            module_credit INT not null,
            grade VARCHAR
          );
        `,
          [],
        )
        .then(() => {
          return res.sendStatus(200);
        })
        .catch((error) => {
          return next(error);
        });
    })
    .catch(err=>{
        return next(err);
    });
  });

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

app.listen(port, ()=>{
    console.log(`App listen on port http://localhost:${port}`);
});