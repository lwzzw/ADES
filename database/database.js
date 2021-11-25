const pg = require('pg');
const DATABASE_URL = require("../config").DATABASEURL;

let connection;
exports.connect = function () {
  var connectionString = DATABASE_URL;
  // if (connection) {
  //     const oldConnection = connection;
  //     connection = null;
  //     return oldConnection.end().then(() => exports.connect(connectionString));
  // }
  connection = new pg.Pool({
    connectionString,
    max: 5
  });
  if (connection) {
    console.log("Database connected")
  }
  return connection.connect().catch(function (error) {
    connection = null;
    throw error;
  });
};

exports.query = function (text, params) {
  return new Promise((resolve, reject) => {
    if (!connection) {
      // reject(new Error('Not connected to database'));
       setTimeout(() => {
        exports.query(text, params);
      }, 1000);
      // return connection.query(text, params);
    }
    const start = Date.now();
    connection.query(text, params, function (error, result) {
      const duration = Date.now() - start;
      console.log('executed query', {
        text,
        duration
      });
      if (error) {
        reject(error);
        // console.log(error)
        //  setTimeout(() => {
        //   exports.query(text, params);
        // }, 1000);
      } else {
        resolve(result);
      }
    });
  })
  .catch(err=>{
    // console.log(err);
  });
};

////////////////////////////////////////////////////////////////////////////////////
// const pg = require('pg');

// let connection;
// exports.connect = function (connectionString) {
//   if (connection) {
//     const oldConnection = connection;
//     connection = null;
//     return oldConnection.end().then(() => exports.connect(connectionString));
//   }
//   // TODO: Use Pool instead of Client (Ref: https://node-postgres.com/features/pooling)
//   connection = new pg.Pool({
//     connectionString,
//   });
//   return connection.connect().catch(function (error) {
//     connection = null;
//     throw error;
//   });
// };

// exports.query = function (text, params) {
//   return new Promise((resolve, reject) => {
//     if (!connection) {
//       reject(new Error('Not connected to database'));
//       return
//     }
//     const start = Date.now();
//     connection.query(text, params, function (error, result) {
//       const duration = Date.now() - start;
//       console.log('executed query', { text, duration });
//       if (error) {
//         reject(error);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// };