var mysql = require('mysql2');
const sql = require('mssql');

const config = {
    server: 'localhost\\SQLEXPRESS',  // Your MSSQL server name or IP address
    database: 'planner',
    user: "root",
    password: "vermilion",
    options: {
      encrypt: false,  // For security reasons, always use encryption when connecting to Azure SQL Database
    //   trustedConnection: true,  // Use Windows Authentication
    },

    // server: "db",
    // database: 'planner',
    // user: "sa",
    // password: "Vermilion9$",
    // port: 1433,
    // options: {
    //   encrypt: false,  // For security reasons, always use encryption when connecting to Azure SQL Database
    //   trustServerCertificate: true,
    // //   trustedConnection: true,  // Use Windows Authentication
    // },
};
const pool = new sql.ConnectionPool(config);

pool.connect()
  .then(() => {
    console.log('Connected to MSSQL database');
  })
  .catch((err) => {
    console.error('Error connecting to MSSQL database', err);
  });

//   pool.connect()
//     .then(() => {
//       console.log('Connected to MSSQL database');
//     })
//     .catch((err) => {
//       console.error('Error connecting to MSSQL database', err);
//     });
  
// var conn = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'planner'
// });


// conn.connect(function(err) {
//     if (err) throw err;
//     console.log('Database: lapoplanner connected');
// });

module.exports = pool;