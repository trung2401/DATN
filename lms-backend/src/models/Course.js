const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Course = sequelize.define('Course', {
    CourseID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'CourseID'
    },
    CourseName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'CourseName'
    },
    CourseDesc: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'CourseDesc'
    },
    Price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'Price'
    },
    Duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Duration'
    },
    TeacherID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'TeacherID'
    },
    Target: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Target'
    },
    Input: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'Input'
    },
    Image: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Image'
    },
    percentSalary: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'percentSalary'
    },
    percentDiscount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'percentDiscount'
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        field: 'status'
    }
}, {
    tableName: 'course'
});

Course.belongsTo(User, { foreignKey: 'TeacherID', as: 'Teacher' });

module.exports = Course;
