const pg = require("pg");
const DATABASE_URL = require("../config").DATABASEURL;

let connection;
exports.connect = function () {
  var connectionString = DATABASE_URL;
  connection = new pg.Pool({
    connectionString,
    max: 4,//the database only allow 5 connection and another one connection already have been used by discord bot
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
      reject(new Error("Not connected to database"));//if connection is undefined reject the query
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
  });
};

exports.transactionQuery = function (text, params) {
  return new Promise(async (resolve, reject) => {
    if (!connection) {
      reject(new Error("Not connected to database"));//if connection is undefined reject the query
    }
    try {
      console.log("start executed transaction query {", text, "}");
      const start = Date.now();
      await connection.query("BEGIN");//start transaction query
      const res = await connection.query(text, params);
      await connection.query("COMMIT");//commit the change
      const duration = Date.now() - start;
      console.log("end executed transaction query", duration);
      resolve(res);
    } catch (e) {
      console.log("Rollback", text, params);
      await connection.query("ROLLBACK");//if error occur roll back the change
      reject(e);
    }
  });
};
