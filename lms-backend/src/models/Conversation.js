const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Conversation = sequelize.define('Conversation', {
  ConversationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'ConversationID'
  },
  User1ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'User1ID'
  },
  User2ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'User2ID'
  },
  LastMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'LastMessage'
  },
  LastMessageTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'LastMessageTime'
  },
  UnreadCountUser1: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'UnreadCountUser1'
  },
  UnreadCountUser2: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'UnreadCountUser2'
  },
  CreatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'CreatedAt'
  }
}, {
  tableName: 'conversation',
  timestamps: false
});

Conversation.belongsTo(User, { foreignKey: 'User1ID', as: 'User1' });
Conversation.belongsTo(User, { foreignKey: 'User2ID', as: 'User2' });
User.hasMany(Conversation, { foreignKey: 'User1ID', as: 'ConversationsAsUser1' });
User.hasMany(Conversation, { foreignKey: 'User2ID', as: 'ConversationsAsUser2' });

module.exports = Conversation;
