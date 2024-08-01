const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'web700db',
    password: '1212',
    port: 5432,
});

module.exports = pool;
