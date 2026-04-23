const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TypeTwoQuestion = sequelize.define('TypeTwoQuestion', {
    QuestionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'QuestionID'
    },
    ContentAnswerA: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'ContentAnswerA'
    },
    ContentAnswerB: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'ContentAnswerB'
    },
    ContentAnswerC: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'ContentAnswerC'
    },
    ContentAnswerD: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'ContentAnswerD'
    },
    QuestionContent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'QuestionContent'
    }
}, {
    tableName: 'typetwoquestion'
});

module.exports = TypeTwoQuestion;
