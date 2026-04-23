const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Part = sequelize.define('Part', {
    PartID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'PartID'
    },
    PartName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'PartName'
    }
}, {
    tableName: 'part'
});

module.exports = Part;
