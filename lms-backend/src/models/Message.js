const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Conversation = require('./Conversation');
const User = require('./User');

const Message = sequelize.define('Message', {
  MessageID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MessageID'
  },
  ConversationID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ConversationID'
  },
  SenderID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'SenderID'
  },
  MessageText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'MessageText'
  },
  SentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'SentAt'
  },
  IsRead: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0,
    field: 'IsRead'
  }
}, {
  tableName: 'message',
  timestamps: false
});

Message.belongsTo(Conversation, { foreignKey: 'ConversationID', as: 'Conversation' });
Conversation.hasMany(Message, { foreignKey: 'ConversationID', as: 'Messages' });

Message.belongsTo(User, { foreignKey: 'SenderID', as: 'Sender' });
User.hasMany(Message, { foreignKey: 'SenderID', as: 'SentMessages' });

module.exports = Message;
