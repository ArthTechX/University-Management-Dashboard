const pool = require('../db');
const supabase = require('../storage/supabase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: 'No file uploaded' } });
  }

  const file = req.file;
  const userId = req.user.id;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'student-files';

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: { message: 'Unsupported file type. Allowed: PDF, DOCX, PNG, JPG' } });
  }

  // Validate size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return res.status(400).json({ error: { message: 'File exceeds the 5MB limit' } });
  }

  try {
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const storagePath = `uploads/${userId}/${uniqueFilename}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (storageError) {
      throw storageError;
    }

    const result = await pool.query(
      `INSERT INTO files (user_id, original_name, storage_path, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, file.originalname, storageData.path, file.mimetype, file.size]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('uploadFile error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const getFiles = async (req, res) => {
  const { user_id } = req.query;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'student-files';

  try {
    let query = 'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC';
    let params = [req.user.id];

    // Admin can query any user's files
    if (req.user.role === 'admin') {
      if (user_id) {
        query = 'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC';
        params = [user_id];
      } else {
        query = 'SELECT * FROM files ORDER BY uploaded_at DESC';
        params = [];
      }
    }

    const result = await pool.query(query, params);
    
    // Attach signed URLs for download
    const filesWithUrls = await Promise.all(result.rows.map(async (file) => {
      const { data } = await supabase.storage.from(bucket).createSignedUrl(file.storage_path, 3600); // 1 hour
      return { ...file, download_url: data?.signedUrl };
    }));

    res.json(filesWithUrls);
  } catch (error) {
    console.error('getFiles error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

const deleteFile = async (req, res) => {
  const { id } = req.params;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'student-files';

  try {
    const fileResult = await pool.query('SELECT * FROM files WHERE id = $1', [id]);
    const file = fileResult.rows[0];

    if (!file) {
      return res.status(404).json({ error: { message: 'File not found' } });
    }

    if (file.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'You don\'t have permission to perform this action' } });
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage.from(bucket).remove([file.storage_path]);
    if (storageError) {
      throw storageError;
    }

    // Delete from Database
    await pool.query('DELETE FROM files WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('deleteFile error:', error);
    res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile
};
