require('dotenv').config(); // Ensure .env variables are loaded

const mysql = require('mysql2/promise');

// Create a database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool for use in other functions
module.exports = pool;