const pool = require('../utils/db'); // Import the database pool
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    // Vercel serverless functions use req.method to determine HTTP method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // In a real app, you'd generate a JWT here
        res.status(200).json({ message: 'Login successful!', user: { id: user.id, username: user.username, name: user.name } });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Failed to login' });
    }
};
