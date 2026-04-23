const express = require('express');
const router = express.Router();
const { login, register, handleRefreshToken, logout, changePassword } = require('../controllers/authController');
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.post('/register', register);
router.put('/change-password', verifyToken, changePassword);
router.post('/refresh-token', handleRefreshToken);

router.get('/me', verifyToken, userController.getMe);
router.put('/update', verifyToken, userController.updateProfile);

router.post('/create', verifyToken, isAdmin, userController.createUserByAdmin);
router.put('/lock/:id', verifyToken, isAdmin, userController.lockAccount);
router.put('/admin-update/:id', verifyToken, isAdmin, userController.updateUserByAdmin);
router.get('/getAllUsers', verifyToken, isAdmin, userController.getAllUsers);
router.get('/getAllRoles', verifyToken, isAdmin, userController.getAllRoles);
router.get('/getTotalUsersCount', verifyToken, isAdmin, userController.getTotalUsersCount);

module.exports = router;
