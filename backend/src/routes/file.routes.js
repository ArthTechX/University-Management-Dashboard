const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/file.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Use memory storage for multer since we directly upload buffer to Supabase
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
