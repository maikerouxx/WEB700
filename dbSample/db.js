const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    
});

pool.connect((err) => {
    if(err) throw err
    console.log("Connected to Postgres successfully!")
})

module.exports = pool;
