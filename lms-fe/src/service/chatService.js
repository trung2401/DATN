import axios from '../utils/axios-customize';

const getTeachersForChat = () => axios.get('chat/teachers');
const getStudentsForChat = () => axios.get('chat/students');
const getMyConversations = () => axios.get('chat/conversations');
const getOrCreateConversation = ({ otherUserId }) => axios.post('chat/conversations/get-or-create', { otherUserId });
const getConversationMessages = ({ conversationId }) => axios.get(`chat/conversations/${conversationId}/messages`);
const sendChatMessage = ({ conversationId, messageText }) => axios.post(`chat/conversations/${conversationId}/messages`, { messageText });
const markConversationAsRead = ({ conversationId }) => axios.put(`chat/conversations/${conversationId}/read`);

export {
  getTeachersForChat,
  getStudentsForChat,
  getMyConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendChatMessage,
  markConversationAsRead,
};
