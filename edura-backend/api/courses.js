const pool = require('../utils/db'); // Import the database pool

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        try {
            const [rows] = await pool.query('SELECT * FROM courses');
            res.status(200).json(rows);
        } catch (err) {
            console.error('Error fetching courses:', err);
            res.status(500).json({ error: 'Failed to fetch courses' });
        }
    } else if (req.method === 'POST') {
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
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
