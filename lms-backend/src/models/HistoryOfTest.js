const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Test = require('./Test');

const HistoryOfTest = sequelize.define('HistoryOfTest', {
    HistoryOfTestID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'HistoryOfTestID'
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'UserID'
    },
    TestID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'TestID'
    },
    Date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Date'
    }
}, {
    tableName: 'historyoftest'
});

HistoryOfTest.belongsTo(User, { foreignKey: 'UserID', as: 'User' });
User.hasMany(HistoryOfTest, { foreignKey: 'UserID', as: 'HistoryOfTests' });

HistoryOfTest.belongsTo(Test, { foreignKey: 'TestID', as: 'Test' });
Test.hasMany(HistoryOfTest, { foreignKey: 'TestID', as: 'HistoryOfTests' });

module.exports = HistoryOfTest;
