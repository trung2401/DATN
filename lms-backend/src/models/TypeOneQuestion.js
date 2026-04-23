const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { normalizeDataPath } = require('../utils/assetPath');

const TypeOneQuestion = sequelize.define('TypeOneQuestion', {
    QuestionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'QuestionID'
    },
    Audio: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'Audio',
        get() {
            return normalizeDataPath(this.getDataValue('Audio'));
        }
    },
    Transcript: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Transcript'
    }
}, {
    tableName: 'typeonequestion'
});

module.exports = TypeOneQuestion;
