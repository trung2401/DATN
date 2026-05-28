const express = require('express');
const router = express.Router();
const { verifyToken, isTeacher } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const importController = require('../controllers/importController');

// POST /api/test/:testId/import-xlsx?partId=3
router.post('/:testId/import-xlsx', verifyToken, isTeacher, upload.single('file'), importController.importXlsx);

module.exports = router;
