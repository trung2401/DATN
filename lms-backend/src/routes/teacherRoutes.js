const express = require('express');
const router = express.Router();
const teacherDashboardController = require('../controllers/teacherDashboardController');
const { verifyToken, isTeacher } = require('../middlewares/authMiddleware');

router.get('/dashboard/stats', verifyToken, isTeacher, teacherDashboardController.getTeacherDashboardStats);

module.exports = router;
