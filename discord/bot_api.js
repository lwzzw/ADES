const database = require("../database/database");
database.connect();
exports.getPrice = function (gameName) {
  return database
    .query(
      `SELECT g_name, COALESCE(g_discount, g_price) as g_price FROM g2a_gamedatabase WHERE g_name ILIKE '%' || $1 || '%'`,
      [gameName]
    )
    .then((result) => {
      return { data: result.rows };
    })
    .catch((err) => {
      console.log("enter");
      console.log(err);
      return { err };
    });
};
