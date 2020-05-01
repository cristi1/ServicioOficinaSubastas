var mysql = require("mysql");

function DataBaseHandler() {
    this.connection = null;
}

DataBaseHandler.prototype.createConnection = function () {

    this.connection = mysql.createConnection({
        host: '35.188.222.224' || 'bd',
        user: 'admin',
        password: 'Admin123***',
        database: 'oficinaSubasta',
        port: 3307
    });

    this.connection.connect();
    return this.connection;
};

module.exports = DataBaseHandler;

