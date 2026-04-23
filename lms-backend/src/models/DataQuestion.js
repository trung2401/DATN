const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DataQuestion = sequelize.define('DataQuestion', {
    DataQuestionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'DataQuestionID'
    },
    DataQuestion: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'DataQuestion'
    },
    Transcript: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Transcript'
    },
    TestsID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'TestsID'
    },
    OrderNumberPart: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'OrderNumberPart'
    },
    OrderNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'OrderNumber'
    }
}, {
    tableName: 'dataquestion'
});

module.exports = DataQuestion;
