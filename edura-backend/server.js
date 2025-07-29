require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const pool = require('./utils/db'); // Existing Data Base connection pool

const app = express();
const PORT = process.env.PORT || 5000; // Backend will run on port 5000 by default

// Middleware
// Enable CORS for cross-origin requests from the frontend
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Login Route (POST /api/login)
app.post('/api/login', async (req, res) => {
    try {
        // Dynamically import the serverless function logic
        const loginHandler = require('./api/login');
        // Call the serverless function logic, passing Express's req and res
        await loginHandler(req, res);
    } catch (error) {
        console.error('Error in /api/login route:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Register Route (POST /api/register)
app.post('/api/register', async (req, res) => {
    try {
        const registerHandler = require('./api/register');
        await registerHandler(req, res);
    } catch (error) {
        console.error('Error in /api/register route:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Courses Route (GET/POST /api/courses)
// Using app.all to handle both GET and POST requests for courses
app.all('/api/courses', async (req, res) => {
    try {
        const coursesHandler = require('./api/courses');
        await coursesHandler(req, res);
    } catch (error) {
        console.error('Error in /api/courses route:', error);
        res.status(500).json({ error: 'Internal server error during courses operation' });
    }
});

app.get('/', (req, res) => {
    res.send('Edura Backend is running!');
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Edura Backend running on port ${PORT}`);
});
