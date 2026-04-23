const Course = require('../models/Course');
const User = require('../models/User');
const RegisterCourse = require('../models/RegisterCourse');
const { Op, fn, col } = require('sequelize');
const { normalizeDataPath } = require('../utils/assetPath');

const serializeCourse = (course, studentCount = 0) => {
    return {
        courseId: course.CourseID,
        courseName: course.CourseName,
        courseDesc: course.CourseDesc,
        price: course.Price,
        duration: course.Duration,
        teacherId: course.TeacherID,
        teacherName: course.Teacher?.Name || null,
        target: course.Target,
        input: course.Input,
        image: normalizeDataPath(course.Image),
        percentSalary: course.percentSalary,
        percentDiscount: course.percentDiscount,
        status: Number(course.status ?? 1),
        studentCount: Number(studentCount || 0)
    };
};

const getStudentCountMap = async () => {
    const rows = await RegisterCourse.findAll({
        attributes: [
            'CourseID',
            [fn('COUNT', fn('DISTINCT', col('UserID'))), 'studentCount']
        ],
        where: {
            status: {
                [Op.ne]: 'cancel'
            }
        },
        group: ['CourseID'],
        raw: true
    });

    const countMap = new Map();
    rows.forEach((row) => {
        countMap.set(Number(row.CourseID), Number(row.studentCount || 0));
    });

    return countMap;
};

const getAllCourses = async (req, res) => {
    try {
        const condition = {};

        if (req.user && (req.user.role === 'Teacher' || req.user.role === 'Giáo Viên' || req.user.roleId === 2)) {
            condition.TeacherID = req.user.id;
        }

        const courses = await Course.findAll({
            where: condition,
            include: [{
                model: User,
                as: 'Teacher',
                attributes: ['UserID', 'Name']
            }],
            order: [['CourseID', 'DESC']]
        });

        const studentCountMap = await getStudentCountMap();

        return res.json(
            courses.map((course) => serializeCourse(course, studentCountMap.get(Number(course.CourseID)) || 0))
        );
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getAllCoursesByStudent = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { status: 1 },
            include: [{
                model: User,
                as: 'Teacher',
                attributes: ['UserID', 'Name']
            }],
            order: [['CourseID', 'DESC']]
        });

        const studentCountMap = await getStudentCountMap();

        return res.json(
            courses.map((course) => serializeCourse(course, studentCountMap.get(Number(course.CourseID)) || 0))
        );
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getStudentCountByCourse = async (req, res) => {
    try {
        const countMap = await getStudentCountMap();
        const data = Array.from(countMap.entries()).map(([courseId, studentCount]) => ({
            courseId,
            studentCount
        }));

        return res.json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const { courseName, courseDesc, price, duration, teacherId, input, target, percentSalary, percentDiscount, image } = req.body;
        
        const newCourse = await Course.create({
            CourseName: courseName,
            CourseDesc: courseDesc,
            Price: price,
            Duration: duration,
            TeacherID: teacherId,
            Input: input,
            Target: target,
            percentSalary,
            percentDiscount,
            Image: null
        });

        return res.status(201).json({
            message: 'Course created successfully!',
            data: serializeCourse(newCourse)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRows = await Course.destroy({ where: { CourseID: id } });
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Course not found to delete' });
        }

        return res.json({ message: 'Course deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { courseName, courseDesc, price, duration, teacherId, input, target, percentSalary, percentDiscount, image } = req.body;

        const [updatedRows] = await Course.update({
            CourseName: courseName,
            CourseDesc: courseDesc,
            Price: price,
            Duration: duration,
            TeacherID: teacherId,
            Input: input,
            Target: target,
            percentSalary,
            percentDiscount,
            Image: normalizeDataPath(image)
        }, {
            where: { CourseID: id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Course not found or no changes were made.' });
        }

        return res.json({ message: 'Course updated successfully!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const setStatusCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found!' });
        }

        const nextStatus =
            status === undefined || status === null
                ? (Number(course.status) === 1 ? 0 : 1)
                : (Number(status) === 1 ? 1 : 0);

        await course.update({ status: nextStatus });

        return res.json({
            message: nextStatus === 1 ? 'Course opened successfully!' : 'Course closed successfully!',
            status: nextStatus
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllCourses,
    getAllCoursesByStudent,
    getStudentCountByCourse,
    createCourse,
    deleteCourse,
    updateCourse,
    setStatusCourse
};
