const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');

router.get('/getAll', partController.getAllParts);

module.exports = router;
