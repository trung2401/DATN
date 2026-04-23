const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const HistoryOfTest = require('./HistoryOfTest');
const Question = require('./Question');

const HistoryOfTestQuestion = sequelize.define('HistoryOfTestQuestion', {
    HistoryoftestID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'HistoryoftestID'
    },
    QuestionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'QuestionID'
    },
    Answer: {
        type: DataTypes.STRING(1),
        allowNull: true,
        field: 'Answer'
    }
}, {
    tableName: 'historyoftest_question'
});

HistoryOfTestQuestion.belongsTo(HistoryOfTest, { foreignKey: 'HistoryoftestID', as: 'HistoryOfTest' });
HistoryOfTest.hasMany(HistoryOfTestQuestion, { foreignKey: 'HistoryoftestID', as: 'Answers' });

HistoryOfTestQuestion.belongsTo(Question, { foreignKey: 'QuestionID', as: 'Question' });
Question.hasMany(HistoryOfTestQuestion, { foreignKey: 'QuestionID', as: 'HistoryAnswers' });

module.exports = HistoryOfTestQuestion;
