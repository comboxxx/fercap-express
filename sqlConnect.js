var mysql = require('mysql');

var mysql_conn = mysql.createConnection({
    host: '127.0.0.1',
    // host: 'localhost',
    user: 'root',
    password: 'winza0074',
    database: 'FercapDB',
    insecureAuth: true
});

module.exports = mysql_conn