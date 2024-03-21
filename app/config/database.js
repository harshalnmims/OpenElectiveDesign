const { Pool } = require('pg');
const { createClient } = require('redis');

const pgPool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'openelective',
});

const redisDb = createClient({
    host: 'localhost',
    port: 6379,
    password: 'yourpassword' 
});

module.exports = { pgPool,redisDb } ;