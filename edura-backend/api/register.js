const pool = require('../utils/db'); // Import the database pool
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, username, password, email, dob } = req.body;

    if (!name || !username || !password || !email || !dob) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [existingUser] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Username or Email already exists' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.query(
            'INSERT INTO users (name, username, email, password_hash, dob) VALUES (?, ?, ?, ?, ?)',
            [name, username, email, password_hash, dob]
        );
        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Failed to register user' });
    }
};
