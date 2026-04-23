const express = require('express');
const router = express.Router();
const vocabularyListController = require('../controllers/vocabularyListController');
const vocabularyController = require('../controllers/vocabularyController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/getAllVocabularyLists', verifyToken, vocabularyListController.getAllVocabularyLists);
router.get('/getAllVocabularyListsByUserId/:userId', verifyToken, vocabularyListController.getAllVocabularyListsByUserId);
router.get('/my-vocab', verifyToken, vocabularyController.getMyVocab);
router.get('/:id', verifyToken, vocabularyListController.getVocabularyListDetail);
router.get('/:id/vocabularies', verifyToken, vocabularyListController.getAllVocabularyOfList);

router.post('/add', verifyToken, vocabularyListController.createVocabularyList);
router.put('/:id', verifyToken, vocabularyListController.updateVocabularyList);
router.delete('/:id', verifyToken, vocabularyListController.deleteVocabularyList);

// Vocabulary CRUD inside a vocabulary list (owner only)
router.post('/:id/vocabularies', verifyToken, vocabularyController.addVocabulary);
router.put('/vocabularies/:vocabId', verifyToken, vocabularyController.updateVocabulary);
router.delete('/vocabularies/:vocabId', verifyToken, vocabularyController.deleteVocabulary);

module.exports = router;
