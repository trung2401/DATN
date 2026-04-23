const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Course = require('./Course');
const User = require('./User');

const RegisterCourse = sequelize.define('RegisterCourse', {
    RegisterCourseID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'RegisterCourseID'
    },
    CourseID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'CourseID'
    },
    Date: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'Date'
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'UserID'
    },
    TotalAmount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'TotalAmount'
    },
    ConfirmDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'ConfirmDate'
    },
    TotalAmountOfTeacher: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: 'TotalAmountOfTeacher'
    },
    TeacherID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'TeacherID'
    },
    status: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'status'
    }
}, {
    tableName: 'register_course'
});

RegisterCourse.belongsTo(Course, { foreignKey: 'CourseID', as: 'Course' });
Course.hasMany(RegisterCourse, { foreignKey: 'CourseID', as: 'RegisterCourses' });

RegisterCourse.belongsTo(User, { foreignKey: 'UserID', as: 'Student' });
User.hasMany(RegisterCourse, { foreignKey: 'UserID', as: 'CourseRegistrations' });

RegisterCourse.belongsTo(User, { foreignKey: 'TeacherID', as: 'Teacher' });
User.hasMany(RegisterCourse, { foreignKey: 'TeacherID', as: 'TeachingRegistrations' });

module.exports = RegisterCourse;
