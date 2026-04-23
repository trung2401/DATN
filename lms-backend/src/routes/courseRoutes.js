const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/getAllCourses', verifyToken, courseController.getAllCourses);
router.get('/getAllCoursesByStudent', verifyToken, courseController.getAllCoursesByStudent);
router.get('/getStudentCountByCourse', verifyToken, isAdmin, courseController.getStudentCountByCourse);
router.post('/add', verifyToken, isAdmin, courseController.createCourse);
router.delete('/:id', verifyToken, isAdmin, courseController.deleteCourse);
router.put('/:id', verifyToken, isAdmin, courseController.updateCourse);
router.put('/:id/set-status', verifyToken, isAdmin, courseController.setStatusCourse);

module.exports = router;
