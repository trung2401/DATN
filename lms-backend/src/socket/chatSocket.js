const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const getConversationByIdAndUser = async (conversationId, currentUserId) => {
  const conversation = await Conversation.findOne({
    where: {
      ConversationID: conversationId,
      [Op.or]: [{ User1ID: currentUserId }, { User2ID: currentUserId }],
    },
  });

  return conversation;
};

const serializeMessage = (message) => ({
  messageId: message.MessageID,
  conversationId: message.ConversationID,
  senderId: message.SenderID,
  messageText: message.MessageText,
  sentAt: message.SentAt,
  isRead: Number(message.IsRead) === 1,
  senderName: message.Sender?.Name || message.Sender?.UserName || null,
});

const initChatSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      return next();
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const currentUserId = Number(socket.user?.id);
    if (!currentUserId) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${currentUserId}`);

    socket.on('chat:joinConversation', async ({ conversationId }) => {
      const id = Number(conversationId);
      if (!id) return;

      const conversation = await getConversationByIdAndUser(id, currentUserId);
      if (!conversation) return;

      socket.join(`conversation:${id}`);
    });

    socket.on('chat:sendMessage', async ({ conversationId, messageText }) => {
      try {
        const id = Number(conversationId);
        const content = String(messageText || '').trim();
        if (!id || !content) return;

        const conversation = await getConversationByIdAndUser(id, currentUserId);
        if (!conversation) return;

        const created = await Message.create({
          ConversationID: id,
          SenderID: currentUserId,
          MessageText: content,
          SentAt: new Date(),
          IsRead: 0,
        });

        const message = await Message.findByPk(created.MessageID, {
          include: [{ model: User, as: 'Sender', attributes: ['UserID', 'UserName', 'Name'] }],
        });

        const payload = serializeMessage(message);

        io.to(`conversation:${id}`).emit('chat:newMessage', payload);
        io.to(`user:${conversation.User1ID}`).emit('chat:newMessage', payload);
        io.to(`user:${conversation.User2ID}`).emit('chat:newMessage', payload);
      } catch (error) {
        socket.emit('chat:error', { message: error.message || 'Không gửi được tin nhắn' });
      }
    });

    socket.on('chat:markRead', async ({ conversationId }) => {
      try {
        const id = Number(conversationId);
        if (!id) return;

        const conversation = await getConversationByIdAndUser(id, currentUserId);
        if (!conversation) return;

        await Message.update(
          { IsRead: 1 },
          {
            where: {
              ConversationID: id,
              SenderID: { [Op.ne]: currentUserId },
              IsRead: 0,
            },
          }
        );

        if (Number(conversation.User1ID) === currentUserId) {
          await conversation.update({ UnreadCountUser1: 0 });
        } else {
          await conversation.update({ UnreadCountUser2: 0 });
        }

        io.to(`user:${conversation.User1ID}`).emit('chat:readUpdated', { conversationId: id });
        io.to(`user:${conversation.User2ID}`).emit('chat:readUpdated', { conversationId: id });
      } catch (error) {
        socket.emit('chat:error', { message: error.message || 'Không đánh dấu đã đọc được' });
      }
    });
  });

  return io;
};

module.exports = { initChatSocket };
