const database = require("../database/database");
database.connect();
exports.getPrice = function (gameName) {
  return database
    .query(
      `SELECT g_name, COALESCE(g_discount, g_price) g_price FROM g2a_gamedatabase WHERE g_name ILIKE '%' || $1 || '%'`,
      [gameName]
    )
    .then((result) => {
      return { data: result.rows };
    })
    .catch((err) => {
      console.log(err);
      return { err };
    });
};

exports.getBSellers = function () {
  return database
    .query(
      `SELECT SUM(amount) bestseller, g2a_gamedatabase.g_name, COALESCE(g_discount, g_price) g_price FROM order_detail INNER JOIN g2a_gamedatabase ON order_detail.g_id = g2a_gamedatabase.g_id GROUP BY order_detail.g_id, g2a_gamedatabase.g_name, g2a_gamedatabase.g_image, g2a_gamedatabase.g_price, g2a_gamedatabase.g_discount ORDER BY bestseller DESC LIMIT 10;`,
      []
    )
    .then((result) => {
      return { data: result.rows };
    })
    .catch((err) => {
      console.log(err);
      return { err };
    });
};

exports.getPreorders = function () {
  return database
    .query(
      `SELECT g_name, COALESCE(g_discount, g_price) g_price, g_publishdate FROM g2a_gamedatabase WHERE g_publishDate > current_timestamp LIMIT 10;`,
      []
    )
    .then((result) => {
      return { data: result.rows };
    })
    .catch((err) => {
      console.log(err);
      return { err };
    });
};
