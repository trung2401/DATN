const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/teachers', verifyToken, chatController.getAvailableTeachers);
router.get('/students', verifyToken, chatController.getAvailableStudents);
router.post('/conversations/get-or-create', verifyToken, chatController.getOrCreateConversation);
router.get('/conversations', verifyToken, chatController.getMyConversations);
router.get('/conversations/:conversationId/messages', verifyToken, chatController.getMessagesByConversation);
router.post('/conversations/:conversationId/messages', verifyToken, chatController.sendMessage);
router.put('/conversations/:conversationId/read', verifyToken, chatController.markConversationAsRead);

module.exports = router;
