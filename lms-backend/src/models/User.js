const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Role = require('./Role');

const User = sequelize.define('User', {
    UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'UserID'
    },
    Name: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: 'Name'
    },
    Phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: 'Phone'
    },
    Gmail: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'Gmail'
    },
    UserName: {
        type: DataTypes.STRING(45),
        allowNull: true,
        unique: true,
        field: 'UserName'
    },
    Password: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'Password'
    },
    RoleID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'RoleID'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'description'
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        field: 'status'
    },
    RefreshToken: {
        type: DataTypes.TEXT, // Dùng TEXT vì token khá dài
        allowNull: true,
        field: 'RefreshToken'
    }
}, {
    tableName: 'user'
});

User.belongsTo(Role, { foreignKey: 'RoleID', as: 'Role' });
Role.hasMany(User, { foreignKey: 'RoleID', as: 'Users' });

module.exports = User;
