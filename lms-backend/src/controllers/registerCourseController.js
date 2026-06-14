const RegisterCourse = require('../models/RegisterCourse');
const Course = require('../models/Course');
const User = require('../models/User');

const VIETQR_BANK = 'BIDV';
const VIETQR_ACCOUNT_NO = '96247TOEICZONE';

const buildPaymentCode = ({ userId, courseId, registerCourseId }) =>
    `U${userId}C${courseId}O${registerCourseId}`;

const buildVietQrLink = ({ amount, paymentCode }) => {
    const encodedAddInfo = encodeURIComponent(paymentCode);
    const normalizedAmount = Number(amount || 0);
    return `https://img.vietqr.io/image/${VIETQR_BANK}-${VIETQR_ACCOUNT_NO}-compact.png?amount=${normalizedAmount}&addInfo=${encodedAddInfo}`;
};

const serializeRegisterCourse = (item) => ({
    registerCourseId: item.RegisterCourseID,
    courseId: item.CourseID,
    userId: item.UserID,
    teacherId: item.TeacherID,
    date: item.ConfirmDate || item.Date,  // Use ConfirmDate (approval date) first, fallback to Date
    totalAmount: item.TotalAmount,
    confirmDate: item.ConfirmDate,
    totalAmountOfTeacher: item.TotalAmountOfTeacher,
    status: item.status,
    paymentCode: item.payment_code,
    paidAmount: item.paid_amount,
    paidAt: item.paid_at,
    sepayTransactionId: item.sepay_transaction_id,
    qrLink: item.payment_code ? buildVietQrLink({ amount: item.TotalAmount, paymentCode: item.payment_code }) : null,
    course: item.Course ? {
        courseId: item.Course.CourseID,
        courseName: item.Course.CourseName,
        duration: item.Course.Duration
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

const getRegisterCoursePaymentPreview = async (req, res) => {
    try {
        const { courseId } = req.query;

        if (!courseId) {
            return res.status(400).json({ message: 'Missing required field: courseId' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found!' });
        }

        const finalTotalAmount = Number(course.Price ?? 0);
        const existingDraft = await RegisterCourse.findOne({
            where: {
                CourseID: course.CourseID,
                UserID: req.user.id,
                status: 'draft'
            },
            order: [['RegisterCourseID', 'DESC']]
        });

        let draft = existingDraft;
        if (!draft) {
            const paymentCode = `U${req.user.id}C${course.CourseID}T${Date.now()}`;
            const salaryPercent = Number(course.percentSalary ?? 0);
            const totalAmountOfTeacher = Number(finalTotalAmount) * (salaryPercent / 100);

            draft = await RegisterCourse.create({
                CourseID: course.CourseID,
                Date: new Date(),
                UserID: req.user.id,
                TotalAmount: finalTotalAmount,
                ConfirmDate: null,
                TotalAmountOfTeacher: totalAmountOfTeacher,
                TeacherID: course.TeacherID,
                status: 'draft',
                payment_code: paymentCode
            });
        }

        return res.json({
            success: true,
            data: {
                courseId: Number(course.CourseID),
                amount: finalTotalAmount,
                registerCourseId: draft.RegisterCourseID,
                paymentCode: draft.payment_code,
                qrLink: buildVietQrLink({ amount: finalTotalAmount, paymentCode: draft.payment_code })
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const createRegisterCourse = async (req, res) => {
    try {
        const { courseId, totalAmount, paymentCode } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'Missing required field: courseId' });
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found!' });
        }

        const existed = await RegisterCourse.findOne({
            where: {
                CourseID: courseId,
                UserID: req.user.id,
                status: ['pending', 'confirmed']
            },
            order: [['RegisterCourseID', 'DESC']]
        });

        if (existed) {
            return res.status(409).json({ message: 'Bạn đã đăng ký khóa học này rồi!' });
        }

        const finalTotalAmount = totalAmount ?? course.Price ?? 0;
        let registerCourse = null;

        if (paymentCode) {
            registerCourse = await RegisterCourse.findOne({
                where: {
                    payment_code: paymentCode,
                    CourseID: course.CourseID,
                    UserID: req.user.id
                }
            });
        }

        if (!registerCourse) {
            registerCourse = await RegisterCourse.findOne({
                where: {
                    CourseID: course.CourseID,
                    UserID: req.user.id,
                    status: 'draft'
                },
                order: [['RegisterCourseID', 'DESC']]
            });
        }

        if (registerCourse) {
            const salaryPercent = Number(course.percentSalary ?? 0);
            const totalAmountOfTeacher = Number(finalTotalAmount) * (salaryPercent / 100);

            await registerCourse.update({
                TotalAmount: finalTotalAmount,
                TotalAmountOfTeacher: totalAmountOfTeacher,
                TeacherID: course.TeacherID,
                status: 'pending',
                payment_code: paymentCode || registerCourse.payment_code
            });
        } else {
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
                status: 'pending',
                payment_code: paymentCode || buildPaymentCode({
                    userId: req.user.id,
                    courseId: course.CourseID,
                    registerCourseId: 0
                })
            });
            registerCourse = created;
        }

        const data = await RegisterCourse.findByPk(registerCourse.RegisterCourseID, {
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
                { model: Course, as: 'Course', attributes: ['CourseID', 'CourseName', 'Duration'] },
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

const toStartOfDay = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
};

const toEndExclusive = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getTotalRevenueConfirmed = async (req, res) => {
    try {
        const startDate = toStartOfDay(req.query.startDate);
        const endDateExclusive = toEndExclusive(req.query.endDate);

        const where = { status: 'confirmed' };
        if (startDate || endDateExclusive) {
            where.ConfirmDate = {};
            if (startDate) {
                where.ConfirmDate[require('sequelize').Op.gte] = startDate;
            }
            if (endDateExclusive) {
                where.ConfirmDate[require('sequelize').Op.lt] = endDateExclusive;
            }
        }

        const [totalAmount, numberTransaction, revenueRows] = await Promise.all([
            RegisterCourse.sum('TotalAmount', { where }),
            RegisterCourse.count({ where }),
            RegisterCourse.findAll({
                attributes: [
                    [require('sequelize').fn('DATE', require('sequelize').col('ConfirmDate')), 'date'],
                    [require('sequelize').fn('SUM', require('sequelize').col('TotalAmount')), 'revenue']
                ],
                where,
                group: [require('sequelize').fn('DATE', require('sequelize').col('ConfirmDate'))],
                order: [[require('sequelize').fn('DATE', require('sequelize').col('ConfirmDate')), 'ASC']],
                raw: true
            })
        ]);

        return res.json({
            success: true,
            totalAmount: Number(totalAmount || 0),
            numberTransaction: Number(numberTransaction || 0),
            range: {
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDateExclusive ? new Date(endDateExclusive.getTime() - 1).toISOString() : null
            },
            revenueSeries: revenueRows.map((row) => ({
                date: row.date,
                revenue: Number(row.revenue || 0)
            }))
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getRegisterCoursePaymentQR = async (req, res) => {
    try {
        const { id } = req.params;

        const registerCourse = await RegisterCourse.findByPk(id);
        if (!registerCourse) {
            return res.status(404).json({ message: 'Registration not found!' });
        }

        const isOwner = Number(registerCourse.UserID) === Number(req.user.id);
        const isAdminUser = Number(req.user.roleId) === 1;
        if (!isOwner && !isAdminUser) {
            return res.status(403).json({ message: 'You do not have permission to access this payment QR!' });
        }

        let paymentCode = registerCourse.payment_code;
        if (!paymentCode) {
            paymentCode = buildPaymentCode({
                userId: registerCourse.UserID,
                courseId: registerCourse.CourseID,
                registerCourseId: registerCourse.RegisterCourseID
            });
            await registerCourse.update({ payment_code: paymentCode });
        }

        return res.json({
            success: true,
            data: {
                registerCourseId: registerCourse.RegisterCourseID,
                paymentCode,
                amount: Number(registerCourse.TotalAmount || 0),
                qrLink: buildVietQrLink({
                    amount: registerCourse.TotalAmount,
                    paymentCode
                })
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const receiveSepayWebhook = async (req, res) => {
    try {
        const payload = req.body || {};
        const transferContent = (
            payload.content
            || payload.description
            || payload.transferContent
            || payload.addInfo
            || ''
        ).toString().trim();

        if (!transferContent) {
            return res.status(400).json({ success: false, message: 'Missing transfer content.' });
        }

        const amountValue = Number(
            payload.amount
            || payload.transferAmount
            || payload.paidAmount
            || payload.creditAmount
            || 0
        );

        const transactionId = (
            payload.id
            || payload.transactionId
            || payload.transaction_id
            || payload.sepay_transaction_id
            || null
        );

        const paidAtRaw = payload.transactionDate || payload.transaction_time || payload.paid_at || null;
        const paidAt = paidAtRaw && !Number.isNaN(new Date(paidAtRaw).getTime())
            ? new Date(paidAtRaw)
            : new Date();
        const paymentCodeMatch = transferContent.match(/U\d+C\d+(?:O\d+|T\d+)/);
        if (!paymentCodeMatch) {
            return res.status(404).json({
                success: false,
                message: 'Payment code not found in transfer content.'
            });
        }
        const paymentCode = paymentCodeMatch[0];
        console.log("TRANSFER CONTENT:", transferContent);
        console.log("EXTRACTED PAYMENT CODE:", paymentCode);
        const registerCourse = await RegisterCourse.findOne({ where: { payment_code: paymentCode } });

        if (!registerCourse) {
            return res.status(404).json({ success: false, message: 'No registration found for payment content.' });
        }

        await registerCourse.update({
            paid_amount: amountValue > 0 ? amountValue : Number(registerCourse.TotalAmount || 0),
            sepay_transaction_id: transactionId,
            paid_at: paidAt
        });

        return res.json({
            success: true,
            message: 'Payment matched and registration updated.',
            data: {
                registerCourseId: registerCourse.RegisterCourseID,
                paymentCode: registerCourse.payment_code,
                paidAmount: registerCourse.paid_amount,
                paidAt: registerCourse.paid_at,
                sepayTransactionId: registerCourse.sepay_transaction_id
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getRegisterCoursePaymentPreview,
    createRegisterCourse,
    updateRegisterCourseStatusConfirmed,
    updateRegisterCourseStatusCancel,
    getAllRegisterCourses,
    getTotalRevenueConfirmed,
    getRegisterCoursePaymentQR,
    receiveSepayWebhook
};
