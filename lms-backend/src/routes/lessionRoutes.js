const express = require('express');
const router = express.Router();
const lessionController = require('../controllers/lessionController');
const { verifyToken, optionalVerifyToken, isTeacher } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.get('/getAll', optionalVerifyToken, lessionController.getAllLessions);
router.post('/files/upload/video', verifyToken, isTeacher, upload.single('file'), lessionController.uploadLessionFile);
router.post('/files/upload/exercise', verifyToken, isTeacher, upload.single('file'), lessionController.uploadLessionFile);
router.post('/add', verifyToken, isTeacher, lessionController.createLession);
router.put('/:id', verifyToken, isTeacher, lessionController.updateLession);
router.delete('/:id', verifyToken, isTeacher, lessionController.deleteLession);

module.exports = router;
