const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/stats', userController.getAdminStats);
router.get('/', userController.getUsers);
router.put('/:id/status', userController.updateUserStatus);

module.exports = router;
