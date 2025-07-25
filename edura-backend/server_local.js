require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Jithu@2146', // IMPORTANT: Change this!
    database: process.env.DB_NAME || 'edura_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database!');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err.message);
    });

// --- API Routes for Courses (as before) ---

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM courses');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Add a new course
app.post('/api/courses', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Course name is required' });
    }
    try {
        const [result] = await pool.query('INSERT INTO courses (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.insertId, name, progress: 0, mid_score: 'N/A', end_score: 'N/A' });
    } catch (err) {
        console.error('Error adding course:', err);
        res.status(500).json({ error: 'Failed to add course' });
    }
});

// Example: Update course progress (you'd expand on this)
app.put('/api/courses/:id/progress', async (req, res) => {
    const { id } = req.params;
    const { progress } = req.body;
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ error: 'Progress must be a number between 0 and 100' });
    }
    try {
        const [result] = await pool.query('UPDATE courses SET progress = ? WHERE id = ?', [progress, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course progress updated successfully' });
    } catch (err) {
        console.error('Error updating course progress:', err);
        res.status(500).json({ error: 'Failed to update course progress' });
    }
});

// --- New API Routes for Authentication ---

// User Registration
app.post('/api/register', async (req, res) => {
    const { name, username, password, email, dob } = req.body;

    if (!name || !username || !password || !email || !dob) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if username or email already exists
        const [existingUser] = await pool.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Username or Email already exists' });
        }

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user into the database
        const [result] = await pool.query(
            'INSERT INTO users (name, username, email, password_hash, dob) VALUES (?, ?, ?, ?, ?)',
            [name, username, email, password_hash, dob]
        );
        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Find user by username
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare provided password with hashed password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // In a real app, you'd generate a JWT here
        res.json({ message: 'Login successful!', user: { id: user.id, username: user.username, name: user.name } });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});