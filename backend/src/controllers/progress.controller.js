const pool = require('../db');

const getMyProgress = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT p.id as progress_id, p.percent_complete, p.status, p.updated_at,
             e.course_id, c.title as course_title
      FROM progress p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('getMyProgress error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const updateProgress = async (req, res) => {
  const { courseId } = req.params;
  const { percent_complete } = req.body;
  const userId = req.user.id;

  if (percent_complete === undefined || percent_complete < 0 || percent_complete > 100) {
    return res.status(400).json({ error: { message: 'percent_complete must be between 0 and 100' } });
  }

  try {
    // Determine the enrollment id for this user and course
    const enrollResult = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (enrollResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Enrollment not found' } });
    }

    const enrollmentId = enrollResult.rows[0].id;
    let status = 'in_progress';
    if (percent_complete === 0) status = 'not_started';
    if (percent_complete === 100) status = 'completed';

    const updateResult = await pool.query(
      `UPDATE progress 
       SET percent_complete = $1, status = $2, updated_at = now()
       WHERE enrollment_id = $3 RETURNING *`,
      [percent_complete, status, enrollmentId]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('updateProgress error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

module.exports = {
  getMyProgress,
  updateProgress
};
