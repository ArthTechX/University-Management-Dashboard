const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', progressController.getMyProgress);
router.put('/:courseId', progressController.updateProgress);

module.exports = router;
