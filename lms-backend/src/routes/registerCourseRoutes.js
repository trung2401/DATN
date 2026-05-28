const express = require('express');
const router = express.Router();
const registerCourseController = require('../controllers/registerCourseController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.post('/add', verifyToken, registerCourseController.createRegisterCourse);
router.put('/:id/confirm', verifyToken, isAdmin, registerCourseController.updateRegisterCourseStatusConfirmed);
router.put('/:id/cancel', verifyToken, isAdmin, registerCourseController.updateRegisterCourseStatusCancel);
router.get('/getAll', verifyToken, registerCourseController.getAllRegisterCourses);
router.get('/getTotalRevenueConfirmed', verifyToken, isAdmin, registerCourseController.getTotalRevenueConfirmed);

module.exports = router;
