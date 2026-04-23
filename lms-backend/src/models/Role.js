const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
    RoleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'RoleID'
    },
    RoleName: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'RoleName'
    }
}, {
    tableName: 'role'
});

module.exports = Role;
