const { Op } = require('sequelize');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const RegisterCourse = require('../models/RegisterCourse');

const normalizePair = (a, b) => {
  const id1 = Number(a);
  const id2 = Number(b);
  return id1 < id2 ? [id1, id2] : [id2, id1];
};

const isTeacherRole = (roleId) => Number(roleId) === 2;
const isStudentRole = (roleId) => Number(roleId) === 3;

const serializeConversation = (conversation, currentUserId) => {
  const isUser1 = Number(conversation.User1ID) === Number(currentUserId);
  const otherUser = isUser1 ? conversation.User2 : conversation.User1;

  return {
    conversationId: conversation.ConversationID,
    user1Id: conversation.User1ID,
    user2Id: conversation.User2ID,
    lastMessage: conversation.LastMessage,
    lastMessageTime: conversation.LastMessageTime,
    unreadCount: Number(isUser1 ? conversation.UnreadCountUser1 : conversation.UnreadCountUser2) || 0,
    otherUser: otherUser
      ? {
          userId: otherUser.UserID,
          userName: otherUser.UserName,
          name: otherUser.Name,
          roleId: otherUser.RoleID,
        }
      : null,
  };
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

const validateParticipantsByRole = async (currentUser, otherUserId) => {
  const currentUserId = Number(currentUser.id);
  const currentRoleId = Number(currentUser.roleId);
  const targetUser = await User.findByPk(otherUserId);

  if (!targetUser) {
    return { ok: false, code: 404, message: 'Người dùng không tồn tại!' };
  }

  if (Number(targetUser.UserID) === currentUserId) {
    return { ok: false, code: 400, message: 'Không thể chat với chính bạn!' };
  }

  if (isStudentRole(currentRoleId) && !isTeacherRole(targetUser.RoleID)) {
    return { ok: false, code: 403, message: 'Học viên chỉ được chat với giáo viên!' };
  }

  if (isTeacherRole(currentRoleId) && !isStudentRole(targetUser.RoleID)) {
    return { ok: false, code: 403, message: 'Giáo viên chỉ được chat với học viên!' };
  }

  if (!isTeacherRole(currentRoleId) && !isStudentRole(currentRoleId)) {
    return { ok: false, code: 403, message: 'Vai trò hiện tại không hỗ trợ chat 1-1!' };
  }

  return { ok: true, targetUser };
};

const getConversationByIdAndUser = async (conversationId, currentUserId) => {
  const conversation = await Conversation.findOne({
    where: {
      ConversationID: conversationId,
      [Op.or]: [{ User1ID: currentUserId }, { User2ID: currentUserId }],
    },
    include: [
      { model: User, as: 'User1', attributes: ['UserID', 'UserName', 'Name', 'RoleID'] },
      { model: User, as: 'User2', attributes: ['UserID', 'UserName', 'Name', 'RoleID'] },
    ],
  });

  return conversation;
};

const getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const otherUserId = Number(req.body.otherUserId);

    if (!otherUserId || Number.isNaN(otherUserId)) {
      return res.status(400).json({ message: 'Thiếu otherUserId hợp lệ!' });
    }

    const validation = await validateParticipantsByRole(req.user, otherUserId);
    if (!validation.ok) {
      return res.status(validation.code).json({ message: validation.message });
    }

    const [user1Id, user2Id] = normalizePair(currentUserId, otherUserId);

    const [conversation] = await Conversation.findOrCreate({
      where: { User1ID: user1Id, User2ID: user2Id },
      defaults: { User1ID: user1Id, User2ID: user2Id },
    });

    const fullConversation = await getConversationByIdAndUser(conversation.ConversationID, currentUserId);

    return res.json({
      success: true,
      data: serializeConversation(fullConversation, currentUserId),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyConversations = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ User1ID: currentUserId }, { User2ID: currentUserId }],
      },
      include: [
        { model: User, as: 'User1', attributes: ['UserID', 'UserName', 'Name', 'RoleID'] },
        { model: User, as: 'User2', attributes: ['UserID', 'UserName', 'Name', 'RoleID'] },
      ],
      order: [['LastMessageTime', 'DESC'], ['ConversationID', 'DESC']],
    });

    return res.json({
      success: true,
      count: conversations.length,
      data: conversations.map((conversation) => serializeConversation(conversation, currentUserId)),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMessagesByConversation = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const conversationId = Number(req.params.conversationId);

    const conversation = await getConversationByIdAndUser(conversationId, currentUserId);
    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại!' });
    }

    const messages = await Message.findAll({
      where: { ConversationID: conversationId },
      include: [{ model: User, as: 'Sender', attributes: ['UserID', 'UserName', 'Name'] }],
      order: [['SentAt', 'ASC'], ['MessageID', 'ASC']],
    });

    return res.json({
      success: true,
      conversation: serializeConversation(conversation, currentUserId),
      count: messages.length,
      data: messages.map(serializeMessage),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const conversationId = Number(req.params.conversationId);
    const messageText = String(req.body.messageText || '').trim();

    if (!messageText) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống!' });
    }

    const conversation = await getConversationByIdAndUser(conversationId, currentUserId);
    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại!' });
    }

    const created = await Message.create({
      ConversationID: conversationId,
      SenderID: currentUserId,
      MessageText: messageText,
      SentAt: new Date(),
      IsRead: 0,
    });

    const message = await Message.findByPk(created.MessageID, {
      include: [{ model: User, as: 'Sender', attributes: ['UserID', 'UserName', 'Name'] }],
    });

    const refreshedConversation = await getConversationByIdAndUser(conversationId, currentUserId);

    return res.status(201).json({
      success: true,
      message: 'Gửi tin nhắn thành công!',
      data: serializeMessage(message),
      conversation: serializeConversation(refreshedConversation, currentUserId),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const conversationId = Number(req.params.conversationId);

    const conversation = await getConversationByIdAndUser(conversationId, currentUserId);
    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại!' });
    }

    await Message.update(
      { IsRead: 1 },
      {
        where: {
          ConversationID: conversationId,
          SenderID: {
            [Op.ne]: currentUserId,
          },
          IsRead: 0,
        },
      }
    );

    const isUser1 = Number(conversation.User1ID) === currentUserId;

    if (isUser1) {
      await conversation.update({ UnreadCountUser1: 0 });
    } else {
      await conversation.update({ UnreadCountUser2: 0 });
    }

    const refreshedConversation = await getConversationByIdAndUser(conversationId, currentUserId);

    return res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc!',
      data: serializeConversation(refreshedConversation, currentUserId),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAvailableTeachers = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);

    const registrations = await RegisterCourse.findAll({
      where: {
        UserID: currentUserId,
        status: {
          [Op.ne]: 'cancel',
        },
      },
      include: [
        {
          model: User,
          as: 'Teacher',
          attributes: ['UserID', 'UserName', 'Name', 'RoleID'],
        },
      ],
      order: [['RegisterCourseID', 'DESC']],
    });

    const teachers = Array.from(
      registrations.reduce((teacherMap, registration) => {
        const teacher = registration.Teacher;
        if (teacher && teacher.UserID) {
          teacherMap.set(String(teacher.UserID), teacher);
        }
        return teacherMap;
      }, new Map()).values()
    ).sort((first, second) => {
      return String(first.Name || first.UserName || '').localeCompare(String(second.Name || second.UserName || ''), 'vi');
    });

    return res.json({
      success: true,
      count: teachers.length,
      data: teachers.map((teacher) => ({
        userId: teacher.UserID,
        userName: teacher.UserName,
        name: teacher.Name,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAvailableStudents = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);

    const registrations = await RegisterCourse.findAll({
      where: {
        TeacherID: currentUserId,
        status: {
          [Op.ne]: 'cancel',
        },
      },
      include: [
        {
          model: User,
          as: 'Student',
          attributes: ['UserID', 'UserName', 'Name', 'RoleID'],
        },
      ],
      order: [['RegisterCourseID', 'DESC']],
    });

    const students = Array.from(
      registrations.reduce((studentMap, registration) => {
        const student = registration.Student;
        if (student && student.UserID) {
          studentMap.set(String(student.UserID), student);
        }
        return studentMap;
      }, new Map()).values()
    ).sort((first, second) => {
      return String(first.Name || first.UserName || '').localeCompare(String(second.Name || second.UserName || ''), 'vi');
    });

    return res.json({
      success: true,
      count: students.length,
      data: students.map((student) => ({
        userId: student.UserID,
        userName: student.UserName,
        name: student.Name,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessagesByConversation,
  sendMessage,
  markConversationAsRead,
  getAvailableTeachers,
  getAvailableStudents,
};
