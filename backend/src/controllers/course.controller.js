const pool = require('../db');
const supabase = require('../storage/supabase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const getCourses = async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM courses WHERE is_active = true';
    const params = [];

    if (req.user && req.user.role === 'admin') {
      query = 'SELECT * FROM courses WHERE 1=1'; // Admins see inactive courses too
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    // Count query
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch data
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      items: result.rows,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('getCourses error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    const course = result.rows[0];

    if (!course || (!course.is_active && req.user?.role !== 'admin')) {
      return res.status(404).json({ error: { message: 'Course not found' } });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const createCourse = async (req, res) => {
  const { title, description, category, instructor_name, capacity } = req.body;
  if (!title) return res.status(400).json({ error: { message: 'Title is required' } });

  try {
    const result = await pool.query(
      `INSERT INTO courses (title, description, category, instructor_name, capacity, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, category, instructor_name, capacity, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createCourse error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, instructor_name, capacity, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           instructor_name = COALESCE($4, instructor_name),
           capacity = COALESCE($5, capacity),
           is_active = COALESCE($6, is_active),
           updated_at = now()
       WHERE id = $7 RETURNING *`,
      [title, description, category, instructor_name, capacity, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Course not found' } });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('updateCourse error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    // Soft delete
    const result = await pool.query(
      'UPDATE courses SET is_active = false, updated_at = now() WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Course not found' } });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const getCourseResources = async (req, res) => {
  const { id } = req.params;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'student-files';

  try {
    const result = await pool.query('SELECT * FROM course_resources WHERE course_id = $1 ORDER BY uploaded_at DESC', [id]);
    
    // Attach signed URLs for download
    const resourcesWithUrls = await Promise.all(result.rows.map(async (resObj) => {
      const { data } = await supabase.storage.from(bucket).createSignedUrl(resObj.storage_path, 3600); // 1 hour
      return { ...resObj, download_url: data?.signedUrl };
    }));

    res.json(resourcesWithUrls);
  } catch (error) {
    console.error('getCourseResources error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const uploadCourseResource = async (req, res) => {
  const { id } = req.params;
  const title = req.file?.originalname || null; 
  const instruction = req.body.instruction || null; 

  if (!req.file && !instruction) {
    return res.status(400).json({ error: { message: 'Must provide either a file or an instruction message' } });
  }

  const userId = req.user.id;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'student-files';

  try {
    let storagePath = null;
    let sizeBytes = null;

    if (req.file) {
      const file = req.file;
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ error: { message: 'File exceeds the 10MB limit' } });
      }

      const ext = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}${ext}`;
      storagePath = `courses/${id}/${uniqueFilename}`;
      sizeBytes = file.size;

      const { data: storageData, error: storageError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (storageError) throw storageError;
      storagePath = storageData.path;
    }

    const result = await pool.query(
      `INSERT INTO course_resources (course_id, title, storage_path, size_bytes, uploaded_by, instruction)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, title, storagePath, sizeBytes, userId, instruction]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('uploadCourseResource error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const deleteCourseResource = async (req, res) => {
  const { id, resourceId } = req.params;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'student-files';

  try {
    const fileResult = await pool.query('SELECT * FROM course_resources WHERE id = $1 AND course_id = $2', [resourceId, id]);
    const file = fileResult.rows[0];

    if (!file) return res.status(404).json({ error: { message: 'Resource not found' } });

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage.from(bucket).remove([file.storage_path]);
    if (storageError) throw storageError;

    // Delete from Database
    await pool.query('DELETE FROM course_resources WHERE id = $1', [resourceId]);

    res.status(204).send();
  } catch (error) {
    console.error('deleteCourseResource error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseResources,
  uploadCourseResource,
  deleteCourseResource
};
