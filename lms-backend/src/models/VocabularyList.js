const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const VocabularyList = sequelize.define('VocabularyList', {
    ListID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ListID'
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'UserID'
    },
    NameList: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'NameList'
    },
    Description: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'Description'
    }
}, {
    tableName: 'vocabularylist'
});

VocabularyList.belongsTo(User, { foreignKey: 'UserID', as: 'User' });
User.hasMany(VocabularyList, { foreignKey: 'UserID', as: 'VocabularyLists' });

module.exports = VocabularyList;
