var mysql = require("mysql");

function DataBaseHandler() {
    this.connection = null;
}

DataBaseHandler.prototype.createConnection = function () {

    this.connection = mysql.createConnection({
        host: 'db' || '172.18.0.2',
        user: 'admin',
        password: 'Admin123***',
        database: 'oficinaSubasta'
    });

    this.connection.connect();
    return this.connection;
};

module.exports = DataBaseHandler;

