const pool = require('../db');

const enrollInCourse = async (req, res) => {
  const { id: courseId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Check if course exists and is active
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1 AND is_active = true', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Course not found or inactive' } });
    }
    
    // Optional: capacity check
    const course = courseResult.rows[0];
    if (course.capacity !== null) {
      const currentEnrollments = await pool.query('SELECT COUNT(*) FROM enrollments WHERE course_id = $1', [courseId]);
      if (parseInt(currentEnrollments.rows[0].count) >= course.capacity) {
        return res.status(400).json({ error: { message: 'Course is at capacity' } });
      }
    }

    // 2. Insert enrollment (duplicate check handled by unique constraint)
    const enrollResult = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING id',
      [userId, courseId]
    );
    const enrollmentId = enrollResult.rows[0].id;

    // 3. Initialize progress
    await pool.query(
      'INSERT INTO progress (enrollment_id, percent_complete, status) VALUES ($1, 0, $2)',
      [enrollmentId, 'not_started']
    );

    res.status(201).json({ enrollment_id: enrollmentId });
  } catch (error) {
    if (error.code === '23505') { // Postgres unique constraint violation
      return res.status(409).json({ error: { message: 'Already enrolled in this course' } });
    }
    console.error('enrollInCourse error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const getMyEnrollments = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT e.id as enrollment_id, e.enrolled_at,
             c.id as course_id, c.title, c.description, c.instructor_name,
             p.percent_complete, p.status
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN progress p ON e.id = p.enrollment_id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('getMyEnrollments error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const getAllEnrollments = async (req, res) => {
  const { course_id, user_id } = req.query;
  try {
    let query = `
      SELECT e.id as enrollment_id, e.enrolled_at,
             u.id as user_id, u.name as student_name, u.email as student_email,
             c.id as course_id, c.title as course_title,
             p.percent_complete, p.status
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      JOIN courses c ON e.course_id = c.id
      JOIN progress p ON e.id = p.enrollment_id
      WHERE 1=1
    `;
    const params = [];
    if (course_id) {
      params.push(course_id);
      query += ` AND e.course_id = $${params.length}`;
    }
    if (user_id) {
      params.push(user_id);
      query += ` AND e.user_id = $${params.length}`;
    }
    query += ' ORDER BY e.enrolled_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('getAllEnrollments error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getAllEnrollments
};
