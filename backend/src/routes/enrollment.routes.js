const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);

// This sits at /api/enrollments
router.get('/me', enrollmentController.getMyEnrollments);
router.get('/', requireRole('admin'), enrollmentController.getAllEnrollments);

module.exports = router;
