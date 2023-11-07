const { Pool, Client } = require('pg')
var Config = require('./config/config');
 
const pool = new Pool({
    host: Config.database.host,
    user: Config.database.username,
    password: Config.database.password,
    port:Config.database.port,
    database: Config.database.database,
    ssl: {
        rejectUnauthorized: false, // Set this to true in a production environment with a proper SSL certificate
    },
        
});

pool.connect();
 
module.exports ={
    connection: pool
};