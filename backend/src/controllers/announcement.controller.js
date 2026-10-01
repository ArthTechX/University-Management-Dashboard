const pool = require('../db');

// Get all announcements, ordered by newest first
const getAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as author_name 
       FROM announcements a
       JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC 
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getAnnouncements error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

// Create a new announcement (Admin only)
const createAnnouncement = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: { message: 'Title and content are required' } });
  }

  try {
    const result = await pool.query(
      `INSERT INTO announcements (title, content, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, content, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createAnnouncement error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement
};
