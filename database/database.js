const pg = require("pg");
const DATABASE_URL = require("../config").DATABASEURL;

let connection;
exports.connect = function () {
  var connectionString = DATABASE_URL;
  connection = new pg.Pool({
    connectionString,
    max: 4,
  });
  if (connection) {
    console.log("Database connected");
  }
  return connection.connect().catch(function (error) {
    connection = null;
    throw error;
  });
};

exports.query = function (text, params) {
  return new Promise((resolve, reject) => {
    if (!connection) {
      reject(new Error("Not connected to database"));
      //  setTimeout(() => {
      //   exports.query(text, params);
      // }, 1000);
      // return connection.query(text, params);
    }
    const start = Date.now();
    connection.query(text, params, function (error, result) {
      const duration = Date.now() - start;
      console.log("executed query", {
        text,
        duration,
      });
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  })
};

exports.transactionQuery = function (text, params) {
  return new Promise(async (resolve, reject) => {
    if (!connection) {
      reject(new Error("Not connected to database"));
    }
    try {
      console.log("start executed transaction query {", text, "}");
      const start = Date.now();
      await connection.query("BEGIN");
      const res = await connection.query(text, params);
      await connection.query("COMMIT");
      const duration = Date.now() - start;
      console.log("end executed transaction query", duration);
      resolve(res);
    } catch (e) {
      console.log("Rollback", text, params);
      await connection.query("ROLLBACK");
      reject(e);
    }
  });
};
