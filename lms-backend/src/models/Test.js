const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const { normalizeDataPath } = require('../utils/assetPath');

const Test = sequelize.define('Test', {
    TestID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'TestID'
    },
    TestName: {
        type: DataTypes.STRING(35),
        allowNull: true,
        field: 'TestName'
    },
    audio: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'audio',
        get() {
            return normalizeDataPath(this.getDataValue('audio'));
        }
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        field: 'status'
    },
    teacherID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'teacherID'
    }
}, {
    tableName: 'test'
});

Test.belongsTo(User, { foreignKey: 'teacherID', as: 'Teacher' });
User.hasMany(Test, { foreignKey: 'teacherID', as: 'Tests' });

module.exports = Test;
