const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Course = require('./Course');
const Part = require('./Part');
const VocabularyList = require('./VocabularyList');
const { normalizeDataPath } = require('../utils/assetPath');

const Lession = sequelize.define('Lession', {
    lessionID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'lessionID'
    },
    CourseID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'CourseID'
    },
    lessionname: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'lessionname'
    },
    Video: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Video',
        get() {
            return normalizeDataPath(this.getDataValue('Video'));
        }
    },
    OrderNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'OrderNumber'
    },
    PartID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'PartID'
    },
    ListID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ListID'
    },
    Exercise: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Exercise',
        get() {
            return normalizeDataPath(this.getDataValue('Exercise'));
        }
    }
}, {
    tableName: 'lession'
});

Lession.belongsTo(Course, { foreignKey: 'CourseID', as: 'Course' });
Course.hasMany(Lession, { foreignKey: 'CourseID', as: 'Lessions' });

Lession.belongsTo(Part, { foreignKey: 'PartID', as: 'Part' });
Part.hasMany(Lession, { foreignKey: 'PartID', as: 'Lessions' });

Lession.belongsTo(VocabularyList, { foreignKey: 'ListID', as: 'VocabularyList' });
VocabularyList.hasMany(Lession, { foreignKey: 'ListID', as: 'Lessions' });

module.exports = Lession;
