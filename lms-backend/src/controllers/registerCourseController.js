const RegisterCourse = require('../models/RegisterCourse');
const Course = require('../models/Course');
const User = require('../models/User');

const serializeRegisterCourse = (item) => ({
    registerCourseId: item.RegisterCourseID,
    courseId: item.CourseID,
    userId: item.UserID,
    teacherId: item.TeacherID,
    date: item.Date,
    totalAmount: item.TotalAmount,
    confirmDate: item.ConfirmDate,
    totalAmountOfTeacher: item.TotalAmountOfTeacher,
    status: item.status,
    course: item.Course ? {
        courseId: item.Course.CourseID,
        courseName: item.Course.CourseName
    } : null,
    student: item.Student ? {
        userId: item.Student.UserID,
        userName: item.Student.UserName,
        name: item.Student.Name
    } : null,
    teacher: item.Teacher ? {
        userId: item.Teacher.UserID,
        userName: item.Teacher.UserName,
        name: item.Teacher.Name
    } : null
});

const createRegisterCourse = async (req, res) => {
    try {
        const { courseId, totalAmount } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'Missing required field: courseId' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found!' });
        }

        const finalTotalAmount = totalAmount ?? course.Price ?? 0;
        const salaryPercent = Number(course.percentSalary ?? 0);
        const totalAmountOfTeacher = Number(finalTotalAmount) * (salaryPercent / 100);

        const created = await RegisterCourse.create({
            CourseID: course.CourseID,
            Date: new Date(),
            UserID: req.user.id,
            TotalAmount: finalTotalAmount,
            ConfirmDate: null,
            TotalAmountOfTeacher: totalAmountOfTeacher,
            TeacherID: course.TeacherID,
            status: 'pending'
        });

        const data = await RegisterCourse.findByPk(created.RegisterCourseID, {
            include: [
                { model: Course, as: 'Course', attributes: ['CourseID', 'CourseName'] },
                { model: User, as: 'Student', attributes: ['UserID', 'UserName', 'Name'] },
                { model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }
            ]
        });

        return res.status(201).json({
            message: 'Course registration created successfully!',
            data: serializeRegisterCourse(data)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateRegisterCourseStatusConfirmed = async (req, res) => {
    try {
        const { id } = req.params;

        const registerCourse = await RegisterCourse.findByPk(id);
        if (!registerCourse) {
            return res.status(404).json({ message: 'Registration not found!' });
        }

        await registerCourse.update({
            status: 'confirmed',
            ConfirmDate: new Date()
        });

        const updated = await RegisterCourse.findByPk(id, {
            include: [
                { model: Course, as: 'Course', attributes: ['CourseID', 'CourseName'] },
                { model: User, as: 'Student', attributes: ['UserID', 'UserName', 'Name'] },
                { model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }
            ]
        });

        return res.json({
            message: 'Registration confirmed successfully!',
            data: serializeRegisterCourse(updated)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateRegisterCourseStatusCancel = async (req, res) => {
    try {
        const { id } = req.params;

        const registerCourse = await RegisterCourse.findByPk(id);
        if (!registerCourse) {
            return res.status(404).json({ message: 'Registration not found!' });
        }

        await registerCourse.update({
            status: 'cancel',
            ConfirmDate: new Date()
        });

        const updated = await RegisterCourse.findByPk(id, {
            include: [
                { model: Course, as: 'Course', attributes: ['CourseID', 'CourseName'] },
                { model: User, as: 'Student', attributes: ['UserID', 'UserName', 'Name'] },
                { model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }
            ]
        });

        return res.json({
            message: 'Registration canceled successfully!',
            data: serializeRegisterCourse(updated)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllRegisterCourses = async (req, res) => {
    try {
        const where = {};

        if (req.user.roleId === 2) {
            where.TeacherID = req.user.id;
        } else if (req.user.roleId === 3) {
            where.UserID = req.user.id;
        }

        const { status } = req.query;
        if (status) {
            where.status = status;
        }

        const data = await RegisterCourse.findAll({
            where,
            include: [
                { model: Course, as: 'Course', attributes: ['CourseID', 'CourseName'] },
                { model: User, as: 'Student', attributes: ['UserID', 'UserName', 'Name'] },
                { model: User, as: 'Teacher', attributes: ['UserID', 'UserName', 'Name'] }
            ],
            order: [['RegisterCourseID', 'DESC']]
        });

        return res.json({
            success: true,
            count: data.length,
            data: data.map(serializeRegisterCourse)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTotalRevenueConfirmed = async (req, res) => {
    try {
        const whereConfirmed = { status: 'confirmed' };
        const [totalAmount, numberTransaction] = await Promise.all([
            RegisterCourse.sum('TotalAmount', {
                where: whereConfirmed
            }),
            RegisterCourse.count({
                where: whereConfirmed
            })
        ]);

        return res.json({
            success: true,
            totalAmount: Number(totalAmount || 0),
            numberTransaction: Number(numberTransaction || 0)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRegisterCourse,
    updateRegisterCourseStatusConfirmed,
    updateRegisterCourseStatusCancel,
    getAllRegisterCourses,
    getTotalRevenueConfirmed
};
