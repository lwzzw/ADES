const express = require("express");
const app = express();
const path = require("path");
const createHttpErrors = require("http-errors");
const ApiRouter = require("./router/api");
const db = require("./database/database");
const port = require("./config").PORT;
const config = require("./config");
const getCat = require("./router/categoryRouter").getCat;
const queryString = require("query-string");
const getGameAC = require("./router/gameRouter").getGameAC;
const readFile = require("fs").readFile;
const verifyToken = require('./middleware/checkUserAuthorize');
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");


db.connect()
  .then(() => {
     //return
    let tableStr;
    readFile("./table.txt", (err, data) => {
      if (err) throw err;
      tableStr = data.toString();
      db.query(tableStr).then(() => {
        getCat();
        getGameAC();
      }).catch((err)=>{
        console.log(err);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
});

app.use((req, res, next) => {
  if (req.path.includes("category.html")) {
    res.sendFile(path.join(__dirname, "/public/html/category.html"));
  } else {
    next();
  }
});

app.get("/shoppingCart.html", (req, res, next) => {
  res.render("shoppingCart", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  });
});

app.get('/bestseller', (req, res, next) => {
  res.sendFile(path.join(__dirname, "/public/html/discover.html"));
})

app.get('/preorders', (req, res, next) => {
  res.sendFile(path.join(__dirname, "/public/html/discover.html"));
})

app.get("/admin_page", verifyToken, (req, res, next)=>{
  if(req.role!=1){
    res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "/public/html/adminPage.html"));
})

app.get("/admin_game_list", verifyToken, (req, res, next)=>{
  if(req.role!=1){
    res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "/public/html/adminGameList.html"));
})

app.get("/edit_game", verifyToken, (req, res, next)=>{
  if(req.role!=1){
    res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "/public/html/editGame.html"));
})

app.get("/admin_requests", verifyToken, (req, res, next)=>{
  if(req.role!=1){
    res.redirect("/login.html");
  }
  res.sendFile(path.join(__dirname, "/public/html/adminRequest.html"));
})

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/html")));

app.use(ApiRouter);

// 404 Handler
app.use((req, res, next) => {
  console.log("404");
  next(
    createHttpErrors(404, `Unknown Resource ${req.method} ${req.originalUrl}`)
  );
});

// Error Handler
app.use((error, req, res, next) => {
  console.error(error);
  return res.status(error.status || 500).json({
    error: error.message || `Unknown Error!`,
    status: error.status,
  });
});

app.listen(port, () => {
  console.log(`App listen on port http://localhost:${port}`);
});
