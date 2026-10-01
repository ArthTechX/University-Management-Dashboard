const pool = require('../db');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, role, is_active',
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['student']);
    const courseCount = await pool.query('SELECT COUNT(*) FROM courses');
    const enrollmentCount = await pool.query('SELECT COUNT(*) FROM enrollments');
    const fileCount = await pool.query('SELECT COUNT(*) FROM files');

    res.json({
      total_students: parseInt(userCount.rows[0].count),
      total_courses: parseInt(courseCount.rows[0].count),
      total_enrollments: parseInt(enrollmentCount.rows[0].count),
      total_files: parseInt(fileCount.rows[0].count)
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  getAdminStats
};
