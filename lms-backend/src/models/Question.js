const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { normalizeDataPath } = require('../utils/assetPath');
const TypeOneQuestion = require('./TypeOneQuestion');
const TypeTwoQuestion = require('./TypeTwoQuestion');
const DataQuestion = require('./DataQuestion');

const Question = sequelize.define('Question', {
    QuestionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'QuestionID'
    },
    PartID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'PartID'
    },
    TestID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'TestID'
    },
    AnswerCorrect: {
        type: DataTypes.STRING(1),
        allowNull: true,
        field: 'AnswerCorrect'
    },
    AnswerExplain: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'AnswerExplain'
    },
    OrderNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'OrderNumber'
    },
    Image: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Image',
        get() {
            return normalizeDataPath(this.getDataValue('Image'));
        }
    },
    DataQuestionID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'DataQuestionID'
    }
}, {
    tableName: 'question'
});

Question.belongsTo(TypeTwoQuestion, { foreignKey: 'QuestionID', as: 'TypeTwoQuestion' });
TypeTwoQuestion.hasOne(Question, { foreignKey: 'QuestionID', as: 'Question' });

Question.belongsTo(TypeOneQuestion, { foreignKey: 'QuestionID', as: 'TypeOneQuestion' });
TypeOneQuestion.hasOne(Question, { foreignKey: 'QuestionID', as: 'Question' });

Question.belongsTo(DataQuestion, { foreignKey: 'DataQuestionID', as: 'DataQuestion' });
DataQuestion.hasMany(Question, { foreignKey: 'DataQuestionID', as: 'Questions' });

module.exports = Question;
