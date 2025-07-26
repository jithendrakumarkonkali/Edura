const pool = require('../utils/db'); // Ensure this path is correct

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Attempt to get a connection from the pool to test connectivity
        const connection = await pool.getConnection();
        connection.release(); // Release the connection immediately

        // Attempt a simple query to ensure the database and a table exist
        // This query will fail if the 'users' table doesn't exist, which is good for debugging
        await pool.query('SELECT 1 FROM users LIMIT 1');

        res.status(200).json({ message: 'Database connection successful and users table accessible!' });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
};
