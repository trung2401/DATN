const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const VocabularyList = require('./VocabularyList');

const Vocabulary = sequelize.define('Vocabulary', {
    VocabID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'VocabID'
    },
    ListID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ListID'
    },
    Vocab: {
        type: DataTypes.STRING(35),
        allowNull: true,
        field: 'Vocab'
    },
    Mean: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'Mean'
    },
    WordType: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: 'WordType'
    },
    Example: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Example'
    },
    pronunciation: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'pronunciation'
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        field: 'status'
    }
}, {
    tableName: 'vocabulary'
});

Vocabulary.belongsTo(VocabularyList, { foreignKey: 'ListID', as: 'VocabularyList' });
VocabularyList.hasMany(Vocabulary, { foreignKey: 'ListID', as: 'Vocabularies' });

module.exports = Vocabulary;
